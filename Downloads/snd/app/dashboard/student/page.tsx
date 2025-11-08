"use client";

import { useEffect, useState } from "react";
import { RoleBasedHeader } from "@/components/role-based-header";
import { useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { getProfile, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Calendar, TrendingUp, Clock, Activity, Zap } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";

type ActivityData = {
  [category: string]: number;
};

type ActivityStats = {
  data: ActivityData;
  timestamp: string;
  success: boolean;
  error?: string;
};

type WeeklyData = {
  day: string;
  study: number;
  entertainment: number;
  work: number;
  social: number;
};

type PhoneUsageData = {
  total_minutes: number;
  total_apps: number;
  top_apps: { app: string; minutes: number }[];
  message: string;
};

type PhoneWeeklyData = {
  day: string;
  date: string;
  minutes: number;
  top_app: string;
};

export default function StudentDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<{ full_name: string; role: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activityData, setActivityData] = useState<ActivityData>({});
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string>("");
  
  // Phone usage state
  const [phoneUsage, setPhoneUsage] = useState<PhoneUsageData>({
    total_minutes: 0,
    total_apps: 0,
    top_apps: [],
    message: ''
  });
  const [phoneWeeklyData, setPhoneWeeklyData] = useState<PhoneWeeklyData[]>([]);
  const [phoneError, setPhoneError] = useState<string>("");

  // Mock weekly data for demonstration (you can replace with real data)
  const screenTimeData: WeeklyData[] = [
    { day: "Mon", study: 4.5, entertainment: 2.5, work: 1.0, social: 1.0 },
    { day: "Tue", study: 5.2, entertainment: 1.8, work: 1.5, social: 0.8 },
    { day: "Wed", study: 3.8, entertainment: 2.2, work: 1.2, social: 1.2 },
    { day: "Thu", study: 4.1, entertainment: 1.9, work: 1.8, social: 0.9 },
    { day: "Fri", study: 3.5, entertainment: 2.5, work: 1.0, social: 1.5 },
    { day: "Sat", study: 2.5, entertainment: 3.5, work: 0.5, social: 2.5 },
    { day: "Sun", study: 1.5, entertainment: 4.0, work: 0.5, social: 2.0 },
  ];

  const totalScreenTimeData = screenTimeData.map((d) => ({
    ...d,
    total: d.study + d.entertainment + d.work + d.social,
  }));

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/auth/choose-role');
          return;
        }

        const userProfile = await getProfile(session.user.id);
        if (!userProfile || userProfile.role !== 'student') {
          router.push('/auth/choose-role');
          return;
        }

        setProfile(userProfile);
        fetchActivityData();
        fetchPhoneUsage();
        fetchPhoneWeekly();
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/auth/choose-role');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
    // Set up real-time updates every 10 seconds
    const interval = setInterval(() => {
      fetchActivityData();
      fetchPhoneUsage();
      fetchPhoneWeekly();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [router]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-6 w-16" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-2 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <Skeleton className="h-6 w-32 mb-4" />
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-8" />
                    </div>
                    <Skeleton className="h-2 w-full" />
                  </div>
                ))}
              </CardHeader>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <Skeleton className="h-6 w-32 mb-4" />
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                ))}
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Profile Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              We couldn&apos;t find your profile. Please sign in again.
            </p>
            <Button onClick={handleSignOut} className="w-full">
              Back to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Helper functions for the dashboard
  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getCategoryColor = (category: string): string => {
    const colors: { [key: string]: string } = {
      'study': '#3b82f6',
      'entertainment': '#ef4444',
      'others': '#6b7280',
    };
    return colors[category.toLowerCase()] || '#6b7280';
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: any } = {
      'study': BookOpen,
      'entertainment': Activity,
      'others': Clock,
    };
    return icons[category.toLowerCase()] || Clock;
  };

  // Normalize categories: map any unknown to 'others'
  const normalizeCategory = (name: string): string => {
    const n = (name || '').toLowerCase();
    if (n === 'study' || n === 'entertainment') {
      return n;
    }
    return 'others';
  };

  const aggregated: Record<string, number> = Object.entries(activityData).reduce((acc, [key, val]) => {
    const nk = normalizeCategory(key);
    acc[nk] = (acc[nk] || 0) + (val || 0);
    return acc;
  }, {} as Record<string, number>);

  const totalTime = Object.values(aggregated).reduce((sum, time) => sum + time, 0);
  const sortedCategories = Object.entries(aggregated)
    .sort(([,a], [,b]) => b - a)
    .map(([category, time]) => ({ 
      category, 
      time, 
      percentage: totalTime > 0 ? (time / totalTime) * 100 : 0,
      color: getCategoryColor(category),
      Icon: getCategoryIcon(category)
    }));

  // Prepare pie chart data
  const pieChartData = sortedCategories.map(({ category, time, color }) => ({
    name: category.charAt(0).toUpperCase() + category.slice(1),
    value: time,
    color: color,
  }));

  async function fetchActivityData() {
    try {
      // Fetch from Supabase via Flask backend
      const response = await fetch('http://127.0.0.1:5000/api/daily-summary');
      
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const summary = await response.json();
      
      if (summary && summary.total_minutes > 0) {
        // Convert Supabase data to activity data format (only 3 categories)
        const data: ActivityData = {
          study: summary.study_minutes || 0,
          entertainment: summary.entertainment_minutes || 0,
          others: summary.others_minutes || 0
        };
        
        setActivityData(data);
        setLastUpdated(summary.updated_at || new Date().toISOString());
        setError("");
        setIsTracking(true);
      } else {
        // No data yet today
        setActivityData({});
        setLastUpdated(new Date().toISOString());
        setError("");
        setIsTracking(true);
      }
    } catch (err) {
      setError("Backend server not running. Please start run_tracker.py");
      setIsTracking(false);
    }
  }

  async function fetchPhoneUsage() {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/phone-usage-today');
      if (response.ok) {
        const data = await response.json();
        console.log('Phone usage data received:', data);
        setPhoneUsage(data);
        setPhoneError("");
      } else {
        console.error('Phone usage fetch failed:', response.status);
        setPhoneError(`Failed to fetch phone data: ${response.status}`);
      }
    } catch (err) {
      console.error('Phone usage error:', err);
      setPhoneError("Unable to fetch phone usage data");
    }
  }

  async function fetchPhoneWeekly() {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/phone-usage-weekly');
      if (response.ok) {
        const data = await response.json();
        setPhoneWeeklyData(data.weekly_data || []);
      }
    } catch (err) {
      console.error("Error fetching phone weekly data:", err);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <RoleBasedHeader 
        isLoggedIn={true} 
        userName={profile?.full_name || 'Student'} 
        userRole="student"
        onSignOut={handleSignOut} 
      />
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <br></br><br></br>
              
            </div>
            
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {profile.full_name || 'Student'}!
          </h1>
          <p className="text-muted-foreground">Here's your study activity overview</p>
          
          {/* Status Indicator */}
          <div className="mt-4 flex items-center space-x-4">
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
              isTracking 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                isTracking ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span>{isTracking ? 'Tracking Active' : 'Tracking Inactive'}</span>
            </div>

            {lastUpdated && (
              <span className="text-sm text-muted-foreground">
                Last updated: {new Date(lastUpdated).toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Backend Connection Error</h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  <p>{error}</p>
                  <p className="mt-1">To start tracking, run: <code className="bg-red-100 dark:bg-red-900/30 px-1 rounded">python backend/run_tracker.py</code></p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Real-time Activity Visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Real-time Activity Pie Chart */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Today's Activity Distribution</CardTitle>
              <CardDescription>Your desktop usage by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                {pieChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [formatTime(value), 'Time']}
                        contentStyle={{
                          backgroundColor: "hsl(var(--background))",
                          borderColor: "hsl(var(--border))",
                          borderRadius: "0.5rem",
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No activity data available</p>
                      <p className="text-sm">Start tracking to see your usage</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Weekly Activity Trend */}
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Weekly Study Trend</CardTitle>
              <CardDescription>Study vs Entertainment hours this week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={screenTimeData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="studyWeekGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="entertainmentGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                      </linearGradient>
                    </defs>

                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                      tickLine={{ stroke: "hsl(var(--border))" }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                      tickLine={{ stroke: "hsl(var(--border))" }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                      width={30}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "0.5rem",
                        boxShadow: "0 2px 8px rgba(64,64,64,0.15)",
                      }}
                    />
                    <Legend />

                    <Area
                      type="monotone"
                      dataKey="study"
                      name="Study Time"
                      stroke="#3b82f6"
                      fillOpacity={1}
                      fill="url(#studyWeekGradient)"
                      strokeWidth={2}
                      activeDot={{ r: 6 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="entertainment"
                      name="Entertainment Time"
                      stroke="#f43f5e"
                      fillOpacity={1}
                      fill="url(#entertainmentGradient)"
                      strokeWidth={2}
                      activeDot={{ r: 6 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Screen Time Today</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{formatTime(totalTime)}</div>
              <p className="text-xs text-muted-foreground mt-1">Total active time today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Study Time</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{formatTime(activityData.study || 0)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {totalTime > 0 ? `${((activityData.study || 0) / totalTime * 100).toFixed(1)}%` : '0%'} of total time
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Categories</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{Object.keys(activityData).length}</div>
              <p className="text-xs text-muted-foreground mt-1">Different activities tracked</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Most Active</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground capitalize">
                {sortedCategories[0]?.category || 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {sortedCategories[0] ? formatTime(sortedCategories[0].time) : 'No data'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Activity Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Activity Breakdown</CardTitle>
              <CardDescription>Detailed time distribution by category</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {sortedCategories.length > 0 ? (
                sortedCategories.map(({ category, time, percentage, Icon }) => (
                  <div key={category}>
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground capitalize">{category}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{formatTime(time)}</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                    <div className="text-xs text-muted-foreground mt-1">{percentage.toFixed(1)}% of total time</div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No activity data available</p>
                  <p className="text-sm">Start tracking to see your usage patterns</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Real-time Activity</CardTitle>
              <CardDescription>Current desktop usage status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {sortedCategories.slice(0, 5).map(({ category, time, percentage, Icon, color }) => (
                <div key={category} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: color }}
                    ></div>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-foreground capitalize">{category}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">{formatTime(time)}</p>
                    <p className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</p>
                  </div>
                </div>
              ))}
              {sortedCategories.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No activity recorded today</p>
                  <p className="text-sm">Your desktop activity will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Phone Usage Section */}
        <div className="mt-12 mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">📱 Phone Usage Tracking</h2>
          
          {phoneError && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-4">
              {phoneError}
            </div>
          )}

          {/* Phone Usage Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Phone Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {formatTime(phoneUsage.total_minutes)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Today&apos;s usage</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Apps Used</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{phoneUsage.total_apps}</div>
                <p className="text-xs text-muted-foreground mt-1">Different apps</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Top App</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground truncate">
                  {phoneUsage.top_apps[0]?.app || 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {phoneUsage.top_apps[0] ? formatTime(phoneUsage.top_apps[0].minutes) : 'No data'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Phone Usage Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 7-Day Phone Usage Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Weekly Phone Usage</CardTitle>
                <CardDescription>Last 7 days phone activity</CardDescription>
              </CardHeader>
              <CardContent>
                {phoneWeeklyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={phoneWeeklyData}>
                      <XAxis dataKey="day" stroke="#888888" />
                      <YAxis stroke="#888888" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-card p-3 border border-border rounded shadow-lg">
                                <p className="font-semibold">{data.day}</p>
                                <p className="text-sm">Time: {formatTime(data.minutes)}</p>
                                <p className="text-sm">Top App: {data.top_app}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="minutes" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No phone usage data available</p>
                    <p className="text-sm">Connect your Android app to start tracking</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Apps List */}
            <Card>
              <CardHeader>
                <CardTitle>Top Apps Today</CardTitle>
                <CardDescription>Most used applications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {phoneUsage.top_apps.length > 0 ? (
                  phoneUsage.top_apps.map((app, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <span className="font-medium text-foreground">{app.app}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">{formatTime(app.minutes)}</p>
                        <p className="text-xs text-muted-foreground">
                          {phoneUsage.total_minutes > 0 
                            ? `${((app.minutes / phoneUsage.total_minutes) * 100).toFixed(1)}%` 
                            : '0%'}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No app usage data today</p>
                    <p className="text-sm">Start using your phone to see stats</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

      </main>
    </div>
  );
}
