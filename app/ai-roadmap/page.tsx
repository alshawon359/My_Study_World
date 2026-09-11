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
  Database,
  Loader2,
  AlertCircle,
} from 'lucide-react';

interface Topic {
  id: string;
  levelId: string;
  name: string;
  estimatedTime: string | null;
  completed: boolean;
  videoLinks: string;
  resources: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Level {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  estimatedWeeks: string | null;
  topics: Topic[];
  status: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

const userId = 'cmtszibhe0000uzf04p06d1fe'; // Shawon's user ID

export default function AIRoadmapPage() {
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [isAddingLevel, setIsAddingLevel] = useState(false);
  const [editingLevel, setEditingLevel] = useState<Level | null>(null);
  const [isAddingTopic, setIsAddingTopic] = useState(false);
  const [addingTopicToLevelId, setAddingTopicToLevelId] = useState<string | null>(null);

  // Form states
  const [levelForm, setLevelForm] = useState({
    title: '',
    description: '',
    estimatedWeeks: '',
  });

  const [topicForm, setTopicForm] = useState({
    name: '',
    estimatedTime: '',
  });

  // Load levels on mount
  useEffect(() => {
    loadLevels();
  }, []);

  const loadLevels = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/ai-roadmap?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setLevels(data.sort((a: Level, b: Level) => a.order - b.order));
      }
    } catch (error) {
      console.error('❌ Error loading AI roadmap levels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLevel = async () => {
    if (!levelForm.title) {
      alert('Please enter a level title');
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch('/api/ai-roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          title: levelForm.title,
          description: levelForm.description || null,
          estimatedWeeks: levelForm.estimatedWeeks || null,
          status: 'not-started',
          order: levels.length,
        }),
      });

