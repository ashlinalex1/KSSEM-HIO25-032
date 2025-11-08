"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RoleBasedHeader } from "@/components/role-based-header";
import { supabase } from "@/integrations/supabase/client";
import { getProfile, signOut } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Search, X, Smartphone, Monitor, TrendingUp, Calendar, ClipboardList, Award, Check, XCircle, Clock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type Student = {
  id: string;
  full_name: string;
  student_id: string;
  class: string;
  cgpa: string;
  performance_score?: number;
};

type ScreenTimeData = {
  phone_usage: number;
  desktop_usage: number;
  total_usage: number;
};

type AttendanceRecord = {
  id: string;
  student_id: string;
  course_code: string;
  course_name: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  remarks?: string;
};

type MarksRecord = {
  id: string;
  student_id: string;
  course_code: string;
  course_name: string;
  assessment_type: string;
  max_marks: number;
  marks_obtained: number;
  assessment_date: string;
  remarks?: string;
};

type TeacherCourse = {
  id: string;
  course_name: string;
  semester: string;
  year: number;
};

export default function TeacherDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [screenTimeData, setScreenTimeData] = useState<ScreenTimeData | null>(null);
  const [activeTab, setActiveTab] = useState("students");
  const [teacherCourses, setTeacherCourses] = useState<TeacherCourse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, 'present' | 'absent' | 'late'>>({});
  const [marksData, setMarksData] = useState<{studentId: string; assessmentType: string; maxMarks: number; marksObtained: number}>({studentId: '', assessmentType: 'IA1', maxMarks: 100, marksObtained: 0});

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/choose-role');
        return;
      }

      const userProfile = await getProfile(session.user.id);
      if (!userProfile || userProfile.role !== 'teacher') {
        router.push('/auth/choose-role');
        return;
      }

      setProfile(userProfile);
      
      // Load teacher's class info to get students
      const { data: teacherProfile, error: teacherError } = await supabase
        .from('teacher_profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (teacherError) {
        console.log('Teacher profile error (this is OK if profile not created yet):', teacherError);
      }
      
      // For now, load all students (in future, filter by teacher's classes)
      console.log('Fetching students...');
      const { data: studentsData, error: studentsError } = await supabase
        .from('profiles')
        .select('id, full_name, student_id, class, cgpa')
        .eq('role', 'student')
        .order('class', { ascending: true });
      
      console.log('Students data:', studentsData);
      console.log('Students error:', studentsError);
      
      if (studentsError) {
        console.error('Error fetching students:', studentsError);
      }
      
      if (studentsData) {
        console.log('Setting students:', studentsData.length, 'students found');
        setStudents(studentsData as Student[]);
        setFilteredStudents(studentsData as Student[]);
      } else {
        console.log('No students data returned');
        setStudents([]);
        setFilteredStudents([]);
      }
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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredStudents(students);
      return;
    }
    const filtered = students.filter(
      (s) =>
        s.full_name.toLowerCase().includes(query.toLowerCase()) ||
        s.student_id.toLowerCase().includes(query.toLowerCase()) ||
        s.class.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredStudents(filtered);
  };

  const handleStudentClick = async (student: Student) => {
    setSelectedStudent(student);
    
    // Fetch screen time data for this student
    // For now, using mock data - will be replaced with actual API call
    const mockScreenTime: ScreenTimeData = {
      phone_usage: Math.floor(Math.random() * 480), // Random 0-8 hours in minutes
      desktop_usage: Math.floor(Math.random() * 360), // Random 0-6 hours in minutes
      total_usage: 0,
    };
    mockScreenTime.total_usage = mockScreenTime.phone_usage + mockScreenTime.desktop_usage;
    setScreenTimeData(mockScreenTime);
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };


  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><p>Loading...</p></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <RoleBasedHeader 
        isLoggedIn={true} 
        userName={profile?.full_name || 'Teacher'} 
        userRole="teacher"
        onSignOut={handleSignOut} 
      /><br></br><br></br>
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Teacher Dashboard</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Students List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Students</CardTitle>
                <CardDescription>{filteredStudents.length} students</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Search Bar */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search by name, USN, or class"
                    className="pl-10"
                  />
                </div>

                {/* Students List */}
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {filteredStudents.map((student) => (
                    <div
                      key={student.id}
                      onClick={() => handleStudentClick(student)}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                        selectedStudent?.id === student.id ? 'bg-muted border-primary' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                          {getInitials(student.full_name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{student.full_name}</p>
                          <p className="text-xs text-muted-foreground">{student.student_id}</p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Class: {student.class}</span>
                        <span className="font-medium">CGPA: {student.cgpa || 'N/A'}</span>
                      </div>
                    </div>
                  ))}
                  {filteredStudents.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No students found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Student Details */}
          <div className="lg:col-span-2">
            {selectedStudent ? (
              <div className="space-y-6">
                {/* Student Info Card */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
                        {getInitials(selectedStudent.full_name)}
                      </div>
                      <div>
                        <CardTitle>{selectedStudent.full_name}</CardTitle>
                        <CardDescription>{selectedStudent.student_id}</CardDescription>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedStudent(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Class</p>
                        <p className="text-lg font-semibold">{selectedStudent.class}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">CGPA</p>
                        <p className="text-lg font-semibold">{selectedStudent.cgpa || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Performance Score</p>
                        <p className="text-lg font-semibold">
                          {selectedStudent.performance_score || 'Coming Soon'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Screen Time Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Screen Time Usage</CardTitle>
                    <CardDescription>Daily average usage</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {screenTimeData ? (
                      <div className="space-y-6">
                        {/* Total Usage */}
                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">Total Screen Time</p>
                          <p className="text-3xl font-bold">{formatTime(screenTimeData.total_usage)}</p>
                        </div>

                        {/* Phone Usage */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Smartphone className="h-5 w-5 text-blue-500" />
                              <span className="font-medium">Phone Usage</span>
                            </div>
                            <span className="text-lg font-semibold">{formatTime(screenTimeData.phone_usage)}</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500"
                              style={{
                                width: `${(screenTimeData.phone_usage / screenTimeData.total_usage) * 100}%`,
                              }}
                            ></div>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {((screenTimeData.phone_usage / screenTimeData.total_usage) * 100).toFixed(1)}% of total time
                          </p>
                        </div>

                        {/* Desktop Usage */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Monitor className="h-5 w-5 text-purple-500" />
                              <span className="font-medium">Desktop Usage</span>
                            </div>
                            <span className="text-lg font-semibold">{formatTime(screenTimeData.desktop_usage)}</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-purple-500"
                              style={{
                                width: `${(screenTimeData.desktop_usage / screenTimeData.total_usage) * 100}%`,
                              }}
                            ></div>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {((screenTimeData.desktop_usage / screenTimeData.total_usage) * 100).toFixed(1)}% of total time
                          </p>
                        </div>

                        {/* Insights */}
                        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                          <div className="flex items-start space-x-2">
                            <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                            <div>
                              <p className="font-medium text-blue-900 dark:text-blue-100">Usage Insights</p>
                              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                                {screenTimeData.phone_usage > screenTimeData.desktop_usage
                                  ? 'Student spends more time on phone than desktop.'
                                  : 'Student spends more time on desktop than phone.'}
                              </p>
                              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                                Total daily screen time: {formatTime(screenTimeData.total_usage)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Monitor className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Loading screen time data...</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-[400px]">
                  <div className="text-center text-muted-foreground">
                    <User className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Select a student</p>
                    <p className="text-sm">Click on a student to view their details and screen time usage</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
