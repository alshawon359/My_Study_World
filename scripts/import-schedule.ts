import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const userId = 'cmtszibhe0000uzf04p06d1fe';

// Master Timetable from Excel - Complete Week Schedule
const scheduleData = [
  // SUNDAY (0)
  { day: 0, title: 'Wake up + breakfast', startTime: '07:30', endTime: '08:00', duration: 30, category: 'PERSONAL', priority: 'LOW', description: 'Freshen up, breakfast' },
  { day: 0, title: 'Prepare + commute', startTime: '08:00', endTime: '08:40', duration: 40, category: 'PERSONAL', priority: 'LOW', description: 'Get ready and commute to class' },
  { day: 0, title: 'University class', startTime: '09:00', endTime: '16:00', duration: 420, category: 'UNIVERSITY', priority: 'HIGH', description: 'Attend all classes actively; mark unclear topics' },
  { day: 0, title: 'Home + GSL + rest', startTime: '16:00', endTime: '17:00', duration: 60, category: 'PERSONAL', priority: 'MEDIUM', description: 'GSL / shower / food / reset' },
  { day: 0, title: 'DIP Deep Study', startTime: '17:00', endTime: '18:30', duration: 90, category: 'ACADEMIC', priority: 'HIGH', description: "Today's lecture + concepts + examples" },
  { day: 0, title: 'Break', startTime: '18:30', endTime: '18:50', duration: 20, category: 'PERSONAL', priority: 'LOW', description: 'Walk / water / no scrolling' },
  { day: 0, title: 'Machine Learning', startTime: '18:50', endTime: '20:20', duration: 90, category: 'AI_ML', priority: 'HIGH', description: 'Theory + notes' },
  { day: 0, title: 'Dinner + phone', startTime: '20:20', endTime: '21:00', duration: 40, category: 'PERSONAL', priority: 'LOW', description: 'Dinner + controlled phone time' },
  { day: 0, title: 'Digital Communication', startTime: '21:00', endTime: '22:30', duration: 90, category: 'ACADEMIC', priority: 'HIGH', description: 'Problems, derivations, lecture revision' },
  { day: 0, title: 'Break', startTime: '22:30', endTime: '22:50', duration: 20, category: 'PERSONAL', priority: 'LOW', description: 'Reset' },
  { day: 0, title: 'AI/ML Coding', startTime: '22:50', endTime: '00:20', duration: 90, category: 'AI_ML', priority: 'HIGH', description: 'Python / NumPy / ML implementation' },
  { day: 0, title: 'Phone + relax', startTime: '00:20', endTime: '01:00', duration: 40, category: 'PERSONAL', priority: 'LOW', description: 'Light entertainment; prepare for bed' },
  { day: 0, title: 'Sleep', startTime: '01:00', endTime: '07:30', duration: 390, category: 'SLEEP', priority: 'HIGH', description: '6.5 hours sleep' },

  // MONDAY (1)
  { day: 1, title: 'Wake up + breakfast', startTime: '07:30', endTime: '08:00', duration: 30, category: 'PERSONAL', priority: 'LOW', description: 'Freshen up, breakfast' },
  { day: 1, title: 'Prepare + commute', startTime: '08:00', endTime: '08:40', duration: 40, category: 'PERSONAL', priority: 'LOW', description: 'Get ready and commute' },
  { day: 1, title: 'University class', startTime: '09:00', endTime: '16:00', duration: 420, category: 'UNIVERSITY', priority: 'HIGH', description: 'Attend actively; capture key formulas' },
  { day: 1, title: 'Home + GSL + rest', startTime: '16:00', endTime: '17:00', duration: 60, category: 'PERSONAL', priority: 'MEDIUM', description: 'GSL / shower / food / reset' },
  { day: 1, title: 'Telecommunication Engineering', startTime: '17:00', endTime: '18:30', duration: 90, category: 'ACADEMIC', priority: 'HIGH', description: 'Lecture revision + numerical/concepts' },
  { day: 1, title: 'Break', startTime: '18:30', endTime: '18:50', duration: 20, category: 'PERSONAL', priority: 'LOW', description: 'Walk / water' },
  { day: 1, title: 'Machine Learning', startTime: '18:50', endTime: '20:20', duration: 90, category: 'AI_ML', priority: 'HIGH', description: 'Algorithms + mathematical intuition' },
  { day: 1, title: 'Dinner + phone', startTime: '20:20', endTime: '21:00', duration: 40, category: 'PERSONAL', priority: 'LOW', description: 'Dinner + controlled phone' },
  { day: 1, title: 'DIP MATLAB / Problem Solving', startTime: '21:00', endTime: '22:30', duration: 90, category: 'ACADEMIC', priority: 'HIGH', description: 'Code from memory + practice' },
  { day: 1, title: 'Break', startTime: '22:30', endTime: '22:50', duration: 20, category: 'PERSONAL', priority: 'LOW', description: 'Reset' },
  { day: 1, title: 'Python / ML Coding', startTime: '22:50', endTime: '00:20', duration: 90, category: 'AI_ML', priority: 'HIGH', description: 'Implement what was learned' },
  { day: 1, title: 'Phone + relax', startTime: '00:20', endTime: '01:00', duration: 40, category: 'PERSONAL', priority: 'LOW', description: 'Wind down' },
  { day: 1, title: 'Sleep', startTime: '01:00', endTime: '07:30', duration: 390, category: 'SLEEP', priority: 'HIGH', description: '6.5 hours sleep' },

  // TUESDAY (2)
  { day: 2, title: 'Wake up + breakfast', startTime: '07:30', endTime: '08:00', duration: 30, category: 'PERSONAL', priority: 'LOW', description: 'Freshen up, breakfast' },
  { day: 2, title: 'Prepare + commute', startTime: '08:00', endTime: '08:40', duration: 40, category: 'PERSONAL', priority: 'LOW', description: 'Get ready and commute' },
  { day: 2, title: 'University class', startTime: '09:00', endTime: '16:00', duration: 420, category: 'UNIVERSITY', priority: 'HIGH', description: 'Attend actively' },
  { day: 2, title: 'Home + GSL + rest', startTime: '16:00', endTime: '17:00', duration: 60, category: 'PERSONAL', priority: 'MEDIUM', description: 'GSL / shower / food / reset' },
  { day: 2, title: 'Optical Fiber Communication', startTime: '17:00', endTime: '18:30', duration: 90, category: 'ACADEMIC', priority: 'HIGH', description: 'Lecture + formulas + concepts' },
  { day: 2, title: 'Break', startTime: '18:30', endTime: '19:00', duration: 30, category: 'PERSONAL', priority: 'LOW', description: 'Relax' },
  { day: 2, title: 'Machine Learning', startTime: '19:00', endTime: '20:30', duration: 90, category: 'AI_ML', priority: 'HIGH', description: 'Practice + recap' },
  { day: 2, title: 'Dinner + phone', startTime: '20:30', endTime: '21:15', duration: 45, category: 'PERSONAL', priority: 'LOW', description: 'Dinner + controlled phone' },
  { day: 2, title: 'Digital Communication', startTime: '21:15', endTime: '22:45', duration: 90, category: 'ACADEMIC', priority: 'HIGH', description: 'Problem solving' },
  { day: 2, title: 'Break', startTime: '22:45', endTime: '23:15', duration: 30, category: 'PERSONAL', priority: 'LOW', description: 'Reset' },
  { day: 2, title: 'Research Reading', startTime: '23:15', endTime: '00:15', duration: 60, category: 'RESEARCH', priority: 'HIGH', description: 'Read 1 relevant paper / make notes' },
  { day: 2, title: 'Phone + relax', startTime: '00:15', endTime: '01:00', duration: 45, category: 'PERSONAL', priority: 'LOW', description: 'Wind down' },
  { day: 2, title: 'Sleep', startTime: '01:00', endTime: '07:30', duration: 390, category: 'SLEEP', priority: 'HIGH', description: '6.5 hours sleep' },

  // WEDNESDAY (3)
  { day: 3, title: 'Wake up + breakfast', startTime: '07:30', endTime: '08:00', duration: 30, category: 'PERSONAL', priority: 'LOW', description: 'Freshen up, breakfast' },
  { day: 3, title: 'Prepare + commute', startTime: '08:00', endTime: '08:40', duration: 40, category: 'PERSONAL', priority: 'LOW', description: 'Get ready and commute' },
  { day: 3, title: 'University class', startTime: '09:00', endTime: '13:00', duration: 240, category: 'UNIVERSITY', priority: 'HIGH', description: 'Attend actively; note questions' },
  { day: 3, title: 'Home + lunch + GSL', startTime: '13:00', endTime: '14:00', duration: 60, category: 'PERSONAL', priority: 'MEDIUM', description: 'Return, GSL, lunch' },
  { day: 3, title: 'Power nap / rest', startTime: '14:00', endTime: '15:00', duration: 60, category: 'PERSONAL', priority: 'MEDIUM', description: 'No phone' },
  { day: 3, title: 'DIP', startTime: '15:00', endTime: '16:30', duration: 90, category: 'ACADEMIC', priority: 'HIGH', description: 'Core concepts + problems' },
  { day: 3, title: 'Break', startTime: '16:30', endTime: '16:50', duration: 20, category: 'PERSONAL', priority: 'LOW', description: 'Walk / water' },
  { day: 3, title: 'Machine Learning', startTime: '16:50', endTime: '18:20', duration: 90, category: 'AI_ML', priority: 'HIGH', description: 'Theory + notebook' },
  { day: 3, title: 'Rest + phone', startTime: '18:20', endTime: '19:00', duration: 40, category: 'PERSONAL', priority: 'LOW', description: 'Controlled phone' },
  { day: 3, title: 'Telecommunication Engineering', startTime: '19:00', endTime: '20:30', duration: 90, category: 'ACADEMIC', priority: 'HIGH', description: 'Revision + problem solving' },
  { day: 3, title: 'Dinner', startTime: '20:30', endTime: '21:15', duration: 45, category: 'PERSONAL', priority: 'LOW', description: 'Dinner + reset' },
  { day: 3, title: 'AI + Antenna Research', startTime: '21:15', endTime: '22:45', duration: 90, category: 'RESEARCH', priority: 'HIGH', description: 'Paper / problem / methodology notes' },
  { day: 3, title: 'Break', startTime: '22:45', endTime: '23:05', duration: 20, category: 'PERSONAL', priority: 'LOW', description: 'Reset' },
  { day: 3, title: 'AI Coding', startTime: '23:05', endTime: '00:35', duration: 90, category: 'AI_ML', priority: 'HIGH', description: 'Python / ML implementation' },
  { day: 3, title: 'Phone + relax', startTime: '00:35', endTime: '01:00', duration: 25, category: 'PERSONAL', priority: 'LOW', description: 'Wind down' },
  { day: 3, title: 'Sleep', startTime: '01:00', endTime: '07:30', duration: 390, category: 'SLEEP', priority: 'HIGH', description: '6.5 hours sleep' },

  // THURSDAY (4)
  { day: 4, title: 'Wake up + breakfast', startTime: '07:30', endTime: '08:00', duration: 30, category: 'PERSONAL', priority: 'LOW', description: 'Freshen up, breakfast' },
  { day: 4, title: 'Prepare + commute', startTime: '08:00', endTime: '08:40', duration: 40, category: 'PERSONAL', priority: 'LOW', description: 'Get ready and commute' },
  { day: 4, title: 'University class', startTime: '09:00', endTime: '13:00', duration: 240, category: 'UNIVERSITY', priority: 'HIGH', description: 'Attend actively' },
  { day: 4, title: 'Home + lunch + GSL', startTime: '13:00', endTime: '14:00', duration: 60, category: 'PERSONAL', priority: 'MEDIUM', description: 'Return, GSL, lunch' },
  { day: 4, title: 'Rest', startTime: '14:00', endTime: '15:00', duration: 60, category: 'PERSONAL', priority: 'MEDIUM', description: 'Recover before social time' },
  { day: 4, title: 'Weekly light review', startTime: '15:00', endTime: '16:00', duration: 60, category: 'ACADEMIC', priority: 'MEDIUM', description: 'Review difficult points only' },
  { day: 4, title: 'Friends / Adda', startTime: '16:00', endTime: '22:00', duration: 360, category: 'PERSONAL', priority: 'HIGH', description: 'Full social time — no study guilt' },
  { day: 4, title: 'Dinner', startTime: '22:00', endTime: '22:45', duration: 45, category: 'PERSONAL', priority: 'LOW', description: 'Dinner + return home' },
  { day: 4, title: 'Machine Learning', startTime: '22:45', endTime: '23:45', duration: 60, category: 'AI_ML', priority: 'MEDIUM', description: 'Light recap / video / notes' },
  { day: 4, title: 'Break', startTime: '23:45', endTime: '00:05', duration: 20, category: 'PERSONAL', priority: 'LOW', description: 'Reset' },
  { day: 4, title: 'Research notes', startTime: '00:05', endTime: '01:00', duration: 55, category: 'RESEARCH', priority: 'MEDIUM', description: 'Organize ideas, paper notes, next step' },
  { day: 4, title: 'Sleep', startTime: '01:00', endTime: '07:30', duration: 390, category: 'SLEEP', priority: 'HIGH', description: '6.5 hours sleep' },

  // FRIDAY (5)
  { day: 5, title: 'Wake up + breakfast', startTime: '08:00', endTime: '08:30', duration: 30, category: 'PERSONAL', priority: 'LOW', description: 'Start relaxed' },
  { day: 5, title: 'Machine Learning Deep Study', startTime: '08:30', endTime: '10:30', duration: 120, category: 'AI_ML', priority: 'HIGH', description: 'New concept + handwritten notes' },
  { day: 5, title: 'Break', startTime: '10:30', endTime: '10:50', duration: 20, category: 'PERSONAL', priority: 'LOW', description: 'Reset' },
  { day: 5, title: 'ML Coding', startTime: '10:50', endTime: '12:20', duration: 90, category: 'AI_ML', priority: 'HIGH', description: 'Implement algorithms' },
  { day: 5, title: 'Lunch + rest', startTime: '12:20', endTime: '13:20', duration: 60, category: 'PERSONAL', priority: 'MEDIUM', description: 'Food + recovery' },
  { day: 5, title: 'AI-integrated Antenna Research', startTime: '13:20', endTime: '15:20', duration: 120, category: 'RESEARCH', priority: 'HIGH', description: 'Literature + simulation/model idea' },
  { day: 5, title: 'Break', startTime: '15:20', endTime: '15:50', duration: 30, category: 'PERSONAL', priority: 'LOW', description: 'Reset' },
  { day: 5, title: 'DIP', startTime: '15:50', endTime: '17:20', duration: 90, category: 'ACADEMIC', priority: 'HIGH', description: 'Weekly deep practice' },
  { day: 5, title: 'Rest + phone', startTime: '17:20', endTime: '18:00', duration: 40, category: 'PERSONAL', priority: 'LOW', description: 'Controlled phone' },
  { day: 5, title: 'Digital Communication', startTime: '18:00', endTime: '19:30', duration: 90, category: 'ACADEMIC', priority: 'HIGH', description: 'Weekly problem set' },
  { day: 5, title: 'Dinner', startTime: '19:30', endTime: '20:15', duration: 45, category: 'PERSONAL', priority: 'LOW', description: 'Dinner' },
  { day: 5, title: 'Deep Learning / AI', startTime: '20:15', endTime: '21:45', duration: 90, category: 'AI_ML', priority: 'HIGH', description: 'Neural networks / next topic' },
  { day: 5, title: 'Break', startTime: '21:45', endTime: '22:15', duration: 30, category: 'PERSONAL', priority: 'LOW', description: 'Reset' },
  { day: 5, title: 'Research / Simulation', startTime: '22:15', endTime: '23:45', duration: 90, category: 'RESEARCH', priority: 'HIGH', description: 'Antenna-related coding / experiment' },
  { day: 5, title: 'Phone + relax', startTime: '23:45', endTime: '00:30', duration: 45, category: 'PERSONAL', priority: 'LOW', description: 'Wind down' },
  { day: 5, title: 'Weekly planning', startTime: '00:30', endTime: '01:00', duration: 30, category: 'PERSONAL', priority: 'MEDIUM', description: 'Update trackers + next week goals' },
  { day: 5, title: 'Sleep', startTime: '01:00', endTime: '08:00', duration: 420, category: 'SLEEP', priority: 'HIGH', description: '7 hours sleep' },

  // SATURDAY (6)
  { day: 6, title: 'Wake up + breakfast', startTime: '08:00', endTime: '08:30', duration: 30, category: 'PERSONAL', priority: 'LOW', description: 'Start day' },
  { day: 6, title: 'AI/ML Deep Study', startTime: '08:30', endTime: '10:30', duration: 120, category: 'AI_ML', priority: 'HIGH', description: 'New concept + revision' },
  { day: 6, title: 'Break', startTime: '10:30', endTime: '11:00', duration: 30, category: 'PERSONAL', priority: 'LOW', description: 'Reset' },
  { day: 6, title: 'Coding / Project', startTime: '11:00', endTime: '12:30', duration: 90, category: 'AI_ML', priority: 'HIGH', description: 'Build something small with ML' },
  { day: 6, title: 'Lunch', startTime: '12:30', endTime: '13:30', duration: 60, category: 'PERSONAL', priority: 'MEDIUM', description: 'Lunch' },
  { day: 6, title: 'Rest', startTime: '13:30', endTime: '14:30', duration: 60, category: 'PERSONAL', priority: 'MEDIUM', description: 'Recover' },
  { day: 6, title: 'Weekly Academic Revision', startTime: '14:30', endTime: '16:00', duration: 90, category: 'ACADEMIC', priority: 'HIGH', description: 'Rotate weakest subject; this week start with OFC/Satellite' },
  { day: 6, title: 'Personal / Flexible Time', startTime: '16:00', endTime: '22:00', duration: 360, category: 'PERSONAL', priority: 'MEDIUM', description: 'Free time: hobbies, family, walk, light outing' },
  { day: 6, title: 'Dinner', startTime: '22:00', endTime: '22:45', duration: 45, category: 'PERSONAL', priority: 'LOW', description: 'Dinner' },
  { day: 6, title: 'Movie', startTime: '22:45', endTime: '23:45', duration: 60, category: 'PERSONAL', priority: 'MEDIUM', description: 'One movie per week' },
  { day: 6, title: 'Relax + phone', startTime: '23:45', endTime: '00:30', duration: 45, category: 'PERSONAL', priority: 'LOW', description: 'Wind down' },
  { day: 6, title: 'Plan Sunday', startTime: '00:30', endTime: '01:00', duration: 30, category: 'PERSONAL', priority: 'MEDIUM', description: 'Set books/notebooks ready' },
  { day: 6, title: 'Sleep', startTime: '01:00', endTime: '08:00', duration: 420, category: 'SLEEP', priority: 'HIGH', description: '7 hours sleep' },
];

