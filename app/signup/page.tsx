'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SignupPage() {
  const router = useRouter(); const [username, setUsername] = useState(''); const [password, setPassword] = useState(''); const [confirm, setConfirm] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const submit = async (event: FormEvent) => { event.preventDefault(); if (password !== confirm) return setError('Passwords do not match.'); setBusy(true); setError(''); const response = await fetch('/api/auth/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) }); if (response.ok) router.push('/dashboard'); else setError((await response.json()).error || 'Unable to create account.'); setBusy(false); };
  return <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-cyan-50/50 to-white p-5"><div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-xl shadow-cyan-950/10 sm:p-9"><div className="mb-7 text-center"><div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 font-bold text-cyan-300">MSW</div><h1 className="text-2xl font-bold text-slate-900">Create your study world</h1><p className="mt-1 text-sm text-slate-500">Your workspace starts empty and belongs only to you.</p></div><form onSubmit={submit} className="space-y-5"><div><Label>Username</Label><Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="letters, numbers, underscore" autoComplete="username" required /></div><div><Label>Password</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" minLength={8} required /></div><div><Label>Confirm password</Label><Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" required /></div>{error && <p className="text-sm font-medium text-red-600">{error}</p>}<Button disabled={busy} className="w-full">{busy ? 'Creating account...' : 'Create account'}</Button><p className="text-center text-sm text-slate-500">Already registered? <Link href="/login" className="font-semibold text-cyan-700 hover:underline">Sign in</Link></p></form></div></main>;
}
