import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSession, normalizeUsername } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    const user = await prisma.user.findUnique({ where: { username: normalizeUsername(String(username || '')) } });
    if (!user?.passwordHash || !(await bcrypt.compare(String(password || ''), user.passwordHash))) {
      return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 });
    }
    await createSession(user.id);
    return NextResponse.json({ user: { id: user.id, username: user.username, name: user.name } });
  } catch (error) {
    console.error('Login failed:', error);
    return NextResponse.json({ error: 'Unable to sign in.' }, { status: 500 });
  }
}
