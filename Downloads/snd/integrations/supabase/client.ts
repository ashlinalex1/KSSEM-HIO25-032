import { createClient } from '@supabase/supabase-js';

// Supabase client configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://aqgkchsnapehyhhwxcba.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxZ2tjaHNuYXBlaHloaHd4Y2JhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzMzQ0NzAsImV4cCI6MjA3NzkxMDQ3MH0.am6GN0Z2XFGkBpkMhFqEAYvQhLejjX8DW_mOzYy9U-g";

// Create Supabase client with real-time support
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});
