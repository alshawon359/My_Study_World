import { PrismaClient, BlockType, BlockCategory, Priority, TaskStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create demo user
  const user = await prisma.user.upsert({
    where: { email: 'demo@mystudyworld.com' },
    update: {},
    create: {
      email: 'demo@mystudyworld.com',
      name: 'Shawon',
    },
  });

  console.log('✓ Created user:', user.name);

  // Create user settings
  await prisma.userSettings.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      sleepStartTime: '01:00',
      sleepEndTime: '07:30',
      sleepTarget: 6.5,
      phoneLimit: 90,
      weeklyStudyHoursTarget: 40,
      weeklyAcademicHoursTarget: 22,
      weeklyAIHoursTarget: 12,
      weeklyResearchHoursTarget: 6,
    },
  });

  console.log('✓ Created user settings');

  // Create subjects
  const subjects = await Promise.all([
    prisma.subject.create({
      data: {
        userId: user.id,
        name: 'Digital Image Processing',
        code: 'DIP',
        category: BlockCategory.ACADEMIC,
        color: '#3b82f6',
        totalTopics: 8,
        completedTopics: 5,
      },
    }),
    prisma.subject.create({
      data: {
        userId: user.id,
        name: 'Digital Communication',
        code: 'DC',
        category: BlockCategory.ACADEMIC,
        color: '#8b5cf6',
        totalTopics: 10,
        completedTopics: 6,
      },
    }),
    prisma.subject.create({
      data: {
        userId: user.id,
        name: 'Telecommunication Engineering',
        code: 'TE',
        category: BlockCategory.ACADEMIC,
        color: '#ec4899',
        totalTopics: 12,
        completedTopics: 7,
      },
    }),
    prisma.subject.create({
      data: {
        userId: user.id,
        name: 'Optical Fiber Communication',
        code: 'OFC',
        category: BlockCategory.ACADEMIC,
        color: '#f59e0b',
        totalTopics: 9,
        completedTopics: 4,
      },
    }),
    prisma.subject.create({
      data: {
        userId: user.id,
        name: 'Satellite Communication',
        code: 'SC',
        category: BlockCategory.ACADEMIC,
        color: '#10b981',
        totalTopics: 8,
        completedTopics: 3,
      },
    }),
  ]);

  console.log('✓ Created subjects');

  // Create weekly schedule blocks
  const scheduleBlocks = [
    // Tuesday (Today's sample day)
    { day: 2, start: '07:30', end: '09:00', title: 'Wake Up & Morning Routine', category: BlockCategory.PERSONAL, type: BlockType.FIXED },
    { day: 2, start: '09:00', end: '12:30', title: 'University', category: BlockCategory.UNIVERSITY, type: BlockType.FIXED },
    { day: 2, start: '12:30', end: '16:00', title: 'Break & Lunch', category: BlockCategory.PERSONAL, type: BlockType.FIXED },
    { day: 2, start: '16:00', end: '17:00', title: 'GSL + Rest', category: BlockCategory.PERSONAL, type: BlockType.FLEXIBLE },
    { day: 2, start: '17:00', end: '18:30', title: 'Digital Image Processing', category: BlockCategory.ACADEMIC, type: BlockType.FLEXIBLE, subject: 'DIP', priority: Priority.HIGH, color: '#3b82f6', taskObjective: 'Complete spatial filtering problems and revise convolution masks' },
    { day: 2, start: '18:50', end: '21:00', title: 'Machine Learning', category: BlockCategory.AI_ML, type: BlockType.FLEXIBLE, priority: Priority.HIGH, color: '#06b6d4', taskObjective: 'Implement Decision Tree algorithm and test on dataset' },
    { day: 2, start: '21:00', end: '22:50', title: 'Satellite Communication', category: BlockCategory.ACADEMIC, type: BlockType.FLEXIBLE, subject: 'SC', priority: Priority.MEDIUM, color: '#10b981' },
    { day: 2, start: '22:50', end: '00:20', title: 'ML Coding Practice', category: BlockCategory.AI_ML, type: BlockType.FLEXIBLE, priority: Priority.MEDIUM, color: '#06b6d4' },
    { day: 2, start: '00:20', end: '00:40', title: 'Planning', category: BlockCategory.PERSONAL, type: BlockType.FLEXIBLE },
    { day: 2, start: '00:40', end: '01:00', title: 'Relax', category: BlockCategory.PERSONAL, type: BlockType.FLEXIBLE },
    { day: 2, start: '01:00', end: '07:30', title: 'Sleep', category: BlockCategory.SLEEP, type: BlockType.FIXED },
  ];

  for (const block of scheduleBlocks) {
    await prisma.scheduleBlock.create({
      data: {
        userId: user.id,
        title: block.title,
        category: block.category,
        type: block.type,
        dayOfWeek: block.day,
        startTime: block.start,
        endTime: block.end,
        duration: calculateDuration(block.start, block.end),
        subject: block.subject,
        priority: block.priority || Priority.MEDIUM,
        color: block.color || '#06b6d4',
        taskObjective: block.taskObjective,
        recurring: true,
      },
    });
  }

  console.log('✓ Created schedule blocks');

  // Create today's tasks
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to start of day in local time
  
  const todayTasks = [
    { start: '17:00', end: '18:30', title: 'Digital Image Processing', category: BlockCategory.ACADEMIC, status: TaskStatus.COMPLETED, priority: Priority.HIGH },
    { start: '18:50', end: '21:00', title: 'Machine Learning', category: BlockCategory.AI_ML, status: TaskStatus.IN_PROGRESS, priority: Priority.HIGH },
    { start: '21:00', end: '22:50', title: 'Satellite Communication', category: BlockCategory.ACADEMIC, status: TaskStatus.PENDING, priority: Priority.MEDIUM },
    { start: '22:50', end: '00:20', title: 'ML Coding Practice', category: BlockCategory.AI_ML, status: TaskStatus.PENDING, priority: Priority.MEDIUM },
  ];

  for (const task of todayTasks) {
    await prisma.task.create({
      data: {
        userId: user.id,
        title: task.title,
        category: task.category,
        startTime: task.start,
        endTime: task.end,
        duration: calculateDuration(task.start, task.end),
        date: today,
        status: task.status,
        priority: task.priority,
      },
    });
  }

  console.log('✓ Created today\'s tasks');

  // Create AI/ML roadmap
  const aiRoadmap = await prisma.roadmap.create({
    data: {
      userId: user.id,
      title: 'AI/ML Learning Path',
      category: BlockCategory.AI_ML,
      description: 'Complete roadmap to become an AI Engineer',
    },
  });

  const roadmapItems = [
    { title: 'Python Fundamentals', completed: true, progress: 100, order: 1 },
    { title: 'Mathematics for ML', completed: true, progress: 100, order: 2 },
    { title: 'Statistics & Probability', completed: true, progress: 100, order: 3 },
    { title: 'Machine Learning Basics', completed: false, progress: 65, order: 4 },
    { title: 'Deep Learning', completed: false, progress: 30, order: 5 },
    { title: 'Neural Networks', completed: false, progress: 20, order: 6 },
    { title: 'Computer Vision', completed: false, progress: 0, order: 7 },
    { title: 'NLP', completed: false, progress: 0, order: 8 },
  ];

  for (const item of roadmapItems) {
    await prisma.roadmapItem.create({
      data: {
        roadmapId: aiRoadmap.id,
        title: item.title,
        completed: item.completed,
        completionProgress: item.progress,
        order: item.order,
        topics: "[]",
        lessons: "[]",
        projects: "[]",
        resources: "[]",
      },
    });
  }

  console.log('✓ Created AI/ML roadmap');

  // Create research project
  const researchProject = await prisma.researchProject.create({
    data: {
      userId: user.id,
      title: 'AI-Integrated Antenna Design',
      description: 'Research on using machine learning for antenna optimization',
      area: 'Antenna Design & AI',
      stage: 'literature',
      active: true,
    },
  });

  console.log('✓ Created research project');

  // Create goals
  await Promise.all([
    prisma.goal.create({
      data: {
        userId: user.id,
        title: 'Study 40 hours this week',
        type: 'WEEKLY',
        category: 'ACADEMIC',
        targetValue: 40,
        currentValue: 31.5,
        unit: 'hours',
        progress: 78.75,
        priority: Priority.HIGH,
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.goal.create({
      data: {
        userId: user.id,
        title: 'Complete ML Decision Tree Implementation',
        type: 'DAILY',
        category: 'AI_ML',
        priority: Priority.HIGH,
        progress: 60,
      },
    }),
    prisma.goal.create({
      data: {
        userId: user.id,
        title: 'Become AI Engineer + Researcher',
        type: 'LONG_TERM',
        category: 'CAREER',
        priority: Priority.CRITICAL,
        progress: 35,
      },
    }),
  ]);

  console.log('✓ Created goals');

  console.log('✅ Seeding completed successfully!');
}

function calculateDuration(start: string, end: string): number {
  const [startH, startM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);
  let duration = (endH * 60 + endM) - (startH * 60 + startM);
  if (duration < 0) duration += 24 * 60;
  return duration;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
