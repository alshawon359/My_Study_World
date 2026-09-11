'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Home,
  BookOpen,
  Brain,
  FlaskConical,
  Target,
  BarChart3,
  Settings,
  Menu,
  X,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/schedule', label: 'Schedule', icon: Calendar },
  { href: '/courses', label: 'Courses', icon: BookOpen },
  { href: '/ai-roadmap', label: 'AI/ML', icon: Brain },
  { href: '/research', label: 'Research', icon: FlaskConical },
  { href: '/goals', label: 'Goals', icon: Target },
  { href: '/progress', label: 'Progress', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:block fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-b shadow-sm">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex items-center justify-between h-14">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-lg p-1.5">
                <span className="text-white font-bold text-sm">MSW</span>
              </div>
              <span className="font-bold text-base">MY STUDY WORLD</span>
            </Link>

            <div className="flex items-center gap-0.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive ? 'default' : 'ghost'}
                      size="sm"
                      className={cn(
                        'gap-1.5 text-xs h-8 px-3',
                        isActive && 'bg-primary text-primary-foreground'
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span className="hidden xl:inline">{item.label}</span>
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Tablet Navigation - Icons Only */}
      <nav className="hidden md:block lg:hidden fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-b shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-lg p-1.5">
                <span className="text-white font-bold text-sm">MSW</span>
              </div>
            </Link>

            <div className="flex items-center gap-0.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive ? 'default' : 'ghost'}
                      size="icon"
                      className={cn(
                        'h-8 w-8',
                        isActive && 'bg-primary text-primary-foreground'
                      )}
                      title={item.label}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-b shadow-sm">
        <div className="flex items-center justify-between h-14 px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-lg p-1.5">
              <span className="text-white font-bold text-sm">MSW</span>
            </div>
            <span className="font-bold text-sm">MY STUDY WORLD</span>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-14 left-0 right-0 bg-background border-b shadow-lg">
            <div className="p-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button
                      variant={isActive ? 'default' : 'ghost'}
                      size="sm"
                      className={cn('w-full justify-start gap-2 h-9', isActive && 'bg-primary')}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Bottom Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t shadow-lg">
        <div className="grid grid-cols-5 gap-1 p-2">
          {[navItems[0], navItems[1], navItems[2], navItems[5], navItems[6]].map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  size="sm"
                  className={cn(
                    'flex-col h-auto py-2 gap-1 w-full',
                    isActive && 'bg-primary text-primary-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-[9px] leading-tight font-medium">{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Spacer */}
      <div className="h-14" />
    </>
  );
}