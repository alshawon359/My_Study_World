import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const subjects = await prisma.subject.findMany({
      where: { userId },
      include: {
        chapters: {
          include: {
            materials: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Calculate real-time stats
    const subjectsWithStats = subjects.map(subject => {
      const totalChapters = subject.chapters.length;
      const completedChapters = subject.chapters.filter(ch => ch.completed).length;
      const totalTopics = subject.chapters.reduce((sum, ch) => {
        const topics = JSON.parse(ch.topics || '[]');
        return sum + (Array.isArray(topics) ? topics.length : 0);
      }, 0);
      
      return {
        id: subject.id,
        name: subject.name,
        code: subject.code,
        color: subject.color,
        description: subject.description,
        category: subject.category,
        totalChapters,
        completedChapters,
        totalTopics,
        completedTopics: 0, // Can be calculated from topic completion if needed
        chapters: subject.chapters.map(ch => ({
          ...ch,
          topics: JSON.parse(ch.topics || '[]'),
          materialsCount: ch.materials.length,
        })),
      };
    });

    return NextResponse.json(subjectsWithStats);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json({ error: 'Failed to fetch subjects' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Subject ID required' }, { status: 400 });
    }

    const subject = await prisma.subject.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(subject);
  } catch (error) {
    console.error('Error updating subject:', error);
    return NextResponse.json({ error: 'Failed to update subject' }, { status: 500 });
  }
}
