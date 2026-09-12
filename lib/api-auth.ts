import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function authenticatedUser() {
  return getCurrentUser();
}

export function unauthorized() {
  return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
}
