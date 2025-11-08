'use client'

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2 } from "lucide-react";
import { getProfile, getRoleDashboardPath, createProfile, type UserRole } from "@/lib/auth";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = (searchParams?.get("role") || "student") as UserRole;
  const [isLoading, setIsLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Check if already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const profile = await getProfile(session.user.id);
        if (profile) {
          router.push(getRoleDashboardPath(profile.role));
        }
      }
    };
    checkSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
          },
        },
      });

      if (authError) throw authError;

      if (!authData.user) throw new Error("No user data returned");

      // Store the selected role in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('userRole', role);
      }

      // Create profile in the profiles table
      const profile = await createProfile(authData.user.id, email, fullName, role);
      if (!profile) {
        console.log("Profile creation failed, but user was created successfully");
      }

      alert("Account created successfully! Please check your email to verify your account.");
      router.push(`/auth/login?role=${role}`);
    } catch (error: unknown) {
      console.error("Signup error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create account. Please try again.";
      alert(errorMessage);
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
            onClick={() => router.push("/auth/choose-role")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to role selection
          </Button>
          <CardTitle className="text-3xl">
            Sign up as {role.charAt(0).toUpperCase() + role.slice(1)}
          </CardTitle>
          <CardDescription>
            Create your account to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                minLength={6}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Account
            </Button>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={() => router.push(`/auth/login?role=${role}`)}
              >
                Login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
