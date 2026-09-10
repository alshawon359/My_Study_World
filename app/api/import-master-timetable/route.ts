import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Simplified Master Timetable - Core blocks only (Academic/AI/Research)
const coreSchedule = [
  // Thursday (4) - Current day
  { d: 4, t: 'Wake up', s: '07:30', e: '08:00', c: 'PERSONAL', p: 'LOW' },
  { d: 4, t: 'Commute', s: '08:00', e: '08:40', c: 'PERSONAL', p: 'LOW' },
  { d: 4, t: 'University', s: '09:00', e: '13:00', c: 'UNIVERSITY', p: 'HIGH' },
  { d: 4, t: 'Lunch', s: '13:00', e: '14:00', c: 'PERSONAL', p: 'MEDIUM' },
  { d: 4, t: 'Rest', s: '14:00', e: '15:00', c: 'PERSONAL', p: 'MEDIUM' },
  { d: 4, t: 'Review', s: '15:00', e: '16:00', c: 'ACADEMIC', p: 'MEDIUM' },
  { d: 4, t: 'Friends', s: '16:00', e: '22:00', c: 'PERSONAL', p: 'HIGH' },
  { d: 4, t: 'Dinner', s: '22:00', e: '22:45', c: 'PERSONAL', p: 'LOW' },
  { d: 4, t: 'ML Study', s: '22:45', e: '23:45', c: 'AI_ML', p: 'MEDIUM' },
  { d: 4, t: 'Research', s: '00:05', e: '01:00', c: 'RESEARCH', p: 'MEDIUM' },
  { d: 4, t: 'Sleep', s: '01:00', e: '07:30', c: 'SLEEP', p: 'HIGH' },
];

const colors: any = {
  ACADEMIC: '#3b82f6', AI_ML: '#06b6d4', RESEARCH: '#8b5cf6',
  UNIVERSITY: '#f59e0b', PERSONAL: '#10b981', SLEEP: '#64748b',
};

