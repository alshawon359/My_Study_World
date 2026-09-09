import { create } from 'zustand';
import { ScheduleBlock, Task, TaskStatus } from '@prisma/client';
import { getCurrentActivity, CurrentActivityInfo } from './scheduling-engine';

interface AppStore {
  // Real-time state
  currentTime: string;
  currentActivity: CurrentActivityInfo | null;
  
  // Schedule data
  scheduleBlocks: ScheduleBlock[];
  todayTasks: Task[];
  
  // UI state
  focusModeActive: boolean;
  currentTaskId: string | null;
  
  // Actions
  setCurrentTime: (time: string) => void;
  setScheduleBlocks: (blocks: ScheduleBlock[]) => void;
  setTodayTasks: (tasks: Task[]) => void;
  updateCurrentActivity: () => void;
  setFocusMode: (active: boolean) => void;
  setCurrentTask: (taskId: string | null) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  currentTime: new Date().toTimeString().slice(0, 5),
  currentActivity: null,
  scheduleBlocks: [],
  todayTasks: [],
  focusModeActive: false,
  currentTaskId: null,
  
  setCurrentTime: (time) => {
    set({ currentTime: time });
    get().updateCurrentActivity();
  },
  
  setScheduleBlocks: (blocks) => {
    set({ scheduleBlocks: blocks });
    get().updateCurrentActivity();
  },
  
  setTodayTasks: (tasks) => set({ todayTasks: tasks }),
  
  updateCurrentActivity: () => {
    const { scheduleBlocks, currentTime } = get();
    const activity = getCurrentActivity(scheduleBlocks, currentTime);
    set({ currentActivity: activity });
  },
  
  setFocusMode: (active) => set({ focusModeActive: active }),
  
  setCurrentTask: (taskId) => set({ currentTaskId: taskId }),
  
  updateTaskStatus: (taskId, status) => {
    set((state) => ({
      todayTasks: state.todayTasks.map((task) =>
        task.id === taskId ? { ...task, status } : task
      ),
    }));
  },
}));

// Hook to keep current time updated
export function useRealtimeClock() {
  const setCurrentTime = useAppStore((state) => state.setCurrentTime);
  
  React.useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const timeString = now.toTimeString().slice(0, 5);
      setCurrentTime(timeString);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [setCurrentTime]);
}

import React from 'react';
