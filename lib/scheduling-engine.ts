import { ScheduleBlock, Task, TaskStatus, BlockType } from '@prisma/client';
import {
  getCurrentTime,
  getCurrentDayOfWeek,
  isTimeInRange,
  timeToMinutes,
  minutesToTime,
  calculateDuration,
  calculateTimeRemaining,
} from './utils';

export interface CurrentActivityInfo {
  current: ScheduleBlock | null;
  next: ScheduleBlock | null;
  previous: ScheduleBlock | null;
  remainingSeconds: number;
  isActive: boolean;
  isLate: boolean;
  isUpcoming: boolean;
  minutesUntilNext: number;
}

export interface DailyStatus {
  status: 'ON_TRACK' | 'SLIGHTLY_BEHIND' | 'SIGNIFICANTLY_BEHIND';
  message: string;
  completedTasks: number;
  totalTasks: number;
  remainingTasks: number;
  availableTimeMinutes: number;
  requiredTimeMinutes: number;
}

/**
 * Get current activity based on schedule blocks
 */
export function getCurrentActivity(
  scheduleBlocks: ScheduleBlock[],
  currentTime?: string,
  currentDay?: number
): CurrentActivityInfo {
  const now = currentTime || getCurrentTime();
  const today = currentDay !== undefined ? currentDay : getCurrentDayOfWeek();
  
  // Filter blocks for today and sort by start time
  const todayBlocks = scheduleBlocks
    .filter(block => block.dayOfWeek === today)
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
  
  let current: ScheduleBlock | null = null;
  let next: ScheduleBlock | null = null;
  let previous: ScheduleBlock | null = null;
  
  for (let i = 0; i < todayBlocks.length; i++) {
    const block = todayBlocks[i];
    
    if (isTimeInRange(now, block.startTime, block.endTime)) {
      current = block;
      next = todayBlocks[i + 1] || null;
      previous = todayBlocks[i - 1] || null;
      break;
    } else if (timeToMinutes(now) < timeToMinutes(block.startTime)) {
      next = block;
      previous = todayBlocks[i - 1] || null;
      break;
    }
  }
  
  // If no next block found, it might be tomorrow
  if (!next && todayBlocks.length > 0) {
    const nextDay = (today + 1) % 7;
    const tomorrowBlocks = scheduleBlocks
      .filter(block => block.dayOfWeek === nextDay)
      .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
    next = tomorrowBlocks[0] || null;
  }
  
  const remainingSeconds = current ? calculateTimeRemaining(current.endTime) : 0;
  const isActive = current !== null;
  const isLate = false; // Will be determined by task status
  const isUpcoming = !isActive && next !== null;
  
  let minutesUntilNext = 0;
  if (next) {
    const nowMinutes = timeToMinutes(now);
    const nextMinutes = timeToMinutes(next.startTime);
    minutesUntilNext = nextMinutes > nowMinutes
      ? nextMinutes - nowMinutes
      : (24 * 60 - nowMinutes) + nextMinutes;
  }
  
  return {
    current,
    next,
    previous,
    remainingSeconds,
    isActive,
    isLate,
    isUpcoming,
    minutesUntilNext,
  };
}

/**
 * Find available time slots for rescheduling
 */
export function findAvailableSlots(
  scheduleBlocks: ScheduleBlock[],
  requiredMinutes: number,
  dayOfWeek: number,
  excludeFixed: boolean = true
): Array<{ startTime: string; endTime: string; duration: number }> {
  const slots: Array<{ startTime: string; endTime: string; duration: number }> = [];
  
  // Filter blocks for the specified day
  const dayBlocks = scheduleBlocks
    .filter(block => {
      if (block.dayOfWeek !== dayOfWeek) return false;
      if (excludeFixed && block.type === BlockType.FIXED) return true;
      return !excludeFixed;
    })
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
  
  // Find gaps between blocks
  let currentTime = 0; // Start of day (00:00)
  
  for (const block of dayBlocks) {
    const blockStart = timeToMinutes(block.startTime);
    const blockEnd = timeToMinutes(block.endTime);
    
    // Check if there's a gap before this block
    if (blockStart - currentTime >= requiredMinutes) {
      slots.push({
        startTime: minutesToTime(currentTime),
        endTime: minutesToTime(blockStart),
        duration: blockStart - currentTime,
      });
    }
    
    currentTime = Math.max(currentTime, blockEnd);
  }
  
  // Check for gap at end of day
  const endOfDay = 24 * 60; // 24:00
  if (endOfDay - currentTime >= requiredMinutes) {
    slots.push({
      startTime: minutesToTime(currentTime),
      endTime: '23:59',
      duration: endOfDay - currentTime,
    });
  }
  
  return slots;
}

/**
 * Calculate daily status based on tasks and time
 */
