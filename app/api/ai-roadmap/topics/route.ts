import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticatedUser, unauthorized } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const user = await authenticatedUser();
    if (!user) return unauthorized();
    const { levelId, ...data } = body;

    if (!levelId) {
      return NextResponse.json({ error: 'Level ID required' }, { status: 400 });
    }

    if (!data.name) {
      return NextResponse.json({ error: 'Topic name is required' }, { status: 400 });
    }

    const level = await prisma.aIRoadmapLevel.findFirst({ where: { id: levelId, userId: user.id } });
    if (!level) return unauthorized();
    const topic = await prisma.aIRoadmapTopic.create({
      data: {
        levelId,
        name: data.name,
        estimatedTime: data.estimatedTime || null,
        completed: data.completed || false,
        resources: data.resources || null,
        videoLinks: data.videoLinks ? JSON.stringify(data.videoLinks) : '[]',
        subtopics: data.subtopics ? JSON.stringify(data.subtopics) : '[]',
      },
    });

    return NextResponse.json(topic);
  } catch (error: any) {
    console.error('❌ Error creating topic:', error);
    return NextResponse.json(
      { error: 'Failed to create topic', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const user = await authenticatedUser();
    if (!user) return unauthorized();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'Topic ID required' }, { status: 400 });
    }

    const updateData: any = {};
    
    if (data.name !== undefined) updateData.name = data.name;
    if (data.estimatedTime !== undefined) updateData.estimatedTime = data.estimatedTime;
    if (data.completed !== undefined) updateData.completed = data.completed;
    if (data.resources !== undefined) updateData.resources = data.resources;
    if (data.videoLinks !== undefined) updateData.videoLinks = JSON.stringify(data.videoLinks);
    if (data.subtopics !== undefined) updateData.subtopics = JSON.stringify(data.subtopics);

    const topic = await prisma.aIRoadmapTopic.findFirst({ where: { id, level: { userId: user.id } } });
    if (!topic) return unauthorized();
    const updatedTopic = await prisma.aIRoadmapTopic.update({
      where: { id: topic.id },
      data: updateData,
    });

    return NextResponse.json(updatedTopic);
  } catch (error: any) {
    console.error('❌ Error updating topic:', error);
    return NextResponse.json(
      { error: 'Failed to update topic', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const user = await authenticatedUser();
    if (!user) return unauthorized();
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Topic ID required' }, { status: 400 });
    }

    const topic = await prisma.aIRoadmapTopic.findFirst({ where: { id, level: { userId: user.id } } });
    if (!topic) return unauthorized();
    await prisma.aIRoadmapTopic.delete({ where: { id: topic.id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Error deleting topic:', error);
    return NextResponse.json(
      { error: 'Failed to delete topic', details: error.message },
      { status: 500 }
    );
  }
}
