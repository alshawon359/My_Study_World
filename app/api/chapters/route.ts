import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticatedUser, unauthorized } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const user = await authenticatedUser();
    if (!user) return unauthorized();
    const subjectId = searchParams.get('subjectId');

    if (!subjectId) {
      return NextResponse.json({ error: 'Subject ID required' }, { status: 400 });
    }

    const subject = await prisma.subject.findFirst({ where: { id: subjectId, userId: user.id } });
    if (!subject) return unauthorized();
    const chapters = await prisma.chapter.findMany({
      where: { subjectId: subject.id },
      include: {
        materials: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json(chapters);
  } catch (error) {
    console.error('Error fetching chapters:', error);
    return NextResponse.json({ error: 'Failed to fetch chapters' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const user = await authenticatedUser();
    if (!user) return unauthorized();
    const { subjectId, title, description, topics } = body;

    if (!subjectId || !title) {
      return NextResponse.json({ error: 'Subject ID and title required' }, { status: 400 });
    }
    const subject = await prisma.subject.findFirst({ where: { id: subjectId, userId: user.id } });
    if (!subject) return unauthorized();

    // Get current chapter count for order
    const chapterCount = await prisma.chapter.count({
      where: { subjectId },
    });

    const chapter = await prisma.chapter.create({
      data: {
        subjectId,
        title,
        description: description || null,
        order: chapterCount,
        topics: JSON.stringify(topics || []),
        subtopics: JSON.stringify([]),
        totalTopics: Array.isArray(topics) ? topics.length : 0,
      },
      include: {
        materials: true,
      },
    });

    // Update subject chapter count
    await prisma.subject.update({
      where: { id: subjectId },
      data: {
        totalChapters: { increment: 1 },
      },
    });

    return NextResponse.json(chapter);
  } catch (error) {
    console.error('Error creating chapter:', error);
    return NextResponse.json({ error: 'Failed to create chapter' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const user = await authenticatedUser();
    if (!user) return unauthorized();
    const { id, title, description, topics, completed } = body;

    if (!id) {
      return NextResponse.json({ error: 'Chapter ID required' }, { status: 400 });
    }

    const chapterOwner = await prisma.chapter.findFirst({ where: { id, subject: { userId: user.id } } });
    if (!chapterOwner) return unauthorized();
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (topics !== undefined) {
      updateData.topics = JSON.stringify(topics);
      updateData.totalTopics = Array.isArray(topics) ? topics.length : 0;
    }
    if (completed !== undefined) {
      updateData.completed = completed;
      
      // Update subject completed chapters count
      const chapter = await prisma.chapter.findUnique({
        where: { id: chapterOwner.id },
        select: { subjectId: true, completed: true },
      });
      
      if (chapter && chapter.completed !== completed) {
        await prisma.subject.update({
          where: { id: chapter.subjectId },
          data: {
            completedChapters: completed ? { increment: 1 } : { decrement: 1 },
          },
        });
      }
    }

    const updatedChapter = await prisma.chapter.update({
      where: { id: chapterOwner.id },
      data: updateData,
      include: {
        materials: true,
      },
    });

    return NextResponse.json(updatedChapter);
  } catch (error) {
    console.error('Error updating chapter:', error);
    return NextResponse.json({ error: 'Failed to update chapter' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const user = await authenticatedUser();
    if (!user) return unauthorized();
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Chapter ID required' }, { status: 400 });
    }

    const chapter = await prisma.chapter.findFirst({
      where: { id, subject: { userId: user.id } },
      select: { id: true, subjectId: true, completed: true },
    });

    if (!chapter) return unauthorized();
    await prisma.chapter.delete({ where: { id: chapter.id } });

    // Update subject chapter counts
    if (chapter) {
      await prisma.subject.update({
        where: { id: chapter.subjectId },
        data: {
          totalChapters: { decrement: 1 },
          ...(chapter.completed && { completedChapters: { decrement: 1 } }),
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting chapter:', error);
    return NextResponse.json({ error: 'Failed to delete chapter' }, { status: 500 });
  }
}
