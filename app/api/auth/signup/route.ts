import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSession, normalizeUsername } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    const normalizedUsername = normalizeUsername(String(username || ''));
    if (!/^[a-z0-9_]{3,24}$/.test(normalizedUsername)) {
      return NextResponse.json({ error: 'Username must be 3-24 characters using letters, numbers, or underscores.' }, { status: 400 });
    }
    if (typeof password !== 'string' || password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
    }
    const existing = await prisma.user.findUnique({ where: { username: normalizedUsername } });
    if (existing) return NextResponse.json({ error: 'Username is already taken.' }, { status: 409 });
    const passwordHash = await bcrypt.hash(password, 12);
    const legacyUser = await prisma.user.findFirst({ where: { name: { equals: normalizedUsername, mode: 'insensitive' }, passwordHash: null } });
    const user = legacyUser ? await prisma.user.update({ where: { id: legacyUser.id }, data: { username: normalizedUsername, passwordHash } }) : await prisma.user.create({
      data: {
        username: normalizedUsername,
        name: normalizedUsername,
        email: `${normalizedUsername}@users.mystudyworld.local`,
        passwordHash,
      },
    });
    await createSession(user.id);
    return NextResponse.json({ user: { id: user.id, username: user.username, name: user.name } }, { status: 201 });
  } catch (error) {
    console.error('Signup failed:', error);
    return NextResponse.json({ error: 'Unable to create account.' }, { status: 500 });
  }
}
