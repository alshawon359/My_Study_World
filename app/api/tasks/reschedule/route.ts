import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { suggestRescheduleSlot } from '@/lib/scheduling-engine';
import { authenticatedUser, unauthorized } from '@/lib/api-auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const user = await authenticatedUser();
    if (!user) return unauthorized();
    const { taskId, preferredDay, reason } = body;
    const userId = user.id;

    if (!taskId || !userId) {
      return NextResponse.json(
        { error: 'Task ID and User ID required' },
        { status: 400 }
      );
    }

    // Get the task
    const task = await prisma.task.findFirst({ where: { id: taskId, userId } });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Get today's schedule blocks
    const dayOfWeek = preferredDay !== undefined ? preferredDay : new Date().getDay();
    const scheduleBlocks = await prisma.scheduleBlock.findMany({
      where: { userId, dayOfWeek },
    });

    // Find best slot
    const suggestedSlot = suggestRescheduleSlot(
      scheduleBlocks,
      task.duration,
      dayOfWeek,
      task.priority
    );

    if (!suggestedSlot) {
      return NextResponse.json(
        { error: 'No available slots found', availableSlots: [] },
        { status: 200 }
      );
    }

    // Update task with new time
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        startTime: suggestedSlot.startTime,
        endTime: suggestedSlot.endTime,
        status: 'RESCHEDULED',
        originalDate: task.date,
        rescheduledReason: reason,
      },
    });

    return NextResponse.json({
      task: updatedTask,
      suggestedSlot,
      message: 'Task rescheduled successfully',
    });
  } catch (error) {
    console.error('Error rescheduling task:', error);
    return NextResponse.json(
      { error: 'Failed to reschedule task' },
      { status: 500 }
    );
  }
}