const categoryColorMap: { [key: string]: string } = {
  'ACADEMIC': '#3b82f6',
  'AI_ML': '#06b6d4',
  'RESEARCH': '#8b5cf6',
  'UNIVERSITY': '#f59e0b',
  'PERSONAL': '#10b981',
  'SLEEP': '#64748b',
};

async function importSchedule() {
  console.log('🚀 Starting schedule import...\n');

  try {
    // Delete existing schedule blocks for this user
    console.log('🗑️ Deleting existing schedule blocks...');
    const deleted = await prisma.scheduleBlock.deleteMany({
      where: { userId },
    });
    console.log(`✅ Deleted ${deleted.count} existing blocks\n`);

    // Import new schedule
    let imported = 0;
    for (const block of scheduleData) {
      try {
        await prisma.scheduleBlock.create({
          data: {
            userId,
            title: block.title,
            description: block.description,
            dayOfWeek: block.day,
            startTime: block.startTime,
            endTime: block.endTime,
            duration: block.duration,
            category: block.category as any,
            priority: block.priority as any,
            type: 'FLEXIBLE',
            recurring: true,
            color: categoryColorMap[block.category] || '#06b6d4',
          },
        });
        imported++;
      } catch (error: any) {
        console.error(`❌ Error importing ${block.title}:`, error.message);
      }
    }

    console.log(`\n✅ Successfully imported ${imported}/${scheduleData.length} schedule blocks!`);
    
    // Show summary by day
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    console.log('\n📊 Summary by day:');
    for (let i = 0; i < 7; i++) {
      const dayBlocks = scheduleData.filter(b => b.day === i);
      console.log(`  ${days[i]}: ${dayBlocks.length} blocks`);
    }

  } catch (error) {
    console.error('❌ Fatal error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
importSchedule();
