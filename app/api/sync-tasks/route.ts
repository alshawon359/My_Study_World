import { NextRequest, NextResponse } from 'next/server';
import { getBDDateString, getBDDayOfWeek, getBDStartOfDay, getBDEndOfDay } from '@/lib/date-utils';
import { prisma } from '@/lib/prisma';

/**
 * Force task regeneration for today (BD timezone)
 * Call this after creating/updating/deleting schedule blocks
 * Directly generates tasks without external fetch
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const dateStr = getBDDateString();
    const dayOfWeek = getBDDayOfWeek();
    
    console.log(`🔄 Syncing tasks for user ${userId}, date ${dateStr}, day ${dayOfWeek} (BD time)`);
    
    // Get schedule blocks for today
    const scheduleBlocks = await prisma.scheduleBlock.findMany({
      where: {
        userId,
        dayOfWeek,
      },
      orderBy: { startTime: 'asc' },
    });

    console.log(`📋 Found ${scheduleBlocks.length} schedule blocks for day ${dayOfWeek}`);

    // Delete existing tasks for today
    const startOfDay = getBDStartOfDay(dateStr);
    const endOfDay = getBDEndOfDay(dateStr);
    
    const deleted = await prisma.task.deleteMany({
      where: {
        userId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });
    
    console.log(`🗑️ Deleted ${deleted.count} old tasks`);

    // Create new tasks from schedule blocks
    const tasks = [];
    for (const block of scheduleBlocks) {
      const task = await prisma.task.create({
        data: {
          userId,
          title: block.title,
          description: block.description,
          category: block.category,
          priority: block.priority,
          startTime: block.startTime,
          endTime: block.endTime,
          duration: block.duration,
          date: startOfDay,
          status: 'PENDING',
          scheduleBlockId: block.id,
        },
      });
      tasks.push(task);
    }

    console.log(`✅ Created ${tasks.length} tasks`);

    return NextResponse.json({
      success: true,
      count: tasks.length,
      tasks: tasks,
      dayOfWeek,
      date: dateStr,
    });
  } catch (error: any) {
    console.error('❌ Sync error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
