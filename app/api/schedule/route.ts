import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const dayOfWeek = searchParams.get('dayOfWeek');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const where: any = { userId };
    if (dayOfWeek !== null) {
      where.dayOfWeek = parseInt(dayOfWeek);
    }

    const scheduleBlocks = await prisma.scheduleBlock.findMany({
      where,
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });

    return NextResponse.json(scheduleBlocks);
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedule' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, ...data } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Validate required fields
    if (!data.title || !data.startTime || !data.endTime || data.dayOfWeek === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Clean data: remove empty strings, convert to null or omit
    const cleanData: any = {
      title: data.title,
      category: data.category,
      type: data.type,
      priority: data.priority,
      dayOfWeek: data.dayOfWeek,
      startTime: data.startTime,
      endTime: data.endTime,
      duration: data.duration,
      recurring: data.recurring ?? true,
    };

    // Add optional fields only if they have values
    if (data.description && data.description.trim()) {
      cleanData.description = data.description.trim();
    }
    if (data.subject && data.subject.trim()) {
      cleanData.subject = data.subject.trim();
    }
    if (data.taskObjective && data.taskObjective.trim()) {
      cleanData.taskObjective = data.taskObjective.trim();
    }
    if (data.notes && data.notes.trim()) {
      cleanData.notes = data.notes.trim();
    }
    if (data.color) {
      cleanData.color = data.color;
    }
    if (data.icon) {
      cleanData.icon = data.icon;
    }

    const scheduleBlock = await prisma.scheduleBlock.create({
      data: {
        ...cleanData,
        userId,
      },
    });

    return NextResponse.json(scheduleBlock);
  } catch (error: any) {
    console.error('Error creating schedule block:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create schedule block' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Schedule block ID required' },
        { status: 400 }
      );
    }

    // Clean update data: remove empty strings
    const cleanData: any = {};
    
    for (const [key, value] of Object.entries(data)) {
      if (value === null) {
        cleanData[key] = null;
      } else if (typeof value === 'string' && value.trim() === '') {
        // Skip empty strings - don't update
        continue;
      } else if (value !== undefined) {
        cleanData[key] = value;
      }
    }

    const scheduleBlock = await prisma.scheduleBlock.update({
      where: { id },
      data: cleanData,
    });

    return NextResponse.json(scheduleBlock);
  } catch (error: any) {
    console.error('Error updating schedule block:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update schedule block' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Schedule block ID required' },
        { status: 400 }
      );
    }

    await prisma.scheduleBlock.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting schedule block:', error);
    return NextResponse.json(
      { error: 'Failed to delete schedule block' },
      { status: 500 }
    );
  }
}
