import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, Users, BookOpen } from "lucide-react";

const ChooseRole = () => {
  const navigate = useNavigate();

  const roles = [
    {
      role: "student",
      title: "Student",
      description: "Access your classes, grades, and academic performance",
      icon: GraduationCap,
      color: "hsl(var(--student))",
    },
    {
      role: "parent",
      title: "Parent",
      description: "Monitor your child's progress and academic journey",
      icon: Users,
      color: "hsl(var(--parent))",
    },
    {
      role: "teacher",
      title: "Teacher",
      description: "Manage classes, students, and track performance",
      icon: BookOpen,
      color: "hsl(var(--teacher))",
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            CampusConnect
          </h1>
          <p className="text-xl text-muted-foreground">
            Choose your role to get started
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {roles.map(({ role, title, description, icon: Icon, color }) => (
            <Card
              key={role}
              className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer border-2 hover:border-primary/50"
              onClick={() => navigate(`/auth/signup?role=${role}`)}
            >
              <div
                className="absolute top-0 left-0 right-0 h-2"
                style={{ backgroundColor: color }}
              />
              <CardHeader className="pb-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 mx-auto"
                  style={{ backgroundColor: `${color}15` }}
                >
                  <Icon className="w-8 h-8" style={{ color }} />
                </div>
                <CardTitle className="text-2xl text-center">{title}</CardTitle>
                <CardDescription className="text-center">
                  {description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full"
                  style={{ backgroundColor: color }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/auth/signup?role=${role}`);
                  }}
                >
                  Sign Up as {title}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/auth/login?role=${role}`);
                  }}
                >
                  Already have an account?
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChooseRole;
