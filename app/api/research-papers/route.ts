import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const papers = await prisma.standaloneResearchPaper.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(papers);
  } catch (error) {
    console.error('Error fetching research papers:', error);
    return NextResponse.json({ error: 'Failed to fetch research papers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, ...paperData } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const paper = await prisma.standaloneResearchPaper.create({
      data: {
        userId,
        ...paperData,
      },
    });

    return NextResponse.json(paper);
  } catch (error: any) {
    console.error('Error creating research paper:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to create research paper' 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Paper ID required' }, { status: 400 });
    }

    const paper = await prisma.standaloneResearchPaper.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(paper);
  } catch (error) {
    console.error('Error updating research paper:', error);
    return NextResponse.json({ error: 'Failed to update research paper' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Paper ID required' }, { status: 400 });
    }

    await prisma.standaloneResearchPaper.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting research paper:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to delete research paper' 
    }, { status: 500 });
  }
}
