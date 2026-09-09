import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TaskStatus } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📥 Generate tasks request:', JSON.stringify(body, null, 2));
    
    const { userId, date } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Parse the date string to Date object
    const targetDate = date ? new Date(date + 'T00:00:00.000Z') : new Date();
    const dayOfWeek = targetDate.getUTCDay(); // Use UTC to avoid timezone issues
    
    const dateStr = targetDate.toISOString().split('T')[0];
    console.log(`📅 Generating tasks for date: ${dateStr}, UTC Day: ${dayOfWeek}`);

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

    // Delete existing tasks for this specific date (using date range for safety)
    const startOfDay = new Date(dateStr + 'T00:00:00.000Z');
    const endOfDay = new Date(dateStr + 'T23:59:59.999Z');
    
    const deleted = await prisma.task.deleteMany({
      where: {
        userId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    console.log(`🗑️ Deleted ${deleted.count} existing tasks for ${dateStr}`);

    // Determine current status based on time
    const now = new Date();
    const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const isToday = now.toISOString().split('T')[0] === dateStr;

    console.log(`🕐 Current time: ${currentTimeStr}, Is today: ${isToday}`);

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

      const task = await prisma.task.create({
        data: {
          userId,
          title: block.title,
          description: block.description,
          category: block.category,
          startTime: block.startTime,
          endTime: block.endTime,
          duration: block.duration,
          date: startOfDay, // Use start of day for consistency
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
