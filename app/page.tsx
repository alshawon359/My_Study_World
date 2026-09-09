'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [status, setStatus] = useState('Initializing...');
  
  useEffect(() => {
    const init = async () => {
      try {
        // Initialize user if not exists
        setStatus('Checking user...');
        const response = await fetch('/api/init', { method: 'POST' });
        if (response.ok) {
          setStatus('Redirecting to dashboard...');
          setTimeout(() => router.push('/dashboard'), 500);
        } else {
          setStatus('Error initializing. Redirecting anyway...');
          setTimeout(() => router.push('/dashboard'), 1000);
        }
      } catch (error) {
        console.error('Init error:', error);
        setStatus('Redirecting to dashboard...');
        setTimeout(() => router.push('/dashboard'), 1000);
      }
    };
    
    init();
  }, [router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-lg text-muted-foreground">Loading My Study World...</p>
        <p className="text-sm text-muted-foreground mt-2">{status}</p>
      </div>
    </div>
  );
}

