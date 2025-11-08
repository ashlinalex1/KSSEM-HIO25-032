# Activity Tracker Backend - Complete Guide

## 🎯 What This Does

This system tracks your desktop activity in real-time and stores it in Supabase, providing:
- ✅ **Real-time tracking** every 5 seconds
- ✅ **ML classification** (study/entertainment/others)
- ✅ **Supabase storage** with automatic daily/weekly summaries
- ✅ **REST API** for dashboard access
- ✅ **CSV backup** for data safety
- ✅ **Digital wellbeing** style analytics

## 📁 File Structure

```
backend/
├── 📄 Core Files
│   ├── run_tracker.py                    # Main entry point
│   ├── desktop_tracker_step2.py          # Activity tracker
│   ├── flask_backend_step2.py            # Flask API server
│   └── supabase_helper.py                # Database operations
│
├── 🤖 ML Models
│   ├── model_reclassified.pkl            # Trained classifier
│   ├── tfidf_vectorizer_reclassified.pkl # Text vectorizer
│   └── classification_prediciton.ipynb   # Training notebook
│
├── 🗄️ Database
│   └── supabase_schema.sql               # Database schema
│
├── 📚 Documentation
│   ├── README.md                         # This file
│   ├── SETUP_INSTRUCTIONS.md             # Detailed setup guide
│   └── requirements.txt                  # Python dependencies
│
└── 🛠️ Utilities
    └── install_dependencies.bat          # Dependency installer
```

## 🚀 Quick Start (3 Steps)

### 1️⃣ Install Dependencies
```bash
# Run this in the backend folder
install_dependencies.bat
```

### 2️⃣ Set Up Supabase
1. Go to your Supabase project → **SQL Editor**
2. Copy contents of `supabase_schema.sql`
3. Paste and **Run**

### 3️⃣ Start Tracking
```bash
python run_tracker.py
```

That's it! Your activity is now being tracked and stored in Supabase.

## 📊 Database Schema

### Tables Created

#### 1. `activity_logs` (Raw Data)
Stores every 5-second activity snapshot:
```sql
- id (primary key)
- timestamp (when activity occurred)
- app_name (application name)
- window_title (window title)
- category (study/entertainment/others)
- duration_seconds (5 seconds)
- date (date of activity)
```

#### 2. `daily_summary` (Daily Aggregates)
Auto-calculated daily statistics:
```sql
- date (unique)
- study_minutes
- entertainment_minutes
- others_minutes
- total_minutes
- study_percentage
- entertainment_percentage
- others_percentage
- most_used_app
- total_activities
```

#### 3. `weekly_summary` (Weekly Aggregates)
Auto-calculated weekly statistics:
```sql
- week_start_date
- week_end_date
- year, week_number
- study_minutes
- entertainment_minutes
- others_minutes
- total_minutes
- percentages
- avg_daily_minutes
- most_productive_day
```

### Auto-Update Triggers
- ✅ Daily summary updates automatically when new activity is logged
- ✅ Weekly summary can be updated on-demand
- ✅ No manual calculation needed

## 🔌 API Endpoints

