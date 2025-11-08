# supabase_helper.py
import os
import json
from datetime import datetime, date, timedelta
from typing import Dict, List, Optional, Any
from supabase import create_client, Client
import pandas as pd

class SupabaseHelper:
    def __init__(self):
        """Initialize Supabase client with environment variables"""
        self.supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
        self.supabase_key = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
        
        if not self.supabase_url or not self.supabase_key:
            # Try to load from .env.local file
            self._load_env_file()
        
        if not self.supabase_url or not self.supabase_key:
            raise ValueError("Supabase credentials not found. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY")
        
        self.supabase: Client = create_client(self.supabase_url, self.supabase_key)
        self.user_id = None
        
    def _load_env_file(self):
        """Load environment variables from .env.local or .env file"""
        # Try .env.local first, then .env
        env_files = ['.env.local', '.env']
        
        for env_file in env_files:
            env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), env_file)
            if os.path.exists(env_path):
                print(f"Loading environment from {env_file}")
                with open(env_path, 'r') as f:
                    for line in f:
                        if '=' in line and not line.startswith('#'):
                            key, value = line.strip().split('=', 1)
                            value = value.strip('"').strip("'")
                            if key == 'NEXT_PUBLIC_SUPABASE_URL':
                                self.supabase_url = value
                            elif key == 'NEXT_PUBLIC_SUPABASE_ANON_KEY':
                                self.supabase_key = value
                if self.supabase_url and self.supabase_key:
                    break
    
    def set_user_id(self, user_id: str):
        """Set the current user ID for all operations"""
        self.user_id = user_id
    
    def get_demo_user_id(self) -> str:
        """Get or create a demo user ID for testing"""
        if not self.user_id:
            # Use a consistent demo user ID in valid UUID format
            # This is a fixed UUID for demo/testing purposes
            self.user_id = "00000000-0000-0000-0000-000000000001"
        return self.user_id
    
    def insert_activity_log(self, app_name: str, window_title: str, category: str, 
                           duration_seconds: int = 5, timestamp: datetime = None) -> bool:
        """Insert a single activity log entry"""
        try:
            if not self.user_id:
                self.get_demo_user_id()
            
            if timestamp is None:
                timestamp = datetime.now()
            
            data = {
                'user_id': self.user_id,
                'timestamp': timestamp.isoformat(),
                'app_name': app_name,
                'window_title': window_title,
                'category': category.lower(),
                'duration_seconds': duration_seconds,
                'date': timestamp.date().isoformat()
            }
            
            result = self.supabase.table('activity_logs').insert(data).execute()
            return True
            
        except Exception as e:
            print(f"Error inserting activity log: {e}")
            return False
    
    def insert_activity_batch(self, activities: List[Dict[str, Any]]) -> bool:
        """Insert multiple activity logs in batch"""
        try:
            if not self.user_id:
                self.get_demo_user_id()
            
            # Prepare batch data
            batch_data = []
            for activity in activities:
                timestamp = activity.get('timestamp', datetime.now())
                if isinstance(timestamp, str):
                    timestamp = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
                
                data = {
                    'user_id': self.user_id,
                    'timestamp': timestamp.isoformat(),
                    'app_name': activity['app_name'],
                    'window_title': activity['window_title'],
                    'category': activity['category'].lower(),
                    'duration_seconds': activity.get('duration_seconds', 5),
                    'date': timestamp.date().isoformat()
                }
                batch_data.append(data)
            
            # Insert batch
            result = self.supabase.table('activity_logs').insert(batch_data).execute()
            print(f"Successfully inserted {len(batch_data)} activity logs")
            return True
            
        except Exception as e:
            print(f"Error inserting activity batch: {e}")
            return False
    
    def get_daily_summary(self, target_date: date = None) -> Optional[Dict[str, Any]]:
        """Get daily summary for a specific date"""
        try:
            if not self.user_id:
                self.get_demo_user_id()
            
            if target_date is None:
                target_date = date.today()
            
            result = self.supabase.table('daily_summary')\
                .select('*')\
                .eq('user_id', self.user_id)\
                .eq('date', target_date.isoformat())\
                .single()\
                .execute()
            
            return result.data if result.data else None
            
        except Exception as e:
            # Only print error if it's not a "no rows" error
            error_dict = e.args[0] if e.args else {}
            if isinstance(error_dict, dict) and error_dict.get('code') != 'PGRST116':
                print(f"Error getting daily summary: {e}")
            return None
    
    def get_weekly_summary(self, target_date: date = None) -> Optional[Dict[str, Any]]:
        """Get weekly summary for the week containing target_date"""
        try:
            if not self.user_id:
                self.get_demo_user_id()
            
            if target_date is None:
                target_date = date.today()
            
            # Calculate week number
            year = target_date.year
            week_number = target_date.isocalendar()[1]
            
            result = self.supabase.table('weekly_summary')\
                .select('*')\
                .eq('user_id', self.user_id)\
                .eq('year', year)\
                .eq('week_number', week_number)\
                .single()\
                .execute()
            
            return result.data if result.data else None
            
        except Exception as e:
            # Only print error if it's not a "no rows" error
            error_dict = e.args[0] if e.args else {}
            if isinstance(error_dict, dict) and error_dict.get('code') != 'PGRST116':
                print(f"Error getting weekly summary: {e}")
            return None
    
    def get_last_n_days(self, days: int = 7) -> List[Dict[str, Any]]:
        """Get daily summaries for the last N days"""
        try:
            if not self.user_id:
                self.get_demo_user_id()
            
            start_date = date.today() - timedelta(days=days-1)
            
            result = self.supabase.table('daily_summary')\
                .select('*')\
                .eq('user_id', self.user_id)\
                .gte('date', start_date.isoformat())\
                .order('date', desc=False)\
                .execute()
            
            return result.data if result.data else []
            
        except Exception as e:
            error_dict = e.args[0] if e.args else {}
            if isinstance(error_dict, dict) and error_dict.get('code') != 'PGRST116':
                print(f"Error getting last {days} days: {e}")
            return []
    
    def get_top_apps(self, days: int = 7) -> Dict[str, List[Dict[str, Any]]]:
        """Get top apps by category for the last N days"""
        try:
            if not self.user_id:
                self.get_demo_user_id()
            
            start_date = date.today() - timedelta(days=days-1)
            
            result = self.supabase.table('app_usage')\
                .select('*')\
                .eq('user_id', self.user_id)\
                .gte('date', start_date.isoformat())\
                .order('total_minutes', desc=True)\
                .execute()
            
            # Group by category
            apps_by_category = {}
            for app in result.data:
                category = app['category']
                if category not in apps_by_category:
                    apps_by_category[category] = []
                apps_by_category[category].append(app)
            
            # Limit to top 5 per category
            for category in apps_by_category:
                apps_by_category[category] = apps_by_category[category][:5]
            
            return apps_by_category
            
        except Exception as e:
            error_dict = e.args[0] if e.args else {}
            if isinstance(error_dict, dict) and error_dict.get('code') != 'PGRST116':
                print(f"Error getting top apps: {e}")
            return {}
    
    def get_activity_logs(self, target_date: date = None, limit: int = 100) -> List[Dict[str, Any]]:
        """Get activity logs for a specific date"""
        try:
            if not self.user_id:
                self.get_demo_user_id()
            
            if target_date is None:
                target_date = date.today()
            
            result = self.supabase.table('activity_logs')\
                .select('*')\
                .eq('user_id', self.user_id)\
                .eq('date', target_date.isoformat())\
                .order('timestamp', desc=True)\
                .limit(limit)\
                .execute()
            
            return result.data if result.data else []
            
        except Exception as e:
            print(f"Error getting activity logs: {e}")
            return []
    
    def update_weekly_summary(self, target_date: date = None):
        """Manually trigger weekly summary calculation"""
        try:
            if not self.user_id:
                self.get_demo_user_id()
            
            if target_date is None:
                target_date = date.today()
            
            # Call the PostgreSQL function
            result = self.supabase.rpc('calculate_weekly_summary', {
                'target_user_id': self.user_id,
                'target_date': target_date.isoformat()
            }).execute()
            
            print(f"Weekly summary updated for {target_date}")
            return True
            
        except Exception as e:
            print(f"Error updating weekly summary: {e}")
            return False
    
    def cleanup_old_data(self, days_to_keep: int = 30):
        """Clean up old activity logs (keep only last N days)"""
        try:
            if not self.user_id:
                self.get_demo_user_id()
            
            cutoff_date = date.today() - timedelta(days=days_to_keep)
            
            # Delete old activity logs
            result = self.supabase.table('activity_logs')\
                .delete()\
                .eq('user_id', self.user_id)\
                .lt('date', cutoff_date.isoformat())\
                .execute()
            
            print(f"Cleaned up activity logs older than {cutoff_date}")
            return True
            
        except Exception as e:
            print(f"Error cleaning up old data: {e}")
            return False
    
    def get_comprehensive_stats(self) -> Dict[str, Any]:
        """Get all stats in one call for dashboard"""
        try:
            today_summary = self.get_daily_summary()
            last_7_days = self.get_last_n_days(7)
            top_apps = self.get_top_apps(7)
            
            return {
                'today': today_summary,
                'last_7_days': last_7_days,
                'top_apps': top_apps,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Error getting comprehensive stats: {e}")
            return {}
    
    def test_connection(self) -> bool:
        """Test Supabase connection"""
        try:
            # Try to query a simple table
            result = self.supabase.table('daily_summary').select('id').limit(1).execute()
            print("✅ Supabase connection successful!")
            return True
        except Exception as e:
            print(f"❌ Supabase connection failed: {e}")
            return False

# Test the connection when run directly
if __name__ == "__main__":
    try:
        helper = SupabaseHelper()
        helper.test_connection()
        
        # Test with demo user
        helper.set_user_id("00000000-0000-0000-0000-000000000001")
        
        # Test insert
        success = helper.insert_activity_log(
            app_name="test.exe",
            window_title="Test Application",
            category="study"
        )
        
        if success:
            print("✅ Test activity log inserted successfully!")
        else:
            print("❌ Failed to insert test activity log")
            
        # Test get today's summary
        summary = helper.get_daily_summary()
        if summary:
            print(f"✅ Today's summary: {summary}")
        else:
            print("ℹ️ No summary data found (this is normal for new setup)")
            
    except Exception as e:
        print(f"❌ Test failed: {e}")
        print("\nMake sure to:")
        print("1. Run the SQL schema in Supabase")
        print("2. Set environment variables in .env.local")
        print("3. Install required packages: pip install supabase python-dotenv")
