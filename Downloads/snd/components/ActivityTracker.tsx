'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Gamepad2, 
  Clock, 
  TrendingUp, 
  RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { activityTracker, type ActivitySummary } from '@/lib/activity-tracker';

interface ActivityTrackerProps {
  userRole: 'student' | 'parent';
  studentName?: string; // For parent dashboard
}

export default function ActivityTracker({ userRole, studentName }: ActivityTrackerProps) {
  const [activitySummary, setActivitySummary] = useState<ActivitySummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [backendStatus, setBackendStatus] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    loadActivityData();
    checkBackendStatus();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadActivityData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadActivityData = async () => {
    try {
      setIsLoading(true);
      const summary = await activityTracker.getActivitySummary();
      setActivitySummary(summary);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading activity data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkBackendStatus = async () => {
    const status = await activityTracker.checkBackendStatus();
    setBackendStatus(status);
  };

  const handleRefresh = () => {
    loadActivityData();
    checkBackendStatus();
  };

  if (isLoading && !activitySummary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Activity Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <span className="ml-2">Loading activity data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!activitySummary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Activity Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No activity data available</p>
            <Button onClick={handleRefresh} className="mt-4">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const activityStatus = activityTracker.getActivityStatus(activitySummary);
  const productivityPercentage = activityTracker.getProductivityPercentage(activitySummary);

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Activity Tracker
                {userRole === 'parent' && studentName && (
                  <span className="text-sm font-normal text-gray-600">
                    - {studentName}
                  </span>
                )}
              </CardTitle>
              <CardDescription>
                Real-time desktop activity monitoring and classification
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {backendStatus ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                )}
                <span className="text-xs text-gray-600">
                  {backendStatus ? 'Connected' : 'Offline'}
                </span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activityTracker.formatTime(activitySummary.totalMinutes)}
            </div>
            <p className="text-xs text-muted-foreground">
              Tracked today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Time</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {activityTracker.formatTime(activitySummary.studyMinutes)}
            </div>
            <p className="text-xs text-muted-foreground">
              {productivityPercentage}% of total time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entertainment</CardTitle>
            <Gamepad2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {activityTracker.formatTime(activitySummary.entertainmentMinutes)}
            </div>
            <p className="text-xs text-muted-foreground">
              {activityTracker.getEntertainmentPercentage(activitySummary)}% of total time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productivity</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${activityStatus.color}`}>
              {productivityPercentage}%
            </div>
            <p className="text-xs text-muted-foreground">
              {activityStatus.message}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Breakdown</CardTitle>
          <CardDescription>
            Detailed view of time spent in different categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(activitySummary.categories).map(([category, minutes]) => {
              const percentage = activitySummary.totalMinutes > 0 
                ? Math.round((minutes / activitySummary.totalMinutes) * 100) 
                : 0;
              
              return (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
                    <span className="font-medium">{category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {activityTracker.formatTime(minutes)}
                    </Badge>
                    <span className="text-sm text-gray-600 w-12 text-right">
                      {percentage}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          
          {Object.keys(activitySummary.categories).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No activity data available for today
            </div>
          )}
        </CardContent>
      </Card>

      {/* Last Updated */}
      <div className="text-xs text-gray-500 text-center">
        Last updated: {lastUpdated.toLocaleTimeString()}
      </div>
    </div>
  );
}
