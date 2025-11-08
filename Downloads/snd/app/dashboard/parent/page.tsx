'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { RoleBasedHeader } from "@/components/role-based-header";
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

export default function ParentDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activityData, setActivityData] = useState<ActivityData>({});
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState<string>("");
  const [stock, setStock] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch("http://localhost:5001/api/email", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ 
          recipient_email: email, 
          stock_name: stock || "General" 
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Subscription successful:", data);
      alert(`Thank you for subscribing! ${data.message || ''}`);
      setEmail("");
      setStock("");
    } catch (error) {
      console.error("Subscription error:", error);
      alert("Couldn't connect to the subscription service. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const [screenTimeData, setScreenTimeData] = useState<WeeklyData[]>([
    { day: "Mon", study: 3.5, entertainment: 2.0, work: 1.5, social: 0.8 },
    { day: "Tue", study: 4.2, entertainment: 1.8, work: 2.0, social: 1.2 },
    { day: "Wed", study: 2.8, entertainment: 2.5, work: 1.8, social: 0.9 },
    { day: "Thu", study: 3.1, entertainment: 1.9, work: 2.2, social: 1.1 },
    { day: "Fri", study: 2.5, entertainment: 2.8, work: 1.5, social: 1.5 },
    { day: "Sat", study: 1.5, entertainment: 4.0, work: 0.5, social: 2.0 },
    { day: "Sun", study: 2.0, entertainment: 3.2, work: 0.8, social: 1.8 }
  ]);

  const totalScreenTimeData = screenTimeData.map((d) => ({
    ...d,
    total: d.study + d.entertainment + d.work + d.social
  }));

  useEffect(() => {
    checkAuth();
    fetchActivityData();
    
    // Set up real-time updates every 10 seconds
    const interval = setInterval(fetchActivityData, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/choose-role');
        return;
      }

      const userProfile = await getProfile(session.user.id);
      if (!userProfile || userProfile.role !== 'parent') {
        router.push('/auth/choose-role');
        return;
      }

      setProfile(userProfile);
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/auth/choose-role');
    } finally {
      setIsLoading(false);
    }
  };

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
              We couldn't find your profile. Please sign in again.
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

  return (
    <div className="min-h-screen bg-background">
      <RoleBasedHeader 
        isLoggedIn={true} 
        userName={profile?.full_name || 'Parent'} 
        userRole="parent"
        onSignOut={handleSignOut} 
      />
      <main className="container mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            <br></br>
          </h1><br></br>
          <p className="text-muted-foreground">Here's your child's activity overview</p>
          
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
              <CardDescription>Real-time desktop usage by category</CardDescription>
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
                      <p className="text-sm">Start tracking to see usage</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Weekly Activity Trend */}
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Weekly Activity Trend</CardTitle>
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
              <p className="text-xs text-muted-foreground mt-1">Desktop activity tracked</p>
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
                  <p className="text-sm">Desktop activity will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Newsletter Section */}
        <section className="py-12 bg-gray-900 rounded-lg my-8">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-6 text-white">Get Career Updates</h2>
            <p className="text-gray-300 text-center mb-8">
              Subscribe to receive personalized tips, job alerts, and resume improvement suggestions tailored to your career goals.
            </p>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-300">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-white"
                  placeholder="your@email.com"
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-lg font-semibold transition-colors text-white"
              >
                Subscribe
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
