const { PrismaClient, TaskStatus } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const userId = 'cmtszibhe0000uzf04p06d1fe';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayOfWeek = today.getDay();
  
  console.log(`🌱 Generating tasks for ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek]}...\n`);

  // Clear today's tasks
  await prisma.task.deleteMany({
    where: {
      userId,
      date: {
        gte: today,
        lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      }
    }
  });
  
  // Get today's schedule blocks
  const scheduleBlocks = await prisma.scheduleBlock.findMany({
    where: {
      userId,
      dayOfWeek,
    },
    orderBy: { startTime: 'asc' },
  });
  
  console.log(`Found ${scheduleBlocks.length} schedule blocks for today\n`);
  
  // Create tasks from schedule blocks
  let created = 0;
  for (const block of scheduleBlocks) {
    // Determine initial status based on current time
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    let status = TaskStatus.PENDING;
    if (block.endTime <= currentTime) {
      status = TaskStatus.COMPLETED; // Past blocks
    } else if (block.startTime <= currentTime && block.endTime > currentTime) {
      status = TaskStatus.IN_PROGRESS; // Current block
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
        date: today,
        status,
        priority: block.priority,
        scheduleBlockId: block.id,
      },
    });
    created++;
  }
  
  console.log(`✅ Created ${created} tasks for today!\n`);
  console.log('📋 Tasks are now available on the dashboard');
  
  await prisma.$disconnect();
}

main();
