import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://aqgkchsnapehyhhwxcba.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxZ2tjaHNuYXBlaHloaHd4Y2JhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzMzQ0NzAsImV4cCI6MjA3NzkxMDQ3MH0.am6GN0Z2XFGkBpkMhFqEAYvQhLejjX8DW_mOzYy9U-g"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Activity data types
export interface ActivityLog {
  id: number
  user_id: string
  timestamp: string
  app_name: string
  window_title: string
  category: string
  duration_seconds: number
  date: string
  created_at: string
  updated_at: string
}

export interface DailySummary {
  id: number
  user_id: string
  date: string
  study_minutes: number
  entertainment_minutes: number
  others_minutes: number
  work_minutes: number
  social_minutes: number
  productivity_minutes: number
  gaming_minutes: number
  total_minutes: number
  study_percentage: number
  entertainment_percentage: number
  others_percentage: number
  most_used_app: string
  total_activities: number
  created_at: string
  updated_at: string
}

export interface WeeklySummary {
  id: number
  user_id: string
  week_start_date: string
  week_end_date: string
  year: number
  week_number: number
  study_minutes: number
  entertainment_minutes: number
  others_minutes: number
  work_minutes: number
  social_minutes: number
  productivity_minutes: number
  gaming_minutes: number
  total_minutes: number
  study_percentage: number
  entertainment_percentage: number
  others_percentage: number
  avg_daily_minutes: number
  most_productive_day: string
  created_at: string
  updated_at: string
}

export interface AppUsage {
  id: number
  user_id: string
  date: string
  app_name: string
  category: string
  usage_count: number
  total_minutes: number
  created_at: string
  updated_at: string
}
