'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { RoleBasedHeader } from "@/components/role-based-header";
import { getProfile, signOut } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function TeacherMarks() {
  const router = useRouter();
  const [profile, setProfile] = useState<{ full_name: string; role: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/auth/choose-role');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [router]);

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
      />
      <main className="container mx-auto px-4 py-20">
        <h1 className="text-3xl font-bold mb-6">Marks Management</h1>
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Internal Marks</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Internal marks management coming soon...</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>SEE Marks</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">SEE marks management coming soon...</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Lab Test Marks</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Lab test marks management coming soon...</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
