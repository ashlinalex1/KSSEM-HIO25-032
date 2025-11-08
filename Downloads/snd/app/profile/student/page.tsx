"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Save, X, Mail, Phone, MapPin, User, GraduationCap, BookOpen, Award } from "lucide-react";


type AppUser = {
  id: string;
  email: string | null;
  name?: string | null;
  phone?: string | null;
  address?: string | null;
  paremail?: string | null;
  semester?: string | null;
  cgpa?: string | null;
  graduationYear?: string | null;
  created_at?: string | null;
};


export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [isEditingAcademic, setIsEditingAcademic] = useState(false);
  const [editingCourse, setEditingCourse] = useState<number | null>(null);
  const [courseName, setCourseName] = useState("");

  const [formData, setFormData] = useState({
    fullName: "John Doe",
    email: "student@mindstride.com",
    phone: "+1 (555) 123-4567",
    address: "123 University Avenue, City, State",
    paremail: "parent@mindstride.com",
    studentId: "STU-2024-001",
    class: "DS-5A",
    semester: "6",
    cgpa: "8.7",
    graduationYear: "2026",
  });

  type Course = { id: string; name: string };
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
        paremail: sUser.user_metadata?.paremail ?? null,
        semester: sUser.user_metadata?.semester ?? null,
        cgpa: sUser.user_metadata?.cgpa ?? null,
        graduationYear: sUser.user_metadata?.graduationYear ?? null,
        created_at: sUser.created_at ?? null,
      };
      setUser(appUser);
      // Load profile row
      const { data: profileRow } = await supabase
        .from("profiles")
        .select("full_name,email,phone,address,paremail,student_id,class,semester,cgpa,graduation_year")
        .eq("id", sUser.id)
        .single();

      setFormData((prev) => ({
        ...prev,
        fullName: profileRow?.full_name ?? appUser.name ?? prev.fullName,
        email: profileRow?.email ?? appUser.email ?? prev.email,
        phone: profileRow?.phone ?? appUser.phone ?? prev.phone,
        address: profileRow?.address ?? appUser.address ?? prev.address,
        paremail: profileRow?.paremail ?? appUser.paremail ?? prev.paremail,
        studentId: profileRow?.student_id ?? prev.studentId,
        class: profileRow?.class ?? prev.class,
        semester: profileRow?.semester ?? appUser.semester ?? prev.semester,
        cgpa: profileRow?.cgpa ?? appUser.cgpa ?? prev.cgpa,
        graduationYear: profileRow?.graduation_year ?? appUser.graduationYear ?? prev.graduationYear,
      }));

      // Load courses for user
      const { data: courseRows } = await supabase
        .from("courses")
        .select("id,name")
        .eq("user_id", sUser.id)
        .order("created_at", { ascending: false });
      setCourses((courseRows || []).map((c) => ({ id: c.id as string, name: c.name as string })));
      setLoading(false);
    })();
  }, [router]);

  const updateUser = async (updates: Record<string, unknown>) => {
    // No profile table configured; update session user metadata for the demo
    // This won't persist across sessions without a backend, but mirrors the requested API.
    try {
      await supabase.auth.updateUser({ data: updates });
      setUser((prev) => (prev ? { ...prev, ...(updates as Partial<AppUser>) } : prev));
    } catch (e) {
      console.error("Failed to update user metadata", e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSave = async () => {
    try {
      // Update auth metadata for display name, etc.
      await updateUser({
        full_name: formData.fullName.trim(),
      });
      // Upsert into profiles table
      if (!user) return;
      await supabase.from("profiles").upsert({
        id: user.id,
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        paremail: formData.paremail,
        student_id: formData.studentId,
        class: formData.class,
        semester: formData.semester,
        cgpa: formData.cgpa,
        graduation_year: formData.graduationYear,
        role: 'student',
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
        paremail: user.paremail || "",
      }));
    }
    setIsEditing(false);
  };

  const handleSaveAcademic = async () => {
    try {
      await updateUser({
        semester: formData.semester,
        cgpa: formData.cgpa,
        graduationYear: formData.graduationYear,
      });
      setIsEditingAcademic(false);
    } catch (error) {
      console.error("Failed to update academic info:", error);
    }
  };

  const handleCancelAcademic = () => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        semester: user.semester || "6",
        cgpa: user.cgpa || "8.7",
        graduationYear: user.graduationYear || "2026",
      }));
    }
    setIsEditingAcademic(false);
  };

  const handleEditCourse = (index: number, currentName: string) => {
    setEditingCourse(index);
    setCourseName(currentName);
  };

  const handleSaveCourse = async (index: number) => {
    const course = courses[index];
    if (!course || !user) return;
    try {
      const { error } = await supabase.from("courses").update({ name: courseName }).eq("id", course.id).eq("user_id", user.id);
      if (error) throw error;
      const updated = [...courses];
      updated[index] = { ...updated[index], name: courseName };
      setCourses(updated);
    } catch (e) {
      console.error("Failed to update course", e);
    } finally {
      setEditingCourse(null);
      setCourseName("");
    }
  };

  const handleAddCourse = async () => {
    if (!courseName.trim() || !user) {
      console.log("Missing courseName or user:", { courseName, user });
      return;
    }
    
    try {
      console.log("Attempting to insert course:", { user_id: user.id, name: courseName });
      
      const { data, error } = await supabase
        .from("courses")
        .insert({ user_id: user.id, name: courseName })
        .select("id,name")
        .single();
      
      console.log("Insert result:", { data, error });
      console.log("Error object:", error);
      console.log("Error type:", typeof error);
      console.log("Error keys:", error ? Object.keys(error) : 'null');
      
      if (error) {
        console.error("Full error object:", JSON.stringify(error, null, 2));
        alert(`Failed to add course. Check console for details. Error: ${JSON.stringify(error)}`);
        throw error;
      }
      
      if (!data) {
        console.error("No data returned from insert");
        alert("Failed to add course: No data returned");
        return;
      }
      
      console.log("Course added successfully:", data);
      setCourses([{ id: data.id as string, name: data.name as string }, ...courses]);
    } catch (e) {
      console.error("Failed to add course", e);
    } finally {
      setCourseName("");
      setEditingCourse(null);
    }
  };

  const handleDeleteCourse = async (index: number) => {
    const course = courses[index];
    if (!course || !user) return;
    try {
      const { error } = await supabase.from("courses").delete().eq("id", course.id).eq("user_id", user.id);
      if (error) throw error;
      setCourses(courses.filter((_, i) => i !== index));
    } catch (e) {
      console.error("Failed to delete course", e);
    }
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="container mx-auto px-6 py-8 flex-1">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Profile</h1>
          <p className="text-muted-foreground">Manage your personal information and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Overview */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Overview</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="h-32 w-32 mb-4 rounded-full bg-muted flex items-center justify-center text-xl font-bold">
                  {getInitials(user?.name || user?.email || "")}
                </div>
                <h3 className="text-xl font-bold text-foreground mb-1 text-center">
                  {isEditing ? (
                    <div className="relative w-full">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        id="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="pl-10 text-center font-bold text-xl h-10 w-full border rounded-md"
                        placeholder="Full Name"
                      />
                    </div>
                  ) : (
                    user?.name || user?.email || "User"
                  )}
                </h3>
                <div className="text-sm text-muted-foreground mb-4 w-full">
                  {isEditing ? (
                    <div className="relative w-full">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="pl-10 text-center h-8 w-full border rounded-md"
                      />
                    </div>
                  ) : (
                    user?.email
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Personal and Academic Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
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
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="studentId" className="text-sm text-muted-foreground">Student ID (USN)</label>
                      <input 
                        id="studentId" 
                        value={formData.studentId}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full border rounded-md px-3 py-2" 
                        placeholder="e.g., 1MS21CS001"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="class" className="text-sm text-muted-foreground">Class (e.g., DS-5A)</label>
                      <input
                        id="class"
                        value={formData.class}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full border rounded-md px-3 py-2"
                        placeholder="DS-5A"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm text-muted-foreground">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="pl-10 w-full border rounded-md px-3 py-2"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="address" className="text-sm text-muted-foreground">Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        id="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="pl-10 w-full border rounded-md px-3 py-2"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="paremail" className="text-sm text-muted-foreground">Parent&apos;s Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        id="paremail"
                        type="email"
                        value={formData.paremail}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="pl-10 w-full border rounded-md px-3 py-2"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Academic Information */}
            <Card>
              <CardHeader className="flex flex-row justify-between items-center">
                <div>
                  <CardTitle>Academic Information</CardTitle>
                  <CardDescription>Your current academic standing and details</CardDescription>
                </div>
                {isEditingAcademic ? (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleCancelAcademic}>
                      <X className="h-4 w-4 mr-1" /> Cancel
                    </Button>
                    <Button size="sm" onClick={handleSaveAcademic}>
                      <Save className="h-4 w-4 mr-1" /> Save
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => setIsEditingAcademic(true)}>
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <BookOpen className="h-4 w-4" />
                      <span>Current Semester</span>
                    </div>
                    {isEditingAcademic ? (
                      <input
                        value={formData.semester}
                        onChange={(e) => setFormData((prev) => ({ ...prev, semester: e.target.value }))}
                        className="w-full border rounded-md px-3 py-2"
                      />
                    ) : (
                      <p className="text-lg font-semibold text-foreground">{formData.semester} Semester</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Award className="h-4 w-4" />
                      <span>CGPA</span>
                    </div>
                    {isEditingAcademic ? (
                      <input
                        value={formData.cgpa}
                        onChange={(e) => setFormData((prev) => ({ ...prev, cgpa: e.target.value }))}
                        className="w-full border rounded-md px-3 py-2"
                      />
                    ) : (
                      <p className="text-lg font-semibold text-foreground">{formData.cgpa} / 10.0</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <GraduationCap className="h-4 w-4" />
                      <span>Graduation Year</span>
                    </div>
                    {isEditingAcademic ? (
                      <input
                        value={formData.graduationYear}
                        onChange={(e) => setFormData((prev) => ({ ...prev, graduationYear: e.target.value }))}
                        className="w-full border rounded-md px-3 py-2"
                      />
                    ) : (
                      <p className="text-lg font-semibold text-foreground">{formData.graduationYear}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* My Courses Section */}
            <Card>
              <CardHeader className="flex flex-row justify-between items-center">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <CardTitle>My Courses</CardTitle>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingCourse(-1);
                    setCourseName("");
                  }}
                >
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Button>
              </CardHeader>
              <CardContent className="space-y-2">
                {courses.map((course, index) => (
                  <div key={index} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md">
                    {editingCourse === index ? (
                      <div className="flex w-full gap-2">
                        <input
                          value={courseName}
                          onChange={(e) => setCourseName(e.target.value)}
                          className="h-8 flex-1 border rounded-md px-2"
                          autoFocus
                        />
                        <Button size="sm" onClick={() => handleSaveCourse(index)} disabled={!courseName.trim()}>
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingCourse(null);
                            setCourseName("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <>
                        <span className="font-medium">{course.name}</span>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleEditCourse(index, course.name)}
                          >
                            <Edit className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          {editingCourse !== null && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteCourse(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}
                {editingCourse === -1 && (
                  <div className="flex gap-2 mt-2">
                    <input
                      value={courseName}
                      onChange={(e) => setCourseName(e.target.value)}
                      placeholder="Enter course name"
                      className="h-8 flex-1 border rounded-md px-2"
                    />
                    <Button size="sm" onClick={handleAddCourse} disabled={!courseName.trim()}>
                      Add
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingCourse(null);
                        setCourseName("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
                {editingCourse === null && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => {
                      setEditingCourse(-1);
                      setCourseName("");
                    }}
                  >
                    + Add Course
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
