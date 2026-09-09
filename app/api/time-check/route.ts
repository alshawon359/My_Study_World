import { NextResponse } from 'next/server';
import { getBDDate, getBDDayOfWeek, getBDDateString, getBDTimeString } from '@/lib/date-utils';

export async function GET() {
  const serverUTC = new Date();
  const bdDate = getBDDate();
  const bdDayOfWeek = getBDDayOfWeek();
  
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  return NextResponse.json({
    serverUTC: {
      time: serverUTC.toISOString(),
      date: serverUTC.toISOString().split('T')[0],
      day: serverUTC.getUTCDay(),
      dayName: days[serverUTC.getUTCDay()],
    },
    bangladesh: {
      time: bdDate.toISOString(),
      date: getBDDateString(),
      timeString: getBDTimeString(),
      day: bdDayOfWeek,
      dayName: days[bdDayOfWeek],
    },
    expected: {
      date: '2026-09-10',
      day: 4,
      dayName: 'Thursday',
      time: '01:48 AM',
    },
    match: {
      dateMatches: getBDDateString() === '2026-09-10',
      dayMatches: bdDayOfWeek === 4,
    }
  });
}
