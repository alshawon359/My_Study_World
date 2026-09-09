import { NextResponse } from 'next/server';
import { getBDDate, getBDDayOfWeek, getBDDateString, getBDTimeString } from '@/lib/date-utils';

export async function GET() {
  const serverUTC = new Date();
  const bdDate = getBDDate();
  const bdDayOfWeek = getBDDayOfWeek();
  
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  // Manual calculation for verification
  const utcTime = serverUTC.getTime() + (serverUTC.getTimezoneOffset() * 60000);
  const bdTimeManual = new Date(utcTime + (6 * 60 * 60 * 1000));
  
  return NextResponse.json({
    serverUTC: {
      time: serverUTC.toISOString(),
      date: serverUTC.toISOString().split('T')[0],
      day: serverUTC.getUTCDay(),
      dayName: days[serverUTC.getUTCDay()],
      timestamp: serverUTC.getTime(),
    },
    bangladesh: {
      time: bdDate.toISOString(),
      date: getBDDateString(),
      timeString: getBDTimeString(),
      day: bdDayOfWeek,
      dayName: days[bdDayOfWeek],
      timestamp: bdDate.getTime(),
    },
    manualCalculation: {
      time: bdTimeManual.toISOString(),
      date: `${bdTimeManual.getUTCFullYear()}-${String(bdTimeManual.getUTCMonth() + 1).padStart(2, '0')}-${String(bdTimeManual.getUTCDate()).padStart(2, '0')}`,
      day: bdTimeManual.getUTCDay(),
      dayName: days[bdTimeManual.getUTCDay()],
    },
    expected: {
      date: '2026-09-10',
      day: 4,
      dayName: 'Thursday',
      time: '01:50 AM',
    },
    match: {
      dateMatches: getBDDateString() === '2026-09-10',
      dayMatches: bdDayOfWeek === 4,
    },
    calculation: {
      serverTimezoneOffset: serverUTC.getTimezoneOffset(),
      utcTime: utcTime,
      bdOffset: 6 * 60 * 60 * 1000,
      bdTime: utcTime + (6 * 60 * 60 * 1000),
    }
  });
}
