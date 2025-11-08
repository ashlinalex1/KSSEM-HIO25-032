'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BookOpen, Calendar, BarChart3, Heart, MessageCircle, Users, GraduationCap } from 'lucide-react';
import { signOut } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { getProfile } from '@/lib/auth';
import { HeroHeader as StudentHeader } from '@/components/header';
import { HeroHeader as TeacherHeader } from '@/components/headertea'; ``
import { HeroHeader as ParentHeader } from '@/components/headerpar';
import StudentProfile from "@/src/components/StudentProfile";

// Map user roles to their corresponding header components
const headerComponents = {
  student: StudentHeader,
  teacher: TeacherHeader,
  parent: ParentHeader
};

// Header Component
function AppHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const profile = await getProfile(session.user.id);
          setUser(profile);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      }
    };

    checkAuth();
  }, []);

  // Map user roles to their corresponding header components
  const headerComponents = {
    student: StudentHeader,
    teacher: TeacherHeader,
    parent: ParentHeader
  };

  // If user is logged in, show the appropriate header component
  if (user) {
    const HeaderComponent = headerComponents[user.role as keyof typeof headerComponents] || StudentHeader;
    return (
      <HeaderComponent 
        isLoggedIn={!!user}
        userName={user.full_name || user.email}
        onSignOut={async () => {
          await signOut();
          router.push('/');
        }}
      />
    );
  }

  // Default header for non-logged in users
  return (
    <header className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-md z-50 border-b border-border">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            MindStride
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-sm font-medium text-foreground hover:text-primary transition">
            Home
          </Link>
          <Link href="/dashboard" className="text-sm font-medium text-foreground hover:text-primary transition">
            Dashboard
          </Link>
          <Link href="/notes" className="text-sm font-medium text-foreground hover:text-primary transition">
            Notes
          </Link>
          <Link href="/chatbot" className="text-sm font-medium text-foreground hover:text-primary transition">
            AI Chatbot
          </Link>
          
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-foreground">Hi, {user.full_name}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={async () => {
                  await signOut();
                  router.push('/');
                }}
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Link href="/auth">
                <Button variant="outline" size="sm">
                  Log In
                </Button>
              </Link>
              <Link href="/auth?signup=true">
                <Button size="sm">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-background border-t border-border">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
            <Link 
              href="/" 
              className="py-2 text-foreground hover:text-primary transition"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link 
              href="/dashboard" 
              className="py-2 text-foreground hover:text-primary transition"
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </Link>
            <Link 
              href="/notes" 
              className="py-2 text-foreground hover:text-primary transition"
              onClick={() => setIsOpen(false)}
            >
              Notes
            </Link>
            <Link 
              href="/chatbot" 
              className="py-2 text-foreground hover:text-primary transition"
              onClick={() => setIsOpen(false)}
            >
              AI Chatbot
            </Link>
            
            {user ? (
              <div className="pt-4 mt-4 border-t border-border">
                <p className="text-sm text-muted-foreground mb-2">Logged in as {user.email}</p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={async () => {
                    await signOut();
                    router.push('/');
                  }}
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-4 mt-4 border-t border-border">
                <Link href="/auth" className="w-full">
                  <Button variant="outline" className="w-full" onClick={() => setIsOpen(false)}>
                    Log In
                  </Button>
                </Link>
                <Link href="/auth?signup=true" className="w-full">
                  <Button className="w-full" onClick={() => setIsOpen(false)}>
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

// Features Section Component
function FeaturesSection() {
  const features = [
    {
      icon: <BookOpen className="h-6 w-6 text-primary" />,
      title: 'Smart Notes',
      desc: 'Organize and manage your study notes efficiently with our intuitive note-taking system.',
      href: '/notes',
    },
    {
      icon: <Calendar className="h-6 w-6 text-primary" />,
      title: 'Attendance Tracking',
      desc: 'Keep track of your class attendance and never miss important sessions.',
      href: '/attendance',
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-primary" />,
      title: 'Progress Dashboard',
      desc: 'Monitor your academic progress with detailed analytics and insights.',
      href: '/dashboard',
    },
    {
      icon: <Heart className="h-6 w-6 text-primary" />,
      title: 'Well-being Focus',
      desc: 'Prioritize your mental health with integrated well-being resources and support.',
      href: '/wellbeing',
    },
    {
      icon: <MessageCircle className="h-6 w-6 text-primary" />,
      title: 'AI Chat Support',
      desc: 'Instant academic and career assistance powered by intelligent AI guidance.',
      href: '/chatbot',
    },
    {
      icon: <Users className="h-6 w-6 text-primary" />,
      title: 'Parent Insights',
      desc: 'Stay connected with your ward\'s performance, attendance, and progress reports.',
      href: '/parent',
    },
  ];

  return (
    <section className="py-16 bg-secondary/20">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Link key={index} href={feature.href} className="group">
              <Card className="p-6 hover:shadow-lg transition-shadow h-full">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                </div>
                <p className="mt-3 text-muted-foreground">
                  {feature.desc}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// Testimonials Section Component
function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Anjali R.',
      role: 'Student',
      content: 'MindStride helped me organize my study schedule and track my progress effectively.',
    },
    {
      name: 'Rahul S.',
      role: 'Teacher',
      content: 'The attendance tracking and progress monitoring features are incredibly useful for my class.',
    },
    {
      name: 'Priya M.',
      role: 'Parent',
      content: 'I can easily keep track of my child\'s academic performance and well-being.',
    },
  ];

  return (
    <section className="py-16">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12">What Our Users Say</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-6">
              <p className="text-muted-foreground italic mb-4">"{testimonial.content}"</p>
              <div className="font-medium">
                <div className="text-foreground">{testimonial.name}</div>
                <div className="text-sm text-muted-foreground">{testimonial.role}</div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// CTA Section Component
function CTASection() {
  return (
    <section className="py-16 bg-primary/5">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Join thousands of students, teachers, and parents using MindStride to enhance their academic journey.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth?signup=true">
            <Button size="lg">
              Sign Up for Free
            </Button>
          </Link>
          <Link href="/demo">
            <Button variant="outline" size="lg">
              Request a Demo
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

// Main Home Page Component
export default function HomePage() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const quickLinks = [
    'Study Tips',
    'Exam Preparation',
    'Time Management',
    'Career Guidance'
  ];

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-20">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Welcome to <span className="text-primary">MindStride</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Your all-in-one platform for academic success, personal growth, and well-being.
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex gap-2 mb-8">
              <input
                type="text"
                placeholder="Search for notes, assignments, or ask a question..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <Button type="submit">
                Search
              </Button>
            </form>

            {/* Quick Links */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {quickLinks.map((link, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="rounded-full"
                  onClick={() => setQuery(link)}
                >
                  {link}
                </Button>
              ))}
            </div>
          </div>
        </section>

        <FeaturesSection />
        <TestimonialsSection />
        <CTASection />
      </main>
    </div>
  );
}
