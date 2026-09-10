import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getBDDayOfWeek, getBDDateString, getBDTimeString, getBDStartOfDay, getBDEndOfDay } from '@/lib/date-utils';

export async function GET() {
  try {
    const userId = 'cmtszibhe0000uzf04p06d1fe';
    const bdDate = getBDDateString();
    const bdDay = getBDDayOfWeek();
    const bdTime = getBDTimeString();
    
    // Get ALL schedule blocks
    const allScheduleBlocks = await prisma.scheduleBlock.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        dayOfWeek: true,
        startTime: true,
        endTime: true,
        category: true,
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
    
    // Get schedule blocks for TODAY
    const todayScheduleBlocks = await prisma.scheduleBlock.findMany({
      where: {
        userId,
        dayOfWeek: bdDay,
      },
      select: {
        id: true,
        title: true,
        startTime: true,
        endTime: true,
        category: true,
      },
      orderBy: { startTime: 'asc' },
    });
    
    // Get ALL tasks
    const allTasks = await prisma.task.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        date: true,
        startTime: true,
        endTime: true,
        status: true,
      },
      orderBy: { date: 'desc' },
    });
    
    // Get tasks for TODAY
    const startOfDay = getBDStartOfDay(bdDate);
    const endOfDay = getBDEndOfDay(bdDate);
    
    const todayTasks = await prisma.task.findMany({
      where: {
        userId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      select: {
        id: true,
        title: true,
        date: true,
        startTime: true,
        endTime: true,
        status: true,
      },
      orderBy: { startTime: 'asc' },
    });
    
    return NextResponse.json({
      bdTimezone: {
        date: bdDate,
        day: bdDay,
        dayName: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][bdDay],
        time: bdTime,
        startOfDay: startOfDay.toISOString(),
        endOfDay: endOfDay.toISOString(),
      },
      scheduleBlocks: {
        total: allScheduleBlocks.length,
        all: allScheduleBlocks,
        today: {
          count: todayScheduleBlocks.length,
          blocks: todayScheduleBlocks,
        },
      },
      tasks: {
        total: allTasks.length,
        all: allTasks,
        today: {
          count: todayTasks.length,
          tasks: todayTasks,
        },
      },
      analysis: {
        shouldHaveTasksForToday: todayScheduleBlocks.length > 0,
        actualTasksForToday: todayTasks.length,
        mismatch: todayScheduleBlocks.length > 0 && todayTasks.length === 0,
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
