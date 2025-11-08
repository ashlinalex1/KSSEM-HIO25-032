import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Users, BookOpen, ArrowRight, CheckCircle } from "lucide-react";
import { getProfile, getRoleDashboardPath } from "@/lib/auth";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const profile = await getProfile(session.user.id);
        if (profile) {
          navigate(getRoleDashboardPath(profile.role));
        }
      }
    };
    checkAuth();
  }, [navigate]);

  const features = [
    {
      icon: GraduationCap,
      title: "For Students",
      description: "Track your academic progress, view grades, and access class materials",
    },
    {
      icon: Users,
      title: "For Parents",
      description: "Monitor your child's performance and stay connected with their education",
    },
    {
      icon: BookOpen,
      title: "For Teachers",
      description: "Manage classes, track student progress, and streamline grading",
    },
  ];

  const benefits = [
    "Real-time performance tracking",
    "Secure role-based access",
    "Comprehensive grade management",
    "Attendance monitoring",
    "Parent-teacher communication",
    "User-friendly interface",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent">
            CampusConnect
          </h1>
          <p className="text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            A comprehensive platform connecting students, parents, and teachers for better education management
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/auth/choose-role")}
            className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
          >
            Get Started
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <CardContent className="pt-6">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 mx-auto"
                  style={{
                    backgroundColor: `hsl(var(--primary) / 0.1)`,
                  }}
                >
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-center">{feature.title}</h3>
                <p className="text-muted-foreground text-center">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Benefits Section */}
        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-8">
            <h2 className="text-3xl font-bold mb-6 text-center">Why Choose CampusConnect?</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <span className="text-muted-foreground">{benefit}</span>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate("/auth/choose-role")}
              >
                Choose Your Role
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-16 text-center text-muted-foreground">
          <p>© 2025 CampusConnect. Built with modern technologies for seamless education management.</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
