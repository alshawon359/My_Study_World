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

    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const dayOfWeek = targetDate.getDay();

    console.log(`📅 Generating tasks for: ${targetDate.toISOString()}, Day: ${dayOfWeek}`);

    // Get schedule blocks for this day
    const scheduleBlocks = await prisma.scheduleBlock.findMany({
      where: {
        userId,
        dayOfWeek,
      },
      orderBy: { startTime: 'asc' },
    });

    console.log(`📋 Found ${scheduleBlocks.length} schedule blocks`);

    if (scheduleBlocks.length === 0) {
      return NextResponse.json({
        success: true,
        count: 0,
        tasks: [],
        message: 'No schedule blocks found for this day'
      });
    }

    // Delete existing tasks for this specific date
    const deleted = await prisma.task.deleteMany({
      where: {
        userId,
        date: {
          gte: targetDate,
          lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    console.log(`🗑️ Deleted ${deleted.count} existing tasks`);

    // Create tasks from schedule blocks
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const isToday = targetDate.toDateString() === now.toDateString();

    const tasks = await Promise.all(
      scheduleBlocks.map((block) => {
        let status: TaskStatus = TaskStatus.PENDING;
        
        if (isToday) {
          if (block.endTime <= currentTime) {
            status = TaskStatus.COMPLETED;
          } else if (block.startTime <= currentTime && block.endTime > currentTime) {
            status = TaskStatus.IN_PROGRESS;
          }
        }

        console.log(`✨ Creating task: ${block.title} (${block.startTime}-${block.endTime}) - ${status}`);

        return prisma.task.create({
          data: {
            userId,
            title: block.title,
            description: block.description,
            category: block.category,
            startTime: block.startTime,
            endTime: block.endTime,
            duration: block.duration,
            date: targetDate,
            status,
            priority: block.priority,
            scheduleBlockId: block.id,
          },
        });
      })
    );

    console.log(`✅ Created ${tasks.length} tasks successfully`);

    return NextResponse.json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error: any) {
    console.error('❌ Error generating tasks:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { 
        error: 'Failed to generate tasks',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
