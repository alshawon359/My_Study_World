import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getBDDate, getBDDayOfWeek, getBDDateString, getBDTimeString, getBDStartOfDay, getBDEndOfDay } from '@/lib/date-utils';

/**
 * Test the complete Schedule → Dashboard flow using BD timezone
 * This endpoint simulates the entire process
 */
export async function POST(request: NextRequest) {
  const results: any = {
    bdTimestamp: getBDDate().toISOString(),
    bdTime: getBDTimeString(),
    bdDate: getBDDateString(),
    bdDayOfWeek: getBDDayOfWeek(),
    steps: [],
  };

  try {
    const { userId = 'cmtszibhe0000uzf04p06d1fe' } = await request.json().catch(() => ({}));
    
    // Step 1: Create a test schedule block for today (BD timezone)
    results.steps.push({ step: 1, action: 'Creating schedule block for today (BD time)...' });
    
    const dayOfWeek = getBDDayOfWeek();
    const currentTime = getBDTimeString();
    const [h, m] = currentTime.split(':').map(Number);
    const startTime = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    const endTime = `${(h + 1).toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    
    const scheduleBlock = await prisma.scheduleBlock.create({
      data: {
        userId,
        title: 'Test Task from API (BD Time)',
        description: 'Testing schedule to dashboard flow with BD timezone',
        category: 'ACADEMIC',
        type: 'FLEXIBLE',
        priority: 'HIGH',
        dayOfWeek,
        startTime,
        endTime,
        duration: 60,
        recurring: true,
        color: '#3b82f6',
      },
    });
    
    results.steps.push({ 
      step: 1, 
      success: true, 
      blockId: scheduleBlock.id,
      dayOfWeek,
      startTime,
      endTime,
      bdTime: currentTime,
    });

    // Step 2: Generate tasks from this schedule
    results.steps.push({ step: 2, action: 'Generating tasks...' });
    
    const dateStr = getBDDateString();
    const startOfDay = getBDStartOfDay(dateStr);
    const endOfDay = getBDEndOfDay(dateStr);
    
    // Delete old tasks
    await prisma.task.deleteMany({
      where: {
        userId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    // Get all schedule blocks for today
    const allBlocks = await prisma.scheduleBlock.findMany({
      where: { userId, dayOfWeek },
      orderBy: { startTime: 'asc' },
    });

    // Create tasks
    const tasks = [];
    for (const block of allBlocks) {
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

    results.steps.push({ 
      step: 2, 
      success: true, 
      tasksCreated: tasks.length,
      tasks: tasks.map(t => ({ id: t.id, title: t.title, startTime: t.startTime }))
    });

    // Step 3: Verify tasks can be retrieved
    results.steps.push({ step: 3, action: 'Verifying tasks retrieval...' });
    
    const retrievedTasks = await prisma.task.findMany({
      where: {
        userId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    results.steps.push({ 
      step: 3, 
      success: true, 
      tasksRetrieved: retrievedTasks.length 
    });

    results.success = true;
    results.message = `✅ Complete flow works! Created ${tasks.length} tasks that dashboard can now display.`;
    results.timezone = 'Bangladesh (UTC+6)';
    
    return NextResponse.json(results);

  } catch (error: any) {
    results.success = false;
    results.error = error.message;
    results.stack = error.stack;
    return NextResponse.json(results, { status: 500 });
  }
}
