'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CountdownTimer } from '@/components/countdown-timer';
import { Task } from '@prisma/client';
import {
  Play,
  Pause,
  Square,
  X,
  Plus,
  Coffee,
  Target,
  Timer,
} from 'lucide-react';

interface FocusModeProps {
  task: Task;
  onExit: () => void;
  onComplete: () => void;
  pomodoroEnabled?: boolean;
  pomodoroWork?: number; // minutes
  pomodoroBreak?: number; // minutes
}

export function FocusMode({
  task,
  onExit,
  onComplete,
  pomodoroEnabled = false,
  pomodoroWork = 25,
  pomodoroBreak = 5,
}: FocusModeProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [sessionStart] = useState(new Date());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isPaused]);

  const formatElapsed = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePomodoroComplete = () => {
    if (isBreak) {
      setIsBreak(false);
    } else {
      setCompletedPomodoros((prev) => prev + 1);
      setIsBreak(true);
    }
  };

  const handleExtend = () => {
    // Extend task by 15 minutes
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-sm">
            FOCUS MODE
          </Badge>
          <Badge variant="outline" className="text-sm">
            {task.category}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onExit}
          className="text-white hover:bg-white/10"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Main Content */}
      <div className="h-full flex flex-col items-center justify-center px-6 pb-32">
        {/* Task Title */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4">{task.title}</h1>
          {task.description && (
            <p className="text-xl text-gray-400 max-w-2xl">
              {task.description}
            </p>
          )}
        </div>

        {/* Timer Display */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-md p-12 mb-8">
          {pomodoroEnabled && !isBreak ? (
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-2 flex items-center justify-center gap-2">
                <Timer className="h-4 w-4" />
                POMODORO SESSION {completedPomodoros + 1}
              </div>
              <div className="text-7xl font-bold tabular-nums text-primary">
                {/* Show pomodoro countdown */}
                25:00
              </div>
            </div>
          ) : pomodoroEnabled && isBreak ? (
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-2 flex items-center justify-center gap-2">
                <Coffee className="h-4 w-4" />
                BREAK TIME
              </div>
              <div className="text-7xl font-bold tabular-nums text-green-500">
                05:00
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-2">TIME REMAINING</div>
              <CountdownTimer
                endTime={task.endTime}
                className="text-7xl font-bold tabular-nums text-primary"
              />
            </div>
          )}
        </Card>

        {/* Stats */}
        <div className="flex items-center gap-8 mb-8">
          <div className="text-center">
            <div className="text-3xl font-bold">{formatElapsed(elapsedSeconds)}</div>
            <div className="text-sm text-gray-400">Elapsed</div>
          </div>
          {pomodoroEnabled && (
            <>
              <div className="h-12 w-px bg-white/20" />
              <div className="text-center">
                <div className="text-3xl font-bold">{completedPomodoros}</div>
                <div className="text-sm text-gray-400">Pomodoros</div>
              </div>
            </>
          )}
          <div className="h-12 w-px bg-white/20" />
          <div className="text-center">
            <div className="text-3xl font-bold">{task.priority}</div>
            <div className="text-sm text-gray-400">Priority</div>
          </div>
        </div>

        {/* Task Objective */}
        {task.description && (
          <Card className="bg-white/5 border-white/10 backdrop-blur-md p-6 max-w-2xl mb-8">
            <div className="flex items-start gap-3">
              <Target className="h-5 w-5 text-primary mt-1" />
              <div>
                <div className="font-semibold mb-2">Task Objective</div>
                <p className="text-sm text-gray-300">{task.description}</p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setIsPaused(!isPaused)}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            {isPaused ? (
              <>
                <Play className="mr-2 h-5 w-5" />
                Resume
              </>
            ) : (
              <>
                <Pause className="mr-2 h-5 w-5" />
                Pause
              </>
            )}
          </Button>

          <Button
            size="lg"
            onClick={onComplete}
            className="bg-primary hover:bg-primary/90"
          >
            <Square className="mr-2 h-5 w-5" />
            Finish Task
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={handleExtend}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <Plus className="mr-2 h-5 w-5" />
            +15 min
          </Button>
        </div>
      </div>
    </div>
  );
}
