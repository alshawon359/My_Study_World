const { PrismaClient, BlockCategory } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const userId = 'cmtszibhe0000uzf04p06d1fe';

  console.log('🌱 Creating subjects...\n');

  const subjects = [
    {
      id: '1',
      name: 'Digital Image Processing',
      code: 'DIP',
      color: '#3b82f6',
      category: BlockCategory.ACADEMIC,
      description: 'Complete course on digital image processing including spatial and frequency domain techniques',
    },
    {
      id: '2',
      name: 'Digital Communication',
      code: 'DC',
      color: '#8b5cf6',
      category: BlockCategory.ACADEMIC,
      description: 'Digital communication systems, modulation techniques, and error correction',
    },
    {
      id: '3',
      name: 'Telecommunication Engineering',
      code: 'TE',
      color: '#ec4899',
      category: BlockCategory.ACADEMIC,
      description: 'Comprehensive telecommunication systems and network architecture',
    },
    {
      id: '4',
      name: 'Optical Fiber Communication',
      code: 'OFC',
      color: '#f59e0b',
      category: BlockCategory.ACADEMIC,
      description: 'Fiber optics, light propagation, and optical networking systems',
    },
    {
      id: '5',
      name: 'Satellite Communication',
      code: 'SC',
      color: '#10b981',
      category: BlockCategory.ACADEMIC,
      description: 'Satellite systems, orbits, and communication networks',
    },
  ];

  // Clear existing subjects for this user
  await prisma.subject.deleteMany({
    where: { userId },
  });

  console.log('✓ Cleared old subjects\n');

  // Create subjects
  for (const subject of subjects) {
    await prisma.subject.create({
      data: {
        id: subject.id,
        userId,
        name: subject.name,
        code: subject.code,
        color: subject.color,
        category: subject.category,
        description: subject.description,
        totalTopics: 0,
        completedTopics: 0,
        totalChapters: 0,
        completedChapters: 0,
      },
    });
    console.log(`✓ Created: ${subject.name} (${subject.code})`);
  }

  console.log('\n✅ All subjects created successfully!');
  console.log('You can now add chapters to these courses.\n');

  await prisma.$disconnect();
}

main();
