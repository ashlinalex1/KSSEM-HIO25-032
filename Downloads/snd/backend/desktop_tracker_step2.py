# desktop_tracker_step2.py

import time
import psutil
import win32gui
import win32process
import requests
import pandas as pd
import os
from datetime import datetime
from supabase_helper import SupabaseHelper

# --- Configuration ---
FLASK_API_URL = "http://127.0.0.1:5000/predict"
CHECK_INTERVAL = 5  # seconds
CSV_COLUMNS = ['Timestamp', 'App Name', 'Window Title', 'Category']
USE_SUPABASE = False  # Set to False to use CSV only (avoiding Supabase errors)
BATCH_SIZE = 1  # Number of activities to batch before sending to Supabase (1 = immediate sync)

# --- Core Functions ---

def get_daily_csv_filename():
    """Generates the CSV filename for the current day."""
    today = datetime.now().strftime("%Y-%m-%d")
    return f"desktop_activity_{today}.csv"

def get_active_window_info():
    """Get the process name and window title of the currently active window."""
    try:
        hwnd = win32gui.GetForegroundWindow()
        _, pid = win32process.GetWindowThreadProcessId(hwnd)
        process = psutil.Process(pid)
        process_name = process.name()
        window_title = win32gui.GetWindowText(hwnd)
        return process_name, window_title
    except (psutil.NoSuchProcess, win32gui.error, psutil.AccessDenied):
        return None, None

def get_category(process_name, window_title):
    """Send activity data to the Flask backend and get a category prediction."""
    if not process_name or not window_title:
        return 'Uncategorized'
    try:
        text_to_predict = f"{process_name} {window_title}"
        response = requests.post(FLASK_API_URL, json={'text': text_to_predict}, timeout=3)
        if response.status_code == 200:
            return response.json().get('category', 'Uncategorized')
        else:
            print(f"API Error: {response.status_code}")
            return 'Uncategorized'
    except requests.exceptions.ConnectionError:
        print("Error: Flask backend not running. Cannot get category.")
        return 'Uncategorized'
    except Exception as e:
        print(f"An unexpected error occurred during prediction: {e}")
        return 'Uncategorized'

def append_to_csv(filename, record):
    """Appends a new record to the specified CSV file."""
    file_exists = os.path.isfile(filename)
    df = pd.DataFrame([record])
    df.to_csv(filename, mode='a', header=not file_exists, index=False)

def load_and_calculate_time(filename):
    """Loads the daily CSV and calculates cumulative time per category."""
    if not os.path.isfile(filename):
        return {}
    try:
        df = pd.read_csv(filename)
        # Each row represents one CHECK_INTERVAL
        time_per_category = (df['Category'].value_counts() * CHECK_INTERVAL).to_dict()
        return {k: v for k, v in time_per_category.items()}
    except (pd.errors.EmptyDataError, KeyError):
        # Handle empty or malformed CSV
        return {}

def print_summary(time_per_category):
    """Prints a summary table of time spent per category."""
    print("\n--- Activity Summary ---")
    if not time_per_category:
        print("No activity was tracked.")
        return

    total_minutes_df = pd.DataFrame(list(time_per_category.items()), columns=['Category', 'Total Seconds'])
    total_minutes_df['Total Minutes'] = (total_minutes_df['Total Seconds'] / 60).round(2)
    total_minutes_df = total_minutes_df.sort_values(by='Total Seconds', ascending=False)
    
    print(total_minutes_df[['Category', 'Total Minutes']].to_string(index=False))
    total_time_minutes = total_minutes_df['Total Minutes'].sum()
    print(f"\nTotal Tracked Time: {total_time_minutes:.2f} minutes")


def start_tracking():
    """The main loop to run the tracker and log activity to CSV and Supabase."""
    csv_filename = get_daily_csv_filename()
    print("=" * 60)
    print("🚀 Starting Desktop Activity Tracker")
    print("=" * 60)
    print(f"📁 CSV Logging: {csv_filename}")
    
    # Initialize Supabase
    supabase_helper = None
    activity_buffer = []
    
    if USE_SUPABASE:
        try:
            supabase_helper = SupabaseHelper()
            supabase_helper.set_user_id("00000000-0000-0000-0000-000000000001")  # Demo user for testing (valid UUID)
            print(f"💾 Supabase: Enabled (batch size: {BATCH_SIZE})")
        except Exception as e:
            print(f"⚠️  Supabase: Disabled ({e})")
            print("   Falling back to CSV only")
    else:
        print(f"💾 Supabase: Disabled (CSV only)")
    
    print("=" * 60)
    print("Press Ctrl+C to stop tracking\n")

    try:
        while True:
            process_name, window_title = get_active_window_info()
            
            # We get the category even if the window info is partial to handle edge cases
            category = get_category(process_name, window_title)

            if process_name and window_title:
                timestamp = datetime.now()
                record = {
                    'Timestamp': timestamp.strftime("%Y-%m-%d %H:%M:%S"),
                    'App Name': process_name,
                    'Window Title': window_title,
                    'Category': category
                }
                
                # Save to CSV
                append_to_csv(csv_filename, record)
                
                # Add to Supabase buffer
                if supabase_helper:
                    activity_buffer.append({
                        'app_name': process_name,
                        'window_title': window_title,
                        'category': category,
                        'duration_seconds': CHECK_INTERVAL,
                        'timestamp': timestamp.isoformat(),
                        'date': timestamp.date().isoformat()
                    })
                    
                    # Send batch to Supabase
                    if len(activity_buffer) >= BATCH_SIZE:
                        if supabase_helper.insert_activity_batch(activity_buffer):
                            print(f"✅ Synced {len(activity_buffer)} activities to Supabase")
                        activity_buffer = []
                
                print(f"[{timestamp.strftime('%H:%M:%S')}] {category.upper():15} | {process_name}")
            
            time.sleep(CHECK_INTERVAL)

    except KeyboardInterrupt:
        print("\n" + "=" * 60)
        print("🛑 Stopping tracker...")
        print("=" * 60)
    finally:
        # Save remaining buffer to Supabase
        if supabase_helper and activity_buffer:
            if supabase_helper.insert_activity_batch(activity_buffer):
                print(f"✅ Synced final {len(activity_buffer)} activities to Supabase")
        
        # Update weekly summary (daily summary updates automatically via triggers)
        if supabase_helper:
            print("📊 Updating weekly summary...")
            supabase_helper.update_weekly_summary()
            print("✅ Weekly summary updated")
        
        # Recalculate final times from the CSV for an accurate summary
        final_times = load_and_calculate_time(csv_filename)
        print_summary(final_times)
        
        print("=" * 60)
        print("👋 Tracker stopped successfully")
        print("=" * 60)

# Main execution block
if __name__ == "__main__":
    start_tracking()
