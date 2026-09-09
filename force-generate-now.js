const { PrismaClient, TaskStatus } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const userId = 'cmtszibhe0000uzf04p06d1fe';
  const today = new Date();
  const dayOfWeek = today.getDay();
  
  console.log('Current Date:', today.toLocaleString());
  console.log('ISO Date:', today.toISOString());
  console.log('Day of Week:', dayOfWeek, ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek]);
  
  // Delete ALL tasks first
  const deleted = await prisma.task.deleteMany({
    where: { userId }
  });
  console.log('\n✓ Deleted', deleted.count, 'old tasks');
  
  // Get schedule blocks
  const scheduleBlocks = await prisma.scheduleBlock.findMany({
    where: { userId, dayOfWeek },
    orderBy: { startTime: 'asc' },
  });
  
  console.log('✓ Found', scheduleBlocks.length, 'schedule blocks for', ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek]);
  
  // Create today - exactly as the API expects it
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  
  console.log('\nCreating tasks with date:', todayDate.toISOString());
  
  let created = 0;
  for (const block of scheduleBlocks) {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    let status = TaskStatus.PENDING;
    if (block.endTime <= currentTime) {
      status = TaskStatus.COMPLETED;
    } else if (block.startTime <= currentTime && block.endTime > currentTime) {
      status = TaskStatus.IN_PROGRESS;
    }
    
    const task = await prisma.task.create({
      data: {
        userId,
        title: block.title,
        description: block.description,
        category: block.category,
        startTime: block.startTime,
        endTime: block.endTime,
        duration: block.duration,
        date: todayDate,
        status,
        priority: block.priority,
        scheduleBlockId: block.id,
      },
    });
    
    console.log(`  ${created + 1}. Created: ${task.startTime}-${task.endTime} ${task.title}`);
    console.log(`     DB Date: ${task.date.toISOString()}`);
    created++;
  }
  
  console.log('\n✅ Created', created, 'tasks for today!');
  
  // Verify
  const allTasks = await prisma.task.findMany({
    where: { userId },
    orderBy: { startTime: 'asc' }
  });
  
  console.log('\nVerification - Total tasks in DB:', allTasks.length);
  
  const todayStr = today.toISOString().split('T')[0];
  const todayTasks = allTasks.filter(t => t.date.toISOString().split('T')[0] === todayStr);
  console.log('Tasks for today:', todayTasks.length);
  
  await prisma.$disconnect();
}

main();
