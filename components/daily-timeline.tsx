'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScheduleBlock, TaskStatus } from '@prisma/client';
import { cn } from '@/lib/utils';
import { CheckCircle2, Circle, Clock, XCircle, RefreshCw } from 'lucide-react';

interface TimelineItem extends ScheduleBlock {
  status?: TaskStatus;
  isCurrent?: boolean;
  isPast?: boolean;
  isFuture?: boolean;
}

interface DailyTimelineProps {
  items: TimelineItem[];
  currentTime: string;
}

export function DailyTimeline({ items, currentTime }: DailyTimelineProps) {
  const getStatusIcon = (item: TimelineItem) => {
    if (item.status === TaskStatus.COMPLETED) {
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    }
    if (item.status === TaskStatus.MISSED) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    if (item.status === TaskStatus.RESCHEDULED) {
      return <RefreshCw className="h-4 w-4 text-yellow-500" />;
    }
    if (item.isCurrent) {
      return <Clock className="h-4 w-4 text-primary animate-pulse" />;
    }
    return <Circle className="h-4 w-4 text-muted-foreground" />;
  };

  const getStatusColor = (item: TimelineItem) => {
    if (item.status === TaskStatus.COMPLETED) return 'border-green-500 bg-green-500/10';
    if (item.status === TaskStatus.MISSED) return 'border-red-500 bg-red-500/10';
    if (item.status === TaskStatus.RESCHEDULED) return 'border-yellow-500 bg-yellow-500/10';
    if (item.isCurrent) return 'border-primary bg-primary/10';
    if (item.isPast) return 'border-muted-foreground/30 bg-muted/50';
    return 'border-muted bg-background';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today's Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={item.id}
              className={cn(
                'relative pl-8 pb-3',
                index !== items.length - 1 && 'border-l-2 border-muted ml-2'
              )}
            >
              {/* Timeline Dot */}
              <div className="absolute left-0 top-1">
                {getStatusIcon(item)}
              </div>

              {/* Time Block Card */}
              <div
                className={cn(
                  'border-2 rounded-lg p-3 transition-all',
                  getStatusColor(item),
                  item.isCurrent && 'shadow-md scale-[1.02]'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-muted-foreground">
                        {item.startTime}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-xs"
                        style={{
                          borderColor: item.color || undefined,
                          color: item.color || undefined,
                        }}
                      >
                        {item.category}
                      </Badge>
                    </div>
                    <h4
                      className={cn(
                        'font-semibold truncate',
                        item.isCurrent && 'text-primary',
                        item.isPast && !item.status && 'text-muted-foreground'
                      )}
                    >
                      {item.title}
                    </h4>
                    {item.subject && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.subject}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">
                      {item.duration}m
                    </div>
                    {item.status && (
                      <Badge
                        variant="outline"
                        className="text-xs mt-1"
                      >
                        {item.status.replace('_', ' ')}
                      </Badge>
                    )}
                  </div>
                </div>

                {item.taskObjective && item.isCurrent && (
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                    {item.taskObjective}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
