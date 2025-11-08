# flask_backend_step2.py

import pickle
import re
import nltk
import pandas as pd
import os
from datetime import datetime, date, timedelta
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from nltk.corpus import stopwords
from nltk import PorterStemmer
from supabase_helper import SupabaseHelper

# --- Configuration & Setup ---
CHECK_INTERVAL = 5 # Must match the tracker's interval

# --- Preprocessing Logic (from notebook) ---
try:
    stopwords.words('english')
except LookupError:
    nltk.download('stopwords')
    nltk.download('punkt')

stop_words = set(stopwords.words('english'))
port_stemmer = PorterStemmer()
def preprocessing(text):
    text = text.lower()
    text = re.sub(r"http\S+", "", text)
    text = re.sub(r"[^a-zA-Z]", " ", text)
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r'[^\w\s,.!?]', '', text)
    text = text.split()
    text = [port_stemmer.stem(word) for word in text if not word in stop_words]
    return ' '.join(text)

# --- Flask App Initialization & ML Asset Loading ---
app = Flask(__name__, template_folder='.') # Serve templates from the root directory
CORS(app)  # Enable CORS for frontend access

# Initialize Supabase
supabase_helper = None
supabase_client = None
try:
    supabase_helper = SupabaseHelper()
    supabase_helper.set_user_id("00000000-0000-0000-0000-000000000001")  # Demo user for testing (valid UUID)
    # Also get direct Supabase client for phone data
    supabase_client = supabase_helper.supabase
    print("✅ Supabase connected")
except Exception as e:
    print(f"⚠️  Supabase not available: {e}")

model, vectorizer = None, None
try:
    with open('model_reclassified.pkl', 'rb') as f_model:
        model = pickle.load(f_model)
    with open('tfidf_vectorizer_reclassified.pkl', 'rb') as f_vec:
        vectorizer = pickle.load(f_vec)
    print("✅ Model and vectorizer loaded successfully")
except Exception as e:
    print(f"❌ Fatal Error: Could not load ML assets. {e}")

# --- Web Page Routes ---

@app.route('/')
def dashboard():
    """Serves the main dashboard page."""
    return render_template('index.html')

# --- API Routes ---

@app.route('/api/activity-data')
def get_activity_data():
    """Reads the daily CSV and returns aggregated time per category."""
    today_csv = f"desktop_activity_{datetime.now().strftime('%Y-%m-%d')}.csv"
    if not os.path.isfile(today_csv):
        return jsonify({})
    try:
        df = pd.read_csv(today_csv)
        if df.empty:
            return jsonify({})
        time_per_category = (df['Category'].value_counts() * CHECK_INTERVAL / 60).round(2) # in minutes
        return jsonify(time_per_category.to_dict())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def normalize_category(category):
    """Normalize all categories to only study, entertainment, or others."""
    category_lower = category.lower()
    
    # Map all categories to only 3 types
    if category_lower in ['study', 'work', 'productivity']:
        return 'study'
    elif category_lower in ['entertainment', 'gaming', 'social']:
        return 'entertainment'
    else:
        return 'others'

@app.route('/predict', methods=['POST'])
def predict():
    """Receives text and returns a category prediction (for the tracker)."""
    if not model or not vectorizer:
        return jsonify({'error': 'ML model not available.'}), 500

    data = request.get_json()
    if not data or 'text' not in data:
        return jsonify({'error': 'Invalid request.'}), 400

    try:
        text_input = data['text']
        preprocessed_text = preprocessing(text_input)
        text_tfidf = vectorizer.transform([preprocessed_text])
        predicted_category = model.predict(text_tfidf)[0]
        
        # Normalize to only 3 categories
        normalized_category = normalize_category(predicted_category)
        return jsonify({'category': normalized_category})
    except Exception as e:
        return jsonify({'error': f'Prediction error: {str(e)}'}), 500

# --- New Supabase API Routes ---

