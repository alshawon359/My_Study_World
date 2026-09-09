const { PrismaClient, BlockCategory, Priority, TaskStatus, BlockType } = require('@prisma/client');
const prisma = new PrismaClient();

// Map Excel categories to our enum
const categoryMap = {
  'Life': BlockCategory.PERSONAL,
  'Class': BlockCategory.UNIVERSITY,
  'Rest': BlockCategory.PERSONAL,
  'Academic': BlockCategory.ACADEMIC,
  'AI/ML': BlockCategory.AI_ML,
  'Research': BlockCategory.RESEARCH,
  'Sleep': BlockCategory.SLEEP,
  'Social': BlockCategory.PERSONAL,
  'Entertainment': BlockCategory.PERSONAL,
  'Planning': BlockCategory.PERSONAL,
  'Personal': BlockCategory.PERSONAL,
};

const priorityMap = {
  'High': Priority.HIGH,
  'Medium': Priority.MEDIUM,
  'Low': Priority.LOW,
  'Normal': Priority.MEDIUM,
};

// Master Timetable from Excel
const masterSchedule = [
  // SUNDAY (0)
  { day: 0, time: '7:30–8:00', title: 'Wake up + breakfast', desc: 'Freshen up, breakfast', category: 'Life', priority: 'Low' },
  { day: 0, time: '8:00–8:40', title: 'Prepare + commute', desc: 'Get ready and commute to class', category: 'Life', priority: 'Low' },
  { day: 0, time: '9:00–16:00', title: 'University class', desc: 'Attend all classes actively; mark unclear topics', category: 'Class', priority: 'High' },
  { day: 0, time: '16:00–17:00', title: 'Home + GSL + rest', desc: 'GSL / shower / food / reset', category: 'Rest', priority: 'Medium' },
  { day: 0, time: '17:00–18:30', title: 'DIP Deep Study', desc: "Today's lecture + concepts + examples", category: 'Academic', priority: 'High', subject: 'DIP' },
  { day: 0, time: '18:30–18:50', title: 'Break', desc: 'Walk / water / no scrolling', category: 'Rest', priority: 'Low' },
  { day: 0, time: '18:50–20:20', title: 'Machine Learning', desc: 'Theory + notes', category: 'AI/ML', priority: 'High' },
  { day: 0, time: '20:20–21:00', title: 'Dinner + phone', desc: 'Dinner + controlled phone time', category: 'Rest', priority: 'Low' },
  { day: 0, time: '21:00–22:30', title: 'Digital Communication', desc: 'Problems, derivations, lecture revision', category: 'Academic', priority: 'High', subject: 'DC' },
  { day: 0, time: '22:30–22:50', title: 'Break', desc: 'Reset', category: 'Rest', priority: 'Low' },
  { day: 0, time: '22:50–00:20', title: 'AI/ML Coding', desc: 'Python / NumPy / ML implementation', category: 'AI/ML', priority: 'High' },
  { day: 0, time: '00:20–01:00', title: 'Phone + relax', desc: 'Light entertainment; prepare for bed', category: 'Rest', priority: 'Low' },
  { day: 0, time: '01:00–07:30', title: 'Sleep', desc: '6.5 hours sleep', category: 'Sleep', priority: 'High' },

  // MONDAY (1)
  { day: 1, time: '7:30–8:00', title: 'Wake up + breakfast', desc: 'Freshen up, breakfast', category: 'Life', priority: 'Low' },
  { day: 1, time: '8:00–8:40', title: 'Prepare + commute', desc: 'Get ready and commute', category: 'Life', priority: 'Low' },
  { day: 1, time: '9:00–16:00', title: 'University class', desc: 'Attend actively; capture key formulas', category: 'Class', priority: 'High' },
  { day: 1, time: '16:00–17:00', title: 'Home + GSL + rest', desc: 'GSL / shower / food / reset', category: 'Rest', priority: 'Medium' },
  { day: 1, time: '17:00–18:30', title: 'Telecommunication Engineering', desc: 'Lecture revision + numerical/concepts', category: 'Academic', priority: 'High', subject: 'TE' },
  { day: 1, time: '18:30–18:50', title: 'Break', desc: 'Walk / water', category: 'Rest', priority: 'Low' },
  { day: 1, time: '18:50–20:20', title: 'Machine Learning', desc: 'Algorithms + mathematical intuition', category: 'AI/ML', priority: 'High' },
  { day: 1, time: '20:20–21:00', title: 'Dinner + phone', desc: 'Dinner + controlled phone', category: 'Rest', priority: 'Low' },
  { day: 1, time: '21:00–22:30', title: 'DIP MATLAB / Problem Solving', desc: 'Code from memory + practice', category: 'Academic', priority: 'High', subject: 'DIP' },
  { day: 1, time: '22:30–22:50', title: 'Break', desc: 'Reset', category: 'Rest', priority: 'Low' },
  { day: 1, time: '22:50–00:20', title: 'Python / ML Coding', desc: 'Implement what was learned', category: 'AI/ML', priority: 'High' },
  { day: 1, time: '00:20–01:00', title: 'Phone + relax', desc: 'Wind down', category: 'Rest', priority: 'Low' },
  { day: 1, time: '01:00–07:30', title: 'Sleep', desc: '6.5 hours sleep', category: 'Sleep', priority: 'High' },

  // TUESDAY (2)
  { day: 2, time: '7:30–8:00', title: 'Wake up + breakfast', desc: 'Freshen up, breakfast', category: 'Life', priority: 'Low' },
  { day: 2, time: '8:00–8:40', title: 'Prepare + commute', desc: 'Get ready and commute', category: 'Life', priority: 'Low' },
  { day: 2, time: '9:00–16:00', title: 'University class', desc: 'Attend actively', category: 'Class', priority: 'High' },
  { day: 2, time: '16:00–17:00', title: 'Home + GSL + rest', desc: 'GSL / shower / food / reset', category: 'Rest', priority: 'Medium' },
  { day: 2, time: '17:00–18:30', title: 'Optical Fiber Communication', desc: 'Lecture + formulas + concepts', category: 'Academic', priority: 'High', subject: 'OFC' },
  { day: 2, time: '18:30–19:00', title: 'Break', desc: 'Relax', category: 'Rest', priority: 'Low' },
  { day: 2, time: '19:00–20:30', title: 'Machine Learning', desc: 'Practice + recap', category: 'AI/ML', priority: 'High' },
  { day: 2, time: '20:30–21:15', title: 'Dinner + phone', desc: 'Dinner + controlled phone', category: 'Rest', priority: 'Low' },
  { day: 2, time: '21:15–22:45', title: 'Digital Communication', desc: 'Problem solving', category: 'Academic', priority: 'High', subject: 'DC' },
  { day: 2, time: '22:45–23:15', title: 'Break', desc: 'Reset', category: 'Rest', priority: 'Low' },
  { day: 2, time: '23:15–00:15', title: 'Research Reading', desc: 'Read 1 relevant paper / make notes', category: 'Research', priority: 'High' },
  { day: 2, time: '00:15–01:00', title: 'Phone + relax', desc: 'Wind down', category: 'Rest', priority: 'Low' },
  { day: 2, time: '01:00–07:30', title: 'Sleep', desc: '6.5 hours sleep', category: 'Sleep', priority: 'High' },

  // WEDNESDAY (3)
  { day: 3, time: '7:30–8:00', title: 'Wake up + breakfast', desc: 'Freshen up, breakfast', category: 'Life', priority: 'Low' },
  { day: 3, time: '8:00–8:40', title: 'Prepare + commute', desc: 'Get ready and commute', category: 'Life', priority: 'Low' },
  { day: 3, time: '9:00–13:00', title: 'University class', desc: 'Attend actively; note questions', category: 'Class', priority: 'High' },
  { day: 3, time: '13:00–14:00', title: 'Home + lunch + GSL', desc: 'Return, GSL, lunch', category: 'Rest', priority: 'Medium' },
  { day: 3, time: '14:00–15:00', title: 'Power nap / rest', desc: 'No phone', category: 'Rest', priority: 'Medium' },
  { day: 3, time: '15:00–16:30', title: 'DIP', desc: 'Core concepts + problems', category: 'Academic', priority: 'High', subject: 'DIP' },
  { day: 3, time: '16:30–16:50', title: 'Break', desc: 'Walk / water', category: 'Rest', priority: 'Low' },
  { day: 3, time: '16:50–18:20', title: 'Machine Learning', desc: 'Theory + notebook', category: 'AI/ML', priority: 'High' },
  { day: 3, time: '18:20–19:00', title: 'Rest + phone', desc: 'Controlled phone', category: 'Rest', priority: 'Low' },
  { day: 3, time: '19:00–20:30', title: 'Telecommunication Engineering', desc: 'Revision + problem solving', category: 'Academic', priority: 'High', subject: 'TE' },
  { day: 3, time: '20:30–21:15', title: 'Dinner', desc: 'Dinner + reset', category: 'Rest', priority: 'Low' },
  { day: 3, time: '21:15–22:45', title: 'AI + Antenna Research', desc: 'Paper / problem / methodology notes', category: 'Research', priority: 'High' },
  { day: 3, time: '22:45–23:05', title: 'Break', desc: 'Reset', category: 'Rest', priority: 'Low' },
  { day: 3, time: '23:05–00:35', title: 'AI Coding', desc: 'Python / ML implementation', category: 'AI/ML', priority: 'High' },
  { day: 3, time: '00:35–01:00', title: 'Phone + relax', desc: 'Wind down', category: 'Rest', priority: 'Low' },
  { day: 3, time: '01:00–07:30', title: 'Sleep', desc: '6.5 hours sleep', category: 'Sleep', priority: 'High' },

  // THURSDAY (4)
  { day: 4, time: '7:30–8:00', title: 'Wake up + breakfast', desc: 'Freshen up, breakfast', category: 'Life', priority: 'Low' },
  { day: 4, time: '8:00–8:40', title: 'Prepare + commute', desc: 'Get ready and commute', category: 'Life', priority: 'Low' },
  { day: 4, time: '9:00–13:00', title: 'University class', desc: 'Attend actively', category: 'Class', priority: 'High' },
  { day: 4, time: '13:00–14:00', title: 'Home + lunch + GSL', desc: 'Return, GSL, lunch', category: 'Rest', priority: 'Medium' },
  { day: 4, time: '14:00–15:00', title: 'Rest', desc: 'Recover before social time', category: 'Rest', priority: 'Medium' },
  { day: 4, time: '15:00–16:00', title: 'Weekly light review', desc: 'Review difficult points only', category: 'Academic', priority: 'Medium' },
  { day: 4, time: '16:00–22:00', title: 'Friends / Adda', desc: 'Full social time — no study guilt', category: 'Social', priority: 'High' },
  { day: 4, time: '22:00–22:45', title: 'Dinner', desc: 'Dinner + return home', category: 'Rest', priority: 'Low' },
  { day: 4, time: '22:45–23:45', title: 'Machine Learning', desc: 'Light recap / video / notes', category: 'AI/ML', priority: 'Medium' },
  { day: 4, time: '23:45–00:05', title: 'Break', desc: 'Reset', category: 'Rest', priority: 'Low' },
  { day: 4, time: '00:05–01:00', title: 'Research notes', desc: 'Organize ideas, paper notes, next step', category: 'Research', priority: 'Medium' },
  { day: 4, time: '01:00–07:30', title: 'Sleep', desc: '6.5 hours sleep', category: 'Sleep', priority: 'High' },

  // FRIDAY (5)
  { day: 5, time: '8:00–8:30', title: 'Wake up + breakfast', desc: 'Start relaxed', category: 'Life', priority: 'Low' },
  { day: 5, time: '8:30–10:30', title: 'Machine Learning Deep Study', desc: 'New concept + handwritten notes', category: 'AI/ML', priority: 'High' },
  { day: 5, time: '10:30–10:50', title: 'Break', desc: 'Reset', category: 'Rest', priority: 'Low' },
  { day: 5, time: '10:50–12:20', title: 'ML Coding', desc: 'Implement algorithms', category: 'AI/ML', priority: 'High' },
  { day: 5, time: '12:20–13:20', title: 'Lunch + rest', desc: 'Food + recovery', category: 'Rest', priority: 'Medium' },
  { day: 5, time: '13:20–15:20', title: 'AI-integrated Antenna Research', desc: 'Literature + simulation/model idea', category: 'Research', priority: 'High' },
  { day: 5, time: '15:20–15:50', title: 'Break', desc: 'Reset', category: 'Rest', priority: 'Low' },
  { day: 5, time: '15:50–17:20', title: 'DIP', desc: 'Weekly deep practice', category: 'Academic', priority: 'High', subject: 'DIP' },
  { day: 5, time: '17:20–18:00', title: 'Rest + phone', desc: 'Controlled phone', category: 'Rest', priority: 'Low' },
  { day: 5, time: '18:00–19:30', title: 'Digital Communication', desc: 'Weekly problem set', category: 'Academic', priority: 'High', subject: 'DC' },
  { day: 5, time: '19:30–20:15', title: 'Dinner', desc: 'Dinner', category: 'Rest', priority: 'Low' },
  { day: 5, time: '20:15–21:45', title: 'Deep Learning / AI', desc: 'Neural networks / next topic', category: 'AI/ML', priority: 'High' },
  { day: 5, time: '21:45–22:15', title: 'Break', desc: 'Reset', category: 'Rest', priority: 'Low' },
  { day: 5, time: '22:15–23:45', title: 'Research / Simulation', desc: 'Antenna-related coding / experiment', category: 'Research', priority: 'High' },
  { day: 5, time: '23:45–00:30', title: 'Phone + relax', desc: 'Wind down', category: 'Rest', priority: 'Low' },
  { day: 5, time: '00:30–01:00', title: 'Weekly planning', desc: 'Update trackers + next week goals', category: 'Planning', priority: 'Medium' },
  { day: 5, time: '01:00–07:30', title: 'Sleep', desc: '6.5 hours sleep', category: 'Sleep', priority: 'High' },

  // SATURDAY (6)
  { day: 6, time: '8:00–8:30', title: 'Wake up + breakfast', desc: 'Start day', category: 'Life', priority: 'Low' },
  { day: 6, time: '8:30–10:30', title: 'AI/ML Deep Study', desc: 'New concept + revision', category: 'AI/ML', priority: 'High' },
  { day: 6, time: '10:30–11:00', title: 'Break', desc: 'Reset', category: 'Rest', priority: 'Low' },
  { day: 6, time: '11:00–12:30', title: 'Coding / Project', desc: 'Build something small with ML', category: 'AI/ML', priority: 'High' },
  { day: 6, time: '12:30–13:30', title: 'Lunch', desc: 'Lunch', category: 'Rest', priority: 'Medium' },
  { day: 6, time: '13:30–14:30', title: 'Rest', desc: 'Recover', category: 'Rest', priority: 'Medium' },
  { day: 6, time: '14:30–16:00', title: 'Weekly Academic Revision', desc: 'Rotate weakest subject; this week start with OFC/Satellite', category: 'Academic', priority: 'High' },
  { day: 6, time: '16:00–22:00', title: 'Personal / Flexible Time', desc: 'Free time: hobbies, family, walk, light outing', category: 'Personal', priority: 'Medium' },
  { day: 6, time: '22:00–22:45', title: 'Dinner', desc: 'Dinner', category: 'Rest', priority: 'Low' },
  { day: 6, time: '22:45–23:45', title: 'Movie', desc: 'One movie per week', category: 'Entertainment', priority: 'Medium' },
  { day: 6, time: '23:45–00:30', title: 'Relax + phone', desc: 'Wind down', category: 'Rest', priority: 'Low' },
  { day: 6, time: '00:30–01:00', title: 'Plan Sunday', desc: 'Set books/notebooks ready', category: 'Planning', priority: 'Medium' },
  { day: 6, time: '01:00–07:30', title: 'Sleep', desc: '6.5 hours sleep', category: 'Sleep', priority: 'High' },
];

