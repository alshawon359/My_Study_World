import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticatedUser, unauthorized } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

const fields = [
  'sleepStartTime', 'sleepEndTime', 'sleepTarget', 'phoneLimit', 'defaultPomodoroWork', 'defaultPomodoroBreak',
  'focusModeEnabled', 'notificationsEnabled', 'taskReminders', 'reminderMinutes', 'quietHoursStart', 'quietHoursEnd',
  'theme', 'weeklyStudyHoursTarget', 'weeklyAcademicHoursTarget', 'weeklyAIHoursTarget', 'weeklyResearchHoursTarget',
] as const;

export async function GET() {
  const user = await authenticatedUser();
  if (!user) return unauthorized();
  const settings = await prisma.userSettings.upsert({ where: { userId: user.id }, update: {}, create: { userId: user.id } });
  return NextResponse.json(settings);
}

export async function PUT(request: NextRequest) {
  try {
    const user = await authenticatedUser();
    if (!user) return unauthorized();
    const body = await request.json();
    const data = Object.fromEntries(fields.filter((field) => body[field] !== undefined).map((field) => [field, body[field]]));
    const settings = await prisma.userSettings.upsert({ where: { userId: user.id }, update: data, create: { userId: user.id, ...data } });
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Settings update failed:', error);
    return NextResponse.json({ error: 'Failed to save settings.' }, { status: 500 });
  }
}