export function calculateDailyStatus(
  tasks: Task[],
  scheduleBlocks: ScheduleBlock[],
  currentTime?: string
): DailyStatus {
  const now = currentTime || getCurrentTime();
  const nowMinutes = timeToMinutes(now);
  
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(
    t => t.status === TaskStatus.COMPLETED || t.status === TaskStatus.PARTIALLY_COMPLETED
  ).length;
  const remainingTasks = totalTasks - completedTasks;
  
  // Calculate remaining available time (excluding fixed blocks)
  const flexibleBlocks = scheduleBlocks.filter(
    block => block.type === BlockType.FLEXIBLE && timeToMinutes(block.startTime) >= nowMinutes
  );
  const availableTimeMinutes = flexibleBlocks.reduce((sum, block) => sum + block.duration, 0);
  
  // Calculate required time for remaining tasks
  const requiredTimeMinutes = tasks
    .filter(t => t.status === TaskStatus.PENDING || t.status === TaskStatus.IN_PROGRESS)
    .reduce((sum, task) => sum + task.duration, 0);
  
  let status: 'ON_TRACK' | 'SLIGHTLY_BEHIND' | 'SIGNIFICANTLY_BEHIND' = 'ON_TRACK';
  let message = 'You are on track to complete today\'s tasks.';
  
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const timeBuffer = availableTimeMinutes - requiredTimeMinutes;
  
  if (completionRate < 50 && timeBuffer < 0) {
    status = 'SIGNIFICANTLY_BEHIND';
    message = `You are significantly behind. ${remainingTasks} tasks remain with limited time.`;
  } else if (completionRate < 70 || timeBuffer < 30) {
    status = 'SLIGHTLY_BEHIND';
    message = `You are slightly behind, but today's remaining tasks are still achievable.`;
  } else {
    message = `You are on track. ${remainingTasks} tasks remaining with sufficient time.`;
  }
  
  return {
    status,
    message,
    completedTasks,
    totalTasks,
    remainingTasks,
    availableTimeMinutes,
    requiredTimeMinutes,
  };
}

/**
 * Suggest best time slot for rescheduling
 */
export function suggestRescheduleSlot(
  scheduleBlocks: ScheduleBlock[],
  taskDuration: number,
  dayOfWeek: number,
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM'
): { startTime: string; endTime: string } | null {
  const slots = findAvailableSlots(scheduleBlocks, taskDuration, dayOfWeek, true);
  
  if (slots.length === 0) return null;
  
  // For high priority, suggest earliest available slot
  if (priority === 'CRITICAL' || priority === 'HIGH') {
    const slot = slots[0];
    const startMinutes = timeToMinutes(slot.startTime);
    return {
      startTime: slot.startTime,
      endTime: minutesToTime(startMinutes + taskDuration),
    };
  }
  
  // For medium/low priority, try to find evening slots (after 18:00)
  const eveningSlots = slots.filter(slot => timeToMinutes(slot.startTime) >= 18 * 60);
  const preferredSlots = eveningSlots.length > 0 ? eveningSlots : slots;
  
  const slot = preferredSlots[0];
  const startMinutes = timeToMinutes(slot.startTime);
  
  return {
    startTime: slot.startTime,
    endTime: minutesToTime(startMinutes + taskDuration),
  };
}

/**
 * Check if there's a schedule conflict
 */
export function hasScheduleConflict(
  scheduleBlocks: ScheduleBlock[],
  dayOfWeek: number,
  startTime: string,
  endTime: string,
  excludeBlockId?: string
): boolean {
  const newStart = timeToMinutes(startTime);
  const newEnd = timeToMinutes(endTime);
  
  const dayBlocks = scheduleBlocks.filter(
    block => block.dayOfWeek === dayOfWeek && block.id !== excludeBlockId
  );
  
  for (const block of dayBlocks) {
    const blockStart = timeToMinutes(block.startTime);
    const blockEnd = timeToMinutes(block.endTime);
    
    // Check for overlap
    if (
      (newStart >= blockStart && newStart < blockEnd) ||
      (newEnd > blockStart && newEnd <= blockEnd) ||
      (newStart <= blockStart && newEnd >= blockEnd)
    ) {
      return true;
    }
  }
  
  return false;
}

/**
 * Calculate productivity score
 */
export function calculateProductivityScore(
  completedTasks: number,
  totalTasks: number,
  focusMinutes: number,
  targetFocusMinutes: number,
  sleepHours: number,
  targetSleepHours: number,
  phoneMinutes: number,
  phoneLimit: number,
  weights: {
    taskCompletion: number;
    focusTime: number;
    sleep: number;
    phone: number;
  }
): number {
  const taskScore = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const focusScore = Math.min((focusMinutes / targetFocusMinutes) * 100, 100);
  const sleepScore = Math.min((sleepHours / targetSleepHours) * 100, 100);
  const phoneScore = phoneMinutes <= phoneLimit ? 100 : Math.max(0, 100 - ((phoneMinutes - phoneLimit) / phoneLimit) * 100);
  
  const totalScore =
    taskScore * weights.taskCompletion +
    focusScore * weights.focusTime +
    sleepScore * weights.sleep +
    phoneScore * weights.phone;
  
  return Math.round(Math.min(totalScore, 100));
}
