#!/usr/bin/env python3
"""
Import existing CSV data to Supabase
Run this to import today's CSV data into Supabase database
"""

import pandas as pd
import os
from datetime import datetime
from supabase_helper import SupabaseHelper

def import_csv_to_supabase():
    """Import today's CSV data to Supabase"""
    
    # Get today's CSV filename
    today = datetime.now().strftime("%Y-%m-%d")
    csv_filename = f"desktop_activity_{today}.csv"
    
    if not os.path.exists(csv_filename):
        print(f"❌ CSV file not found: {csv_filename}")
        print("   No data to import.")
        return
    
    print(f"📁 Reading CSV: {csv_filename}")
    
    try:
        # Read CSV
        df = pd.read_csv(csv_filename)
        
        if df.empty:
            print("❌ CSV file is empty")
            return
        
        print(f"✅ Found {len(df)} activities in CSV")
        
        # Initialize Supabase
        print("🔗 Connecting to Supabase...")
        supabase_helper = SupabaseHelper()
        supabase_helper.set_user_id("00000000-0000-0000-0000-000000000001")
        print("✅ Connected to Supabase")
        
        # Prepare activities for batch insert
        activities = []
        for _, row in df.iterrows():
            timestamp = datetime.strptime(row['Timestamp'], "%Y-%m-%d %H:%M:%S")
            activity = {
                'app_name': row['App Name'],
                'window_title': row['Window Title'],
                'category': row['Category'].lower(),
                'duration_seconds': 5,  # Default 5 seconds per activity
                'timestamp': timestamp.isoformat(),
                'date': timestamp.date().isoformat()
            }
            activities.append(activity)
        
        # Insert in batches of 50
        batch_size = 50
        total_batches = (len(activities) + batch_size - 1) // batch_size
        
        print(f"📤 Importing {len(activities)} activities in {total_batches} batches...")
        
        for i in range(0, len(activities), batch_size):
            batch = activities[i:i+batch_size]
            if supabase_helper.insert_activity_batch(batch):
                print(f"✅ Batch {i//batch_size + 1}/{total_batches}: Synced {len(batch)} activities")
            else:
                print(f"❌ Batch {i//batch_size + 1}/{total_batches}: Failed")
        
        print("\n" + "=" * 60)
        print("✅ Import completed successfully!")
        print("=" * 60)
        print("\n💡 Tip: Refresh your dashboard to see the data")
        
    except Exception as e:
        print(f"❌ Error importing CSV: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    print("=" * 60)
    print("📊 CSV to Supabase Importer")
    print("=" * 60)
    print()
    import_csv_to_supabase()
