import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    return NextResponse.json({
      status: 'ok',
      message: 'Server and database are healthy',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: 'Database connection failed',
      error: error.message,
      timestamp: new Date().toISOString(),
      database: 'disconnected'
    }, { status: 500 });
  }
}
