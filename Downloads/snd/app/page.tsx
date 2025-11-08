'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Users, BookOpen, ArrowRight, CheckCircle } from "lucide-react";
import Features from "@/components/features-3";
import FAQsThree from "@/components/faqs-3";
import HeroSection from "@/components/hero-section";
import IntegrationsSection from "@/components/integrations-3";
import TestimonialsSection from "@/components/testimonials";
import FooterSection from "@/components/footer";
import { supabase } from "@/integrations/supabase/client";
import { getProfile, getRoleDashboardPath } from "@/lib/auth";
import StudentProfile from "@/src/components/StudentProfile";
export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const profile = await getProfile(session.user.id);
          if (profile) {
            router.push(getRoleDashboardPath(profile.role));
          }
        }
      } catch (error) {
        console.log("Auth check failed, continuing to home page:", error);
        // Continue to show home page if auth check fails
      }
    };
    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <HeroSection />
      <StudentProfile/>
      <IntegrationsSection />
      <Features />
      <FAQsThree />
      <TestimonialsSection />
      <FooterSection />
    </div>
  );
}
