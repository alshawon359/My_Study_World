'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Brain,
  CheckCircle2,
  Circle,
  Plus,
  Edit,
  Trash2,
  PlayCircle,
  Video,
  Link2,
  Save,
  X,
  Award,
  Clock,
  Target,
} from 'lucide-react';

interface Topic {
  id: string;
  name: string;
  estimatedTime: string;
  completed: boolean;
  videoLinks: string[];
  resources: string;
}

interface Level {
  id: string;
  title: string;
  description: string;
  estimatedWeeks: string;
  topics: Topic[];
  status: 'not-started' | 'in-progress' | 'completed';
}

const INITIAL_LEVELS: Level[] = [
  {
    id: '1',
    title: 'Testing the Waters',
    description: 'Get familiar with the ML universe. Learn a bit of everything.',
    estimatedWeeks: '6-8 Weeks',
    status: 'not-started',
    topics: [
      {
        id: '1-1',
        name: 'Learn Python',
        estimatedTime: '2 weeks',
        completed: false,
        videoLinks: ['https://www.youtube.com/watch?v=...'],
        resources: 'Basics, OOP, Exception Handling, File Handling, Flask',
      },
      {
        id: '1-2',
        name: 'Learn Numpy',
        estimatedTime: '3 Days',
        completed: false,
        videoLinks: [],
        resources: 'Arrays, Operations, Broadcasting',
      },
      {
        id: '1-3',
        name: 'Learn Pandas',
        estimatedTime: '4 Days',
        completed: false,
        videoLinks: [],
        resources: 'DataFrames, Series, Data Manipulation',
      },
    ],
  },
  {
    id: '2',
    title: 'Gaining Conceptual Depth',
    description: 'Learn core machine learning concepts and algorithms.',
    estimatedWeeks: '6-8 Weeks',
    status: 'not-started',
    topics: [
      {
        id: '2-1',
        name: 'Advance Statistics',
        estimatedTime: '1 Week',
        completed: false,
        videoLinks: [],
        resources: 'Covariance, Correlation, Hypothesis Testing',
      },
      {
        id: '2-2',
        name: 'ML Algorithms',
        estimatedTime: '3 Weeks',
        completed: false,
        videoLinks: [],
        resources: 'Linear Regression, Decision Trees, Random Forest, SVM',
      },
    ],
  },
];

