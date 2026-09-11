'use client';

import { useEffect, useState, useMemo } from 'react';
import { CurrentTaskCard } from '@/components/current-task-card';
import { ProgressCard } from '@/components/progress-card';
import { StatusIndicator } from '@/components/status-indicator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getGreeting, formatDate } from '@/lib/utils';
import { getBDDayOfWeek, getBDDateString, getBDTimeString } from '@/lib/date-utils';
import { calculateDailyStatus } from '@/lib/scheduling-engine';
import { Task, ScheduleBlock, TaskStatus } from '@prisma/client';
import { Clock, Calendar, CheckCircle2, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const [bdTimeString, setBdTimeString] = useState('00:00:00');
  const [bdDateString, setBdDateString] = useState('');
  const [scheduleBlocks, setScheduleBlocks] = useState<ScheduleBlock[]>([]);
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const userId = 'cmtszibhe0000uzf04p06d1fe'; // Shawon's user ID

  // Update BD time every second (Direct UTC + 6 calculation)
  useEffect(() => {
    const updateBDTime = () => {
      const now = new Date();
      
      // Get UTC time directly
      const utcHours = now.getUTCHours();
      const utcMinutes = now.getUTCMinutes();
      const utcSeconds = now.getUTCSeconds();
      
      // Add 6 hours for Bangladesh
      let bdHours = utcHours + 6;
      if (bdHours >= 24) {
        bdHours -= 24;
      }
      
      const hours = String(bdHours).padStart(2, '0');
      const minutes = String(utcMinutes).padStart(2, '0');
      const seconds = String(utcSeconds).padStart(2, '0');
      setBdTimeString(`${hours}:${minutes}:${seconds}`);
      
      // For date, create a BD date object
      const bdDate = new Date(now.getTime() + (6 * 60 * 60 * 1000));
      const dateStr = bdDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC',
      });
      setBdDateString(dateStr);
    };
    
    updateBDTime(); // Initial call
    const interval = setInterval(updateBDTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    loadData();
    
    // Auto-refresh every 30 seconds for live updates
    const interval = setInterval(() => {
      loadData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Dashboard: Starting data load...');
      
      const currentDay = getBDDayOfWeek();
      const dateStr = getBDDateString();
      
      console.log(`📅 Today (BD time): ${dateStr}, Day of week: ${currentDay}`);
      
      // Step 1: Load schedule blocks
      console.log(`🔍 Fetching schedule blocks for day ${currentDay}...`);
      const scheduleRes = await fetch(`/api/schedule?userId=${userId}&dayOfWeek=${currentDay}`);
      
      let scheduleData = [];
      if (scheduleRes.ok) {
        scheduleData = await scheduleRes.json();
        console.log(`✅ Loaded ${scheduleData.length} schedule blocks`);
        setScheduleBlocks(scheduleData);
      } else {
        const errorText = await scheduleRes.text();
        console.error('❌ Failed to load schedule:', errorText);
      }

      // Step 2: Try to load existing tasks
      console.log(`🔍 Fetching tasks for date ${dateStr}...`);
      const tasksRes = await fetch(`/api/tasks?userId=${userId}&date=${dateStr}`);
      
      let tasksData = [];
      if (tasksRes.ok) {
        tasksData = await tasksRes.json();
        console.log(`✅ Loaded ${tasksData.length} existing tasks`);
      } else {
        const errorText = await tasksRes.text();
        console.error('❌ Failed to load tasks:', errorText);
      }

      // Step 3: Auto-generate if needed
      if (tasksData.length === 0 && scheduleData.length > 0) {
        console.log('⚡ No tasks found but schedule blocks exist. Generating tasks...');
        
        try {
          const generateRes = await fetch('/api/tasks/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, date: dateStr }),
          });

          if (generateRes.ok) {
            const result = await generateRes.json();
            tasksData = result.tasks || [];
            console.log(`✅ Generated ${tasksData.length} tasks successfully`);
            
            if (tasksData.length > 0) {
              toast({
                title: 'Tasks Generated',
                description: `Created ${tasksData.length} tasks from your schedule`,
              });
            }
          } else {
            const errorData = await generateRes.json();
            console.error('❌ Task generation failed:', errorData);
            toast({
              title: 'Generation Failed',
              description: errorData.error || 'Could not generate tasks',
              variant: 'destructive',
            });
          }
        } catch (genError) {
          console.error('❌ Exception during task generation:', genError);
        }
      } else if (scheduleData.length === 0) {
        console.log('ℹ️ No schedule blocks found for today');
      } else {
        console.log(`ℹ️ Using ${tasksData.length} existing tasks`);
      }

      setTodayTasks(tasksData);
      console.log('✅ Dashboard data load complete');
      
    } catch (error: any) {
      console.error('❌ Fatal error in loadData:', error);
      console.error('Stack:', error.stack);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Find current task (using BD timezone)
  const currentTimeStr = getBDTimeString();
  
  const currentTask = useMemo(() => 
    todayTasks.find(
      (task) =>
        task.startTime <= currentTimeStr &&
        task.endTime > currentTimeStr &&
        task.status !== TaskStatus.COMPLETED &&
        task.status !== TaskStatus.SKIPPED
    ), [todayTasks, currentTimeStr]
  );

  // Calculate next task
  const nextTask = useMemo(() => 
    todayTasks.find(
      (task) => task.startTime > currentTimeStr && task.status === TaskStatus.PENDING
    ), [todayTasks, currentTimeStr]
  );

  // Calculate daily status
  const dailyStatus = useMemo(() => 
    todayTasks.length > 0
      ? calculateDailyStatus(todayTasks, scheduleBlocks, currentTimeStr)
      : null,
    [todayTasks, scheduleBlocks, currentTimeStr]
  );

  // Calculate progress
  const completedTasks = useMemo(() => 
    todayTasks.filter(
      (t) => t.status === TaskStatus.COMPLETED || t.status === TaskStatus.PARTIALLY_COMPLETED
    ).length,
    [todayTasks]
  );
  
  const totalTasks = todayTasks.length;
  const todayProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Auto-complete in-progress tasks when time expires
  useEffect(() => {
    const checkTaskCompletion = async () => {
      const currentTimeStr = getBDTimeString();
      const expiredTasks = todayTasks.filter(
        (task) => task.status === TaskStatus.IN_PROGRESS && currentTimeStr >= task.endTime
      );

      await Promise.all(expiredTasks.map(async (task) => {
        try {
          const response = await fetch('/api/tasks', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: task.id,
              status: TaskStatus.COMPLETED,
              actualEndTime: new Date().toISOString(),
              completionPercentage: 100,
            }),
          });

          if (response.ok) {
            const updatedTask = await response.json();
            setTodayTasks((tasks) => tasks.map((item) => item.id === updatedTask.id ? updatedTask : item));
            toast({
              title: 'Task Auto-Completed! ⏰',
              description: `Time's up! "${task.title}" marked as completed`,
            });
          }
        } catch (error) {
          console.error('Error auto-completing task:', error);
        }
      }));
    };

    // Check every 5 seconds
    const interval = setInterval(checkTaskCompletion, 5000);
    
    // Also check immediately
    checkTaskCompletion();

    return () => clearInterval(interval);
  }, [todayTasks, toast]);

  // Helper function to get category color
  const getCategoryColor = (category: string) => {
    const colorMap: { [key: string]: string } = {
      'ACADEMIC': '#3b82f6',
      'AI_ML': '#06b6d4',
      'RESEARCH': '#8b5cf6',
      'UNIVERSITY': '#f59e0b',
      'PERSONAL': '#10b981',
      'SLEEP': '#64748b',
    };
    return colorMap[category] || '#06b6d4';
  };

  // Task handlers with real API calls
  const handleStartTask = async () => {
    if (!currentTask) return;
    
    try {
      const response = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentTask.id,
          status: TaskStatus.IN_PROGRESS,
          actualStartTime: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setTodayTasks(tasks =>
          tasks.map(t => (t.id === updatedTask.id ? updatedTask : t))
        );
        toast({
          title: 'Task Started',
          description: `${currentTask.title} is now in progress`,
        });
      }
    } catch (error) {
      console.error('Error starting task:', error);
      toast({
        title: 'Error',
        description: 'Failed to start task',
        variant: 'destructive',
      });
    }
  };

  const handlePauseTask = async () => {
    if (!currentTask) return;
    
    try {
      const response = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentTask.id,
          status: TaskStatus.PAUSED,
        }),
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setTodayTasks(tasks =>
          tasks.map(t => (t.id === updatedTask.id ? updatedTask : t))
        );
        toast({
          title: 'Task Paused',
          description: `${currentTask.title} has been paused`,
        });
      }
    } catch (error) {
      console.error('Error pausing task:', error);
      toast({
        title: 'Error',
        description: 'Failed to pause task',
        variant: 'destructive',
      });
    }
  };

  const handleCompleteTask = async () => {
    if (!currentTask) return;
    
    try {
      const response = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentTask.id,
          status: TaskStatus.COMPLETED,
          actualEndTime: new Date().toISOString(),
          completionPercentage: 100,
        }),
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setTodayTasks(tasks =>
          tasks.map(t => (t.id === updatedTask.id ? updatedTask : t))
        );
        toast({
          title: 'Task Completed! 🎉',
          description: `Great job on ${currentTask.title}`,
        });
      }
    } catch (error) {
      console.error('Error completing task:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete task',
        variant: 'destructive',
      });
    }
  };

  const handleSkipTask = async () => {
    if (!currentTask) return;
    
    try {
      const response = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentTask.id,
          status: TaskStatus.SKIPPED,
        }),
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setTodayTasks(tasks =>
          tasks.map(t => (t.id === updatedTask.id ? updatedTask : t))
        );
        toast({
          title: 'Task Skipped',
          description: `${currentTask.title} has been skipped`,
        });
      }
    } catch (error) {
      console.error('Error skipping task:', error);
      toast({
        title: 'Error',
        description: 'Failed to skip task',
        variant: 'destructive',
      });
    }
  };

  const handleExtendTask = async () => {
    if (!currentTask) return;
    
    // Calculate new end time (add 15 minutes)
    const [hours, minutes] = currentTask.endTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + 15;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMinutes = totalMinutes % 60;
    const newEndTime = `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
    
    try {
      const response = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentTask.id,
          endTime: newEndTime,
          duration: currentTask.duration + 15,
        }),
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setTodayTasks(tasks =>
          tasks.map(t => (t.id === updatedTask.id ? updatedTask : t))
        );
        toast({
          title: 'Task Extended',
          description: `Added 15 minutes to ${currentTask.title}`,
        });
      }
    } catch (error) {
      console.error('Error extending task:', error);
      toast({
        title: 'Error',
        description: 'Failed to extend task',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="mb-8">
            <div className="h-10 w-64 bg-muted animate-pulse rounded mb-2"></div>
            <div className="h-6 w-96 bg-muted animate-pulse rounded"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-muted animate-pulse rounded-lg"></div>
              <div className="h-96 bg-muted animate-pulse rounded-lg"></div>
            </div>
            <div className="space-y-6">
              <div className="h-48 bg-muted animate-pulse rounded-lg"></div>
              <div className="h-48 bg-muted animate-pulse rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header - Compact */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">
              {getGreeting()}, Shawon 👋
            </h1>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>{bdDateString}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span className="tabular-nums font-mono text-base font-semibold text-primary">
                  {bdTimeString}
                </span>
                <span className="text-xs font-semibold text-primary">BD</span>
              </div>
            </div>
          </div>
        </div>



        {/* Generate Tasks Button if no tasks - Compact */}
        {todayTasks.length === 0 && !loading && (
          <Card className="mb-4 border-2 border-primary/20 bg-primary/5">
            <CardContent className="flex flex-col items-center justify-center py-6">
              <Calendar className="h-12 w-12 text-primary mb-3 opacity-50" />
              <h3 className="text-base font-semibold mb-1">No Tasks for Today</h3>
              <p className="text-xs text-muted-foreground mb-3 text-center max-w-md">
                Generate today's tasks from your Master Timetable schedule
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/tasks/generate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId, date: getBDDateString() }),
                      });
                      if (res.ok) {
                        await loadData(); // Reload immediately
                        toast({
                          title: 'Tasks Generated! 🎉',
                          description: 'Your schedule for today is ready',
                        });
                      }
                    } catch (error) {
                      toast({
                        title: 'Error',
                        description: 'Failed to generate tasks',
                        variant: 'destructive',
                      });
                    }
                  }}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Generate Tasks
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadData}
                >
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Daily Status - Compact */}
        {dailyStatus && (
          <div className="mb-4">
            <StatusIndicator
              status={dailyStatus.status}
              message={dailyStatus.message}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Current & Upcoming Tasks */}
          <div className="lg:col-span-2 space-y-4">
            {/* Current Task - Moved Up */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="default" className="text-xs px-2.5 py-0.5 animate-pulse">
                  🔴 LIVE NOW
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">
                  {currentTimeStr}
                </span>
              </div>
              <CurrentTaskCard
                task={currentTask || null}
                onStart={handleStartTask}
                onPause={handlePauseTask}
                onComplete={handleCompleteTask}
                onSkip={handleSkipTask}
                onExtend={handleExtendTask}
                onTimeExpired={handleCompleteTask}
              />
            </div>

            {/* Upcoming Tasks Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Today's Schedule
                  <Badge variant="secondary" className="ml-auto">
                    {completedTasks}/{totalTasks} completed
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {todayTasks.map((task) => {
                    const isPast = task.endTime <= currentTimeStr;
                    const isCurrent = task.startTime <= currentTimeStr && task.endTime > currentTimeStr;
                    const isNext = task === nextTask;
                    const isCompleted = task.status === TaskStatus.COMPLETED;
                    const isPending = task.status === TaskStatus.PENDING;

                    return (
                      <div
                        key={task.id}
                        className={cn(
                          "flex items-center gap-4 p-4 rounded-lg border transition-all",
                          isCurrent && "border-2 border-primary bg-primary/5 shadow-md",
                          isNext && !isCurrent && "border-blue-300 bg-blue-50 dark:bg-blue-950/20",
                          isPast && !isCompleted && "opacity-50",
                          isCompleted && "bg-green-50 dark:bg-green-950/20 border-green-200"
                        )}
                      >
                        {/* Time Badge */}
                        <div className="flex flex-col items-center min-w-[80px]">
                          <div className={cn(
                            "text-sm font-mono font-semibold",
                            isCurrent && "text-primary",
                            isCompleted && "text-green-600 line-through"
                          )}>
                            {task.startTime}
                          </div>
                          <div className="text-xs text-muted-foreground">to</div>
                          <div className={cn(
                            "text-sm font-mono font-semibold",
                            isCurrent && "text-primary",
                            isCompleted && "text-green-600 line-through"
                          )}>
                            {task.endTime}
                          </div>
                        </div>

                        {/* Vertical Line */}
                        <div className={cn(
                          "w-1 h-16 rounded-full",
                          isCurrent && "bg-primary animate-pulse",
                          isCompleted && "bg-green-500",
                          isPending && "bg-gray-300 dark:bg-gray-700"
                        )} />

                        {/* Task Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={cn(
                              "font-semibold",
                              isCurrent && "text-lg",
                              isCompleted && "line-through text-muted-foreground"
                            )}>
                              {task.title}
                            </h3>
                            {isCurrent && (
                              <Badge variant="default" className="text-xs animate-pulse">
                                NOW
                              </Badge>
                            )}
                            {isNext && !isCurrent && (
                              <Badge variant="secondary" className="text-xs">
                                NEXT
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge 
                              variant="outline" 
                              className="text-xs"
                              style={{ 
                                borderColor: getCategoryColor(task.category),
                                color: getCategoryColor(task.category)
                              }}
                            >
                              {task.category}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {Math.floor(task.duration / 60)}h {task.duration % 60}m
                            </span>
                            {task.description && (
                              <span className="text-xs text-muted-foreground">
                                • {task.description}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Status Icon */}
                        <div className="flex items-center">
                          {isCompleted && (
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-900">
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            </div>
                          )}
                          {task.status === TaskStatus.IN_PROGRESS && (
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                              <Play className="h-5 w-5 text-primary animate-pulse" />
                            </div>
                          )}
                          {isPending && !isCurrent && (
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
                              <Clock className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Progress & Stats */}
          <div className="space-y-6">
            {/* Today's Progress */}
            <ProgressCard
              title="TODAY"
              mainProgress={todayProgress}
              subtitle={`${completedTasks} / ${totalTasks} tasks`}
              items={[
                { label: 'Academic', value: 0 },
                { label: 'AI/ML', value: 0 },
                { label: 'Research', value: 0 },
                { label: 'Habits', value: 0 },
              ]}
            />

            {/* Weekly Progress */}
            <ProgressCard
              title="THIS WEEK"
              mainProgress={0}
              subtitle="0 / 40 hours"
              items={[
                { label: 'Academic', value: 0, target: 22 },
                { label: 'AI/ML', value: 0, target: 12 },
                { label: 'Research', value: 0, target: 6 },
              ]}
            />

            {/* Study Score */}
            <Card>
              <CardHeader>
                <CardTitle>Today's Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-5xl font-bold text-primary mb-2">0</div>
                  <div className="text-sm text-muted-foreground">/ 100</div>
                  <div className="mt-4 text-xs text-muted-foreground">
                    Based on task completion, focus time, and habits
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
