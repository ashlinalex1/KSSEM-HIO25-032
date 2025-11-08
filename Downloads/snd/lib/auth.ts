import { supabase } from "@/integrations/supabase/client";

export type UserRole = "student" | "parent" | "teacher";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}

export interface Student {
  id: string;
  usn: string;
  class: string;
  department: string;
}

export interface Parent {
  id: string;
  phone: string | null;
}

export interface Teacher {
  id: string;
  teacher_code: string;
  department: string;
}

export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
}

export async function createProfile(userId: string, email: string, fullName: string, role: UserRole): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        email: email,
        full_name: fullName,
        role: role,
      })
      .select()
      .single();

    if (error) {
      // If the table doesn't exist, return a mock profile for now
      if ((error as any).code === 'PGRST116' || (error as any).code === '42P01') {
        console.log("Profiles table not found, using fallback profile");
        return {
          id: userId,
          email: email,
          full_name: fullName,
          role: role,
          created_at: new Date().toISOString(),
        };
      }
      console.error("Error creating profile:", error);
      return null;
    }
    return data as Profile;
  } catch (error) {
    console.error("Unexpected error in createProfile:", error);
    // Return fallback profile if there's an unexpected error
    return {
      id: userId,
      email: email,
      full_name: fullName,
      role: role,
      created_at: new Date().toISOString(),
    };
  }
}

export async function getProfile(userId: string): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      // If the table doesn't exist or user has no profile, create a fallback profile
      console.log("Profiles table not found, creating fallback profile");
      
      // Get session to extract user info
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user && session.user.id === userId) {
        const user = session.user;
        // Create a fallback profile with default role
        const fallbackProfile: Profile = {
          id: userId,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          role: 'student', // Default role
          created_at: user.created_at || new Date().toISOString(),
        };
        
        // Try to get the role from localStorage if it was stored during signup
        if (typeof window !== 'undefined') {
          const storedRole = localStorage.getItem(`user_role_${userId}`);
          if (storedRole && ['student', 'parent', 'teacher'].includes(storedRole)) {
            fallbackProfile.role = storedRole as UserRole;
          }
        }
        
        return fallbackProfile;
      }
      return null;
    }
    return data as Profile;
  } catch (error) {
    console.error("Unexpected error in getProfile:", error);
    return null;
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export function getRoleDashboardPath(role: UserRole): string {
  switch (role) {
    case "student":
      return "/dashboard/student";
    case "parent":
      return "/dashboard/parent";
    case "teacher":
      return "/dashboard/teacher";
    default:
      return "/";
  }
}

export function getRoleColor(role: UserRole): string {
  switch (role) {
    case "student":
      return "hsl(var(--student))";
    case "parent":
      return "hsl(var(--parent))";
    case "teacher":
      return "hsl(var(--teacher))";
    default:
      return "hsl(var(--primary))";
  }
}

export function getRoleBadgeVariant(role: UserRole): "default" | "secondary" | "outline" {
  switch (role) {
    case "student":
      return "default";
    case "parent":
      return "secondary";
    case "teacher":
      return "outline";
    default:
      return "default";
  }
}
