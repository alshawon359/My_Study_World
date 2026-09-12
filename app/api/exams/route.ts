import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticatedUser, unauthorized } from '@/lib/api-auth';
import { ExamType } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const types = new Set(['CLASS_TEST', 'MID', 'FINAL']);

const cleanTopics = (topics: unknown) => {
  if (Array.isArray(topics)) return JSON.stringify(topics.map(String).map((item) => item.trim()).filter(Boolean));
  return JSON.stringify(String(topics || '').split(',').map((item) => item.trim()).filter(Boolean));
};

const toData = (body: Record<string, unknown>) => ({
  title: String(body.title || '').trim(),
  subject: body.subject ? String(body.subject).trim() : null,
  examType: String(body.examType || 'CLASS_TEST') as ExamType,
  examDate: new Date(`${String(body.examDate)}T00:00:00.000Z`),
  examTime: String(body.examTime || ''),
  durationMinutes: body.durationMinutes ? Number(body.durationMinutes) : null,
  topics: cleanTopics(body.topics),
  approximateMarks: body.approximateMarks ? Number(body.approximateMarks) : null,
  questionMaterial: body.questionMaterial ? String(body.questionMaterial).trim() : null,
  notes: body.notes ? String(body.notes).trim() : null,
});

const validate = (data: ReturnType<typeof toData>) => {
  if (!data.title || !data.examTime || Number.isNaN(data.examDate.getTime()) || !types.has(data.examType)) return 'Title, valid date, time, and exam type are required.';
  if (data.durationMinutes !== null && (!Number.isFinite(data.durationMinutes) || data.durationMinutes < 1)) return 'Duration must be a positive number.';
  if (data.approximateMarks !== null && (!Number.isFinite(data.approximateMarks) || data.approximateMarks < 0)) return 'Approximate marks cannot be negative.';
  return null;
};

export async function GET(request: NextRequest) {
  const user = await authenticatedUser();
  if (!user) return unauthorized();
  const type = request.nextUrl.searchParams.get('type');
  const exams = await prisma.exam.findMany({
    where: { userId: user.id, ...(type && types.has(type) ? { examType: type as 'CLASS_TEST' | 'MID' | 'FINAL' } : {}) },
    orderBy: [{ examDate: 'asc' }, { examTime: 'asc' }],
  });
  return NextResponse.json(exams, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: NextRequest) {
  try {
    const user = await authenticatedUser();
    if (!user) return unauthorized();
    const data = toData(await request.json());
    const error = validate(data);
    if (error) return NextResponse.json({ error }, { status: 400 });
    return NextResponse.json(await prisma.exam.create({ data: { ...data, userId: user.id } }));
  } catch (error) {
    console.error('Exam creation failed:', error);
    return NextResponse.json({ error: 'Failed to create exam.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await authenticatedUser();
    if (!user) return unauthorized();
    const body = await request.json();
    if (!body.id) return NextResponse.json({ error: 'Exam ID is required.' }, { status: 400 });
    const existing = await prisma.exam.findFirst({ where: { id: String(body.id), userId: user.id } });
    if (!existing) return unauthorized();
    const data = toData(body);
    const error = validate(data);
    if (error) return NextResponse.json({ error }, { status: 400 });
    return NextResponse.json(await prisma.exam.update({ where: { id: existing.id }, data }));
  } catch (error) {
    console.error('Exam update failed:', error);
    return NextResponse.json({ error: 'Failed to update exam.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const user = await authenticatedUser();
  if (!user) return unauthorized();
  const id = request.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Exam ID is required.' }, { status: 400 });
  const exam = await prisma.exam.findFirst({ where: { id, userId: user.id } });
  if (!exam) return unauthorized();
  await prisma.exam.delete({ where: { id: exam.id } });
  return NextResponse.json({ success: true });
}