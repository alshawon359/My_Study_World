'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ProgressItem {
  label: string;
  value: number;
  target?: number;
  color?: string;
}

interface ProgressCardProps {
  title: string;
  mainProgress: number;
  subtitle: string;
  items?: ProgressItem[];
  className?: string;
}

export function ProgressCard({
  title,
  mainProgress,
  subtitle,
  items,
  className,
}: ProgressCardProps) {
  const getProgressColor = (value: number) => {
    if (value >= 80) return 'text-green-500';
    if (value >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Progress Circle */}
        <div className="flex items-center justify-center">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-muted"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 56}`}
                strokeDashoffset={`${
                  2 * Math.PI * 56 * (1 - mainProgress / 100)
                }`}
                className={cn('text-primary transition-all duration-500', getProgressColor(mainProgress))}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={cn('text-3xl font-bold', getProgressColor(mainProgress))}>
                {Math.round(mainProgress)}%
              </span>
              <span className="text-xs text-muted-foreground mt-1">
                {subtitle}
              </span>
            </div>
          </div>
        </div>

        {/* Breakdown */}
        {items && items.length > 0 && (
          <div className="space-y-3 pt-2">
            {items.map((item, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{item.label}</span>
                  <span className="text-muted-foreground">
                    {item.target
                      ? `${item.value} / ${item.target}`
                      : `${Math.round(item.value)}%`}
                  </span>
                </div>
                <Progress
                  value={item.target ? (item.value / item.target) * 100 : item.value}
                  className="h-2"
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
