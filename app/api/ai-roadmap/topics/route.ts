import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { levelId, ...topicData } = body;

    if (!levelId) {
      return NextResponse.json({ error: 'Level ID required' }, { status: 400 });
    }

    const topic = await prisma.aIRoadmapTopic.create({
      data: {
        levelId,
        ...topicData,
      },
    });

    return NextResponse.json(topic);
  } catch (error: any) {
    console.error('Error creating topic:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to create topic' 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Topic ID required' }, { status: 400 });
    }

    const topic = await prisma.aIRoadmapTopic.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(topic);
  } catch (error) {
    console.error('Error updating topic:', error);
    return NextResponse.json({ error: 'Failed to update topic' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Topic ID required' }, { status: 400 });
    }

    await prisma.aIRoadmapTopic.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting topic:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to delete topic' 
    }, { status: 500 });
  }
}
