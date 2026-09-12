'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Target,
  Brain,
  BookOpen,
  FlaskConical,
  Moon,
  Smartphone,
  Calendar,
  Award,
  CheckCircle2,
  RefreshCw,
  TrendingDown,
} from 'lucide-react';

interface WeeklyStats {
  totalStudyHours: number;
  academicHours: number;
  aiHours: number;
  researchHours: number;
  completedTasks: number;
  totalTasks: number;
  avgSleepHours: number;
  avgPhoneMinutes: number;
  completionRate: number;
  completedGoals: number;
  totalGoals: number;
  completedAITopics: number;
  totalAITopics: number;
  readPapers: number;
  totalPapers: number;
  readingPapers: number;
  toReadPapers: number;
  targets: { weeklyStudy: number; academic: number; ai: number; research: number; sleep: number; phone: number };
  updatedAt: string;
}

export default function ProgressPage() {
  const [stats, setStats] = useState<WeeklyStats>({
    totalStudyHours: 0,
    academicHours: 0,
    aiHours: 0,
    researchHours: 0,
    completedTasks: 0,
    totalTasks: 0,
    avgSleepHours: 0,
    avgPhoneMinutes: 0,
    completionRate: 0,
    completedGoals: 0,
    totalGoals: 0,
    completedAITopics: 0,
    totalAITopics: 0,
    readPapers: 0,
    totalPapers: 0,
    readingPapers: 0,
    toReadPapers: 0,
    targets: { weeklyStudy: 40, academic: 22, ai: 12, research: 6, sleep: 6.5, phone: 90 },
    updatedAt: '',
  });

  const loadStats = async () => {
    const response = await fetch('/api/progress', { cache: 'no-store' });
    if (response.ok) setStats(await response.json());
  };

  useEffect(() => {
    void loadStats();
    const interval = window.setInterval(() => void loadStats(), 30000);
    return () => window.clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    void loadStats();
  };

  const targets = stats.targets;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-purple-500 to-blue-600 p-4 rounded-xl shadow-lg">
                <BarChart3 className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Progress & Analytics</h1>
                <p className="text-lg text-muted-foreground">
                  Real-time performance tracking and insights
                </p>
              </div>
            </div>
            <Button onClick={handleRefresh} size="lg">
              <RefreshCw className="mr-2 h-5 w-5" />
              Refresh Stats
            </Button>
          </div>

          {/* Overall Score */}
          <Card className="border-2 shadow-xl bg-gradient-to-br from-white to-purple-50 dark:from-gray-900 dark:to-gray-800">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg text-muted-foreground mb-2">Overall Performance Score</h2>
                  <div className="text-6xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    {Math.round(stats.completionRate)}%
                  </div>
                </div>
                <div className="text-right">
                  <Award className="h-20 w-20 text-yellow-500 mb-2" />
                  <Badge variant="secondary" className="text-sm">
                    {stats.completionRate >= 80 ? 'Excellent' 
                      : stats.completionRate >= 60 ? 'Good' 
                      : stats.completionRate >= 40 ? 'Fair' 
                      : 'Needs Improvement'}
                  </Badge>
                </div>
              </div>
              <Progress value={stats.completionRate} className="h-4 mt-6" />
            </CardContent>
          </Card>
        </div>

        {/* Study Hours */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Study Hours This Week</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <span className="text-sm text-muted-foreground">Total Hours</span>
                </div>
                <div className="text-3xl font-bold">{stats.totalStudyHours.toFixed(1)}</div>
                <Progress value={(stats.totalStudyHours / targets.weeklyStudy) * 100} className="h-2 mt-3" />
                <div className="text-xs text-muted-foreground mt-2">
                  Target: {targets.weeklyStudy} hours
                </div>
                {stats.totalStudyHours >= targets.weeklyStudy ? (
                  <Badge variant="default" className="mt-2 bg-green-600">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Target Met!
                  </Badge>
                ) : (
                  <div className="text-xs text-orange-600 mt-2">
                    {(targets.weeklyStudy - stats.totalStudyHours).toFixed(1)}h remaining
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <BookOpen className="h-5 w-5 text-purple-600" />
                  <span className="text-sm text-muted-foreground">Academic</span>
                </div>
                <div className="text-3xl font-bold">{stats.academicHours.toFixed(1)}h</div>
                <Progress value={(stats.academicHours / targets.academic) * 100} className="h-2 mt-3" />
                <div className="text-xs text-muted-foreground mt-2">
                  Target: {targets.academic} hours
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Brain className="h-5 w-5 text-blue-600" />
                  <span className="text-sm text-muted-foreground">AI/ML</span>
                </div>
                <div className="text-3xl font-bold">{stats.aiHours.toFixed(1)}h</div>
                <Progress value={(stats.aiHours / targets.ai) * 100} className="h-2 mt-3" />
                <div className="text-xs text-muted-foreground mt-2">
                  Target: {targets.ai} hours
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <FlaskConical className="h-5 w-5 text-teal-600" />
                  <span className="text-sm text-muted-foreground">Research</span>
                </div>
                <div className="text-3xl font-bold">{stats.researchHours.toFixed(1)}h</div>
                <Progress value={(stats.researchHours / targets.research) * 100} className="h-2 mt-3" />
                <div className="text-xs text-muted-foreground mt-2">
                  Target: {targets.research} hours
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tasks & Goals */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Tasks & Goals Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Target className="h-5 w-5 text-blue-600" />
                    <span className="text-sm text-muted-foreground">Tasks Completed</span>
                  </div>
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div className="text-4xl font-bold mb-2">
                  {stats.completedTasks} / {stats.totalTasks}
                </div>
                <Progress value={stats.completionRate} className="h-2 mb-2" />
                <div className="text-sm text-muted-foreground">
                  {Math.round(stats.completionRate)}% completion rate
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Award className="h-5 w-5 text-yellow-600" />
                    <span className="text-sm text-muted-foreground">Goals Achieved</span>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div className="text-4xl font-bold mb-2">
                  {stats.completedGoals} / {stats.totalGoals}
                </div>
                <Progress value={stats.totalGoals > 0 ? (stats.completedGoals / stats.totalGoals) * 100 : 0} className="h-2 mb-2" />
                <div className="text-sm text-muted-foreground">
                  {stats.totalGoals > 0 ? Math.round((stats.completedGoals / stats.totalGoals) * 100) : 0}% goals completed
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Brain className="h-5 w-5 text-purple-600" />
                    <span className="text-sm text-muted-foreground">AI Topics Mastered</span>
                  </div>
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-4xl font-bold mb-2">
                  {stats.completedAITopics} / {stats.totalAITopics}
                </div>
                <Progress value={stats.totalAITopics > 0 ? (stats.completedAITopics / stats.totalAITopics) * 100 : 0} className="h-2 mb-2" />
                <div className="text-sm text-muted-foreground">
                  {stats.totalAITopics > 0 ? Math.round((stats.completedAITopics / stats.totalAITopics) * 100) : 0}% roadmap complete
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Habits & Health */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Habits & Health</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Moon className="h-5 w-5 text-indigo-600" />
                    <span className="font-semibold">Sleep Quality</span>
                  </div>
                  {stats.avgSleepHours >= targets.sleep ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-orange-600" />
                  )}
                </div>
                <div className="text-3xl font-bold mb-2">{stats.avgSleepHours}h</div>
                <Progress 
                  value={(stats.avgSleepHours / targets.sleep) * 100} 
                  className={`h-2 mb-2 ${stats.avgSleepHours >= targets.sleep ? '' : 'bg-orange-200'}`}
                />
                <div className="text-sm text-muted-foreground">
                  Target: {targets.sleep} hours per night
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-5 w-5 text-red-600" />
                    <span className="font-semibold">Phone Usage</span>
                  </div>
                  {stats.avgPhoneMinutes <= targets.phone ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <div className="text-3xl font-bold mb-2">{stats.avgPhoneMinutes} min</div>
                <Progress 
                  value={100 - (stats.avgPhoneMinutes / targets.phone) * 100} 
                  className="h-2 mb-2"
                />
                <div className="text-sm text-muted-foreground">
                  Limit: {targets.phone} minutes per day
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Research Progress */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Research Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <BookOpen className="h-5 w-5 text-teal-600" />
                  <span className="text-sm text-muted-foreground">Papers Read</span>
                </div>
                <div className="text-4xl font-bold">{stats.readPapers}</div>
                <div className="text-sm text-muted-foreground mt-2">
                  Total papers: {stats.totalPapers}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <FlaskConical className="h-5 w-5 text-purple-600" />
                  <span className="text-sm text-muted-foreground">Reading</span>
                </div>
                <div className="text-4xl font-bold">
                  {stats.readingPapers}
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  Currently reading
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Target className="h-5 w-5 text-orange-600" />
                  <span className="text-sm text-muted-foreground">To Read</span>
                </div>
                <div className="text-4xl font-bold">
                  {stats.toReadPapers}
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  In queue
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Achievement Banner */}
        {stats.completionRate >= 80 && (
          <Card className="mt-8 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 border-0 text-white">
            <CardContent className="p-6 text-center">
              <Trophy className="h-12 w-12 mx-auto mb-3" />
              <h3 className="text-2xl font-bold mb-2">Outstanding Performance!</h3>
              <p className="text-yellow-50">
                You're crushing your goals! Keep up the excellent work! 🎉
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function Trophy(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}