export async function GET() {
  const userId = 'cmtszibhe0000uzf04p06d1fe';
  
  try {
    // Quick delete and insert
    await prisma.scheduleBlock.deleteMany({ where: { userId } });

    for (const b of coreSchedule) {
      const [sh, sm] = b.s.split(':').map(Number);
      const [eh, em] = b.e.split(':').map(Number);
      const dur = ((eh * 60 + em) - (sh * 60 + sm) + 1440) % 1440;
      
      await prisma.scheduleBlock.create({
        data: {
          userId, title: b.t, dayOfWeek: b.d,
          startTime: b.s, endTime: b.e, duration: dur,
          category: b.c, priority: b.p,
          type: 'FLEXIBLE', recurring: true, color: colors[b.c],
        },
      });
    }

    return NextResponse.json({
      success: true,
      imported: coreSchedule.length,
      next: 'Visit /api/force-sync',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Complete Master Timetable from Excel - All 7 days
const masterSchedule = [
  // SUNDAY (0) - 13 blocks
  { day: 0, title: 'Wake up + breakfast', start: '07:30', end: '08:00', dur: 30, cat: 'PERSONAL', pri: 'LOW', desc: 'Freshen up, breakfast' },
  { day: 0, title: 'Prepare + commute', start: '08:00', end: '08:40', dur: 40, cat: 'PERSONAL', pri: 'LOW', desc: 'Get ready and commute to class' },
  { day: 0, title: 'University class', start: '09:00', end: '16:00', dur: 420, cat: 'UNIVERSITY', pri: 'HIGH', desc: 'Attend all classes actively' },
  { day: 0, title: 'Home + GSL + rest', start: '16:00', end: '17:00', dur: 60, cat: 'PERSONAL', pri: 'MEDIUM', desc: 'GSL / shower / food / reset' },
  { day: 0, title: 'DIP Deep Study', start: '17:00', end: '18:30', dur: 90, cat: 'ACADEMIC', pri: 'HIGH', desc: "Lecture + concepts + examples" },
  { day: 0, title: 'Break', start: '18:30', end: '18:50', dur: 20, cat: 'PERSONAL', pri: 'LOW', desc: 'Walk / water' },
  { day: 0, title: 'Machine Learning', start: '18:50', end: '20:20', dur: 90, cat: 'AI_ML', pri: 'HIGH', desc: 'Theory + notes' },
  { day: 0, title: 'Dinner + phone', start: '20:20', end: '21:00', dur: 40, cat: 'PERSONAL', pri: 'LOW', desc: 'Dinner + controlled phone' },
  { day: 0, title: 'Digital Communication', start: '21:00', end: '22:30', dur: 90, cat: 'ACADEMIC', pri: 'HIGH', desc: 'Problems, derivations' },
  { day: 0, title: 'Break', start: '22:30', end: '22:50', dur: 20, cat: 'PERSONAL', pri: 'LOW', desc: 'Reset' },
  { day: 0, title: 'AI/ML Coding', start: '22:50', end: '00:20', dur: 90, cat: 'AI_ML', pri: 'HIGH', desc: 'Python / NumPy / ML' },
  { day: 0, title: 'Phone + relax', start: '00:20', end: '01:00', dur: 40, cat: 'PERSONAL', pri: 'LOW', desc: 'Prepare for bed' },
  { day: 0, title: 'Sleep', start: '01:00', end: '07:30', dur: 390, cat: 'SLEEP', pri: 'HIGH', desc: '6.5 hours sleep' },

  // MONDAY (1) - 13 blocks
  { day: 1, title: 'Wake up + breakfast', start: '07:30', end: '08:00', dur: 30, cat: 'PERSONAL', pri: 'LOW', desc: 'Freshen up, breakfast' },
  { day: 1, title: 'Prepare + commute', start: '08:00', end: '08:40', dur: 40, cat: 'PERSONAL', pri: 'LOW', desc: 'Get ready and commute' },
  { day: 1, title: 'University class', start: '09:00', end: '16:00', dur: 420, cat: 'UNIVERSITY', pri: 'HIGH', desc: 'Attend actively' },
  { day: 1, title: 'Home + GSL + rest', start: '16:00', end: '17:00', dur: 60, cat: 'PERSONAL', pri: 'MEDIUM', desc: 'GSL / shower / food' },
  { day: 1, title: 'Telecommunication Engineering', start: '17:00', end: '18:30', dur: 90, cat: 'ACADEMIC', pri: 'HIGH', desc: 'Lecture revision + numerical' },
  { day: 1, title: 'Break', start: '18:30', end: '18:50', dur: 20, cat: 'PERSONAL', pri: 'LOW', desc: 'Walk / water' },
  { day: 1, title: 'Machine Learning', start: '18:50', end: '20:20', dur: 90, cat: 'AI_ML', pri: 'HIGH', desc: 'Algorithms + math intuition' },
  { day: 1, title: 'Dinner + phone', start: '20:20', end: '21:00', dur: 40, cat: 'PERSONAL', pri: 'LOW', desc: 'Dinner + phone' },
  { day: 1, title: 'DIP MATLAB', start: '21:00', end: '22:30', dur: 90, cat: 'ACADEMIC', pri: 'HIGH', desc: 'Code from memory' },
  { day: 1, title: 'Break', start: '22:30', end: '22:50', dur: 20, cat: 'PERSONAL', pri: 'LOW', desc: 'Reset' },
  { day: 1, title: 'Python / ML Coding', start: '22:50', end: '00:20', dur: 90, cat: 'AI_ML', pri: 'HIGH', desc: 'Implement what learned' },
  { day: 1, title: 'Phone + relax', start: '00:20', end: '01:00', dur: 40, cat: 'PERSONAL', pri: 'LOW', desc: 'Wind down' },
  { day: 1, title: 'Sleep', start: '01:00', end: '07:30', dur: 390, cat: 'SLEEP', pri: 'HIGH', desc: '6.5 hours sleep' },

  // TUESDAY (2) - 13 blocks  
  { day: 2, title: 'Wake up + breakfast', start: '07:30', end: '08:00', dur: 30, cat: 'PERSONAL', pri: 'LOW', desc: 'Freshen up, breakfast' },
  { day: 2, title: 'Prepare + commute', start: '08:00', end: '08:40', dur: 40, cat: 'PERSONAL', pri: 'LOW', desc: 'Get ready and commute' },
  { day: 2, title: 'University class', start: '09:00', end: '16:00', dur: 420, cat: 'UNIVERSITY', pri: 'HIGH', desc: 'Attend actively' },
  { day: 2, title: 'Home + GSL + rest', start: '16:00', end: '17:00', dur: 60, cat: 'PERSONAL', pri: 'MEDIUM', desc: 'GSL / shower / food' },
  { day: 2, title: 'Optical Fiber Communication', start: '17:00', end: '18:30', dur: 90, cat: 'ACADEMIC', pri: 'HIGH', desc: 'Lecture + formulas' },
  { day: 2, title: 'Break', start: '18:30', end: '19:00', dur: 30, cat: 'PERSONAL', pri: 'LOW', desc: 'Relax' },
  { day: 2, title: 'Machine Learning', start: '19:00', end: '20:30', dur: 90, cat: 'AI_ML', pri: 'HIGH', desc: 'Practice + recap' },
  { day: 2, title: 'Dinner + phone', start: '20:30', end: '21:15', dur: 45, cat: 'PERSONAL', pri: 'LOW', desc: 'Dinner + phone' },
  { day: 2, title: 'Digital Communication', start: '21:15', end: '22:45', dur: 90, cat: 'ACADEMIC', pri: 'HIGH', desc: 'Problem solving' },
  { day: 2, title: 'Break', start: '22:45', end: '23:15', dur: 30, cat: 'PERSONAL', pri: 'LOW', desc: 'Reset' },
  { day: 2, title: 'Research Reading', start: '23:15', end: '00:15', dur: 60, cat: 'RESEARCH', pri: 'HIGH', desc: 'Read 1 paper / notes' },
  { day: 2, title: 'Phone + relax', start: '00:15', end: '01:00', dur: 45, cat: 'PERSONAL', pri: 'LOW', desc: 'Wind down' },
  { day: 2, title: 'Sleep', start: '01:00', end: '07:30', dur: 390, cat: 'SLEEP', pri: 'HIGH', desc: '6.5 hours sleep' },

  // WEDNESDAY (3) - 16 blocks
  { day: 3, title: 'Wake up + breakfast', start: '07:30', end: '08:00', dur: 30, cat: 'PERSONAL', pri: 'LOW', desc: 'Freshen up, breakfast' },
  { day: 3, title: 'Prepare + commute', start: '08:00', end: '08:40', dur: 40, cat: 'PERSONAL', pri: 'LOW', desc: 'Get ready and commute' },
  { day: 3, title: 'University class', start: '09:00', end: '13:00', dur: 240, cat: 'UNIVERSITY', pri: 'HIGH', desc: 'Attend actively' },
  { day: 3, title: 'Home + lunch + GSL', start: '13:00', end: '14:00', dur: 60, cat: 'PERSONAL', pri: 'MEDIUM', desc: 'Return, GSL, lunch' },
  { day: 3, title: 'Power nap / rest', start: '14:00', end: '15:00', dur: 60, cat: 'PERSONAL', pri: 'MEDIUM', desc: 'No phone' },
  { day: 3, title: 'DIP', start: '15:00', end: '16:30', dur: 90, cat: 'ACADEMIC', pri: 'HIGH', desc: 'Core concepts + problems' },
  { day: 3, title: 'Break', start: '16:30', end: '16:50', dur: 20, cat: 'PERSONAL', pri: 'LOW', desc: 'Walk / water' },
  { day: 3, title: 'Machine Learning', start: '16:50', end: '18:20', dur: 90, cat: 'AI_ML', pri: 'HIGH', desc: 'Theory + notebook' },
  { day: 3, title: 'Rest + phone', start: '18:20', end: '19:00', dur: 40, cat: 'PERSONAL', pri: 'LOW', desc: 'Controlled phone' },
  { day: 3, title: 'Telecommunication Engineering', start: '19:00', end: '20:30', dur: 90, cat: 'ACADEMIC', pri: 'HIGH', desc: 'Revision + problems' },
  { day: 3, title: 'Dinner', start: '20:30', end: '21:15', dur: 45, cat: 'PERSONAL', pri: 'LOW', desc: 'Dinner + reset' },
  { day: 3, title: 'AI + Antenna Research', start: '21:15', end: '22:45', dur: 90, cat: 'RESEARCH', pri: 'HIGH', desc: 'Paper / methodology' },
  { day: 3, title: 'Break', start: '22:45', end: '23:05', dur: 20, cat: 'PERSONAL', pri: 'LOW', desc: 'Reset' },
  { day: 3, title: 'AI Coding', start: '23:05', end: '00:35', dur: 90, cat: 'AI_ML', pri: 'HIGH', desc: 'Python / ML implementation' },
  { day: 3, title: 'Phone + relax', start: '00:35', end: '01:00', dur: 25, cat: 'PERSONAL', pri: 'LOW', desc: 'Wind down' },
  { day: 3, title: 'Sleep', start: '01:00', end: '07:30', dur: 390, cat: 'SLEEP', pri: 'HIGH', desc: '6.5 hours sleep' },

  // THURSDAY (4) - 12 blocks
  { day: 4, title: 'Wake up + breakfast', start: '07:30', end: '08:00', dur: 30, cat: 'PERSONAL', pri: 'LOW', desc: 'Freshen up, breakfast' },
  { day: 4, title: 'Prepare + commute', start: '08:00', end: '08:40', dur: 40, cat: 'PERSONAL', pri: 'LOW', desc: 'Get ready and commute' },
  { day: 4, title: 'University class', start: '09:00', end: '13:00', dur: 240, cat: 'UNIVERSITY', pri: 'HIGH', desc: 'Attend actively' },
  { day: 4, title: 'Home + lunch + GSL', start: '13:00', end: '14:00', dur: 60, cat: 'PERSONAL', pri: 'MEDIUM', desc: 'Return, GSL, lunch' },
  { day: 4, title: 'Rest', start: '14:00', end: '15:00', dur: 60, cat: 'PERSONAL', pri: 'MEDIUM', desc: 'Recover' },
  { day: 4, title: 'Weekly light review', start: '15:00', end: '16:00', dur: 60, cat: 'ACADEMIC', pri: 'MEDIUM', desc: 'Review difficult points' },
  { day: 4, title: 'Friends / Adda', start: '16:00', end: '22:00', dur: 360, cat: 'PERSONAL', pri: 'HIGH', desc: 'Full social time' },
  { day: 4, title: 'Dinner', start: '22:00', end: '22:45', dur: 45, cat: 'PERSONAL', pri: 'LOW', desc: 'Dinner + return home' },
  { day: 4, title: 'Machine Learning', start: '22:45', end: '23:45', dur: 60, cat: 'AI_ML', pri: 'MEDIUM', desc: 'Light recap / video' },
  { day: 4, title: 'Break', start: '23:45', end: '00:05', dur: 20, cat: 'PERSONAL', pri: 'LOW', desc: 'Reset' },
  { day: 4, title: 'Research notes', start: '00:05', end: '01:00', dur: 55, cat: 'RESEARCH', pri: 'MEDIUM', desc: 'Organize ideas' },
  { day: 4, title: 'Sleep', start: '01:00', end: '07:30', dur: 390, cat: 'SLEEP', pri: 'HIGH', desc: '6.5 hours sleep' },

  // FRIDAY (5) - 16 blocks
  { day: 5, title: 'Wake up + breakfast', start: '08:00', end: '08:30', dur: 30, cat: 'PERSONAL', pri: 'LOW', desc: 'Start relaxed' },
  { day: 5, title: 'ML Deep Study', start: '08:30', end: '10:30', dur: 120, cat: 'AI_ML', pri: 'HIGH', desc: 'New concept + notes' },
  { day: 5, title: 'Break', start: '10:30', end: '10:50', dur: 20, cat: 'PERSONAL', pri: 'LOW', desc: 'Reset' },
  { day: 5, title: 'ML Coding', start: '10:50', end: '12:20', dur: 90, cat: 'AI_ML', pri: 'HIGH', desc: 'Implement algorithms' },
  { day: 5, title: 'Lunch + rest', start: '12:20', end: '13:20', dur: 60, cat: 'PERSONAL', pri: 'MEDIUM', desc: 'Food + recovery' },
  { day: 5, title: 'Antenna Research', start: '13:20', end: '15:20', dur: 120, cat: 'RESEARCH', pri: 'HIGH', desc: 'Literature + simulation' },
  { day: 5, title: 'Break', start: '15:20', end: '15:50', dur: 30, cat: 'PERSONAL', pri: 'LOW', desc: 'Reset' },
  { day: 5, title: 'DIP', start: '15:50', end: '17:20', dur: 90, cat: 'ACADEMIC', pri: 'HIGH', desc: 'Weekly deep practice' },
  { day: 5, title: 'Rest + phone', start: '17:20', end: '18:00', dur: 40, cat: 'PERSONAL', pri: 'LOW', desc: 'Controlled phone' },
  { day: 5, title: 'Digital Communication', start: '18:00', end: '19:30', dur: 90, cat: 'ACADEMIC', pri: 'HIGH', desc: 'Weekly problem set' },
  { day: 5, title: 'Dinner', start: '19:30', end: '20:15', dur: 45, cat: 'PERSONAL', pri: 'LOW', desc: 'Dinner' },
  { day: 5, title: 'Deep Learning / AI', start: '20:15', end: '21:45', dur: 90, cat: 'AI_ML', pri: 'HIGH', desc: 'Neural networks' },
  { day: 5, title: 'Break', start: '21:45', end: '22:15', dur: 30, cat: 'PERSONAL', pri: 'LOW', desc: 'Reset' },
  { day: 5, title: 'Research / Simulation', start: '22:15', end: '23:45', dur: 90, cat: 'RESEARCH', pri: 'HIGH', desc: 'Antenna coding' },
  { day: 5, title: 'Phone + relax', start: '23:45', end: '00:30', dur: 45, cat: 'PERSONAL', pri: 'LOW', desc: 'Wind down' },
  { day: 5, title: 'Weekly planning', start: '00:30', end: '01:00', dur: 30, cat: 'PERSONAL', pri: 'MEDIUM', desc: 'Update trackers' },
  { day: 5, title: 'Sleep', start: '01:00', end: '08:00', dur: 420, cat: 'SLEEP', pri: 'HIGH', desc: '7 hours sleep' },

  // SATURDAY (6) - 13 blocks
  { day: 6, title: 'Wake up + breakfast', start: '08:00', end: '08:30', dur: 30, cat: 'PERSONAL', pri: 'LOW', desc: 'Start day' },
  { day: 6, title: 'AI/ML Deep Study', start: '08:30', end: '10:30', dur: 120, cat: 'AI_ML', pri: 'HIGH', desc: 'New concept + revision' },
  { day: 6, title: 'Break', start: '10:30', end: '11:00', dur: 30, cat: 'PERSONAL', pri: 'LOW', desc: 'Reset' },
  { day: 6, title: 'Coding / Project', start: '11:00', end: '12:30', dur: 90, cat: 'AI_ML', pri: 'HIGH', desc: 'Build ML project' },
  { day: 6, title: 'Lunch', start: '12:30', end: '13:30', dur: 60, cat: 'PERSONAL', pri: 'MEDIUM', desc: 'Lunch' },
  { day: 6, title: 'Rest', start: '13:30', end: '14:30', dur: 60, cat: 'PERSONAL', pri: 'MEDIUM', desc: 'Recover' },
  { day: 6, title: 'Academic Revision', start: '14:30', end: '16:00', dur: 90, cat: 'ACADEMIC', pri: 'HIGH', desc: 'Rotate weakest subject' },
  { day: 6, title: 'Flexible Time', start: '16:00', end: '22:00', dur: 360, cat: 'PERSONAL', pri: 'MEDIUM', desc: 'Free time: hobbies, family' },
  { day: 6, title: 'Dinner', start: '22:00', end: '22:45', dur: 45, cat: 'PERSONAL', pri: 'LOW', desc: 'Dinner' },
  { day: 6, title: 'Movie', start: '22:45', end: '23:45', dur: 60, cat: 'PERSONAL', pri: 'MEDIUM', desc: 'One movie per week' },
  { day: 6, title: 'Relax + phone', start: '23:45', end: '00:30', dur: 45, cat: 'PERSONAL', pri: 'LOW', desc: 'Wind down' },
  { day: 6, title: 'Plan Sunday', start: '00:30', end: '01:00', dur: 30, cat: 'PERSONAL', pri: 'MEDIUM', desc: 'Set books ready' },
  { day: 6, title: 'Sleep', start: '01:00', end: '08:00', dur: 420, cat: 'SLEEP', pri: 'HIGH', desc: '7 hours sleep' },
];

const colors: { [key: string]: string } = {
  ACADEMIC: '#3b82f6', AI_ML: '#06b6d4', RESEARCH: '#8b5cf6',
  UNIVERSITY: '#f59e0b', PERSONAL: '#10b981', SLEEP: '#64748b',
};

export async function GET() {
  const userId = 'cmtszibhe0000uzf04p06d1fe';
  
  try {
    // Delete old schedule
    const del = await prisma.scheduleBlock.deleteMany({ where: { userId } });

    // Import new schedule
    let count = 0;
    for (const b of masterSchedule) {
      await prisma.scheduleBlock.create({
        data: {
          userId, title: b.title, description: b.desc, dayOfWeek: b.day,
          startTime: b.start, endTime: b.end, duration: b.dur,
          category: b.cat as any, priority: b.pri as any,
          type: 'FLEXIBLE', recurring: true, color: colors[b.cat] || '#06b6d4',
        },
      });
      count++;
    }

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const summary = days.map((d, i) => `${d}: ${masterSchedule.filter(b => b.day === i).length}`);

    return NextResponse.json({
      success: true,
      message: '✅ Complete Master Timetable imported from Excel!',
      deleted: del.count,
      imported: count,
      summary: summary.join(', '),
      next: 'Visit /api/force-sync to generate today\'s tasks',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
