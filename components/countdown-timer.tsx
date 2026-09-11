'use client';

import { useEffect, useState } from 'react';
import { formatCountdown } from '@/lib/utils';

interface CountdownTimerProps {
  endTime: string;
  onComplete?: () => void;
  isActive?: boolean;
  className?: string;
}

export function CountdownTimer({ endTime, onComplete, isActive = true, className }: CountdownTimerProps) {
  const [seconds, setSeconds] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const calculateRemaining = () => {
      const now = new Date();
      const [hours, minutes] = endTime.split(':').map(Number);
      
      const end = new Date(now);
      end.setHours(hours, minutes, 0, 0);
      
      // If end time is before now, it's for tomorrow
      if (end < now) {
        end.setDate(end.getDate() + 1);
      }
      
      const remaining = Math.floor((end.getTime() - now.getTime()) / 1000);
      return Math.max(0, remaining);
    };

    if (!isActive) {
      setSeconds(0);
      setIsComplete(false);
      return;
    }

    // Initial calculation
    setSeconds(calculateRemaining());

    // Update every second
    const interval = setInterval(() => {
      const remaining = calculateRemaining();
      setSeconds(remaining);

      if (remaining === 0 && !isComplete) {
        setIsComplete(true);
        onComplete?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime, onComplete, isActive, isComplete]);

  return (
    <div className={className}>
      <div className="text-4xl font-bold tabular-nums">
        {formatCountdown(seconds)}
      </div>
      {seconds === 0 && (
        <div className="text-sm text-muted-foreground mt-1">
          Time completed
        </div>
      )}
    </div>
  );
}
