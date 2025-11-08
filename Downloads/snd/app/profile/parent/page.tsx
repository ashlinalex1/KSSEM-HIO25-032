'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { RoleBasedHeader } from "@/components/role-based-header";
import { getProfile, signOut } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ParentProfile() {
  const router = useRouter();
  const [profile, setProfile] = useState<{ full_name: string; email: string; role: string } | null>(null);
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
        if (!userProfile || userProfile.role !== 'parent') {
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
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <RoleBasedHeader 
        isLoggedIn={true} 
        userName={profile?.full_name || 'Parent'} 
        userRole="parent"
        onSignOut={handleSignOut} 
      />
      <main className="container mx-auto px-4 py-20">
        <h1 className="text-3xl font-bold mb-6">Parent Profile</h1>
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="text-lg font-medium">{profile?.full_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="text-lg font-medium">{profile?.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Role</p>
                <p className="text-lg font-medium capitalize">{profile?.role}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
