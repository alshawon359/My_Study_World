import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create or update the default user
  const user = await prisma.user.upsert({
    where: { id: 'cmtszibhe0000uzf04p06d1fe' },
    update: {},
    create: {
      id: 'cmtszibhe0000uzf04p06d1fe',
      email: 'user@studyworld.com',
      name: 'Study World User',
    },
  });

  console.log('✅ User created/updated:', user);

  // Create default user settings
  const settings = await prisma.userSettings.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      sleepStartTime: '01:00',
      sleepEndTime: '07:30',
      sleepTarget: 6.5,
      phoneLimit: 90,
      theme: 'dark',
    },
  });

  console.log('✅ User settings created/updated:', settings);

  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
