#!/usr/bin/env python3
"""
Test script to insert sample data into Supabase
Run this to quickly test if data appears on dashboard
"""

from datetime import datetime, timedelta
from supabase_helper import SupabaseHelper

def insert_test_data():
    """Insert sample test data for today"""
    
    print("=" * 60)
    print("🧪 Inserting Test Data to Supabase")
    print("=" * 60)
    
    try:
        # Initialize Supabase
        print("🔗 Connecting to Supabase...")
        helper = SupabaseHelper()
        helper.set_user_id("00000000-0000-0000-0000-000000000001")
        print("✅ Connected to Supabase")
        
        # Create sample activities for today
        now = datetime.now()
        activities = []
        
        # Add some study activities
        for i in range(20):
            timestamp = now - timedelta(minutes=i*5)
            activities.append({
                'app_name': 'vscode.exe',
                'window_title': 'Visual Studio Code - Project',
                'category': 'study',
                'duration_seconds': 5,
                'timestamp': timestamp.isoformat(),
                'date': timestamp.date().isoformat()
            })
        
        # Add some entertainment activities
        for i in range(15):
            timestamp = now - timedelta(minutes=100 + i*5)
            activities.append({
                'app_name': 'chrome.exe',
                'window_title': 'YouTube - Watch Videos',
                'category': 'entertainment',
                'duration_seconds': 5,
                'timestamp': timestamp.isoformat(),
                'date': timestamp.date().isoformat()
            })
        
        # Add some others activities
        for i in range(10):
            timestamp = now - timedelta(minutes=200 + i*5)
            activities.append({
                'app_name': 'explorer.exe',
                'window_title': 'File Explorer',
                'category': 'others',
                'duration_seconds': 5,
                'timestamp': timestamp.isoformat(),
                'date': timestamp.date().isoformat()
            })
        
        print(f"\n📤 Inserting {len(activities)} test activities...")
        
        # Insert in batches
        batch_size = 20
        for i in range(0, len(activities), batch_size):
            batch = activities[i:i+batch_size]
            if helper.insert_activity_batch(batch):
                print(f"✅ Inserted batch {i//batch_size + 1}: {len(batch)} activities")
            else:
                print(f"❌ Failed to insert batch {i//batch_size + 1}")
        
        print("\n" + "=" * 60)
        print("✅ Test data inserted successfully!")
        print("=" * 60)
        print("\n📊 Summary:")
        print(f"   - Study: 20 activities (~100 minutes)")
        print(f"   - Entertainment: 15 activities (~75 minutes)")
        print(f"   - Others: 10 activities (~50 minutes)")
        print(f"   - Total: 45 activities (~225 minutes)")
        print("\n💡 Refresh your dashboard to see the data!")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    insert_test_data()
