import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import { getProfile, getRoleDashboardPath, type UserRole } from "@/lib/auth";

// Base schema
const baseSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(100),
});

// Role-specific schemas
const studentSchema = baseSchema.extend({
  usn: z.string().min(3, "USN must be at least 3 characters").max(50),
  class: z.string().min(1, "Class is required").max(50),
  department: z.string().min(2, "Department is required").max(100),
});

const parentSchema = baseSchema.extend({
  phone: z.string().min(10, "Phone must be at least 10 characters").max(20).optional(),
  studentUSN: z.string().max(50).optional(),
});

const teacherSchema = baseSchema.extend({
  teacherCode: z.string().min(3, "Teacher code must be at least 3 characters").max(50),
  department: z.string().min(2, "Department is required").max(100),
});

type StudentFormData = z.infer<typeof studentSchema>;
type ParentFormData = z.infer<typeof parentSchema>;
type TeacherFormData = z.infer<typeof teacherSchema>;

const Signup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = (searchParams.get("role") || "student") as UserRole;
  const [isLoading, setIsLoading] = useState(false);

  const schema = role === "student" ? studentSchema : role === "parent" ? parentSchema : teacherSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  // Check if already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const profile = await getProfile(session.user.id);
        if (profile) {
          navigate(getRoleDashboardPath(profile.role));
        }
      }
    };
    checkSession();
  }, [navigate]);

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: data.fullName,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("No user data returned");

      // Insert profile
      const { error: profileError } = await supabase.from("profiles").insert({
        id: authData.user.id,
        email: data.email,
        full_name: data.fullName,
        role: role,
      });

      if (profileError) throw profileError;

      // Insert role-specific data
      if (role === "student") {
        const { error: studentError } = await supabase.from("students").insert({
          id: authData.user.id,
          usn: data.usn,
          class: data.class,
          department: data.department,
        });
        if (studentError) throw studentError;
      } else if (role === "parent") {
        const { error: parentError } = await supabase.from("parents").insert({
          id: authData.user.id,
          phone: data.phone || null,
        });
        if (parentError) throw parentError;

        // Link to student if USN provided
        if (data.studentUSN) {
          const { data: student, error: studentFetchError } = await supabase
            .from("students")
            .select("id")
            .eq("usn", data.studentUSN)
            .single();

          if (studentFetchError || !student) {
            toast.warning("Student USN not found. You can link later from your dashboard.");
          } else {
            const { error: linkError } = await supabase.from("parent_student").insert({
              parent_id: authData.user.id,
              student_id: student.id,
            });
            if (linkError) {
              toast.warning("Failed to link to student. You can link later from your dashboard.");
            }
          }
        }
      } else if (role === "teacher") {
        const { error: teacherError } = await supabase.from("teachers").insert({
          id: authData.user.id,
          teacher_code: data.teacherCode,
          department: data.department,
        });
        if (teacherError) throw teacherError;
      }

      toast.success("Account created successfully!");
      navigate(getRoleDashboardPath(role));
    } catch (error: any) {
      console.error("Signup error:", error);
      if (error.message.includes("already registered")) {
        toast.error("This email is already registered. Please login instead.");
      } else if (error.message.includes("unique")) {
        toast.error("This USN or code is already taken. Please use a different one.");
      } else {
        toast.error(error.message || "Failed to create account. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <Button
            variant="ghost"
            size="sm"
            className="w-fit mb-4"
            onClick={() => navigate("/auth/choose-role")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to role selection
          </Button>
          <CardTitle className="text-3xl">
            Sign Up as {role.charAt(0).toUpperCase() + role.slice(1)}
          </CardTitle>
          <CardDescription>
            Create your account to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                placeholder="John Doe"
                {...register("fullName")}
                disabled={isLoading}
              />
              {errors.fullName && (
                <p className="text-sm text-destructive">{errors.fullName.message as string}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                {...register("email")}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message as string}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message as string}</p>
              )}
            </div>

            {role === "student" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="usn">University Seat Number (USN)</Label>
                  <Input
                    id="usn"
                    placeholder="e.g., 1AB21CS001"
                    {...register("usn")}
                    disabled={isLoading}
                  />
                  {errors.usn && (
                    <p className="text-sm text-destructive">{errors.usn.message as string}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="class">Class</Label>
                  <Input
                    id="class"
                    placeholder="e.g., 3rd Semester"
                    {...register("class")}
                    disabled={isLoading}
                  />
                  {errors.class && (
                    <p className="text-sm text-destructive">{errors.class.message as string}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    placeholder="e.g., Computer Science"
                    {...register("department")}
                    disabled={isLoading}
                  />
                  {errors.department && (
                    <p className="text-sm text-destructive">{errors.department.message as string}</p>
                  )}
                </div>
              </>
            )}

            {role === "parent" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (Optional)</Label>
                  <Input
                    id="phone"
                    placeholder="+1234567890"
                    {...register("phone")}
                    disabled={isLoading}
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone.message as string}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="studentUSN">Student USN to Link (Optional)</Label>
                  <Input
                    id="studentUSN"
                    placeholder="e.g., 1AB21CS001"
                    {...register("studentUSN")}
                    disabled={isLoading}
                  />
                  {errors.studentUSN && (
                    <p className="text-sm text-destructive">{errors.studentUSN.message as string}</p>
                  )}
                </div>
              </>
            )}

            {role === "teacher" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="teacherCode">Teacher Code</Label>
                  <Input
                    id="teacherCode"
                    placeholder="e.g., TCH001"
                    {...register("teacherCode")}
                    disabled={isLoading}
                  />
                  {errors.teacherCode && (
                    <p className="text-sm text-destructive">{errors.teacherCode.message as string}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    placeholder="e.g., Computer Science"
                    {...register("department")}
                    disabled={isLoading}
                  />
                  {errors.department && (
                    <p className="text-sm text-destructive">{errors.department.message as string}</p>
                  )}
                </div>
              </>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Account
            </Button>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={() => navigate(`/auth/login?role=${role}`)}
              >
                Login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
