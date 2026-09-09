'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Task } from '@prisma/client';
import { Clock, AlertCircle } from 'lucide-react';
import { formatDuration } from '@/lib/utils';

interface RescheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  availableSlots: Array<{ startTime: string; endTime: string; duration: number }>;
  suggestedSlot?: { startTime: string; endTime: string };
  onConfirm: (slot: { startTime: string; endTime: string }, reason: string) => void;
  onSkip: () => void;
}

export function RescheduleDialog({
  open,
  onOpenChange,
  task,
  availableSlots,
  suggestedSlot,
  onConfirm,
  onSkip,
}: RescheduleDialogProps) {
  const [selectedSlot, setSelectedSlot] = useState<{ startTime: string; endTime: string } | null>(
    suggestedSlot || null
  );
  const [reason, setReason] = useState<string>('');

  if (!task) return null;

  const reasons = [
    'Previous task took longer',
    'Tired',
    'University work',
    'Personal reason',
    'Not feeling productive',
    'Other',
  ];

  const handleConfirm = () => {
    if (selectedSlot) {
      onConfirm(selectedSlot, reason);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            Task Missed: {task.title}
          </DialogTitle>
          <DialogDescription>
            This task was scheduled for {task.startTime} - {task.endTime} ({formatDuration(task.duration)})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Reason Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Why did you miss this task?</label>
            <div className="flex flex-wrap gap-2">
              {reasons.map((r) => (
                <Badge
                  key={r}
                  variant={reason === r ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setReason(r)}
                >
                  {r}
                </Badge>
              ))}
            </div>
          </div>

          {/* Available Slots */}
          {availableSlots.length > 0 ? (
            <div>
              <label className="text-sm font-medium mb-2 block">
                Available slots today ({availableSlots.length})
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                {availableSlots.map((slot, index) => {
                  const isSuggested =
                    suggestedSlot &&
                    slot.startTime === suggestedSlot.startTime &&
                    slot.endTime === suggestedSlot.endTime;
                  const isSelected =
                    selectedSlot &&
                    slot.startTime === selectedSlot.startTime &&
                    slot.endTime === selectedSlot.endTime;

                  return (
                    <Card
                      key={index}
                      className={`p-3 cursor-pointer transition-all hover:shadow-md ${
                        isSelected
                          ? 'border-2 border-primary bg-primary/10'
                          : isSuggested
                          ? 'border-2 border-yellow-500/50 bg-yellow-500/5'
                          : ''
                      }`}
                      onClick={() =>
                        setSelectedSlot({
                          startTime: slot.startTime,
                          endTime: slot.endTime,
                        })
                      }
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {slot.startTime} - {slot.endTime}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDuration(slot.duration)} available
                      </div>
                      {isSuggested && (
                        <Badge variant="secondary" className="mt-2 text-xs">
                          ⭐ Suggested
                        </Badge>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="font-medium">No available slots today</p>
              <p className="text-sm">Consider rescheduling to tomorrow or skipping</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onSkip} className="w-full sm:w-auto">
            Skip Today
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedSlot || !reason}
            className="w-full sm:w-auto"
          >
            Reschedule to {selectedSlot?.startTime || 'Selected Time'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