function parseTime(timeStr) {
  // Handle both "7:30" and "07:30" formats
  let [hour, min] = timeStr.split(':').map(s => parseInt(s.trim()));
  return `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
}

function calculateDuration(startTime, endTime) {
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  let duration = (endH * 60 + endM) - (startH * 60 + startM);
  if (duration < 0) duration += 24 * 60; // Handle overnight
  return duration;
}

async function main() {
  console.log('🌱 Importing Master Timetable from Excel...\n');

  const userId = 'cmtszibhe0000uzf04p06d1fe';

  // Clear existing schedule blocks
  await prisma.scheduleBlock.deleteMany({ where: { userId } });
  console.log('✓ Cleared old schedule blocks\n');

  let imported = 0;
  
  for (const block of masterSchedule) {
    const [startStr, endStr] = block.time.split('–').map(s => s.trim());
    const startTime = parseTime(startStr);
    const endTime = parseTime(endStr);
    const duration = calculateDuration(startTime, endTime);
    
    const category = categoryMap[block.category] || BlockCategory.PERSONAL;
    const priority = priorityMap[block.priority] || Priority.MEDIUM;
    
    // Determine block type
    const type = ['Sleep', 'Class', 'Life'].includes(block.category) 
      ? BlockType.FIXED 
      : BlockType.FLEXIBLE;

    // Color based on category
    const colorMap = {
      [BlockCategory.ACADEMIC]: '#3b82f6',
      [BlockCategory.AI_ML]: '#06b6d4',
      [BlockCategory.RESEARCH]: '#8b5cf6',
      [BlockCategory.UNIVERSITY]: '#f59e0b',
      [BlockCategory.SLEEP]: '#64748b',
      [BlockCategory.PERSONAL]: '#10b981',
    };

    await prisma.scheduleBlock.create({
      data: {
        userId,
        title: block.title,
        description: block.desc,
        category,
        type,
        dayOfWeek: block.day,
        startTime,
        endTime,
        duration,
        subject: block.subject || null,
        priority,
        color: colorMap[category],
        taskObjective: block.desc,
        recurring: true,
      },
    });
    
    imported++;
  }

  console.log(`✅ Imported ${imported} schedule blocks!\n`);
  console.log('📅 Schedule Overview:');
  console.log('  Sunday:    13 blocks');
  console.log('  Monday:    13 blocks');
  console.log('  Tuesday:   13 blocks');
  console.log('  Wednesday: 16 blocks');
  console.log('  Thursday:  12 blocks');
  console.log('  Friday:    16 blocks');
  console.log('  Saturday:  13 blocks');
  console.log('\n🎯 Total: ' + imported + ' blocks for complete week!');

  await prisma.$disconnect();
}

main();
