import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDateString } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const dateStr = searchParams.get('date');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    let tasks;
    
    if (dateStr) {
      // Optimized query - fetch all and filter in memory (faster for small datasets)
      const allTasks = await prisma.task.findMany({
        where: { userId },
        orderBy: { startTime: 'asc' },
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          priority: true,
          status: true,
          date: true,
          startTime: true,
          endTime: true,
          duration: true,
          completionPercentage: true,
        },
      });
      
      // Filter by comparing date strings (YYYY-MM-DD)
      tasks = allTasks.filter(task => {
        const taskDateStr = task.date.toISOString().split('T')[0];
        return taskDateStr === dateStr;
      });
    } else {
      tasks = await prisma.task.findMany({
        where: { userId },
        orderBy: { startTime: 'asc' },
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          priority: true,
          status: true,
          date: true,
          startTime: true,
          endTime: true,
          duration: true,
          completionPercentage: true,
        },
      });
    }

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, ...data } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        ...data,
        userId,
        date: new Date(data.date),
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, actualStartTime, actualEndTime, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'Task ID required' }, { status: 400 });
    }

    const updateData: any = { ...data };
    if (status) updateData.status = status;
    if (actualStartTime) updateData.actualStartTime = new Date(actualStartTime);
    if (actualEndTime) updateData.actualEndTime = new Date(actualEndTime);

    // Auto-set completed timestamp
    if (status === 'COMPLETED' || status === 'PARTIALLY_COMPLETED') {
      updateData.completedAt = new Date();
    }

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}
