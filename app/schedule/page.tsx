'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { ScheduleBlock, BlockCategory, Priority, BlockType } from '@prisma/client';
import { Plus, Edit2, Trash2, Calendar, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getDayName } from '@/lib/utils';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const categoryOptions = [
  { value: BlockCategory.ACADEMIC, label: 'Academic', color: '#3b82f6' },
  { value: BlockCategory.AI_ML, label: 'AI/ML', color: '#06b6d4' },
  { value: BlockCategory.RESEARCH, label: 'Research', color: '#8b5cf6' },
  { value: BlockCategory.UNIVERSITY, label: 'University', color: '#f59e0b' },
  { value: BlockCategory.PERSONAL, label: 'Personal', color: '#10b981' },
  { value: BlockCategory.SLEEP, label: 'Sleep', color: '#64748b' },
];

const priorityOptions = [
  { value: Priority.CRITICAL, label: 'Critical' },
  { value: Priority.HIGH, label: 'High' },
  { value: Priority.MEDIUM, label: 'Medium' },
  { value: Priority.LOW, label: 'Low' },
];

export default function SchedulePage() {
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [scheduleBlocks, setScheduleBlocks] = useState<ScheduleBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<ScheduleBlock | null>(null);
  const { toast } = useToast();

  const userId = 'cmtszibhe0000uzf04p06d1fe';

  // Form state
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    category: BlockCategory;
    priority: Priority;
    startTime: string;
    endTime: string;
    subject: string;
  }>({
    title: '',
    description: '',
    category: BlockCategory.ACADEMIC,
    priority: Priority.MEDIUM,
    startTime: '',
    endTime: '',
    subject: '',
  });

  useEffect(() => {
    loadSchedule();
  }, [selectedDay]);

  const loadSchedule = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/schedule?userId=${userId}&dayOfWeek=${selectedDay}`);
      if (response.ok) {
        const data = await response.json();
        setScheduleBlocks(data);
      }
    } catch (error) {
      console.error('Error loading schedule:', error);
      toast({
        title: 'Error',
        description: 'Failed to load schedule',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateDuration = (start: string, end: string) => {
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    let duration = (endH * 60 + endM) - (startH * 60 + startM);
    if (duration < 0) duration += 24 * 60;
    return duration;
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.startTime || !formData.endTime) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    const duration = calculateDuration(formData.startTime, formData.endTime);
    const categoryColor = categoryOptions.find(c => c.value === formData.category)?.color || '#06b6d4';

    try {
      if (editingBlock) {
        // Update existing block
        const response = await fetch('/api/schedule', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingBlock.id,
            ...formData,
            duration,
            color: categoryColor,
          }),
        });

        if (response.ok) {
          toast({
            title: 'Schedule Updated',
            description: 'Time block updated successfully',
          });
          await loadSchedule();
          closeDialog();
        } else {
          const error = await response.json();
          toast({
            title: 'Error',
            description: error.error || 'Failed to update schedule',
            variant: 'destructive',
          });
        }
      } else {
        // Create new block
        const response = await fetch('/api/schedule', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            ...formData,
            dayOfWeek: selectedDay,
            duration,
            type: BlockType.FLEXIBLE,
            color: categoryColor,
            recurring: true,
            taskObjective: formData.description,
          }),
        });

        if (response.ok) {
          toast({
            title: 'Schedule Created',
            description: 'New time block added successfully',
          });
          await loadSchedule();
          closeDialog();
        } else {
          const error = await response.json();
          toast({
            title: 'Error',
            description: error.error || 'Failed to create schedule',
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      console.error('Error saving schedule:', error);
      toast({
        title: 'Error',
        description: 'Failed to save schedule. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (block: ScheduleBlock) => {
    setEditingBlock(block);
    setFormData({
      title: block.title,
      description: block.description || '',
      category: block.category,
      priority: block.priority,
      startTime: block.startTime,
      endTime: block.endTime,
      subject: block.subject || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (blockId: string) => {
    if (!confirm('Are you sure you want to delete this time block?')) return;

    try {
      const response = await fetch(`/api/schedule?id=${blockId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Schedule Deleted',
          description: 'Time block removed successfully',
        });
        loadSchedule();
      }
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete schedule',
        variant: 'destructive',
      });
    }
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingBlock(null);
    setFormData({
      title: '',
      description: '',
      category: BlockCategory.ACADEMIC,
      priority: Priority.MEDIUM,
      startTime: '',
      endTime: '',
      subject: '',
    });
  };

  const getCategoryColor = (category: BlockCategory) => {
    return categoryOptions.find(c => c.value === category)?.color || '#06b6d4';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Schedule Manager</h1>
              <p className="text-lg text-muted-foreground">
                Manage your weekly Master Timetable
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" onClick={() => setEditingBlock(null)}>
                  <Plus className="mr-2 h-5 w-5" />
                  Add Time Block
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingBlock ? 'Edit Time Block' : 'Add New Time Block'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Machine Learning Study"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="What will you do in this time block?"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value as BlockCategory })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categoryOptions.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              <span className="flex items-center gap-2">
                                <span
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: cat.color }}
                                />
                                {cat.label}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="priority">Priority *</Label>
                      <Select
                        value={formData.priority}
                        onValueChange={(value) => setFormData({ ...formData, priority: value as Priority })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {priorityOptions.map((pri) => (
                            <SelectItem key={pri.value} value={pri.value}>
                              {pri.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startTime">Start Time *</Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="endTime">End Time *</Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="subject">Subject (optional)</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="e.g., DIP, DC, ML"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={closeDialog}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit}>
                    {editingBlock ? 'Update' : 'Create'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Day Selector */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {DAYS.map((day, index) => (
              <Button
                key={index}
                variant={selectedDay === index ? 'default' : 'outline'}
                onClick={() => setSelectedDay(index)}
                className="min-w-[120px]"
              >
                {day}
              </Button>
            ))}
          </div>
        </div>

        {/* Schedule Blocks */}
        <div className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {getDayName(selectedDay)}'s Schedule
                <Badge variant="secondary" className="ml-auto">
                  {scheduleBlocks.length} blocks
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {scheduleBlocks.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No schedule blocks for this day</p>
                  <p className="text-sm mt-2">Click "Add Time Block" to create one</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {scheduleBlocks.map((block) => (
                    <div
                      key={block.id}
                      className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                      style={{ borderLeftWidth: '4px', borderLeftColor: getCategoryColor(block.category) }}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{block.title}</h3>
                          <Badge variant="outline" className="text-xs">
                            {block.category}
                          </Badge>
                          {block.subject && (
                            <Badge variant="secondary" className="text-xs">
                              {block.subject}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {block.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>
                              {block.startTime} - {block.endTime}
                            </span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {Math.floor(block.duration / 60)}h {block.duration % 60}m
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {block.priority}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(block)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(block.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
