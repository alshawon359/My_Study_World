const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tasks = await prisma.task.findMany({
    where: { userId: 'cmtszibhe0000uzf04p06d1fe' }
  });
  
  console.log('Total tasks:', tasks.length);
  console.log('\nTasks:');
  tasks.forEach(t => {
    console.log(`- ${t.title} | ${t.date.toISOString().split('T')[0]} | ${t.startTime}-${t.endTime}`);
  });
  
  const today = new Date().toISOString().split('T')[0];
  console.log('\nToday is:', today);
  
  const todayTasks = tasks.filter(t => t.date.toISOString().split('T')[0] === today);
  console.log('Today tasks:', todayTasks.length);
  
  await prisma.$disconnect();
}

main();
