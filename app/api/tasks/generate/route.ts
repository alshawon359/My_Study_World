import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TaskStatus } from '@prisma/client';
import { getBDDate, getBDDateString, getBDTimeString, getBDStartOfDay, getBDEndOfDay } from '@/lib/date-utils';
import { authenticatedUser, unauthorized } from '@/lib/api-auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📥 Generate tasks request:', JSON.stringify(body, null, 2));
    
    const user = await authenticatedUser();
    if (!user) return unauthorized();
    const { date } = body;
    const userId = user.id;

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Derive the weekday from the requested Bangladesh calendar date.
    const dateStr = date || getBDDateString();
    const requestedDate = /^\d{4}-\d{2}-\d{2}$/.test(dateStr)
      ? new Date(`${dateStr}T00:00:00Z`)
      : getBDDate();
    const dayOfWeek = requestedDate.getUTCDay();
    
    console.log(`📅 Requested date: ${requestedDate.toISOString()}`);
    console.log(`📅 Generating tasks for date: ${dateStr}, Day: ${dayOfWeek} (${getDayName(dayOfWeek)}) [BD timezone]`);

    // Get schedule blocks for this day
    const scheduleBlocks = await prisma.scheduleBlock.findMany({
      where: {
        userId,
        dayOfWeek,
      },
      orderBy: { startTime: 'asc' },
    });

    console.log(`📋 Found ${scheduleBlocks.length} schedule blocks for day ${dayOfWeek}`);

    if (scheduleBlocks.length === 0) {
      console.log('⚠️ No schedule blocks found');
      return NextResponse.json({
        success: true,
        count: 0,
        tasks: [],
        message: 'No schedule blocks found for this day'
      });
    }

    const startOfDay = getBDStartOfDay(dateStr);
    const endOfDay = getBDEndOfDay(dateStr);

    const existingTasks = await prisma.task.findMany({
      where: { userId, date: { gte: startOfDay, lte: endOfDay } },
    });
    const scheduleBlockIds = new Set(scheduleBlocks.map((block) => block.id));
    await prisma.task.deleteMany({
      where: {
        userId,
        date: { gte: startOfDay, lte: endOfDay },
        scheduleBlockId: { not: null, notIn: [...scheduleBlockIds] },
      },
    });
    const existingByBlock = new Map(existingTasks.map((task) => [task.scheduleBlockId, task]));

    // Determine current status based on BD time
    const currentTimeStr = getBDTimeString();
    const todayStr = getBDDateString();
    const isToday = dateStr === todayStr;

    console.log(`🕐 Current BD time: ${currentTimeStr}, Is today: ${isToday}`);

    // Create tasks from schedule blocks
    const tasks = [];
    for (const block of scheduleBlocks) {
      let status: TaskStatus = TaskStatus.PENDING;
      
      if (isToday) {
        const blockEnd = block.endTime;
        const blockStart = block.startTime;
        
        if (blockEnd <= currentTimeStr) {
          status = TaskStatus.COMPLETED;
        } else if (blockStart <= currentTimeStr && blockEnd > currentTimeStr) {
          status = TaskStatus.IN_PROGRESS;
        }
      }

      console.log(`✨ Creating task: "${block.title}" (${block.startTime}-${block.endTime}) Status: ${status}`);

      const existingTask = existingByBlock.get(block.id);
      const task = existingTask
        ? await prisma.task.update({
            where: { id: existingTask.id },
            data: {
              title: block.title,
              description: block.description,
              category: block.category,
              priority: block.priority,
              startTime: block.startTime,
              endTime: block.endTime,
              duration: block.duration,
              scheduleBlockId: block.id,
            },
          })
        : await prisma.task.create({
            data: {
              userId,
              title: block.title,
              description: block.description,
              category: block.category,
              startTime: block.startTime,
              endTime: block.endTime,
              duration: block.duration,
              date: startOfDay,
              status,
              priority: block.priority,
              scheduleBlockId: block.id,
            },
          });
      
      tasks.push(task);
    }

    console.log(`✅ Successfully created ${tasks.length} tasks`);

    return NextResponse.json({
      success: true,
      count: tasks.length,
      tasks,
      date: dateStr,
      dayOfWeek,
      bdTime: getBDDate().toISOString(),
    });
  } catch (error: any) {
    console.error('❌ Error generating tasks:', error);
    console.error('Stack:', error.stack);
    return NextResponse.json(
      { 
        error: 'Failed to generate tasks',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

function getDayName(dayOfWeek: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayOfWeek];
}
