import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const levels = await prisma.aIRoadmapLevel.findMany({
      where: { userId },
      orderBy: { order: 'asc' },
      include: {
        topics: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return NextResponse.json(levels);
  } catch (error: any) {
    console.error('❌ Error fetching AI roadmap levels:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AI roadmap levels', details: error.message },
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

    if (!data.title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const level = await prisma.aIRoadmapLevel.create({
      data: {
        userId,
        title: data.title,
        description: data.description || null,
        estimatedWeeks: data.estimatedWeeks || null,
        status: data.status || 'not-started',
        order: data.order || 0,
      },
      include: {
        topics: true,
      },
    });

    return NextResponse.json(level);
  } catch (error: any) {
    console.error('❌ Error creating AI roadmap level:', error);
    return NextResponse.json(
      { error: 'Failed to create AI roadmap level', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'Level ID required' }, { status: 400 });
    }

    const updateData: any = {};
    
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.estimatedWeeks !== undefined) updateData.estimatedWeeks = data.estimatedWeeks;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.order !== undefined) updateData.order = data.order;

    const level = await prisma.aIRoadmapLevel.update({
      where: { id },
      data: updateData,
      include: {
        topics: true,
      },
    });

    return NextResponse.json(level);
  } catch (error: any) {
    console.error('❌ Error updating AI roadmap level:', error);
    return NextResponse.json(
      { error: 'Failed to update AI roadmap level', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Level ID required' }, { status: 400 });
    }

    await prisma.aIRoadmapLevel.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Error deleting AI roadmap level:', error);
    return NextResponse.json(
      { error: 'Failed to delete AI roadmap level', details: error.message },
      { status: 500 }
    );
  }
}
