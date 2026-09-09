'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Target,
  Plus,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Circle,
  Flag,
  Clock,
  Edit,
  Trash2,
  Save,
  Trophy,
} from 'lucide-react';

interface Goal {
  id: string;
  title: string;
  description: string;
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'LONG_TERM';
  category: 'ACADEMIC' | 'AI_ML' | 'RESEARCH' | 'PERSONAL' | 'CAREER' | 'HEALTH' | 'HABIT';
  progress: number;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  completed: boolean;
  createdAt: string;
}

const INITIAL_GOALS: Goal[] = [
  {
    id: '1',
    title: 'Study 40 hours this week',
    description: 'Complete weekly study target',
    type: 'WEEKLY',
    category: 'ACADEMIC',
    progress: 0,
    targetValue: 40,
    currentValue: 0,
    unit: 'hours',
    deadline: '2026-09-13',
    priority: 'HIGH',
    completed: false,
    createdAt: new Date().toISOString(),
  },
];

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
  const [progressValue, setProgressValue] = useState('');

  const [goalForm, setGoalForm] = useState({
    title: '',
    description: '',
    type: 'DAILY' as Goal['type'],
    category: 'ACADEMIC' as Goal['category'],
    targetValue: '',
    unit: 'hours',
    deadline: '',
    priority: 'MEDIUM' as Goal['priority'],
  });

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = () => {
    const saved = localStorage.getItem('studyGoals');
    if (saved) {
      setGoals(JSON.parse(saved));
    } else {
      setGoals(INITIAL_GOALS);
      localStorage.setItem('studyGoals', JSON.stringify(INITIAL_GOALS));
    }
  };

  const saveGoals = (updatedGoals: Goal[]) => {
    localStorage.setItem('studyGoals', JSON.stringify(updatedGoals));
    setGoals(updatedGoals);
  };

  const handleAddGoal = () => {
    if (!goalForm.title || !goalForm.targetValue) {
      alert('Please fill in title and target value');
      return;
    }

    const newGoal: Goal = {
      id: Date.now().toString(),
      title: goalForm.title,
      description: goalForm.description,
      type: goalForm.type,
      category: goalForm.category,
      progress: 0,
      targetValue: parseFloat(goalForm.targetValue),
      currentValue: 0,
      unit: goalForm.unit,
      deadline: goalForm.deadline,
      priority: goalForm.priority,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    saveGoals([...goals, newGoal]);
    setGoalForm({
      title: '',
      description: '',
      type: 'DAILY',
      category: 'ACADEMIC',
      targetValue: '',
      unit: 'hours',
      deadline: '',
      priority: 'MEDIUM',
    });
    setIsAddingGoal(false);
  };

  const handleUpdateProgress = () => {
    if (!selectedGoal || !progressValue) return;

    const newCurrentValue = parseFloat(progressValue);
    const newProgress = Math.min((newCurrentValue / selectedGoal.targetValue) * 100, 100);
    const completed = newProgress >= 100;

    const updated = goals.map(g =>
      g.id === selectedGoal.id
        ? { ...g, currentValue: newCurrentValue, progress: newProgress, completed }
        : g
    );
    saveGoals(updated);
    setProgressValue('');
    setIsUpdatingProgress(false);
    setSelectedGoal(null);
  };

  const handleToggleComplete = (id: string) => {
    const updated = goals.map(g =>
      g.id === id
        ? {
            ...g,
            completed: !g.completed,
            progress: !g.completed ? 100 : g.progress,
            currentValue: !g.completed ? g.targetValue : g.currentValue,
          }
        : g
    );
    saveGoals(updated);
  };

  const handleDeleteGoal = (id: string) => {
    if (confirm('Delete this goal?')) {
      saveGoals(goals.filter(g => g.id !== id));
    }
  };

  const handleEditGoal = () => {
    if (!selectedGoal || !goalForm.title || !goalForm.targetValue) return;

    const updated = goals.map(g =>
      g.id === selectedGoal.id
        ? {
            ...g,
            title: goalForm.title,
            description: goalForm.description,
            type: goalForm.type,
            category: goalForm.category,
            targetValue: parseFloat(goalForm.targetValue),
            unit: goalForm.unit,
            deadline: goalForm.deadline,
            priority: goalForm.priority,
            progress: (g.currentValue / parseFloat(goalForm.targetValue)) * 100,
          }
        : g
    );
    saveGoals(updated);
    setIsEditingGoal(false);
    setSelectedGoal(null);
  };

  const groupedGoals = {
    DAILY: goals.filter(g => g.type === 'DAILY'),
    WEEKLY: goals.filter(g => g.type === 'WEEKLY'),
    MONTHLY: goals.filter(g => g.type === 'MONTHLY'),
    LONG_TERM: goals.filter(g => g.type === 'LONG_TERM'),
  };

  const stats = {
    total: goals.length,
    completed: goals.filter(g => g.completed).length,
    inProgress: goals.filter(g => g.progress > 0 && !g.completed).length,
    notStarted: goals.filter(g => g.progress === 0).length,
    avgProgress: goals.length > 0 ? goals.reduce((sum, g) => sum + g.progress, 0) / goals.length : 0,
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-100 text-red-700 dark:bg-red-950';
      case 'HIGH': return 'bg-orange-100 text-orange-700 dark:bg-orange-950';
      case 'MEDIUM': return 'bg-blue-100 text-blue-700 dark:bg-blue-950';
      case 'LOW': return 'bg-gray-100 text-gray-700 dark:bg-gray-800';
      default: return '';
    }
  };

  const renderGoalCard = (goal: Goal) => (
    <Card
      key={goal.id}
      className={`hover:shadow-lg transition-all ${
        goal.completed
          ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 border-green-300'
          : 'hover:border-primary'
      }`}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">{goal.category}</Badge>
              <Badge className={getPriorityColor(goal.priority)}>{goal.priority}</Badge>
            </div>
            <h3 className="font-semibold text-lg mb-1">{goal.title}</h3>
            {goal.description && (
              <p className="text-sm text-muted-foreground mb-2">{goal.description}</p>
            )}
            {goal.deadline && (
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Due: {new Date(goal.deadline).toLocaleDateString()}
              </p>
            )}
          </div>
          <button onClick={() => handleToggleComplete(goal.id)}>
            {goal.completed ? (
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            ) : (
              <Circle className="h-8 w-8 text-gray-400 hover:text-primary" />
            )}
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold">
              {goal.currentValue} / {goal.targetValue} {goal.unit}
            </span>
          </div>
          <Progress value={goal.progress} className="h-2" />
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-primary">{Math.round(goal.progress)}% Complete</span>
            {!goal.completed && (
              <span className="text-muted-foreground">
                {(goal.targetValue - goal.currentValue).toFixed(1)} {goal.unit} remaining
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          {!goal.completed && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => {
                setSelectedGoal(goal);
                setProgressValue(goal.currentValue.toString());
                setIsUpdatingProgress(true);
              }}
            >
              Update Progress
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setSelectedGoal(goal);
              setGoalForm({
                title: goal.title,
                description: goal.description,
                type: goal.type,
                category: goal.category,
                targetValue: goal.targetValue.toString(),
                unit: goal.unit,
                deadline: goal.deadline,
                priority: goal.priority,
              });
              setIsEditingGoal(true);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleDeleteGoal(goal.id)}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-teal-600 p-4 rounded-xl shadow-lg">
                <Target className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Goals & Objectives</h1>
                <p className="text-lg text-muted-foreground">Track your progress and milestones</p>
              </div>
            </div>
            <Dialog open={isAddingGoal} onOpenChange={setIsAddingGoal}>
              <DialogTrigger asChild>
                <Button size="lg">
                  <Plus className="mr-2 h-5 w-5" />
                  New Goal
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Goal</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label>Goal Title *</Label>
                    <Input
                      placeholder="e.g., Study 40 hours this week"
                      value={goalForm.title}
                      onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Optional description"
                      value={goalForm.description}
                      onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Type</Label>
                      <Select value={goalForm.type} onValueChange={(value: any) => setGoalForm({ ...goalForm, type: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DAILY">Daily</SelectItem>
                          <SelectItem value="WEEKLY">Weekly</SelectItem>
                          <SelectItem value="MONTHLY">Monthly</SelectItem>
                          <SelectItem value="LONG_TERM">Long-term</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Select value={goalForm.category} onValueChange={(value: any) => setGoalForm({ ...goalForm, category: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ACADEMIC">Academic</SelectItem>
                          <SelectItem value="AI_ML">AI/ML</SelectItem>
                          <SelectItem value="RESEARCH">Research</SelectItem>
                          <SelectItem value="PERSONAL">Personal</SelectItem>
                          <SelectItem value="CAREER">Career</SelectItem>
                          <SelectItem value="HEALTH">Health</SelectItem>
                          <SelectItem value="HABIT">Habit</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Target Value *</Label>
                      <Input
                        type="number"
                        placeholder="e.g., 40"
                        value={goalForm.targetValue}
                        onChange={(e) => setGoalForm({ ...goalForm, targetValue: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Unit</Label>
                      <Input
                        placeholder="e.g., hours, tasks, papers"
                        value={goalForm.unit}
                        onChange={(e) => setGoalForm({ ...goalForm, unit: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Deadline</Label>
                      <Input
                        type="date"
                        value={goalForm.deadline}
                        onChange={(e) => setGoalForm({ ...goalForm, deadline: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Priority</Label>
                      <Select value={goalForm.priority} onValueChange={(value: any) => setGoalForm({ ...goalForm, priority: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CRITICAL">Critical</SelectItem>
                          <SelectItem value="HIGH">High</SelectItem>
                          <SelectItem value="MEDIUM">Medium</SelectItem>
                          <SelectItem value="LOW">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleAddGoal} className="flex-1">
                      <Save className="mr-2 h-4 w-4" />
                      Create Goal
                    </Button>
                    <Button variant="outline" onClick={() => setIsAddingGoal(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total Goals</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
                <div className="text-sm text-muted-foreground">In Progress</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-gray-600">{stats.notStarted}</div>
                <div className="text-sm text-muted-foreground">Not Started</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-purple-600">{Math.round(stats.avgProgress)}%</div>
                <div className="text-sm text-muted-foreground">Avg Progress</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Goals by Type */}
        <div className="space-y-8">
          {(['DAILY', 'WEEKLY', 'MONTHLY', 'LONG_TERM'] as const).map(type => {
            const typeGoals = groupedGoals[type];
            if (typeGoals.length === 0) return null;

            const typeIcon = type === 'DAILY' ? <Calendar className="h-5 w-5" />
              : type === 'WEEKLY' ? <Clock className="h-5 w-5" />
              : type === 'MONTHLY' ? <TrendingUp className="h-5 w-5" />
              : <Flag className="h-5 w-5" />;

            const typeLabel = type.replace('_', '-').toLowerCase();

            return (
              <div key={type}>
                <div className="flex items-center gap-2 mb-4">
                  {typeIcon}
                  <h2 className="text-2xl font-bold capitalize">{typeLabel} Goals</h2>
                  <Badge variant="secondary">{typeGoals.length}</Badge>
                </div>
                <div className={`grid grid-cols-1 ${type === 'LONG_TERM' ? '' : 'md:grid-cols-2'} gap-4`}>
                  {typeGoals.map(renderGoalCard)}
                </div>
              </div>
            );
          })}

          {goals.length === 0 && (
            <Card className="p-12 text-center">
              <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No goals yet</h3>
              <p className="text-muted-foreground mb-4">Start by creating your first goal</p>
              <Button onClick={() => setIsAddingGoal(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create First Goal
              </Button>
            </Card>
          )}
        </div>

        {/* Update Progress Dialog */}
        <Dialog open={isUpdatingProgress} onOpenChange={setIsUpdatingProgress}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Progress</DialogTitle>
            </DialogHeader>
            {selectedGoal && (
              <div className="space-y-4 py-4">
                <div>
                  <Label>Goal: {selectedGoal.title}</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Target: {selectedGoal.targetValue} {selectedGoal.unit}
                  </p>
                </div>
                <div>
                  <Label>Current Value ({selectedGoal.unit})</Label>
                  <Input
                    type="number"
                    placeholder={`Enter value (0-${selectedGoal.targetValue})`}
                    value={progressValue}
                    onChange={(e) => setProgressValue(e.target.value)}
                    step="0.1"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleUpdateProgress} className="flex-1">
                    <Save className="mr-2 h-4 w-4" />
                    Update
                  </Button>
                  <Button variant="outline" onClick={() => setIsUpdatingProgress(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Goal Dialog */}
        <Dialog open={isEditingGoal} onOpenChange={setIsEditingGoal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Goal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Goal Title *</Label>
                <Input
                  placeholder="e.g., Study 40 hours this week"
                  value={goalForm.title}
                  onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  placeholder="Optional description"
                  value={goalForm.description}
                  onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <Select value={goalForm.type} onValueChange={(value: any) => setGoalForm({ ...goalForm, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DAILY">Daily</SelectItem>
                      <SelectItem value="WEEKLY">Weekly</SelectItem>
                      <SelectItem value="MONTHLY">Monthly</SelectItem>
                      <SelectItem value="LONG_TERM">Long-term</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={goalForm.category} onValueChange={(value: any) => setGoalForm({ ...goalForm, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACADEMIC">Academic</SelectItem>
                      <SelectItem value="AI_ML">AI/ML</SelectItem>
                      <SelectItem value="RESEARCH">Research</SelectItem>
                      <SelectItem value="PERSONAL">Personal</SelectItem>
                      <SelectItem value="CAREER">Career</SelectItem>
                      <SelectItem value="HEALTH">Health</SelectItem>
                      <SelectItem value="HABIT">Habit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Target Value *</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 40"
                    value={goalForm.targetValue}
                    onChange={(e) => setGoalForm({ ...goalForm, targetValue: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Unit</Label>
                  <Input
                    placeholder="e.g., hours, tasks, papers"
                    value={goalForm.unit}
                    onChange={(e) => setGoalForm({ ...goalForm, unit: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Deadline</Label>
                  <Input
                    type="date"
                    value={goalForm.deadline}
                    onChange={(e) => setGoalForm({ ...goalForm, deadline: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Priority</Label>
                  <Select value={goalForm.priority} onValueChange={(value: any) => setGoalForm({ ...goalForm, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CRITICAL">Critical</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="LOW">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleEditGoal} className="flex-1">
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setIsEditingGoal(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
