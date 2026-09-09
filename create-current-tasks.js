const { PrismaClient, BlockCategory, TaskStatus, Priority } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const userId = 'cmtszibhe0000uzf04p06d1fe';
  
  // Clear old tasks
  await prisma.task.deleteMany({ where: { userId } });
  console.log('Old tasks cleared');
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Create tasks around current time (00:39 AM)
  const tasks = [
    { start: '00:00', end: '01:00', title: 'Night Study - Digital Signal Processing', category: BlockCategory.ACADEMIC, status: TaskStatus.IN_PROGRESS, priority: Priority.HIGH },
    { start: '01:00', end: '02:30', title: 'Machine Learning Project', category: BlockCategory.AI_ML, status: TaskStatus.PENDING, priority: Priority.HIGH },
    { start: '07:30', end: '09:00', title: 'Wake Up & Morning Routine', category: BlockCategory.PERSONAL, status: TaskStatus.PENDING, priority: Priority.MEDIUM },
    { start: '09:00', end: '12:30', title: 'University Classes', category: BlockCategory.ACADEMIC, status: TaskStatus.PENDING, priority: Priority.HIGH },
    { start: '16:00', end: '17:30', title: 'Digital Image Processing', category: BlockCategory.ACADEMIC, status: TaskStatus.PENDING, priority: Priority.HIGH },
    { start: '17:30', end: '19:00', title: 'AI/ML Study Session', category: BlockCategory.AI_ML, status: TaskStatus.PENDING, priority: Priority.HIGH },
    { start: '19:30', end: '21:00', title: 'Research Paper Reading', category: BlockCategory.ACADEMIC, status: TaskStatus.PENDING, priority: Priority.MEDIUM },
    { start: '21:00', end: '22:30', title: 'Coding Practice', category: BlockCategory.AI_ML, status: TaskStatus.PENDING, priority: Priority.MEDIUM },
  ];
  
  for (const task of tasks) {
    const [startH, startM] = task.start.split(':').map(Number);
    const [endH, endM] = task.end.split(':').map(Number);
    let duration = (endH * 60 + endM) - (startH * 60 + startM);
    if (duration < 0) duration += 24 * 60;
    
    await prisma.task.create({
      data: {
        userId,
        title: task.title,
        category: task.category,
        startTime: task.start,
        endTime: task.end,
        duration,
        date: today,
        status: task.status,
        priority: task.priority,
      },
    });
  }
  
  console.log('✅ Created', tasks.length, 'tasks for today');
  console.log('Current task: 00:00-01:00 Night Study (IN_PROGRESS)');
  
  await prisma.$disconnect();
}

main();
