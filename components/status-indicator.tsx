'use client';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react';

interface StatusIndicatorProps {
  status: 'ON_TRACK' | 'SLIGHTLY_BEHIND' | 'SIGNIFICANTLY_BEHIND';
  message: string;
  className?: string;
}

export function StatusIndicator({ status, message, className }: StatusIndicatorProps) {
  const config = {
    ON_TRACK: {
      icon: CheckCircle2,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
      border: 'border-green-500/20',
      label: '🟢 ON TRACK',
    },
    SLIGHTLY_BEHIND: {
      icon: AlertTriangle,
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/20',
      label: '🟡 SLIGHTLY BEHIND',
    },
    SIGNIFICANTLY_BEHIND: {
      icon: AlertCircle,
      color: 'text-red-500',
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
      label: '🔴 SIGNIFICANTLY BEHIND',
    },
  };

  const { icon: Icon, color, bg, border, label } = config[status];

  return (
    <Card className={cn('border-2', border, bg, className)}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Icon className={cn('h-6 w-6', color)} />
          <div className="flex-1">
            <div className={cn('font-semibold text-sm', color)}>{label}</div>
            <p className="text-sm text-muted-foreground mt-1">{message}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
