import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TaskStatus } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, date } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const dayOfWeek = targetDate.getDay();

    // Clear existing tasks for that day
    await prisma.task.deleteMany({
      where: {
        userId,
        date: {
          gte: targetDate,
          lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    // Get schedule blocks for this day
    const scheduleBlocks = await prisma.scheduleBlock.findMany({
      where: {
        userId,
        dayOfWeek,
      },
      orderBy: { startTime: 'asc' },
    });

    // Create tasks from schedule blocks
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const isToday = targetDate.toDateString() === now.toDateString();

    const tasks = await Promise.all(
      scheduleBlocks.map((block) => {
        let status = TaskStatus.PENDING;
        
        if (isToday) {
          if (block.endTime <= currentTime) {
            status = TaskStatus.COMPLETED;
          } else if (block.startTime <= currentTime && block.endTime > currentTime) {
            status = TaskStatus.IN_PROGRESS;
          }
        }

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

    return NextResponse.json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    console.error('Error generating tasks:', error);
    return NextResponse.json(
      { error: 'Failed to generate tasks' },
      { status: 500 }
    );
  }
}
