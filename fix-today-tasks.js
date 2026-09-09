const { PrismaClient, TaskStatus } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const userId = 'cmtszibhe0000uzf04p06d1fe';
  
  // Get EXACT date string that API uses
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const dateString = `${year}-${month}-${day}`;
  
  console.log('Today Date String:', dateString);
  console.log('Day of Week:', now.getDay(), ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()]);
  
  // Create Date object from string (this avoids timezone issues)
  const todayDate = new Date(dateString + 'T00:00:00.000Z');
  console.log('Date Object (UTC):', todayDate.toISOString());
  
  // Delete all existing tasks
  await prisma.task.deleteMany({ where: { userId } });
  console.log('✓ Cleared old tasks\n');
  
  // Get schedule blocks
  const scheduleBlocks = await prisma.scheduleBlock.findMany({
    where: { userId, dayOfWeek: now.getDay() },
    orderBy: { startTime: 'asc' },
  });
  
  console.log(`Found ${scheduleBlocks.length} schedule blocks\n`);
  
  // Create tasks
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  for (const block of scheduleBlocks) {
    let status = TaskStatus.PENDING;
    if (block.endTime <= currentTime) {
      status = TaskStatus.COMPLETED;
    } else if (block.startTime <= currentTime && block.endTime > currentTime) {
      status = TaskStatus.IN_PROGRESS;
    }
    
    await prisma.task.create({
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
    
    console.log(`✓ ${block.startTime}-${block.endTime}: ${block.title} (${status})`);
  }
  
  console.log(`\n✅ Created ${scheduleBlocks.length} tasks!`);
  
  // Verify with API query
  const allTasks = await prisma.task.findMany({
    where: { userId },
  });
  
  const todayTasks = allTasks.filter(t => {
    const taskDateStr = t.date.toISOString().split('T')[0];
    return taskDateStr === dateString;
  });
  
  console.log('\nVerification:');
  console.log('- Total in DB:', allTasks.length);
  console.log('- Matching today date:', todayTasks.length);
  console.log('- Date matching:', dateString);
  
  await prisma.$disconnect();
}

main();
