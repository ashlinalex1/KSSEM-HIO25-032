"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { RoleBasedHeader } from "@/components/role-based-header";
import { getProfile, signOut } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingUp, Check, XCircle, Clock } from "lucide-react";

type AttendanceSummary = {
  course_code: string;
  course_name: string;
  total_classes: number;
  classes_attended: number;
  classes_absent: number;
  classes_late: number;
  attendance_percentage: number;
};

type AttendanceDetail = {
  id: string;
  course_name: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  remarks?: string;
};

export default function StudentAttendance() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [attendanceSummary, setAttendanceSummary] = useState<AttendanceSummary[]>([]);
  const [recentAttendance, setRecentAttendance] = useState<AttendanceDetail[]>([]);
  const [overallPercentage, setOverallPercentage] = useState(0);

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
        
        // Load attendance summary
        const { data: summaryData } = await supabase
          .from('student_attendance_summary')
          .select('*')
          .eq('student_id', session.user.id);
        
        if (summaryData) {
          setAttendanceSummary(summaryData);
          
          // Calculate overall percentage
          if (summaryData.length > 0) {
            const totalPercentage = summaryData.reduce((sum, item) => sum + item.attendance_percentage, 0);
            setOverallPercentage(Math.round(totalPercentage / summaryData.length));
          }
        }
        
        // Load recent attendance records
        const { data: recentData } = await supabase
          .from('attendance')
          .select('*')
          .eq('student_id', session.user.id)
          .order('date', { ascending: false })
          .limit(10);
        
        if (recentData) {
          setRecentAttendance(recentData);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/auth/choose-role');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [router]);

  const getStatusColor = (status: 'present' | 'absent' | 'late') => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'absent': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'late': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    }
  };

  const getStatusIcon = (status: 'present' | 'absent' | 'late') => {
    switch (status) {
      case 'present': return <Check className="h-4 w-4" />;
      case 'absent': return <XCircle className="h-4 w-4" />;
      case 'late': return <Clock className="h-4 w-4" />;
    }
  };

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 75) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
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
      <div className="min-h-screen bg-background">
        <Skeleton className="h-16 w-full" />
        <div className="container mx-auto px-4 py-20">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <RoleBasedHeader 
        isLoggedIn={true} 
        userName={profile?.full_name || 'Student'} 
        userRole="student"
        onSignOut={handleSignOut} 
      />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Attendance</h1>
        
        {/* Overall Attendance Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Overall Attendance</CardTitle>
            <CardDescription>Your attendance across all courses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-4xl font-bold {getPercentageColor(overallPercentage)}">
                  {overallPercentage}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">Average Attendance</p>
              </div>
              <div className="text-right">
                <TrendingUp className={`h-12 w-12 ${getPercentageColor(overallPercentage)}`} />
              </div>
            </div>
            <Progress value={overallPercentage} className="mt-4 h-3" />
            {overallPercentage < 75 && (
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  ⚠️ Your attendance is below 75%. Please attend classes regularly.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Course-wise Attendance */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Course-wise Attendance</CardTitle>
            <CardDescription>Attendance breakdown by subject</CardDescription>
          </CardHeader>
          <CardContent>
            {attendanceSummary.length > 0 ? (
              <div className="space-y-4">
                {attendanceSummary.map((course) => (
                  <div key={course.course_code} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{course.course_name}</h3>
                        <p className="text-sm text-muted-foreground">{course.course_code}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-bold ${getPercentageColor(course.attendance_percentage)}`}>
                          {course.attendance_percentage}%
                        </p>
                      </div>
                    </div>
                    
                    <Progress value={course.attendance_percentage} className="mb-3 h-2" />
                    
                    <div className="grid grid-cols-4 gap-2 text-center text-sm">
                      <div>
                        <p className="font-semibold">{course.total_classes}</p>
                        <p className="text-muted-foreground">Total</p>
                      </div>
                      <div>
                        <p className="font-semibold text-green-600">{course.classes_attended}</p>
                        <p className="text-muted-foreground">Present</p>
                      </div>
                      <div>
                        <p className="font-semibold text-red-600">{course.classes_absent}</p>
                        <p className="text-muted-foreground">Absent</p>
                      </div>
                      <div>
                        <p className="font-semibold text-yellow-600">{course.classes_late}</p>
                        <p className="text-muted-foreground">Late</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No attendance records yet</p>
                <p className="text-sm">Your attendance will appear here once marked by teachers</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Attendance */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Attendance</CardTitle>
            <CardDescription>Last 10 attendance records</CardDescription>
          </CardHeader>
          <CardContent>
            {recentAttendance.length > 0 ? (
              <div className="space-y-3">
                {recentAttendance.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {getStatusIcon(record.status)}
                      </div>
                      <div>
                        <p className="font-medium">{record.course_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(record.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                        {record.remarks && (
                          <p className="text-xs text-muted-foreground mt-1">Note: {record.remarks}</p>
                        )}
                      </div>
                    </div>
                    <Badge className={getStatusColor(record.status)}>
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No recent attendance</p>
                <p className="text-sm">Your recent attendance records will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
