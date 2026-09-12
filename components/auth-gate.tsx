'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter(); const pathname = usePathname(); const [ready, setReady] = useState(false);
  const isPublic = pathname === '/login' || pathname === '/signup';
  useEffect(() => { if (isPublic) { setReady(true); return; } fetch('/api/auth/me').then((response) => response.json()).then(({ user }) => { if (!user) router.replace('/login'); else setReady(true); }).catch(() => router.replace('/login')); }, [isPublic, pathname, router]);
  if (!ready) return <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500">Loading your workspace...</div>;
  return <>{children}</>;
}
