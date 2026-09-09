const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.task.deleteMany();
  console.log('All tasks deleted');
  await prisma.$disconnect();
}

main();
