const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: 'demo@mystudyworld.com' }
  });
  console.log('User ID:', user?.id || 'Not found');
  await prisma.$disconnect();
}

main();