@app.route('/api/daily-summary', methods=['GET'])
def get_daily_summary_api():
    """Get daily summary from CSV file."""
    try:
        # Get today's CSV file
        today_csv = f"desktop_activity_{datetime.now().strftime('%Y-%m-%d')}.csv"
        
        if not os.path.isfile(today_csv):
            # No data yet today
            return jsonify({
                'study_minutes': 0,
                'entertainment_minutes': 0,
                'others_minutes': 0,
                'total_minutes': 0,
                'study_percentage': 0,
                'entertainment_percentage': 0,
                'others_percentage': 0,
                'message': 'No data tracked yet today'
            }), 200
        
        # Read CSV and calculate summary
        df = pd.read_csv(today_csv)
        
        if df.empty:
            return jsonify({
                'study_minutes': 0,
                'entertainment_minutes': 0,
                'others_minutes': 0,
                'total_minutes': 0,
                'study_percentage': 0,
                'entertainment_percentage': 0,
                'others_percentage': 0,
                'message': 'No data tracked yet today'
            }), 200
        
        # Normalize categories
        df['Category'] = df['Category'].str.lower()
        df['Category'] = df['Category'].apply(normalize_category)
        
        # Calculate minutes per category (each row = CHECK_INTERVAL seconds)
        category_counts = df['Category'].value_counts()
        
        study_minutes = (category_counts.get('study', 0) * CHECK_INTERVAL) / 60.0
        entertainment_minutes = (category_counts.get('entertainment', 0) * CHECK_INTERVAL) / 60.0
        others_minutes = (category_counts.get('others', 0) * CHECK_INTERVAL) / 60.0
        total_minutes = study_minutes + entertainment_minutes + others_minutes
        
        # Calculate percentages
        study_percentage = (study_minutes / total_minutes * 100) if total_minutes > 0 else 0
        entertainment_percentage = (entertainment_minutes / total_minutes * 100) if total_minutes > 0 else 0
        others_percentage = (others_minutes / total_minutes * 100) if total_minutes > 0 else 0
        
        return jsonify({
            'study_minutes': round(study_minutes, 2),
            'entertainment_minutes': round(entertainment_minutes, 2),
            'others_minutes': round(others_minutes, 2),
            'total_minutes': round(total_minutes, 2),
            'study_percentage': round(study_percentage, 2),
            'entertainment_percentage': round(entertainment_percentage, 2),
            'others_percentage': round(others_percentage, 2),
            'total_activities': len(df),
            'updated_at': datetime.now().isoformat(),
            'message': 'Data from CSV'
        }), 200
        
    except Exception as e:
        print(f"Error in daily summary API: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/last-7-days', methods=['GET'])
def get_last_7_days_api():
    """Get last 7 days summary from Supabase."""
    if not supabase_helper:
        return jsonify({'error': 'Supabase not available'}), 503
    
    try:
        days = int(request.args.get('days', 7))
        summaries = supabase_helper.get_last_n_days(days)
        return jsonify(summaries)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/weekly-summary', methods=['GET'])
def get_weekly_summary_api():
    """Get weekly summary from Supabase."""
    if not supabase_helper:
        return jsonify({'error': 'Supabase not available'}), 503
    
    try:
        summary = supabase_helper.get_weekly_summary()
        if summary:
            return jsonify(summary)
        else:
            return jsonify({'message': 'No data available'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/top-apps', methods=['GET'])
def get_top_apps_api():
    """Get top applications by category from Supabase."""
    if not supabase_helper:
        return jsonify({'error': 'Supabase not available'}), 503
    
    try:
        days = int(request.args.get('days', 7))
        top_apps = supabase_helper.get_top_apps(days)
        return jsonify(top_apps)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/activity-logs', methods=['GET'])
def get_activity_logs_api():
    """Get activity logs from Supabase."""
    if not supabase_helper:
        return jsonify({'error': 'Supabase not available'}), 503
    
    try:
        date_str = request.args.get('date')
        limit = int(request.args.get('limit', 100))
        
        if date_str:
            from datetime import datetime as dt
            target_date = dt.strptime(date_str, '%Y-%m-%d').date()
            logs = supabase_helper.get_activity_logs(target_date, limit)
        else:
            logs = supabase_helper.get_activity_logs(limit=limit)
        
        return jsonify(logs)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/stats', methods=['GET'])
def get_stats_api():
    """Get comprehensive statistics."""
    if not supabase_helper:
        return jsonify({'error': 'Supabase not available'}), 503
    
    try:
        # Get today's summary
        today_summary = supabase_helper.get_daily_summary()
        
        # Get last 7 days
        last_7_days = supabase_helper.get_last_n_days(7)
        
        # Get current week
        weekly_summary = supabase_helper.get_weekly_summary()
        
        # Get top apps
        top_apps = supabase_helper.get_top_apps(7)
        
        return jsonify({
            'today': today_summary,
            'last_7_days': last_7_days,
            'current_week': weekly_summary,
            'top_apps': top_apps
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# --- Phone Usage API Routes ---

@app.route('/api/phone-usage-today', methods=['GET'])
def get_phone_usage_today():
    """Get today's phone usage summary from app_usage_logs"""
    if not supabase_client:
        return jsonify({'error': 'Supabase not available'}), 503
    
    try:
        # Get all logs from last 24 hours (more reliable than date filtering)
        from datetime import datetime as dt
        now = dt.now()
        yesterday = now - timedelta(days=1)
        
        # Get all logs from today
        result = supabase_client.table('app_usage_logs')\
            .select('*')\
            .gte('created_at', yesterday.isoformat())\
            .order('created_at', desc=True)\
            .execute()
        
        print(f"Phone usage query returned {len(result.data) if result.data else 0} records")
        
        if not result.data:
            return jsonify({
                'total_minutes': 0,
                'total_apps': 0,
                'top_apps': [],
                'message': 'No phone usage data today'
            }), 200
        
        # Calculate total time and top apps
        app_times = {}
        for log in result.data:
            app_name = log.get('app_name', 'Unknown')
            duration_str = log.get('duration', '00:00:00')
            
            # Parse duration (format: HH:MM:SS or MM:SS)
            try:
                parts = duration_str.split(':')
                if len(parts) == 3:
                    hours, minutes, seconds = map(int, parts)
                    total_seconds = hours * 3600 + minutes * 60 + seconds
                elif len(parts) == 2:
                    minutes, seconds = map(int, parts)
                    total_seconds = minutes * 60 + seconds
                else:
                    total_seconds = 0
                
                if app_name in app_times:
                    app_times[app_name] += total_seconds
                else:
                    app_times[app_name] = total_seconds
            except Exception as e:
                print(f"Error parsing duration '{duration_str}': {e}")
                continue
        
        print(f"Processed {len(app_times)} unique apps")
        
        # Convert to minutes and sort
        total_minutes = sum(app_times.values()) / 60.0
        top_apps = sorted(
            [{'app': app, 'minutes': round(seconds / 60.0, 2)} 
             for app, seconds in app_times.items()],
            key=lambda x: x['minutes'],
            reverse=True
        )[:5]  # Top 5 apps
        
        return jsonify({
            'total_minutes': round(total_minutes, 2),
            'total_apps': len(app_times),
            'top_apps': top_apps,
            'message': 'Phone usage data loaded'
        }), 200
        
    except Exception as e:
        print(f"Error getting phone usage: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/phone-usage-weekly', methods=['GET'])
def get_phone_usage_weekly():
    """Get last 7 days phone usage for bar chart"""
    if not supabase_client:
        return jsonify({'error': 'Supabase not available'}), 503
    
    try:
        # Get data for last 7 days
        start_date = (date.today() - timedelta(days=6)).isoformat()
        end_date = date.today().isoformat()
        
        result = supabase_client.table('app_usage_logs')\
            .select('*')\
            .gte('created_at', f'{start_date}T00:00:00')\
            .lte('created_at', f'{end_date}T23:59:59')\
            .execute()
        
        # Group by date
        daily_usage = {}
        daily_top_apps = {}
        
        for log in result.data:
            created_at = log.get('created_at', '')
            log_date = created_at.split('T')[0] if 'T' in created_at else created_at[:10]
            app_name = log.get('app_name', 'Unknown')
            duration_str = log.get('duration', '00:00:00')
            
            # Parse duration
            try:
                parts = duration_str.split(':')
                if len(parts) == 3:
                    hours, minutes, seconds = map(int, parts)
                    total_seconds = hours * 3600 + minutes * 60 + seconds
                elif len(parts) == 2:
                    minutes, seconds = map(int, parts)
                    total_seconds = minutes * 60 + seconds
                else:
                    total_seconds = 0
                
                # Add to daily total
                if log_date not in daily_usage:
                    daily_usage[log_date] = 0
                    daily_top_apps[log_date] = {}
                
                daily_usage[log_date] += total_seconds
                
                # Track per-app usage per day
                if app_name not in daily_top_apps[log_date]:
                    daily_top_apps[log_date][app_name] = 0
                daily_top_apps[log_date][app_name] += total_seconds
                
            except:
                continue
        
        # Format for last 7 days
        weekly_data = []
        for i in range(6, -1, -1):
            day_date = (date.today() - timedelta(days=i)).isoformat()
            day_name = (date.today() - timedelta(days=i)).strftime('%a')
            
            minutes = daily_usage.get(day_date, 0) / 60.0
            
            # Get top app for this day
            top_app = 'None'
            if day_date in daily_top_apps and daily_top_apps[day_date]:
                top_app = max(daily_top_apps[day_date].items(), key=lambda x: x[1])[0]
            
            weekly_data.append({
                'day': day_name,
                'date': day_date,
                'minutes': round(minutes, 2),
                'top_app': top_app
            })
        
        return jsonify({
            'weekly_data': weekly_data,
            'message': 'Weekly phone usage loaded'
        }), 200
        
    except Exception as e:
        print(f"Error getting weekly phone usage: {e}")
        return jsonify({'error': str(e)}), 500

# --- Main Execution ---

if __name__ == '__main__':
    print("=" * 60)
    print("🚀 Starting Flask Backend Server")
    print("=" * 60)
    print("📍 Server: http://127.0.0.1:5000")
    print("=" * 60)
    app.run(debug=True, host='127.0.0.1', port=5000)
