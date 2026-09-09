const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const userId = 'cmtszibhe0000uzf04p06d1fe';
  
  const today = new Date();
  console.log('Today:', today.toLocaleString());
  console.log('Day of week:', today.getDay());
  console.log('Date string:', today.toISOString().split('T')[0]);
  
  const tasks = await prisma.task.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
  });
  
  console.log('\nAll tasks in database:');
  tasks.forEach(t => {
    console.log(`- ${t.title}: ${t.date.toISOString().split('T')[0]} (${t.startTime}-${t.endTime})`);
  });
  
  const todayStr = today.toISOString().split('T')[0];
  const todayTasks = tasks.filter(t => t.date.toISOString().split('T')[0] === todayStr);
  
  console.log(`\nTasks for today (${todayStr}): ${todayTasks.length}`);
  todayTasks.forEach(t => {
    console.log(`- ${t.startTime}-${t.endTime}: ${t.title} (${t.status})`);
  });
  
  await prisma.$disconnect();
}

main();
