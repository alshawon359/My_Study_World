import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticatedUser, unauthorized } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const user = await authenticatedUser();
    if (!user) return unauthorized();
    const userId = user.id;

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
    const subjectsWithStats = subjects.map((subject: any) => {
      const totalChapters = subject.chapters.length;
      const completedChapters = subject.chapters.filter((ch: any) => ch.completed).length;
      const totalTopics = subject.chapters.reduce((sum: number, ch: any) => {
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
        chapters: subject.chapters.map((ch: any) => ({
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Creating subject:', JSON.stringify(body, null, 2));
    
    const user = await authenticatedUser();
    if (!user) return unauthorized();
    const { name, code, color, description, category } = body;
    const userId = user.id;

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Subject name required' }, { status: 400 });
    }

    const subject = await prisma.subject.create({
      data: {
        userId,
        name: name.trim(),
        code: code?.trim() || null,
        color: color || '#3b82f6',
        description: description?.trim() || null,
        category: category || 'ACADEMIC',
      },
    });

    return NextResponse.json(subject);
  } catch (error: any) {
    console.error('Error creating subject:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to create subject' 
    }, { status: 500 });
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

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Subject ID required' }, { status: 400 });
    }

    await prisma.subject.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting subject:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to delete subject' 
    }, { status: 500 });
  }
}
