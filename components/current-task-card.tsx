'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CountdownTimer } from '@/components/countdown-timer';
import { Play, Pause, CheckCircle2, SkipForward, Clock } from 'lucide-react';
import { Task, TaskStatus } from '@prisma/client';
import { useState } from 'react';

interface CurrentTaskCardProps {
  task: Task | null;
  onStart: () => void;
  onPause: () => void;
  onComplete: () => void;
  onSkip: () => void;
  onExtend: () => void;
}

export function CurrentTaskCard({
  task,
  onStart,
  onPause,
  onComplete,
  onSkip,
  onExtend,
}: CurrentTaskCardProps) {
  const [showActions, setShowActions] = useState(false);

  if (!task) {
    return (
      <Card className="border-2 border-dashed">
        <CardContent className="flex items-center justify-center h-48">
          <div className="text-center text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-lg font-medium">No active task</p>
            <p className="text-sm">Your next scheduled task will appear here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isInProgress = task.status === TaskStatus.IN_PROGRESS;
  const isPaused = task.status === TaskStatus.PAUSED;
  const isPending = task.status === TaskStatus.PENDING;

  return (
    <Card className="border-2 border-primary shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-xs">
                NOW
              </Badge>
              <Badge variant="outline" className="text-xs">
                {task.category}
              </Badge>
            </div>
            <CardTitle className="text-3xl">{task.title}</CardTitle>
          </div>
          <div className="flex flex-col items-end">
            <div className="text-sm text-muted-foreground">
              {task.startTime} → {task.endTime}
            </div>
            <Badge
              variant={
                isInProgress ? 'default' : isPaused ? 'secondary' : 'outline'
              }
              className="mt-2"
            >
              ● {isInProgress ? 'In Progress' : isPaused ? 'Paused' : 'Not Started'}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Countdown Timer */}
        <div className="bg-secondary/50 rounded-lg p-6 text-center">
          <div className="text-sm text-muted-foreground mb-2">
            TIME REMAINING
          </div>
          <CountdownTimer
            endTime={task.endTime}
            onComplete={() => setShowActions(true)}
            className="text-primary"
          />
        </div>

        {/* Task Objective */}
        {task.description && (
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="text-sm font-medium mb-1">Task Objective</div>
            <p className="text-sm text-muted-foreground">{task.description}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {isPending && (
            <Button onClick={onStart} size="lg" className="flex-1">
              <Play className="mr-2 h-4 w-4" />
              Start
            </Button>
          )}

          {isInProgress && (
            <>
              <Button
                onClick={onPause}
                variant="secondary"
                size="lg"
                className="flex-1"
              >
                <Pause className="mr-2 h-4 w-4" />
                Pause
              </Button>
              <Button
                onClick={onComplete}
                variant="default"
                size="lg"
                className="flex-1"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Complete
              </Button>
            </>
          )}

          {isPaused && (
            <>
              <Button onClick={onStart} size="lg" className="flex-1">
                <Play className="mr-2 h-4 w-4" />
                Resume
              </Button>
              <Button
                onClick={onComplete}
                variant="default"
                size="lg"
                className="flex-1"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Complete
              </Button>
            </>
          )}

          <Button
            onClick={onSkip}
            variant="outline"
            size="lg"
            className="flex-1"
          >
            <SkipForward className="mr-2 h-4 w-4" />
            Skip
          </Button>

          <Button
            onClick={onExtend}
            variant="outline"
            size="lg"
            className="flex-1"
          >
            <Clock className="mr-2 h-4 w-4" />
            +15 min
          </Button>
        </div>

        {/* Task Complete Actions */}
        {showActions && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 space-y-3">
            <div className="text-sm font-medium text-center">
              Time completed. Did you finish this task?
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={onComplete} variant="default" size="sm">
                ✅ Completed
              </Button>
              <Button
                onClick={() => {
                  /* Handle partial */
                }}
                variant="outline"
                size="sm"
              >
                🟡 Partially
              </Button>
              <Button
                onClick={onSkip}
                variant="outline"
                size="sm"
              >
                ❌ Not Done
              </Button>
              <Button onClick={onExtend} variant="outline" size="sm">
                ⏱ Need More Time
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