Your Flask server (http://localhost:5000) provides:

### Classification
```
POST /predict
Body: { "text": "chrome.exe YouTube" }
Response: { "category": "entertainment" }
```

### Daily Data
```
GET /api/daily-summary              # Today's summary
GET /api/daily-summary?date=2025-11-03  # Specific date
```

### Weekly Data
```
GET /api/weekly-summary             # Current week
```

### Historical Data
```
GET /api/last-7-days                # Last 7 days
GET /api/last-7-days?days=14        # Last N days
```

### Application Stats
```
GET /api/top-apps                   # Top apps by category
GET /api/top-apps?days=14           # Top apps for N days
```

### Activity Logs
```
GET /api/activity-logs              # Today's logs
GET /api/activity-logs?date=2025-11-03  # Specific date
GET /api/activity-logs?limit=50     # Limit results
```

### Comprehensive Stats
```
GET /api/stats                      # All stats in one call
```

## 💻 Using in Your Dashboard

### Next.js Example

```javascript
// app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [todayData, setTodayData] = useState(null);
  const [weekData, setWeekData] = useState([]);

  useEffect(() => {
    // Fetch today's summary
    fetch('http://localhost:5000/api/daily-summary')
      .then(res => res.json())
      .then(data => setTodayData(data));

    // Fetch last 7 days
    fetch('http://localhost:5000/api/last-7-days')
      .then(res => res.json())
      .then(data => setWeekData(data));
  }, []);

  return (
    <div>
      <h1>Today's Activity</h1>
      {todayData && (
        <div>
          <p>Study: {todayData.study_minutes} min</p>
          <p>Entertainment: {todayData.entertainment_minutes} min</p>
          <p>Others: {todayData.others_minutes} min</p>
        </div>
      )}

      <h2>Last 7 Days</h2>
      {weekData.map(day => (
        <div key={day.date}>
          {day.date}: {day.total_minutes} minutes
        </div>
      ))}
    </div>
  );
}
```

### Direct Supabase Query

```javascript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Get last 7 days
export async function getLast7Days() {
  const { data, error } = await supabase
    .from('daily_summary')
    .select('*')
    .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order('date', { ascending: false });
  
  return data;
}

// Get current week
export async function getCurrentWeek() {
  const { data, error } = await supabase
    .from('weekly_summary')
    .select('*')
    .order('week_start_date', { ascending: false })
    .limit(1)
    .single();
  
  return data;
}

// Get top apps
export async function getTopApps(days = 7) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  const { data, error } = await supabase
    .from('activity_logs')
    .select('app_name, category, duration_seconds')
    .gte('date', startDate.toISOString())
    .order('duration_seconds', { ascending: false });
  
  return data;
}
```

## ⚙️ Configuration

### Change Tracking Interval
Edit `desktop_tracker_step2.py`:
```python
CHECK_INTERVAL = 5  # seconds (change to 10 for 10-second intervals)
```

### Change Batch Size
Edit `desktop_tracker_step2.py`:
```python
BATCH_SIZE = 10  # activities (change to 20 to batch more)
```

### Disable Supabase (CSV only)
Edit `desktop_tracker_step2.py`:
```python
USE_SUPABASE = False  # Set to False to use CSV only
```

### Change Data Retention
Edit `supabase_helper.py`:
```python
helper.cleanup_old_data(days_to_keep=60)  # Keep 60 days instead of 30
```

## 🔍 How It Works

### 1. Activity Tracking Flow
```
Desktop Tracker (every 5s)
    ↓
Get Active Window Info
    ↓
Send to Flask API (/predict)
    ↓
ML Classification (study/entertainment/others)
    ↓
Save to CSV + Buffer
    ↓
Batch Send to Supabase (every 10 activities)
    ↓
Auto-Update Daily Summary (trigger)
```

### 2. Data Aggregation Flow
```
Raw Activity Logs
    ↓
Trigger: update_daily_summary()
    ↓
Daily Summary Table
    ↓
Manual: update_weekly_summary()
    ↓
Weekly Summary Table
```

### 3. Dashboard Access Flow
```
Next.js Dashboard
    ↓
Option A: Flask API (http://localhost:5000/api/*)
    ↓
Option B: Direct Supabase Query
    ↓
Display Data (charts, stats, etc.)
```

## 🐛 Troubleshooting

### Python not found
```bash
# Install Python 3.10+ from python.org
# Make sure "Add Python to PATH" is checked
```

### Supabase connection error
```bash
# Check .env.local has correct credentials
# Test connection: python supabase_helper.py
```

### Module not found
```bash
# Install dependencies
pip install -r requirements.txt
```

### Port 5000 already in use
```python
# Change port in flask_backend_step2.py
app.run(debug=True, host='127.0.0.1', port=5001)  # Use 5001
```

### Permission denied (Windows)
```bash
# Run terminal as Administrator
# Check antivirus settings
```

## 📈 Data Examples

### Daily Summary Response
```json
{
  "id": 1,
  "date": "2025-11-03",
  "study_minutes": 120.50,
  "entertainment_minutes": 45.20,
  "others_minutes": 30.10,
  "total_minutes": 195.80,
  "study_percentage": 61.54,
  "entertainment_percentage": 23.08,
  "others_percentage": 15.38,
  "most_used_app": "chrome.exe",
  "total_activities": 2349
}
```

### Weekly Summary Response
```json
{
  "id": 1,
  "week_start_date": "2025-10-28",
  "week_end_date": "2025-11-03",
  "year": 2025,
  "week_number": 44,
  "study_minutes": 840.00,
  "entertainment_minutes": 320.50,
  "others_minutes": 210.30,
  "total_minutes": 1370.80,
  "study_percentage": 61.27,
  "entertainment_percentage": 23.38,
  "others_percentage": 15.35,
  "avg_daily_minutes": 195.83,
  "most_productive_day": "2025-11-01"
}
```

### Top Apps Response
```json
{
  "study": [
    {
      "app_name": "Code.exe",
      "usage_count": 1200,
      "total_minutes": 300.50
    },
    {
      "app_name": "chrome.exe",
      "usage_count": 800,
      "total_minutes": 200.25
    }
  ],
  "entertainment": [
    {
      "app_name": "spotify.exe",
      "usage_count": 500,
      "total_minutes": 125.00
    }
  ],
  "others": [
    {
      "app_name": "explorer.exe",
      "usage_count": 300,
      "total_minutes": 75.50
    }
  ]
}
```

## 🎉 Features

✅ **Real-time tracking** - Every 5 seconds  
✅ **ML classification** - Automatic categorization  
✅ **Supabase storage** - Cloud database  
✅ **Daily summaries** - Auto-calculated  
✅ **Weekly summaries** - Auto-calculated  
✅ **REST API** - Easy dashboard integration  
✅ **CSV backup** - Local data safety  
✅ **Batch processing** - Efficient database writes  
✅ **Error handling** - Graceful fallbacks  
✅ **Auto-cleanup** - Old data removal  
✅ **Digital wellbeing** - Usage analytics  

## 📞 Support

For detailed setup instructions, see `SETUP_INSTRUCTIONS.md`

For testing Supabase connection:
```bash
python supabase_helper.py
```

For checking Flask API:
```bash
# Start server
python flask_backend_step2.py

# Test in browser
http://localhost:5000/api/stats
```

---

**Happy tracking! 🚀**
