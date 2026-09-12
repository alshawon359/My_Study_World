import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticatedUser, unauthorized } from '@/lib/api-auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const user = await authenticatedUser();
    if (!user) return unauthorized();
    const { chapterId, title, type, description, fileUrl, externalUrl, content } = body;

    if (!chapterId || !title || !type) {
      return NextResponse.json(
        { error: 'Chapter ID, title, and type required' },
        { status: 400 }
      );
    }
    const chapter = await prisma.chapter.findFirst({ where: { id: chapterId, subject: { userId: user.id } } });
    if (!chapter) return unauthorized();

    // Get current material count for order
    const materialCount = await prisma.chapterMaterial.count({
      where: { chapterId },
    });

    const material = await prisma.chapterMaterial.create({
      data: {
        chapterId,
        title,
        type,
        description: description || null,
        fileUrl: fileUrl || null,
        externalUrl: externalUrl || null,
        content: content || null,
        order: materialCount,
      },
    });

    return NextResponse.json(material);
  } catch (error) {
    console.error('Error creating material:', error);
    return NextResponse.json({ error: 'Failed to create material' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const user = await authenticatedUser();
    if (!user) return unauthorized();
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Material ID required' }, { status: 400 });
    }

    const material = await prisma.chapterMaterial.findFirst({ where: { id, chapter: { subject: { userId: user.id } } } });
    if (!material) return unauthorized();
    await prisma.chapterMaterial.delete({ where: { id: material.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting material:', error);
    return NextResponse.json({ error: 'Failed to delete material' }, { status: 500 });
  }
}
