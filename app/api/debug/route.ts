import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const results: any = {
    timestamp: new Date().toISOString(),
    checks: {},
  };

  // Check 1: Environment variables
  results.checks.envVars = {
    DATABASE_URL: !!process.env.DATABASE_URL ? 'Set ✅' : 'Missing ❌',
    DIRECT_URL: !!process.env.DIRECT_URL ? 'Set ✅' : 'Missing ❌',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'Not set',
  };

  // Check 2: Database connection
  try {
    await prisma.$queryRaw`SELECT 1`;
    results.checks.database = 'Connected ✅';
  } catch (error: any) {
    results.checks.database = `Failed ❌: ${error.message}`;
  }

  // Check 3: User exists
  try {
    const user = await prisma.user.findUnique({
      where: { id: 'cmtszibhe0000uzf04p06d1fe' },
    });
    results.checks.user = user ? 'Exists ✅' : 'Not found ❌';
  } catch (error: any) {
    results.checks.user = `Error ❌: ${error.message}`;
  }

  // Check 4: Schedule blocks count
  try {
    const count = await prisma.scheduleBlock.count();
    results.checks.scheduleBlocks = `${count} blocks found`;
  } catch (error: any) {
    results.checks.scheduleBlocks = `Error ❌: ${error.message}`;
  }

  // Check 5: Tasks count
  try {
    const count = await prisma.task.count();
    results.checks.tasks = `${count} tasks found`;
  } catch (error: any) {
    results.checks.tasks = `Error ❌: ${error.message}`;
  }

  return NextResponse.json(results, { status: 200 });
}
