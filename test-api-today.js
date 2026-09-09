async function test() {
  try {
    const userId = 'cmtszibhe0000uzf04p06d1fe';
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    
    console.log('Testing API call:');
    console.log('URL:', `http://localhost:3000/api/tasks?userId=${userId}&date=${dateStr}`);
    console.log('Date:', dateStr);
    console.log('Day:', today.getDay(), '(0=Sun, 3=Wed)');
    
    const response = await fetch(`http://localhost:3000/api/tasks?userId=${userId}&date=${dateStr}`);
    console.log('Status:', response.status);
    
    const data = await response.json();
    console.log('Tasks returned:', data.length);
    
    if (data.length > 0) {
      console.log('\nTasks:');
      data.forEach((t, i) => {
        console.log(`${i+1}. ${t.startTime}-${t.endTime}: ${t.title} (${t.status})`);
      });
    } else {
      console.log('\n❌ No tasks returned!');
      console.log('\nChecking database directly...');
      
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      
      const dbTasks = await prisma.task.findMany({
        where: { userId },
      });
      
      console.log('Total tasks in DB:', dbTasks.length);
      
      const todayTasks = dbTasks.filter(t => {
        const taskDate = t.date.toISOString().split('T')[0];
        return taskDate === dateStr;
      });
      
      console.log('Tasks for today in DB:', todayTasks.length);
      
      if (todayTasks.length > 0) {
        console.log('\nTasks found in DB but not returned by API:');
        todayTasks.forEach(t => {
          console.log(`- ${t.startTime}-${t.endTime}: ${t.title}`);
          console.log(`  Date in DB: ${t.date.toISOString()}`);
        });
      }
      
      await prisma.$disconnect();
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

test();