export default function AIRoadmapPage() {
  const [levels, setLevels] = useState<Level[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [isAddingTopic, setIsAddingTopic] = useState(false);
  const [isEditingTopic, setIsEditingTopic] = useState(false);
  const [isAddingLevel, setIsAddingLevel] = useState(false);

  const [topicForm, setTopicForm] = useState({
    name: '',
    estimatedTime: '',
    resources: '',
    videoLinks: '',
  });

  const [levelForm, setLevelForm] = useState({
    title: '',
    description: '',
    estimatedWeeks: '',
  });

  useEffect(() => {
    loadLevels();
  }, []);

  const loadLevels = () => {
    const saved = localStorage.getItem('aiRoadmapLevels');
    if (saved) {
      setLevels(JSON.parse(saved));
    } else {
      setLevels(INITIAL_LEVELS);
      localStorage.setItem('aiRoadmapLevels', JSON.stringify(INITIAL_LEVELS));
    }
  };

  const saveLevels = (updatedLevels: Level[]) => {
    localStorage.setItem('aiRoadmapLevels', JSON.stringify(updatedLevels));
    setLevels(updatedLevels);
  };

  const toggleTopicComplete = (levelId: string, topicId: string) => {
    const updated = levels.map(level => {
      if (level.id === levelId) {
        const updatedTopics = level.topics.map(topic =>
          topic.id === topicId ? { ...topic, completed: !topic.completed } : topic
        );
        const completedCount = updatedTopics.filter(t => t.completed).length;
        const status = completedCount === 0 ? 'not-started' 
          : completedCount === updatedTopics.length ? 'completed' 
          : 'in-progress';
        return { ...level, topics: updatedTopics, status };
      }
      return level;
    });
    saveLevels(updated);
  };

  const handleAddTopic = () => {
    if (!selectedLevel || !topicForm.name) {
      alert('Please enter topic name');
      return;
    }

    const newTopic: Topic = {
      id: Date.now().toString(),
      name: topicForm.name,
      estimatedTime: topicForm.estimatedTime || '1 week',
      completed: false,
      videoLinks: topicForm.videoLinks.split('\n').filter(l => l.trim()),
      resources: topicForm.resources,
    };

    const updated = levels.map(level =>
      level.id === selectedLevel.id
        ? { ...level, topics: [...level.topics, newTopic] }
        : level
    );
    saveLevels(updated);
    setTopicForm({ name: '', estimatedTime: '', resources: '', videoLinks: '' });
    setIsAddingTopic(false);
  };

  const handleEditTopic = () => {
    if (!selectedLevel || !selectedTopic || !topicForm.name) return;

    const updated = levels.map(level => {
      if (level.id === selectedLevel.id) {
        const updatedTopics = level.topics.map(topic =>
          topic.id === selectedTopic.id
            ? {
                ...topic,
                name: topicForm.name,
                estimatedTime: topicForm.estimatedTime,
                resources: topicForm.resources,
                videoLinks: topicForm.videoLinks.split('\n').filter(l => l.trim()),
              }
            : topic
        );
        return { ...level, topics: updatedTopics };
      }
      return level;
    });
    saveLevels(updated);
    setTopicForm({ name: '', estimatedTime: '', resources: '', videoLinks: '' });
    setIsEditingTopic(false);
    setSelectedTopic(null);
  };

  const handleDeleteTopic = (levelId: string, topicId: string) => {
    if (confirm('Delete this topic?')) {
      const updated = levels.map(level =>
        level.id === levelId
          ? { ...level, topics: level.topics.filter(t => t.id !== topicId) }
          : level
      );
      saveLevels(updated);
    }
  };

  const handleAddLevel = () => {
    if (!levelForm.title) {
      alert('Please enter level title');
      return;
    }

    const newLevel: Level = {
      id: Date.now().toString(),
      title: levelForm.title,
      description: levelForm.description,
      estimatedWeeks: levelForm.estimatedWeeks || '6-8 Weeks',
      status: 'not-started',
      topics: [],
    };

    saveLevels([...levels, newLevel]);
    setLevelForm({ title: '', description: '', estimatedWeeks: '' });
    setIsAddingLevel(false);
  };

  const handleDeleteLevel = (levelId: string) => {
    if (confirm('Delete this entire level?')) {
      saveLevels(levels.filter(l => l.id !== levelId));
    }
  };

  const calculateStats = () => {
    const totalTopics = levels.reduce((sum, level) => sum + level.topics.length, 0);
    const completedTopics = levels.reduce(
      (sum, level) => sum + level.topics.filter(t => t.completed).length,
      0
    );
    const completedLevels = levels.filter(l => l.status === 'completed').length;
    const progress = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;

    return { totalTopics, completedTopics, completedLevels, totalLevels: levels.length, progress };
  };

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-xl shadow-lg">
                <Brain className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI/ML Learning Roadmap 2024
                </h1>
                <p className="text-lg text-muted-foreground">
                  Your personalized path to mastering Machine Learning
                </p>
              </div>
            </div>
            <Dialog open={isAddingLevel} onOpenChange={setIsAddingLevel}>
              <DialogTrigger asChild>
                <Button size="lg">
                  <Plus className="mr-2 h-5 w-5" />
                  Add Level
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Level</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label>Level Title *</Label>
                    <Input
                      placeholder="e.g., Advanced Deep Learning"
                      value={levelForm.title}
                      onChange={(e) => setLevelForm({ ...levelForm, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Describe this learning level"
                      value={levelForm.description}
                      onChange={(e) => setLevelForm({ ...levelForm, description: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Estimated Time</Label>
                    <Input
                      placeholder="e.g., 6-8 Weeks"
                      value={levelForm.estimatedWeeks}
                      onChange={(e) => setLevelForm({ ...levelForm, estimatedWeeks: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddLevel} className="flex-1">
                      <Save className="mr-2 h-4 w-4" />
                      Add Level
                    </Button>
                    <Button variant="outline" onClick={() => setIsAddingLevel(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats */}
          <Card className="border-2 shadow-xl bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-gray-800">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Target className="h-4 w-4" />
                    Overall Progress
                  </div>
                  <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {Math.round(stats.progress)}%
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Award className="h-4 w-4" />
                    Levels Completed
                  </div>
                  <div className="text-4xl font-bold">
                    {stats.completedLevels} / {stats.totalLevels}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Topics Completed
                  </div>
                  <div className="text-4xl font-bold">
                    {stats.completedTopics} / {stats.totalTopics}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Clock className="h-4 w-4" />
                    Est. Time Remaining
                  </div>
                  <div className="text-4xl font-bold">
                    {(stats.totalLevels - stats.completedLevels) * 7} weeks
                  </div>
                </div>
              </div>
              <Progress value={stats.progress} className="h-3 mt-6" />
            </CardContent>
          </Card>
        </div>

        {/* Levels */}
        <div className="space-y-6">
          {levels.map((level, index) => {
            const completedTopics = level.topics.filter(t => t.completed).length;
            const totalTopics = level.topics.length;
            const levelProgress = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;

            return (
              <Card
                key={level.id}
                className={`transition-all shadow-lg hover:shadow-2xl ${
                  level.status === 'completed'
                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 border-green-300'
                    : level.status === 'in-progress'
                    ? 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 border-blue-300'
                    : 'bg-white dark:bg-gray-900'
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <div
                          className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${
                            level.status === 'completed'
                              ? 'bg-green-500 text-white'
                              : level.status === 'in-progress'
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-600'
                          }`}
                        >
                          {level.status === 'completed' ? (
                            <CheckCircle2 className="h-8 w-8" />
                          ) : (
                            index + 1
                          )}
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-2xl mb-1">
                            Level {index + 1}: {level.title}
                          </CardTitle>
                          <p className="text-muted-foreground">{level.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {level.estimatedWeeks}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Progress */}
                      {totalTopics > 0 && (
                        <div className="mb-4 mt-4">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-muted-foreground">
                              Progress: {completedTopics} / {totalTopics} topics
                            </span>
                            <span className="font-semibold">{Math.round(levelProgress)}%</span>
                          </div>
                          <Progress value={levelProgress} className="h-2" />
                        </div>
                      )}

                      {/* Topics */}
                      <div className="space-y-2 mt-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-lg">Topics ({totalTopics})</h3>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedLevel(level);
                                setIsAddingTopic(true);
                              }}
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Add Topic
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteLevel(level.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>

                        {level.topics.length === 0 ? (
                          <Card className="p-6 text-center">
                            <p className="text-muted-foreground mb-3">No topics added yet</p>
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedLevel(level);
                                setIsAddingTopic(true);
                              }}
                            >
                              Add First Topic
                            </Button>
                          </Card>
                        ) : (
                          <div className="grid gap-3">
                            {level.topics.map((topic) => (
                              <Card
                                key={topic.id}
                                className={`transition-all cursor-pointer hover:shadow-md ${
                                  topic.completed
                                    ? 'bg-green-50 dark:bg-green-950/20 border-green-200'
                                    : 'hover:border-primary'
                                }`}
                              >
                                <CardContent className="p-4">
                                  <div className="flex items-start gap-3">
                                    <button
                                      onClick={() => toggleTopicComplete(level.id, topic.id)}
                                      className="mt-0.5"
                                    >
                                      {topic.completed ? (
                                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                                      ) : (
                                        <Circle className="h-6 w-6 text-gray-400 hover:text-primary" />
                                      )}
                                    </button>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1">
                                          <h4 className="font-medium text-lg">{topic.name}</h4>
                                          <p className="text-sm text-muted-foreground mt-1">
                                            ⏱️ {topic.estimatedTime}
                                          </p>
                                          {topic.resources && (
                                            <p className="text-sm mt-2 text-muted-foreground">
                                              📚 {topic.resources}
                                            </p>
                                          )}
                                          {topic.videoLinks && topic.videoLinks.length > 0 && (
                                            <div className="mt-3 space-y-1">
                                              {topic.videoLinks.map((link, idx) => (
                                                <a
                                                  key={idx}
                                                  href={link}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                                                >
                                                  <Video className="h-4 w-4" />
                                                  Video {idx + 1}
                                                </a>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                        <div className="flex gap-1">
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => {
                                              setSelectedLevel(level);
                                              setSelectedTopic(topic);
                                              setTopicForm({
                                                name: topic.name,
                                                estimatedTime: topic.estimatedTime,
                                                resources: topic.resources,
                                                videoLinks: topic.videoLinks.join('\n'),
                                              });
                                              setIsEditingTopic(true);
                                            }}
                                          >
                                            <Edit className="h-4 w-4" />
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleDeleteTopic(level.id, topic.id)}
                                          >
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        {/* Add/Edit Topic Dialog */}
        <Dialog
          open={isAddingTopic || isEditingTopic}
          onOpenChange={(open) => {
            if (!open) {
              setIsAddingTopic(false);
              setIsEditingTopic(false);
              setSelectedTopic(null);
              setTopicForm({ name: '', estimatedTime: '', resources: '', videoLinks: '' });
            }
          }}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{isEditingTopic ? 'Edit Topic' : 'Add New Topic'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Topic Name *</Label>
                <Input
                  placeholder="e.g., Linear Regression"
                  value={topicForm.name}
                  onChange={(e) => setTopicForm({ ...topicForm, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Estimated Time</Label>
                <Input
                  placeholder="e.g., 1 week, 3 days"
                  value={topicForm.estimatedTime}
                  onChange={(e) => setTopicForm({ ...topicForm, estimatedTime: e.target.value })}
                />
              </div>
              <div>
                <Label>Resources</Label>
                <Textarea
                  placeholder="List key resources or concepts (comma separated)"
                  value={topicForm.resources}
                  onChange={(e) => setTopicForm({ ...topicForm, resources: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label className="flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  Video Links (one per line)
                </Label>
                <Textarea
                  placeholder="https://www.youtube.com/watch?v=...&#10;https://www.youtube.com/watch?v=..."
                  value={topicForm.videoLinks}
                  onChange={(e) => setTopicForm({ ...topicForm, videoLinks: e.target.value })}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Add YouTube or other video tutorial links, one per line
                </p>
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={isEditingTopic ? handleEditTopic : handleAddTopic}
                  className="flex-1"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isEditingTopic ? 'Update Topic' : 'Add Topic'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddingTopic(false);
                    setIsEditingTopic(false);
                    setSelectedTopic(null);
                  }}
                >
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
