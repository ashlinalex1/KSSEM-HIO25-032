"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Save, X, Mail, Phone, MapPin, User, GraduationCap, BookOpen, Award, Trash2, Plus } from "lucide-react";

type AppUser = {
  id: string;
  email: string | null;
  name: string;
  phone: string | null;
  address: string | null;
  created_at: string | null;
};

export default function TeacherProfile() {
  const router = useRouter();
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [isEditingProfessional, setIsEditingProfessional] = useState(false);
  const [editingCourse, setEditingCourse] = useState<number | null>(null);
  const [courseName, setCourseName] = useState("");
  const [courseSemester, setCourseSemester] = useState("");
  const [courseYear, setCourseYear] = useState("");

  const [formData, setFormData] = useState({
    fullName: "Dr. Jane Smith",
    email: "teacher@mindstride.com",
    phone: "+1 (555) 987-6543",
    address: "456 Faculty Lane, City, State",
    qualification: "Ph.D. in Computer Science",
    specialization: "Artificial Intelligence",
    experienceYears: "10",
    researchArea: "Machine Learning",
  });

  const [subjectsTaught, setSubjectsTaught] = useState<string[]>(["Data Structures", "AI", "Python"]);
  const [publications, setPublications] = useState<string[]>(["Paper on Deep Learning - 2022"]);
  const [awards, setAwards] = useState<string[]>(["Best Faculty 2023"]);

  type Course = { id: string; course_name: string; semester: string; year: number };
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/auth");
        return;
      }
      const sUser = session.user;
      const appUser: AppUser = {
        id: sUser.id,
        email: sUser.email ?? null,
        name: sUser.user_metadata?.full_name || sUser.email?.split("@")[0] || "",
        phone: sUser.user_metadata?.phone ?? null,
        address: sUser.user_metadata?.address ?? null,
        created_at: sUser.created_at ?? null,
      };
      setUser(appUser);
      
      // Load profile row
      const { data: profileRow } = await supabase
        .from("profiles")
        .select("full_name,email,phone,address")
        .eq("id", sUser.id)
        .single();

      // Load teacher profile
      const { data: teacherRow } = await supabase
        .from("teacher_profiles")
        .select("qualification,specialization,experience_years,subjects_taught,research_area,publications,awards")
        .eq("id", sUser.id)
        .single();

      setFormData((prev) => ({
        ...prev,
        fullName: profileRow?.full_name ?? appUser.name ?? prev.fullName,
        email: profileRow?.email ?? appUser.email ?? prev.email,
        phone: profileRow?.phone ?? appUser.phone ?? prev.phone,
        address: profileRow?.address ?? appUser.address ?? prev.address,
        qualification: teacherRow?.qualification ?? prev.qualification,
        specialization: teacherRow?.specialization ?? prev.specialization,
        experienceYears: teacherRow?.experience_years?.toString() ?? prev.experienceYears,
        researchArea: teacherRow?.research_area ?? prev.researchArea,
      }));

      setSubjectsTaught(teacherRow?.subjects_taught ?? []);
      setPublications(teacherRow?.publications ?? []);
      setAwards(teacherRow?.awards ?? []);

      // Load courses for teacher
      const { data: courseRows } = await supabase
        .from("teacher_courses")
        .select("id,course_name,semester,year")
        .eq("teacher_id", sUser.id)
        .order("created_at", { ascending: false });
      setCourses((courseRows || []).map((c) => ({ 
        id: c.id as string, 
        course_name: c.course_name as string,
        semester: c.semester as string,
        year: c.year as number
      })));
      setLoading(false);
    })();
  }, [router]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSave = async () => {
    try {
      if (!user) return;
      await supabase.from("profiles").upsert({
        id: user.id,
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        role: 'teacher',
        updated_at: new Date().toISOString(),
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
      }));
    }
    setIsEditing(false);
  };

  const handleSaveProfessional = async () => {
    try {
      if (!user) return;
      await supabase.from("teacher_profiles").upsert({
        id: user.id,
        qualification: formData.qualification,
        specialization: formData.specialization,
        experience_years: parseInt(formData.experienceYears) || 0,
        research_area: formData.researchArea,
        subjects_taught: subjectsTaught,
        publications: publications,
        awards: awards,
        updated_at: new Date().toISOString(),
      });
      setIsEditingProfessional(false);
    } catch (error) {
      console.error("Failed to update professional info:", error);
    }
  };

  const handleAddCourse = async () => {
    if (!courseName.trim() || !user) return;
    try {
      const { data, error } = await supabase
        .from("teacher_courses")
        .insert({ 
          teacher_id: user.id, 
          course_name: courseName,
          semester: courseSemester,
          year: parseInt(courseYear) || new Date().getFullYear()
        })
        .select("id,course_name,semester,year")
        .single();
      if (error) throw error;
      if (!data) return;
      setCourses([{ 
        id: data.id as string, 
        course_name: data.course_name as string,
        semester: data.semester as string,
        year: data.year as number
      }, ...courses]);
    } catch (e) {
      console.error("Failed to add course", e);
    } finally {
      setCourseName("");
      setCourseSemester("");
      setCourseYear("");
      setEditingCourse(null);
    }
  };

  const handleDeleteCourse = async (index: number) => {
    const course = courses[index];
    if (!course || !user) return;
    try {
      const { error } = await supabase.from("teacher_courses").delete().eq("id", course.id).eq("teacher_id", user.id);
      if (error) throw error;
      setCourses(courses.filter((_, i) => i !== index));
    } catch (e) {
      console.error("Failed to delete course", e);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><p>Loading...</p></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Teacher Profile</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Profile Overview</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="h-32 w-32 mb-4 rounded-full bg-muted flex items-center justify-center text-xl font-bold">
                  {getInitials(user?.name || user?.email || "")}
                </div>
                <h3 className="text-xl font-bold text-foreground mb-1 text-center">
                  {user?.name || user?.email || "User"}
                </h3>
                <div className="text-sm text-muted-foreground mb-4 w-full text-center">
                  {user?.email}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="flex flex-row justify-between items-center">
                <div>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </div>
                {isEditing ? (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleCancel}>
                      <X className="h-4 w-4 mr-1" /> Cancel
                    </Button>
                    <Button size="sm" onClick={handleSave}>
                      <Save className="h-4 w-4 mr-1" /> Save
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="fullName" className="text-sm text-muted-foreground">Full Name</label>
                    <input
                      id="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full border rounded-md px-3 py-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm text-muted-foreground">Email</label>
                    <input
                      id="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full border rounded-md px-3 py-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm text-muted-foreground">Phone</label>
                    <input
                      id="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full border rounded-md px-3 py-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="address" className="text-sm text-muted-foreground">Address</label>
                    <input
                      id="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full border rounded-md px-3 py-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row justify-between items-center">
                <div>
                  <CardTitle>Professional Information</CardTitle>
                  <CardDescription>Your academic and professional details</CardDescription>
                </div>
                {isEditingProfessional ? (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsEditingProfessional(false)}>
                      <X className="h-4 w-4 mr-1" /> Cancel
                    </Button>
                    <Button size="sm" onClick={handleSaveProfessional}>
                      <Save className="h-4 w-4 mr-1" /> Save
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => setIsEditingProfessional(true)}>
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="qualification" className="text-sm text-muted-foreground">Qualification</label>
                    <input
                      id="qualification"
                      value={formData.qualification}
                      onChange={handleInputChange}
                      disabled={!isEditingProfessional}
                      className="w-full border rounded-md px-3 py-2"
                      placeholder="e.g., Ph.D. in Computer Science"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="specialization" className="text-sm text-muted-foreground">Specialization</label>
                    <input
                      id="specialization"
                      value={formData.specialization}
                      onChange={handleInputChange}
                      disabled={!isEditingProfessional}
                      className="w-full border rounded-md px-3 py-2"
                      placeholder="e.g., Artificial Intelligence"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="experienceYears" className="text-sm text-muted-foreground">Experience (Years)</label>
                      <input
                        id="experienceYears"
                        type="number"
                        value={formData.experienceYears}
                        onChange={handleInputChange}
                        disabled={!isEditingProfessional}
                        className="w-full border rounded-md px-3 py-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="researchArea" className="text-sm text-muted-foreground">Research Area</label>
                      <input
                        id="researchArea"
                        value={formData.researchArea}
                        onChange={handleInputChange}
                        disabled={!isEditingProfessional}
                        className="w-full border rounded-md px-3 py-2"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Courses Handled</CardTitle>
                <CardDescription>Manage your courses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {courses.map((course, idx) => (
                    <div key={course.id} className="flex justify-between items-center p-3 border rounded-md">
                      <div>
                        <p className="font-medium">{course.course_name}</p>
                        <p className="text-sm text-muted-foreground">{course.semester} Semester - {course.year}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteCourse(idx)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <input
                      value={courseName}
                      onChange={(e) => setCourseName(e.target.value)}
                      placeholder="Course name"
                      className="flex-1 border rounded-md px-3 py-2"
                    />
                    <input
                      value={courseSemester}
                      onChange={(e) => setCourseSemester(e.target.value)}
                      placeholder="Semester"
                      className="w-24 border rounded-md px-3 py-2"
                    />
                    <input
                      value={courseYear}
                      onChange={(e) => setCourseYear(e.target.value)}
                      placeholder="Year"
                      className="w-24 border rounded-md px-3 py-2"
                    />
                    <Button onClick={handleAddCourse}>
                      <Plus className="h-4 w-4 mr-1" /> Add
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
