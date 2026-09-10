import { NextResponse } from 'next/server';

export async function GET() {
  const now = new Date();
  const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
  const bdTime = new Date(utcTime + (6 * 60 * 60 * 1000));
  
  const hours = bdTime.getUTCHours();
  const minutes = bdTime.getUTCMinutes();
  const seconds = bdTime.getUTCSeconds();
  
  return NextResponse.json({
    serverTime: now.toISOString(),
    bdTime: bdTime.toISOString(),
    bdHours: hours,
    bdMinutes: minutes,
    bdSeconds: seconds,
    bdTimeString: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
    expected: '14:24:XX',
  });
}
