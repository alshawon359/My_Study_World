import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticatedUser, unauthorized } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const user = await authenticatedUser();
    if (!user) return unauthorized();
    const userId = user.id;
    const status = searchParams.get('status');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    const papers = await prisma.standaloneResearchPaper.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(papers);
  } catch (error: any) {
    console.error('❌ Error fetching research papers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch research papers', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const user = await authenticatedUser();
    if (!user) return unauthorized();
    const { ...data } = body;
    const userId = user.id;

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    if (!data.title || !data.authors) {
      return NextResponse.json(
        { error: 'Title and authors are required' },
        { status: 400 }
      );
    }

    const paper = await prisma.standaloneResearchPaper.create({
      data: {
        userId,
        title: data.title,
        authors: data.authors,
        year: data.year || null,
        link: data.link || null,
        topic: data.topic || null,
        status: data.status || 'TO_READ',
        researchProblem: data.researchProblem || null,
        dataset: data.dataset || null,
        method: data.method || null,
        model: data.model || null,
        results: data.results || null,
        limitations: data.limitations || null,
        importantNotes: data.importantNotes || null,
        myThoughts: data.myThoughts || null,
        researchIdeas: data.researchIdeas || null,
        materials: data.materials ? JSON.stringify(data.materials) : '[]',
      },
    });

    return NextResponse.json(paper);
  } catch (error: any) {
    console.error('❌ Error creating research paper:', error);
    return NextResponse.json(
      { error: 'Failed to create research paper', details: error.message },
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
      return NextResponse.json({ error: 'Paper ID required' }, { status: 400 });
    }

    const updateData: any = {};
    
    // Only update provided fields
    if (data.title !== undefined) updateData.title = data.title;
    if (data.authors !== undefined) updateData.authors = data.authors;
    if (data.year !== undefined) updateData.year = data.year;
    if (data.link !== undefined) updateData.link = data.link;
    if (data.topic !== undefined) updateData.topic = data.topic;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.researchProblem !== undefined) updateData.researchProblem = data.researchProblem;
    if (data.dataset !== undefined) updateData.dataset = data.dataset;
    if (data.method !== undefined) updateData.method = data.method;
    if (data.model !== undefined) updateData.model = data.model;
    if (data.results !== undefined) updateData.results = data.results;
    if (data.limitations !== undefined) updateData.limitations = data.limitations;
    if (data.importantNotes !== undefined) updateData.importantNotes = data.importantNotes;
    if (data.myThoughts !== undefined) updateData.myThoughts = data.myThoughts;
    if (data.researchIdeas !== undefined) updateData.researchIdeas = data.researchIdeas;
    if (data.materials !== undefined) updateData.materials = JSON.stringify(data.materials);

    const existingPaper = await prisma.standaloneResearchPaper.findFirst({ where: { id, userId: user.id } });
    if (!existingPaper) return unauthorized();
    const paper = await prisma.standaloneResearchPaper.update({
      where: { id: existingPaper.id },
      data: updateData,
    });

    return NextResponse.json(paper);
  } catch (error: any) {
    console.error('❌ Error updating research paper:', error);
    return NextResponse.json(
      { error: 'Failed to update research paper', details: error.message },
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
      return NextResponse.json({ error: 'Paper ID required' }, { status: 400 });
    }

    const paper = await prisma.standaloneResearchPaper.findFirst({ where: { id, userId: user.id } });
    if (!paper) return unauthorized();
    await prisma.standaloneResearchPaper.delete({ where: { id: paper.id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Error deleting research paper:', error);
    return NextResponse.json(
      { error: 'Failed to delete research paper', details: error.message },
      { status: 500 }
    );
  }
}