      if (response.ok) {
        const newLevel = await response.json();
        setLevels([...levels, newLevel]);
        setLevelForm({ title: '', description: '', estimatedWeeks: '' });
        setIsAddingLevel(false);
      }
    } catch (error) {
      console.error('❌ Error adding level:', error);
      alert('Error adding level');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateLevel = async (level: Level) => {
    try {
      setIsSaving(true);
      const response = await fetch('/api/ai-roadmap', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: level.id,
          title: level.title,
          description: level.description,
          estimatedWeeks: level.estimatedWeeks,
          status: level.status,
          order: level.order,
        }),
      });

      if (response.ok) {
        const updatedLevel = await response.json();
        setLevels(levels.map(l => l.id === updatedLevel.id ? updatedLevel : l));
      }
    } catch (error) {
      console.error('❌ Error updating level:', error);
      alert('Error updating level');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteLevel = async (id: string) => {
    if (!confirm('Are you sure? This will delete all topics in this level')) return;

    try {
      const response = await fetch(`/api/ai-roadmap?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setLevels(levels.filter(l => l.id !== id));
      }
    } catch (error) {
      console.error('❌ Error deleting level:', error);
      alert('Error deleting level');
    }
  };

  const handleAddTopic = async (levelId: string) => {
    if (!topicForm.name) {
      alert('Please enter a topic name');
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch('/api/ai-roadmap/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          levelId,
          name: topicForm.name,
          estimatedTime: topicForm.estimatedTime || null,
          completed: false,
          videoLinks: [],
        }),
      });

      if (response.ok) {
        const newTopic = await response.json();
        setLevels(levels.map(l => 
          l.id === levelId ? { ...l, topics: [...l.topics, newTopic] } : l
        ));
        setTopicForm({ name: '', estimatedTime: '' });
        setIsAddingTopic(false);
        setAddingTopicToLevelId(null);
      }
    } catch (error) {
      console.error('❌ Error adding topic:', error);
      alert('Error adding topic');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleTopic = async (topic: Topic) => {
    try {
      const response = await fetch('/api/ai-roadmap/topics', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: topic.id,
          completed: !topic.completed,
        }),
      });

      if (response.ok) {
        const updatedTopic = await response.json();
        setLevels(levels.map(l => ({
          ...l,
          topics: l.topics.map(t => t.id === updatedTopic.id ? updatedTopic : t),
        })));
      }
    } catch (error) {
      console.error('❌ Error toggling topic:', error);
    }
  };

  const handleDeleteTopic = async (topicId: string) => {
    if (!confirm('Delete this topic?')) return;

    try {
      const response = await fetch(`/api/ai-roadmap/topics?id=${topicId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setLevels(levels.map(l => ({
          ...l,
          topics: l.topics.filter(t => t.id !== topicId),
        })));
      }
    } catch (error) {
      console.error('❌ Error deleting topic:', error);
      alert('Error deleting topic');
    }
  };

  const getCompletedTopics = (level: Level) => level.topics.filter(t => t.completed).length;
  const getTotalTopics = (level: Level) => level.topics.length;
  const getCompletionPercent = (level: Level) => getTotalTopics(level) > 0 ? Math.round((getCompletedTopics(level) / getTotalTopics(level)) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
          <p className="text-slate-300">Loading AI roadmap...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Brain className="h-8 w-8 text-blue-400" />
            <h1 className="text-4xl font-bold text-white">AI/ML Learning Roadmap</h1>
          </div>
          <p className="text-slate-400">Your structured path to mastering AI and Machine Learning</p>
        </div>

        {/* Database Status Badge */}
        <div className="mb-6 flex items-center gap-2 bg-green-900/30 border border-green-700/50 rounded-lg px-4 py-2 w-fit">
          <Database className="h-4 w-4 text-green-400" />
          <span className="text-sm text-green-300">✅ Database Connected</span>
        </div>

        {/* Add Level Button */}
        <div className="mb-8">
          <Dialog open={isAddingLevel} onOpenChange={setIsAddingLevel}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Level
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">Add New Level</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-slate-300">Title *</Label>
                  <Input
                    value={levelForm.title}
                    onChange={(e) => setLevelForm({ ...levelForm, title: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="e.g., Advanced Neural Networks"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Description</Label>
                  <Textarea
                    value={levelForm.description}
                    onChange={(e) => setLevelForm({ ...levelForm, description: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="What will you learn in this level?"
                    rows={3}
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Estimated Weeks</Label>
                  <Input
                    value={levelForm.estimatedWeeks}
                    onChange={(e) => setLevelForm({ ...levelForm, estimatedWeeks: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="e.g., 4 weeks"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleAddLevel}
                    disabled={isSaving}
                    className="bg-blue-600 hover:bg-blue-700 flex-1"
                  >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Add Level
                  </Button>
                  <Button onClick={() => setIsAddingLevel(false)} variant="outline" disabled={isSaving}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Levels List */}
        <div className="space-y-6">
          {levels.length === 0 ? (
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="pt-12 text-center">
                <AlertCircle className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No levels yet. Start by adding your first level!</p>
              </CardContent>
            </Card>
          ) : (
            levels.map(level => {
              const completed = getCompletedTopics(level);
              const total = getTotalTopics(level);
              const completionPercent = getCompletionPercent(level);

              return (
                <Card key={level.id} className="bg-slate-800 border-slate-700 hover:border-blue-500 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-white text-xl">{level.title}</CardTitle>
                          {level.status === 'completed' && (
                            <Badge className="bg-green-600">Completed</Badge>
                          )}
                          {level.status === 'in-progress' && (
                            <Badge className="bg-blue-600">In Progress</Badge>
                          )}
                        </div>
                        {level.description && (
                          <p className="text-slate-400 text-sm mb-3">{level.description}</p>
                        )}
                        {level.estimatedWeeks && (
                          <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                            <Clock className="h-4 w-4" />
                            {level.estimatedWeeks}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleDeleteLevel(level.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    {/* Progress Bar */}
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-slate-400">Progress: {completed}/{total} topics</span>
                        <span className="text-sm font-semibold text-blue-300">{completionPercent}%</span>
                      </div>
                      <Progress value={completionPercent} className="h-2" />
                    </div>

                    {/* Topics */}
                    <div className="space-y-3 mb-6">
                      {level.topics && level.topics.length > 0 ? (
                        level.topics.map(topic => (
                          <div key={topic.id} className="flex items-center gap-3 p-3 bg-slate-700 rounded-lg group hover:bg-slate-600 transition-colors">
                            <button
                              onClick={() => handleToggleTopic(topic)}
                              className="flex-shrink-0"
                            >
                              {topic.completed ? (
                                <CheckCircle2 className="h-5 w-5 text-green-400" />
                              ) : (
                                <Circle className="h-5 w-5 text-slate-500" />
                              )}
                            </button>
                            <div className="flex-1">
                              <p className={`text-sm font-medium ${topic.completed ? 'text-slate-400 line-through' : 'text-white'}`}>
                                {topic.name}
                              </p>
                              {topic.estimatedTime && (
                                <p className="text-xs text-slate-500">{topic.estimatedTime}</p>
                              )}
                            </div>
                            <Button
                              onClick={() => handleDeleteTopic(topic.id)}
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-500 italic">No topics yet</p>
                      )}
                    </div>

                    {/* Add Topic Button */}
                    {addingTopicToLevelId !== level.id ? (
                      <Dialog open={isAddingTopic && addingTopicToLevelId === level.id} onOpenChange={() => {
                        setIsAddingTopic(false);
                        setAddingTopicToLevelId(null);
                      }}>
                        <DialogTrigger asChild>
                          <Button
                            onClick={() => {
                              setAddingTopicToLevelId(level.id);
                              setIsAddingTopic(true);
                            }}
                            variant="outline"
                            size="sm"
                            className="w-full border-slate-600 text-slate-300 hover:text-white"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add Topic
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-slate-800 border-slate-700">
                          <DialogHeader>
                            <DialogTitle className="text-white">Add Topic to {level.title}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label className="text-slate-300">Topic Name *</Label>
                              <Input
                                value={topicForm.name}
                                onChange={(e) => setTopicForm({ ...topicForm, name: e.target.value })}
                                className="bg-slate-700 border-slate-600 text-white"
                                placeholder="e.g., Backpropagation"
                              />
                            </div>
                            <div>
                              <Label className="text-slate-300">Estimated Time</Label>
                              <Input
                                value={topicForm.estimatedTime}
                                onChange={(e) => setTopicForm({ ...topicForm, estimatedTime: e.target.value })}
                                className="bg-slate-700 border-slate-600 text-white"
                                placeholder="e.g., 3 hours"
                              />
                            </div>
                            <div className="flex gap-3 pt-4">
                              <Button
                                onClick={() => handleAddTopic(level.id)}
                                disabled={isSaving}
                                className="bg-blue-600 hover:bg-blue-700 flex-1"
                              >
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                                Add Topic
                              </Button>
                              <Button
                                onClick={() => {
                                  setIsAddingTopic(false);
                                  setAddingTopicToLevelId(null);
                                }}
                                variant="outline"
                                disabled={isSaving}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    ) : null}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
