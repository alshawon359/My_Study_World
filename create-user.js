// Quick script to create user in database
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createUser() {
  try {
    console.log('🚀 Creating user...');
    
    const userId = 'cmtszibhe0000uzf04p06d1fe';

    // Create user
    const user = await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        email: 'user@studyworld.com',
        name: 'Study World User',
      },
    });

    console.log('✅ User created:', user);

    // Create settings
    const settings = await prisma.userSettings.upsert({
      where: { userId },
      update: {},
      create: {
        userId,
        sleepStartTime: '01:00',
        sleepEndTime: '07:30',
        sleepTarget: 6.5,
        phoneLimit: 90,
        theme: 'dark',
      },
    });

    console.log('✅ Settings created:', settings);
    console.log('\n🎉 User setup complete! You can now use the app.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createUser();
