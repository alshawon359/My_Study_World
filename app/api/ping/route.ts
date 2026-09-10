import { NextResponse } from 'next/server';
import { getBDDate, getBDDateString, getBDTimeString } from '@/lib/date-utils';

export async function GET() {
  try {
    const bdDate = getBDDate();
    const bdTimeStr = getBDTimeString();
    const bdDateStr = getBDDateString();
    
    return NextResponse.json({ 
      status: 'ok', 
      message: 'Server is running',
      timestamp: bdDate.toISOString(),
      bdTime: bdTimeStr,
      bdDate: bdDateStr,
      bdTimezone: 'Asia/Dhaka (UTC+6)',
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message,
    }, { status: 500 });
  }
}
