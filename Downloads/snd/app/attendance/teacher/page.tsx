"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { RoleBasedHeader } from "@/components/role-based-header";
import { getProfile, signOut } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Check, XCircle, Clock, Search, User } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

type Student = {
  id: string;
  full_name: string;
  student_id: string;
  class: string;
};

type TeacherCourse = {
  id: string;
  course_name: string;
  semester: string;
  year: number;
};

type AttendanceRecord = {
  student_id: string;
  status: 'present' | 'absent' | 'late';
  remarks: string;
};

export default function TeacherAttendance() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [teacherCourses, setTeacherCourses] = useState<TeacherCourse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showMarkDialog, setShowMarkDialog] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState<'present' | 'absent' | 'late'>('present');
  const [remarks, setRemarks] = useState("");
  const [todayAttendance, setTodayAttendance] = useState<Record<string, AttendanceRecord>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
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
        
        // Load teacher's courses
        const { data: coursesData } = await supabase
          .from('teacher_courses')
          .select('*')
          .eq('teacher_id', session.user.id)
          .order('course_name');
        
        if (coursesData) {
          setTeacherCourses(coursesData);
          if (coursesData.length > 0) {
            setSelectedCourse(coursesData[0].course_name);
          }
        }
        
        // Load all students
        const { data: studentsData } = await supabase
          .from('profiles')
          .select('id, full_name, student_id, class')
          .eq('role', 'student')
          .order('full_name');
        
        if (studentsData) {
          setStudents(studentsData);
          setFilteredStudents(studentsData);
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

  useEffect(() => {
    if (selectedCourse && selectedDate) {
      loadTodayAttendance();
    }
  }, [selectedCourse, selectedDate]);

  const loadTodayAttendance = async () => {
    if (!selectedCourse || !selectedDate) return;
    
    const { data } = await supabase
      .from('attendance')
      .select('*')
      .eq('course_name', selectedCourse)
      .eq('date', selectedDate);
    
    if (data) {
      const attendanceMap: Record<string, AttendanceRecord> = {};
      data.forEach((record) => {
        attendanceMap[record.student_id] = {
          student_id: record.student_id,
          status: record.status,
          remarks: record.remarks || '',
        };
      });
      setTodayAttendance(attendanceMap);
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

  const handleMarkAttendance = (student: Student) => {
    setSelectedStudent(student);
    const existing = todayAttendance[student.id];
    if (existing) {
      setAttendanceStatus(existing.status);
      setRemarks(existing.remarks);
    } else {
      setAttendanceStatus('present');
      setRemarks('');
    }
    setShowMarkDialog(true);
  };

  const handleSaveAttendance = async () => {
    if (!selectedStudent || !selectedCourse || !profile) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('attendance')
        .upsert({
          student_id: selectedStudent.id,
          teacher_id: profile.id,
          course_code: selectedCourse.substring(0, 10), // Generate code from name
          course_name: selectedCourse,
          date: selectedDate,
          status: attendanceStatus,
          remarks: remarks,
        }, {
          onConflict: 'student_id,course_code,date'
        });
      
      if (error) {
        console.error('Error saving attendance:', error);
        alert('Failed to save attendance');
      } else {
        // Update local state
        setTodayAttendance(prev => ({
          ...prev,
          [selectedStudent.id]: {
            student_id: selectedStudent.id,
            status: attendanceStatus,
            remarks: remarks,
          }
        }));
        setShowMarkDialog(false);
        setSelectedStudent(null);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to save attendance');
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

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
        userName={profile?.full_name || 'Teacher'} 
        userRole="teacher"
        onSignOut={handleSignOut} 
      /><br></br><br></br>
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Attendance Management</h1>
        
        {/* Course and Date Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Course and Date</CardTitle>
            <CardDescription>Choose the course and date to mark attendance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="course">Course</Label>
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger id="course">
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {teacherCourses.map((course) => (
                      <SelectItem key={course.id} value={course.course_name}>
                        {course.course_name} - {course.semester}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
            {selectedCourse && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <Calendar className="inline h-4 w-4 mr-2" />
                  Marking attendance for <strong>{selectedCourse}</strong> on <strong>{new Date(selectedDate).toLocaleDateString()}</strong>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Students List */}
        {selectedCourse && (
          <Card>
            <CardHeader>
              <CardTitle>Students</CardTitle>
              <CardDescription>
                {filteredStudents.length} students | {Object.keys(todayAttendance).length} marked today
              </CardDescription>
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

              {/* Students Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStudents.map((student) => {
                  const attendance = todayAttendance[student.id];
                  return (
                    <div
                      key={student.id}
                      onClick={() => handleMarkAttendance(student)}
                      className="p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md hover:border-primary"
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                          {getInitials(student.full_name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{student.full_name}</p>
                          <p className="text-sm text-muted-foreground">{student.student_id}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Class: {student.class}</span>
                        {attendance ? (
                          <Badge className={getStatusColor(attendance.status)}>
                            {getStatusIcon(attendance.status)}
                            <span className="ml-1 capitalize">{attendance.status}</span>
                          </Badge>
                        ) : (
                          <Badge variant="outline">Not Marked</Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredStudents.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <User className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No students found</p>
                  <p className="text-sm">Try adjusting your search</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {!selectedCourse && (
          <Card>
            <CardContent className="flex items-center justify-center h-64">
              <div className="text-center text-muted-foreground">
                <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Select a course to start</p>
                <p className="text-sm">Choose a course and date to mark attendance</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mark Attendance Dialog */}
        <Dialog open={showMarkDialog} onOpenChange={setShowMarkDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Mark Attendance</DialogTitle>
              <DialogDescription>
                Mark attendance for {selectedStudent?.full_name} ({selectedStudent?.student_id})
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Course</Label>
                <Input value={selectedCourse} disabled />
              </div>
              
              <div className="space-y-2">
                <Label>Date</Label>
                <Input value={new Date(selectedDate).toLocaleDateString()} disabled />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Attendance Status</Label>
                <Select value={attendanceStatus} onValueChange={(value: any) => setAttendanceStatus(value)}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="present">
                      <div className="flex items-center">
                        <Check className="h-4 w-4 mr-2 text-green-600" />
                        Present
                      </div>
                    </SelectItem>
                    <SelectItem value="absent">
                      <div className="flex items-center">
                        <XCircle className="h-4 w-4 mr-2 text-red-600" />
                        Absent
                      </div>
                    </SelectItem>
                    <SelectItem value="late">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-yellow-600" />
                        Late
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="remarks">Remarks (Optional)</Label>
                <Textarea
                  id="remarks"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Add any remarks or notes..."
                  rows={3}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowMarkDialog(false)} disabled={isSaving}>
                Cancel
              </Button>
              <Button onClick={handleSaveAttendance} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Attendance'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
