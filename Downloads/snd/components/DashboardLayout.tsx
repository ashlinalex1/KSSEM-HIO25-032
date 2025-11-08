'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { getProfile, signOut, type UserRole } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  LogOut, 
  User, 
  BookOpen, 
  Users, 
  GraduationCap,
  Menu,
  X
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole: UserRole;
  title: string;
}

export default function DashboardLayout({ children, userRole, title }: DashboardLayoutProps) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

      setUser(session.user);
      const userProfile = await getProfile(session.user.id);
      
      if (!userProfile) {
        router.push('/auth/choose-role');
        return;
      }

      if (userProfile.role !== userRole) {
        router.push(`/dashboard/${userProfile.role}`);
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

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Sign out failed:', error);
      alert('Failed to sign out. Please try again.');
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'student':
        return <BookOpen className="w-5 h-5" />;
      case 'parent':
        return <Users className="w-5 h-5" />;
      case 'teacher':
        return <GraduationCap className="w-5 h-5" />;
      default:
        return <User className="w-5 h-5" />;
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'student':
        return 'text-blue-600 bg-blue-50';
      case 'parent':
        return 'text-green-600 bg-green-50';
      case 'teacher':
        return 'text-purple-600 bg-purple-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b">
            <h1 className="text-xl font-bold text-gray-900">Campus Connect</h1>
            <p className="text-sm text-gray-500 mt-1">
              {userRole.charAt(0).toUpperCase() + userRole.slice(1)} Dashboard
            </p>
          </div>

          {/* User Profile */}
          <div className="p-6 border-b">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarFallback className={getRoleColor(userRole)}>
                  {getRoleIcon(userRole)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {profile.full_name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {profile.email}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-6">
            <div className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => router.push(`/dashboard/${userRole}`)}
              >
                {getRoleIcon(userRole)}
                <span className="ml-2">Dashboard</span>
              </Button>
            </div>
          </nav>

          {/* Sign Out */}
          <div className="p-6 border-t">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="lg:ml-64">
        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            <p className="text-gray-600 mt-2">
              Welcome back, {profile.full_name}!
            </p>
          </div>

          {/* Content */}
          {children}
        </div>
      </div>
    </div>
  );
}
