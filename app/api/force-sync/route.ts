import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getBDDateString, getBDDayOfWeek, getBDStartOfDay, getBDEndOfDay } from '@/lib/date-utils';

/**
 * Force regenerate ALL tasks for today - no questions asked
 */
export async function GET() {
  try {
    const userId = 'cmtszibhe0000uzf04p06d1fe';
    const dateStr = getBDDateString();
    const dayOfWeek = getBDDayOfWeek();
    
    const result = {
      bdDate: dateStr,
      bdDay: dayOfWeek,
      dayName: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek],
      steps: [],
    };
    
    // Step 1: Get schedule blocks for today
    result.steps.push('Fetching schedule blocks for today...');
    const scheduleBlocks = await prisma.scheduleBlock.findMany({
      where: {
        userId,
        dayOfWeek,
      },
      orderBy: { startTime: 'asc' },
    });
    
    result.steps.push(`Found ${scheduleBlocks.length} schedule blocks`);
    
    if (scheduleBlocks.length === 0) {
      return NextResponse.json({
        ...result,
        success: false,
        message: 'No schedule blocks found for today',
      });
    }
    
    // Step 2: Delete ALL old tasks for today
    const startOfDay = getBDStartOfDay(dateStr);
    const endOfDay = getBDEndOfDay(dateStr);
    
    result.steps.push(`Deleting old tasks between ${startOfDay.toISOString()} and ${endOfDay.toISOString()}...`);
    
    const deleted = await prisma.task.deleteMany({
      where: {
        userId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });
    
    result.steps.push(`Deleted ${deleted.count} old tasks`);
    
    // Step 3: Create new tasks
    result.steps.push('Creating new tasks...');
    const tasks = [];
    
    for (const block of scheduleBlocks) {
      try {
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
        tasks.push({
          id: task.id,
          title: task.title,
          startTime: task.startTime,
          endTime: task.endTime,
        });
      } catch (err: any) {
        result.steps.push(`ERROR creating task for ${block.title}: ${err.message}`);
      }
    }
    
    result.steps.push(`Created ${tasks.length} tasks successfully`);
    
    return NextResponse.json({
      ...result,
      success: true,
      tasksCreated: tasks.length,
      tasks: tasks,
      message: `✅ ${tasks.length} tasks generated for ${dateStr}`,
    });
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
