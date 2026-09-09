'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Settings as SettingsIcon,
  User,
  Moon,
  Bell,
  Clock,
  Smartphone,
  Target,
  Download,
  Upload,
  Palette,
} from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    // Sleep
    sleepStartTime: '01:00',
    sleepEndTime: '07:30',
    sleepTarget: 6.5,

    // Phone
    phoneLimit: 90,

    // Study Preferences
    pomodoroWork: 25,
    pomodoroBreak: 5,
    focusModeEnabled: true,

    // Notifications
    notificationsEnabled: true,
    taskReminders: true,
    reminderMinutes: 15,
    quietHoursStart: '23:00',
    quietHoursEnd: '08:00',

    // Theme
    theme: 'dark',

    // Weekly Targets
    weeklyStudyHours: 40,
    weeklyAcademicHours: 22,
    weeklyAIHours: 12,
    weeklyResearchHours: 6,
  });

  const handleToggle = (key: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary/10 p-3 rounded-lg">
              <SettingsIcon className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Settings</h1>
              <p className="text-lg text-muted-foreground">
                Customize your study world
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg border bg-background"
                  defaultValue="Shawon"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-2 rounded-lg border bg-background"
                  defaultValue="demo@mystudyworld.com"
                />
              </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Theme</div>
                  <div className="text-sm text-muted-foreground">
                    Choose your preferred color theme
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={settings.theme === 'light' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSettings({ ...settings, theme: 'light' })}
                  >
                    Light
                  </Button>
                  <Button
                    variant={settings.theme === 'dark' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSettings({ ...settings, theme: 'dark' })}
                  >
                    Dark
                  </Button>
                  <Button
                    variant={settings.theme === 'system' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSettings({ ...settings, theme: 'system' })}
                  >
                    System
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sleep Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Moon className="h-5 w-5" />
                Sleep Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Sleep Time
                  </label>
                  <input
                    type="time"
                    className="w-full px-4 py-2 rounded-lg border bg-background"
                    value={settings.sleepStartTime}
                    onChange={(e) =>
                      setSettings({ ...settings, sleepStartTime: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Wake Time</label>
                  <input
                    type="time"
                    className="w-full px-4 py-2 rounded-lg border bg-background"
                    value={settings.sleepEndTime}
                    onChange={(e) =>
                      setSettings({ ...settings, sleepEndTime: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Target Sleep Hours: {settings.sleepTarget}h
                </label>
                <input
                  type="range"
                  min="4"
                  max="12"
                  step="0.5"
                  value={settings.sleepTarget}
                  onChange={(e) =>
                    setSettings({ ...settings, sleepTarget: parseFloat(e.target.value) })
                  }
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Phone Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Phone Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Daily Limit: {settings.phoneLimit} minutes
                </label>
                <input
                  type="range"
                  min="30"
                  max="180"
                  step="15"
                  value={settings.phoneLimit}
                  onChange={(e) =>
                    setSettings({ ...settings, phoneLimit: parseInt(e.target.value) })
                  }
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>30 min</span>
                  <span>180 min</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Study Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Study Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Focus Mode</div>
                  <div className="text-sm text-muted-foreground">
                    Enable distraction-free study sessions
                  </div>
                </div>
                <Switch
                  checked={settings.focusModeEnabled}
                  onCheckedChange={() => handleToggle('focusModeEnabled')}
                />
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Pomodoro Work: {settings.pomodoroWork} min
                  </label>
                  <input
                    type="range"
                    min="15"
                    max="60"
                    step="5"
                    value={settings.pomodoroWork}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        pomodoroWork: parseInt(e.target.value),
                      })
                    }
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Pomodoro Break: {settings.pomodoroBreak} min
                  </label>
                  <input
                    type="range"
                    min="3"
                    max="15"
                    step="1"
                    value={settings.pomodoroBreak}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        pomodoroBreak: parseInt(e.target.value),
                      })
                    }
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Enable Notifications</div>
                  <div className="text-sm text-muted-foreground">
                    Receive task reminders and alerts
                  </div>
                </div>
                <Switch
                  checked={settings.notificationsEnabled}
                  onCheckedChange={() => handleToggle('notificationsEnabled')}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Task Reminders</div>
                  <div className="text-sm text-muted-foreground">
                    Get notified before tasks start
                  </div>
                </div>
                <Switch
                  checked={settings.taskReminders}
                  onCheckedChange={() => handleToggle('taskReminders')}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Reminder Time: {settings.reminderMinutes} minutes before
                </label>
                <input
                  type="range"
                  min="5"
                  max="30"
                  step="5"
                  value={settings.reminderMinutes}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      reminderMinutes: parseInt(e.target.value),
                    })
                  }
                  className="w-full"
                />
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Quiet Hours Start
                  </label>
                  <input
                    type="time"
                    className="w-full px-4 py-2 rounded-lg border bg-background"
                    value={settings.quietHoursStart}
                    onChange={(e) =>
                      setSettings({ ...settings, quietHoursStart: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Quiet Hours End
                  </label>
                  <input
                    type="time"
                    className="w-full px-4 py-2 rounded-lg border bg-background"
                    value={settings.quietHoursEnd}
                    onChange={(e) =>
                      setSettings({ ...settings, quietHoursEnd: e.target.value })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Targets */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Weekly Targets
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Total Study Hours: {settings.weeklyStudyHours}h
                </label>
                <input
                  type="range"
                  min="10"
                  max="70"
                  step="5"
                  value={settings.weeklyStudyHours}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      weeklyStudyHours: parseInt(e.target.value),
                    })
                  }
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Academic Hours: {settings.weeklyAcademicHours}h
                </label>
                <input
                  type="range"
                  min="5"
                  max="40"
                  step="2"
                  value={settings.weeklyAcademicHours}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      weeklyAcademicHours: parseInt(e.target.value),
                    })
                  }
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  AI/ML Hours: {settings.weeklyAIHours}h
                </label>
                <input
                  type="range"
                  min="3"
                  max="30"
                  step="1"
                  value={settings.weeklyAIHours}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      weeklyAIHours: parseInt(e.target.value),
                    })
                  }
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Research Hours: {settings.weeklyResearchHours}h
                </label>
                <input
                  type="range"
                  min="2"
                  max="20"
                  step="1"
                  value={settings.weeklyResearchHours}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      weeklyResearchHours: parseInt(e.target.value),
                    })
                  }
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Export Data
                </Button>
                <Button variant="outline" className="w-full">
                  <Upload className="mr-2 h-4 w-4" />
                  Import Data
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-4">
            <Button variant="outline">Reset to Defaults</Button>
            <Button size="lg">Save Settings</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
