'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';
import { ThemeToggleButton } from './ThemeToggleButton';

interface MenuItem {
  name: string;
  href: string;
}

interface HeroHeaderProps {
  isLoggedIn?: boolean;
  userName?: string;
  onSignOut?: () => void;
}

export function HeroHeader({ 
  isLoggedIn = false, 
  userName = 'User', 
  onSignOut 
}: HeroHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuState, setMenuState] = useState(false);
  const [dashboardPath, setDashboardPath] = useState('/dashboard/student');

  // Handle user role and dashboard path
  useEffect(() => {
    const getValidRole = () => {
      if (typeof window === 'undefined') return 'student';
      const userRole = localStorage.getItem('userRole')?.toLowerCase();
      const validRoles = ['student', 'teacher', 'parent'];
      return validRoles.includes(userRole as string) ? userRole : 'student';
    };

    setDashboardPath(`/dashboard/${getValidRole()}`);

    const handleStorageChange = () => {
      setDashboardPath(`/dashboard/${getValidRole()}`);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Menu items with dynamic dashboard path
  const menuItems: MenuItem[] = [
    { name: 'Home', href: '/home' },
    { name: 'Dashboard', href: dashboardPath },
    { name: 'ChatBot', href: '/chatbot' },
    { name: 'Calendar', href: '#link' },
    { name: 'Notes', href: '#link' }
  ];

  return (
    <header>
      <nav
        data-state={menuState ? 'active' : undefined}
        className="fixed z-20 w-full px-2"
      >
        <div className={cn(
          'mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:px-12',
          isScrolled && 'bg-background/50 max-w-4xl rounded-2xl border backdrop-blur-lg lg:px-5'
        )}>
          <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
            <div className="flex w-full justify-between lg:w-auto">
              <Link
                href="/"
                aria-label="home"
                className="flex items-center space-x-2"
              >
                <Logo />
              </Link>

              <button
                onClick={() => setMenuState(!menuState)}
                aria-label={menuState ? 'Close Menu' : 'Open Menu'}
                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
              >
                <Menu className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                <X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
              </button>
            </div>

            <div className="absolute inset-0 m-auto hidden size-fit lg:block">
              <ul className="flex gap-8 text-sm">
                {menuItems.map((item, index) => (
                  <li key={index}>
                    <Link
                      href={item.href}
                      className="text-muted-foreground hover:text-accent-foreground block duration-150"
                    >
                      <span>{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-background in-data-[state=active]:block lg:in-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
              <div className="lg:hidden">
                <ul className="space-y-6 text-base">
                  {menuItems.map((item, index) => (
                    <li key={index}>
                      <Link
                        href={item.href}
                        className="text-muted-foreground hover:text-accent-foreground block duration-150"
                        onClick={() => setMenuState(false)}
                      >
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              
              {!isLoggedIn ? (
                <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className={cn(isScrolled && 'lg:hidden')}
                  >
                    <Link href="/auth/choose-role">
                      <span>Login</span>
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    className={cn(isScrolled && 'lg:hidden')}
                  >
                    <Link href="/auth/choose-role">
                      <span>Sign Up</span>
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    className={cn(isScrolled ? 'lg:inline-flex' : 'hidden')}
                  >
                    <Link href="/auth/choose-role">
                      <span>Get Started</span>
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden md:inline text-sm font-medium">{userName}</span>
                  </div>
                  <Button
                    onClick={onSignOut}
                    variant="outline"
                    size="sm"
                    className="text-sm"
                  >
                    Sign Out
                  </Button>
                </div>
              )}
              <ThemeToggleButton />
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
