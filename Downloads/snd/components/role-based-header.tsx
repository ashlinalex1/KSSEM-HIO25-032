'use client';

import Link from 'next/link';
import { Logo } from '@/components/logo';
import { Menu, X, Home, LayoutDashboard, Calendar, FileText, ClipboardCheck, MessageSquare, Award, ClipboardList, BookOpen, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { ThemeToggleButton } from './ThemeToggleButton';
import type { UserRole } from '@/lib/auth';

interface MenuItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface RoleBasedHeaderProps {
  isLoggedIn?: boolean;
  userName?: string;
  userRole?: UserRole;
  onSignOut?: () => void;
}

const getHeaderItemsForRole = (role: UserRole): MenuItem[] => {
  switch (role) {
    case 'student':
      return [{ name: 'Home', href: '/home', icon: Home },
        { name: 'Dashboard', href: '/dashboard/student', icon: LayoutDashboard },
        { name: 'Notes', href: '/notes/student', icon: FileText },
      ];
    
    case 'parent':
      return [
        { name: 'Home', href: '/home', icon: Home },
        { name: 'Dashboard', href: '/dashboard/parent', icon: LayoutDashboard },
        { name: 'Calendar', href: '/calendar/parent', icon: Calendar },
      ];
    
    case 'teacher':
      return [{ name: 'Home', href: '/home', icon: Home },
        { name: 'Dashboard', href: '/dashboard/teacher', icon: LayoutDashboard },
        { name: 'Attendance', href: '/attendance/teacher', icon: ClipboardCheck },
        { name: 'Marks', href: '/marks/teacher', icon: Award },
      ];
    
    default:
      return [];
  }
};

const getDropdownItemsForRole = (role: UserRole): MenuItem[] => {
  switch (role) {
    case 'student':
      return [{ name: 'ChatBot', href: '/chatbot', icon: MessageSquare },
        { name: 'Calendar', href: '/calendar/student', icon: Calendar },
        { name: 'Attendance', href: '/attendance/student', icon: ClipboardCheck },
      ];
    
    case 'parent':
      return [];
    
    case 'teacher':
      return [
        { name: 'ChatBot', href: '/chatbot', icon: MessageSquare },
        { name: 'Quiz', href: '/quiz/teacher', icon: ClipboardList },
        { name: 'Notes', href: '/notes/teacher', icon: BookOpen },
      ];
    
    default:
      return [];
  }
};

const getProfileHref = (role: UserRole): string => {
  switch (role) {
    case 'student':
      return '/profile/student';
    case 'parent':
      return '/profile/parent';
    case 'teacher':
      return '/profile/teacher';
    default:
      return '/profile/student';
  }
};

export function RoleBasedHeader({ 
  isLoggedIn = false, 
  userName = 'User',
  userRole = 'student',
  onSignOut 
}: RoleBasedHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuState, setMenuState] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const headerItems = getHeaderItemsForRole(userRole);
  const dropdownItems = getDropdownItemsForRole(userRole);
  const profileHref = getProfileHref(userRole);
  const allMenuItems = [...headerItems, ...dropdownItems];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
              <ul className="flex gap-6 text-sm items-center">
                {headerItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <li key={index}>
                      <Link
                        href={item.href}
                        className="text-muted-foreground hover:text-accent-foreground flex items-center gap-1.5 duration-150"
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  );
                })}
                {dropdownItems.length > 0 && (
                  <li className="relative">
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="text-muted-foreground hover:text-accent-foreground flex items-center gap-1.5 duration-150"
                    >
                      <Menu className="h-4 w-4" />
                      <span>More</span>
                      <ChevronDown className={cn("h-3 w-3 transition-transform", dropdownOpen && "rotate-180")} />
                    </button>
                    {dropdownOpen && (
                      <div ref={dropdownRef} className="absolute top-full right-0 mt-2 w-48 bg-background border rounded-lg shadow-lg py-2 z-50">
                        {dropdownItems.map((item, idx) => {
                          const Icon = item.icon;
                          return (
                            <Link
                              key={idx}
                              href={item.href}
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground hover:text-accent-foreground hover:bg-muted/50 duration-150"
                            >
                              <Icon className="h-4 w-4" />
                              <span>{item.name}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </li>
                )}
              </ul>
            </div>

            <div className="bg-background in-data-[state=active]:block lg:in-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
              <div className="lg:hidden">
                <ul className="space-y-6 text-base">
                  {allMenuItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <li key={index}>
                        <Link
                          href={item.href}
                          className="text-muted-foreground hover:text-accent-foreground flex items-center gap-2 duration-150"
                          onClick={() => setMenuState(false)}
                        >
                          <Icon className="h-5 w-5" />
                          <span>{item.name}</span>
                        </Link>
                      </li>
                    );
                  })}
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
                  <Link href={profileHref} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm cursor-pointer">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden md:inline text-sm font-medium">{userName}</span>
                  </Link>
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
