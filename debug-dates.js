const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tasks = await prisma.task.findMany({
    where: { userId: 'cmtszibhe0000uzf04p06d1fe' }
  });
  
  console.log('Tasks in database:');
  tasks.forEach(t => {
    console.log(`${t.title}`);
    console.log(`  Date object: ${t.date}`);
    console.log(`  ISO: ${t.date.toISOString()}`);
    console.log(`  Local: ${t.date.toLocaleString()}`);
    console.log();
  });
  
  const testDate = '2026-09-08';
  console.log('Testing with date:', testDate);
  const targetDate = new Date(testDate);
  console.log('targetDate:', targetDate.toISOString());
  
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);
  console.log('startOfDay:', startOfDay.toISOString());
  
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);
  console.log('endOfDay:', endOfDay.toISOString());
  
  const filtered = await prisma.task.findMany({
    where: {
      userId: 'cmtszibhe0000uzf04p06d1fe',
      date: {
        gte: startOfDay,
        lt: endOfDay,
      }
    }
  });
  
  console.log('\nFiltered tasks:', filtered.length);
  
  await prisma.$disconnect();
}

main();
