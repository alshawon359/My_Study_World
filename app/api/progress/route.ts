import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticatedUser, unauthorized } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const startOfWeek = (date: Date) => {
  const start = new Date(date);
  const day = start.getDay();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (day === 0 ? 6 : day - 1));
  return start;
};

export async function GET() {
  try {
    const user = await authenticatedUser();
    if (!user) return unauthorized();

    const weekStart = startOfWeek(new Date());
    const [tasks, sessions, phoneLogs, sleepLogs, roadmap, papers, goals, subjects, settings] = await Promise.all([
      prisma.task.findMany({ where: { userId: user.id, date: { gte: weekStart } } }),
      prisma.studySession.findMany({ where: { userId: user.id, startTime: { gte: weekStart } } }),
      prisma.phoneLog.findMany({ where: { userId: user.id, date: { gte: weekStart } } }),
      prisma.sleepLog.findMany({ where: { userId: user.id, date: { gte: weekStart } } }),
      prisma.aIRoadmapLevel.findMany({ where: { userId: user.id }, include: { topics: true } }),
      prisma.standaloneResearchPaper.findMany({ where: { userId: user.id } }),
      prisma.goal.findMany({ where: { userId: user.id } }),
      prisma.subject.findMany({ where: { userId: user.id } }),
      prisma.userSettings.upsert({ where: { userId: user.id }, update: {}, create: { userId: user.id } }),
    ]);

    const completedTasks = tasks.filter((task) => task.status === 'COMPLETED' || task.status === 'PARTIALLY_COMPLETED');
    const completedMinutes = completedTasks.reduce((sum, task) => sum + Math.max(task.focusTimeMinutes, task.duration * task.completionPercentage / 100), 0);
    const sessionMinutes = sessions.reduce((sum, session) => sum + session.duration, 0);
    const totalStudyMinutes = Math.max(completedMinutes, sessionMinutes);
    const hoursByCategory = (category: string) => {
      const taskMinutes = completedTasks.filter((task) => task.category === category).reduce((sum, task) => sum + Math.max(task.focusTimeMinutes, task.duration * task.completionPercentage / 100), 0);
      const sessionCategoryMinutes = sessions.filter((session) => session.category === category).reduce((sum, session) => sum + session.duration, 0);
      return Math.max(taskMinutes, sessionCategoryMinutes) / 60;
    };
    const roadmapTopics = roadmap.flatMap((level) => level.topics);
    const readPapers = papers.filter((paper) => paper.status === 'READ' || paper.status === 'IMPORTANT').length;

    return NextResponse.json({
      totalStudyHours: totalStudyMinutes / 60,
      academicHours: hoursByCategory('ACADEMIC'),
      aiHours: hoursByCategory('AI_ML'),
      researchHours: hoursByCategory('RESEARCH'),
      completedTasks: completedTasks.length,
      totalTasks: tasks.length,
      completionRate: tasks.length ? completedTasks.length / tasks.length * 100 : 0,
      avgSleepHours: sleepLogs.length ? sleepLogs.reduce((sum, log) => sum + log.hours, 0) / sleepLogs.length : 0,
      avgPhoneMinutes: phoneLogs.length ? phoneLogs.reduce((sum, log) => sum + log.minutes, 0) / phoneLogs.length : 0,
      completedGoals: goals.filter((goal) => goal.completed).length,
      totalGoals: goals.length,
      completedAITopics: roadmapTopics.filter((topic) => topic.completed).length,
      totalAITopics: roadmapTopics.length,
      readPapers,
      totalPapers: papers.length,
      readingPapers: papers.filter((paper) => paper.status === 'READING').length,
      toReadPapers: papers.filter((paper) => paper.status === 'TO_READ').length,
      subjectProgress: subjects.reduce((sum, subject) => sum + (subject.totalTopics ? subject.completedTopics / subject.totalTopics * 100 : 0), 0) / (subjects.length || 1),
      targets: {
        weeklyStudy: settings.weeklyStudyHoursTarget,
        academic: settings.weeklyAcademicHoursTarget,
        ai: settings.weeklyAIHoursTarget,
        research: settings.weeklyResearchHoursTarget,
        sleep: settings.sleepTarget,
        phone: settings.phoneLimit,
      },
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Progress stats failed:', error);
    return NextResponse.json({ error: 'Failed to load progress stats.' }, { status: 500 });
  }
}