import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const levels = await prisma.aIRoadmapLevel.findMany({
      where: { userId },
      include: {
        topics: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json(levels);
  } catch (error) {
    console.error('Error fetching AI roadmap:', error);
    return NextResponse.json({ error: 'Failed to fetch AI roadmap' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, topics, ...levelData } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const level = await prisma.aIRoadmapLevel.create({
      data: {
        userId,
        ...levelData,
        topics: topics ? {
          create: topics,
        } : undefined,
      },
      include: {
        topics: true,
      },
    });

    return NextResponse.json(level);
  } catch (error: any) {
    console.error('Error creating AI roadmap level:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to create AI roadmap level' 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Level ID required' }, { status: 400 });
    }

    const level = await prisma.aIRoadmapLevel.update({
      where: { id },
      data: updateData,
      include: {
        topics: true,
      },
    });

    return NextResponse.json(level);
  } catch (error) {
    console.error('Error updating AI roadmap level:', error);
    return NextResponse.json({ error: 'Failed to update AI roadmap level' }, { status: 500 });
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
    console.error('Error deleting AI roadmap level:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to delete AI roadmap level' 
    }, { status: 500 });
  }
}
