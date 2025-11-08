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

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = (searchParams?.get("role") || "student") as UserRole;
  const [isLoading, setIsLoading] = useState(false);
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
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (!authData.user) throw new Error("No user data returned");

      // Store the selected role in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(`user_role_${authData.user.id}`, role);
      }


      // Get or create profile
      let profile = await getProfile(authData.user.id);
      
      if (!profile) {
        // If no profile exists, create one with the selected role
        const userEmail = authData.user.email || email;
        const userName = (
          authData.user.user_metadata && 
          typeof authData.user.user_metadata === 'object' &&
          'full_name' in authData.user.user_metadata
        ) ? String(authData.user.user_metadata.full_name) : userEmail.split('@')[0];
        
        profile = await createProfile(authData.user.id, userEmail, userName, role);
        
        if (!profile) {
          throw new Error("Failed to create user profile. Please try again.");
        }
        
        alert("Profile created successfully!");
      }

      // For demo purposes, always allow login with selected role
      alert("Login successful!");
      router.push(getRoleDashboardPath(role));
    } catch (error: unknown) {
      console.error("Login error:", error);
      
      let errorMessage = "Failed to login. Please try again.";
      
      if (error instanceof Error) {
        if (error.message === "Invalid login credentials") {
          errorMessage = "Invalid email or password. Please check your credentials and try again.";
        } else if (error.message === "Email not confirmed") {
          errorMessage = "Please check your email and click the confirmation link before logging in.";
        } else if (error.message === "Too many requests") {
          errorMessage = "Too many login attempts. Please wait a moment before trying again.";
        } else {
          errorMessage = error.message;
        }
      }
      
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
            Login as {role.charAt(0).toUpperCase() + role.slice(1)}
          </CardTitle>
          <CardDescription>
            Enter your credentials to access your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Login
            </Button>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Don&apos;t have an account? </span>
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={() => router.push(`/auth/signup?role=${role}`)}
              >
                Sign up
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
