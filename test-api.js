async function test() {
  try {
    const userId = 'cmtszibhe0000uzf04p06d1fe';
    const date = new Date().toISOString().split('T')[0];
    
    const response = await fetch(`http://localhost:3000/api/tasks?userId=${userId}&date=${date}`);
    const data = await response.json();
    
    console.log('API Response:');
    console.log('Status:', response.status);
    console.log('Tasks count:', data.length);
    console.log('\nTasks:');
    data.forEach(t => {
      console.log(`- ${t.title} | ${t.startTime}-${t.endTime} | Status: ${t.status}`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}

test();
