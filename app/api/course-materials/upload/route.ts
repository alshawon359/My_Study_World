import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextRequest, NextResponse } from 'next/server';
import { authenticatedUser } from '@/lib/api-auth';

export async function POST(request: NextRequest) {
  try {
    const user = await authenticatedUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = (await request.json()) as HandleUploadBody;
    const response = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: [
          'application/pdf', 'application/msword', 'application/vnd.ms-excel',
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.*', 'image/*', 'text/*',
        ],
        tokenPayload: JSON.stringify({ userId: user.id, purpose: 'course-material' }),
      }),
      onUploadCompleted: async () => undefined,
    });
    return NextResponse.json(response);
  } catch (error) {
    console.error('Course material upload failed:', error);
    return NextResponse.json({ error: 'Unable to upload course material' }, { status: 500 });
  }
}