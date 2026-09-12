'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, Plus, Edit2, Trash2, CheckCircle2, Circle, 
  FileText, Video, Link as LinkIcon, Code, Image as ImageIcon,
  Download, Eye, Calendar, ArrowLeft, ChevronRight, ChevronDown,
  ListChecks, Target
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { upload } from '@vercel/blob/client';

interface Topic {
  id: string;
  name: string;
  completed: boolean;
}

interface Chapter {
  id: string;
  title: string;
  description: string | null;
  order: number;
  completed: boolean;
  totalTopics: number;
  completedTopics: number;
  progress: number;
  topics: Topic[];
  subtopics: any[];
  materials: Material[];
  expanded?: boolean;
}

interface Material {
  id: string;
  title: string;
  type: string;
  description: string | null;
  fileUrl: string | null;
  externalUrl: string | null;
  content: string | null;
  viewed: boolean;
}

interface Subject {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  color: string;
  totalChapters: number;
  completedChapters: number;
  totalTopics: number;
  completedTopics: number;
}

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const courseId = params.id as string;

  const [subject, setSubject] = useState<Subject | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [isChapterDialogOpen, setIsChapterDialogOpen] = useState(false);
  const [isMaterialDialogOpen, setIsMaterialDialogOpen] = useState(false);
  const [isTopicDialogOpen, setIsTopicDialogOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);

  // Form states
  const [chapterForm, setChapterForm] = useState({
    title: '',
    description: '',
  });

  const [topicForm, setTopicForm] = useState({
    topics: '',
  });

  const [materialForm, setMaterialForm] = useState({
    title: '',
    type: 'PDF',
    description: '',
    fileUrl: '',
    externalUrl: '',
    content: '',
  });

  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; url: string; type: string }>>([]);

  useEffect(() => {
    loadCourseData();
  }, [courseId]);

  const loadCourseData = async () => {
    try {
      setLoading(true);
      
      // Load subject info (mock for now - can be from API)
      setSubject({
        id: courseId,
        name: courseId === '1' ? 'Digital Image Processing' : 
              courseId === '2' ? 'Digital Communication' :
              courseId === '3' ? 'Telecommunication Engineering' :
              courseId === '4' ? 'Optical Fiber Communication' :
              courseId === '5' ? 'Satellite Communication' : 'Course',
        code: courseId === '1' ? 'DIP' : 
              courseId === '2' ? 'DC' :
              courseId === '3' ? 'TE' :
              courseId === '4' ? 'OFC' :
              courseId === '5' ? 'SC' : 'COURSE',
        description: 'Complete course with chapters, topics, and learning materials',
        color: courseId === '1' ? '#3b82f6' : 
               courseId === '2' ? '#8b5cf6' :
               courseId === '3' ? '#ec4899' :
               courseId === '4' ? '#f59e0b' :
               courseId === '5' ? '#10b981' : '#06b6d4',
        totalChapters: 0,
        completedChapters: 0,
        totalTopics: 0,
        completedTopics: 0,
      });
      
      // Load chapters from API
      const response = await fetch(`/api/chapters?subjectId=${courseId}`);
      if (response.ok) {
        const data = await response.json();
        const parsedChapters = data.map((ch: any) => {
          const topicsData = JSON.parse(ch.topics || '[]');
          const topicsArray: Topic[] = topicsData.map((t: any) => 
            typeof t === 'string' ? { id: Date.now() + Math.random().toString(), name: t, completed: false } : t
          );
          
          const completedCount = topicsArray.filter(t => t.completed).length;
          const progress = topicsArray.length > 0 ? (completedCount / topicsArray.length) * 100 : 0;
          
          return {
            ...ch,
            topics: topicsArray,
            completedTopics: completedCount,
            totalTopics: topicsArray.length,
            progress,
            subtopics: JSON.parse(ch.subtopics || '[]'),
            expanded: false,
          };
        });
        setChapters(parsedChapters);
      }
    } catch (error) {
      console.error('Error loading course:', error);
      toast({
        title: 'Error',
        description: 'Failed to load course data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChapter = async () => {
    if (!chapterForm.title) {
      toast({
        title: 'Validation Error',
        description: 'Chapter title is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch('/api/chapters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId: courseId,
          title: chapterForm.title,
          description: chapterForm.description,
          topics: [],
        }),
      });

      if (response.ok) {
        const newChapter = await response.json();
        const parsed = {
          ...newChapter,
          topics: [],
          completedTopics: 0,
          totalTopics: 0,
          progress: 0,
          subtopics: [],
          expanded: false,
        };
        setChapters([...chapters, parsed]);
        closeChapterDialog();
        
        toast({
          title: 'Chapter Created',
          description: `${newChapter.title} has been added`,
        });
      }
    } catch (error) {
      console.error('Error creating chapter:', error);
      toast({
        title: 'Error',
        description: 'Failed to create chapter',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateChapter = async () => {
    if (!editingChapter) return;

    try {
      const response = await fetch('/api/chapters', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingChapter.id,
          title: chapterForm.title,
          description: chapterForm.description,
        }),
      });

      if (response.ok) {
        setChapters(chapters.map(ch => 
          ch.id === editingChapter.id 
            ? { ...ch, title: chapterForm.title, description: chapterForm.description }
            : ch
        ));
        closeChapterDialog();
        
        toast({
          title: 'Chapter Updated',
          description: 'Changes saved successfully',
        });
      }
    } catch (error) {
      console.error('Error updating chapter:', error);
      toast({
        title: 'Error',
        description: 'Failed to update chapter',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteChapter = async (chapterId: string) => {
    if (!confirm('Are you sure you want to delete this chapter?')) return;

    try {
      const response = await fetch(`/api/chapters?id=${chapterId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setChapters(chapters.filter(ch => ch.id !== chapterId));
        toast({
          title: 'Chapter Deleted',
          description: 'Chapter has been removed',
        });
      }
    } catch (error) {
      console.error('Error deleting chapter:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete chapter',
        variant: 'destructive',
      });
    }
  };

  const toggleChapterComplete = async (chapterId: string) => {
    const chapter = chapters.find(ch => ch.id === chapterId);
    if (!chapter) return;

    const newCompleted = !chapter.completed;
    const updatedTopics = chapter.topics.map(t => ({ ...t, completed: newCompleted }));
    const completedCount = newCompleted ? updatedTopics.length : 0;
    const progress = updatedTopics.length > 0 ? (completedCount / updatedTopics.length) * 100 : 0;

    try {
      const response = await fetch('/api/chapters', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: chapterId,
          completed: newCompleted,
          topics: updatedTopics,
        }),
      });

      if (response.ok) {
        setChapters(chapters.map(ch => 
          ch.id === chapterId 
            ? { ...ch, completed: newCompleted, topics: updatedTopics, completedTopics: completedCount, progress }
            : ch
        ));
      }
    } catch (error) {
      console.error('Error toggling chapter:', error);
    }
  };

  const handleAddTopics = async () => {
    if (!selectedChapter || !topicForm.topics.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter at least one topic',
        variant: 'destructive',
      });
      return;
    }

    const newTopics: Topic[] = topicForm.topics
      .split('\n')
      .filter(t => t.trim())
      .map(t => ({
        id: `${Date.now()}-${Math.random()}`,
        name: t.trim(),
        completed: false,
      }));

    const updatedTopics = [...selectedChapter.topics, ...newTopics];
    const completedCount = updatedTopics.filter(t => t.completed).length;
    const progress = updatedTopics.length > 0 ? (completedCount / updatedTopics.length) * 100 : 0;

    try {
      const response = await fetch('/api/chapters', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedChapter.id,
          topics: updatedTopics,
        }),
      });

      if (response.ok) {
        setChapters(chapters.map(ch =>
          ch.id === selectedChapter.id
            ? { ...ch, topics: updatedTopics, totalTopics: updatedTopics.length, completedTopics: completedCount, progress }
            : ch
        ));

        setTopicForm({ topics: '' });
        setIsTopicDialogOpen(false);
        
        toast({
          title: 'Topics Added',
          description: `${newTopics.length} topic(s) added successfully`,
        });
      }
    } catch (error) {
      console.error('Error adding topics:', error);
      toast({
        title: 'Error',
        description: 'Failed to add topics',
        variant: 'destructive',
      });
    }
  };

  const toggleTopicComplete = async (chapterId: string, topicId: string) => {
    const chapter = chapters.find(ch => ch.id === chapterId);
    if (!chapter) return;

    const updatedTopics = chapter.topics.map(t =>
      t.id === topicId ? { ...t, completed: !t.completed } : t
    );
    
    const completedCount = updatedTopics.filter(t => t.completed).length;
    const progress = updatedTopics.length > 0 ? (completedCount / updatedTopics.length) * 100 : 0;
    const allCompleted = completedCount === updatedTopics.length && updatedTopics.length > 0;

    try {
      const response = await fetch('/api/chapters', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: chapterId,
          topics: updatedTopics,
          completed: allCompleted,
        }),
      });

      if (response.ok) {
        setChapters(chapters.map(ch =>
          ch.id === chapterId
            ? { ...ch, topics: updatedTopics, completedTopics: completedCount, progress, completed: allCompleted }
            : ch
        ));
      }
    } catch (error) {
      console.error('Error toggling topic:', error);
    }
  };

  const handleDeleteTopic = async (chapterId: string, topicId: string) => {
    const chapter = chapters.find(ch => ch.id === chapterId);
    if (!chapter) return;

    const updatedTopics = chapter.topics.filter(t => t.id !== topicId);
    const completedCount = updatedTopics.filter(t => t.completed).length;
    const progress = updatedTopics.length > 0 ? (completedCount / updatedTopics.length) * 100 : 0;

    try {
      const response = await fetch('/api/chapters', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: chapterId,
          topics: updatedTopics,
        }),
      });

      if (response.ok) {
        setChapters(chapters.map(ch =>
          ch.id === chapterId
            ? { ...ch, topics: updatedTopics, totalTopics: updatedTopics.length, completedTopics: completedCount, progress }
            : ch
        ));
      }
    } catch (error) {
      console.error('Error deleting topic:', error);
    }
  };

  const toggleChapterExpanded = (chapterId: string) => {
    setChapters(chapters.map(ch =>
      ch.id === chapterId ? { ...ch, expanded: !ch.expanded } : ch
    ));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    try {
      const newFiles = await Promise.all(Array.from(files).map(async (file) => {
        const blob = await upload(`course-materials/${Date.now()}-${file.name}`, file, {
          access: 'public',
          handleUploadUrl: '/api/course-materials/upload',
        });
        return { name: file.name, url: blob.url, type: file.type };
      }));
      setUploadedFiles((current) => [...current, ...newFiles]);
      toast({ title: 'Files uploaded', description: `${newFiles.length} material file(s) ready to save.` });
    } catch (error) {
      console.error('Error uploading course material:', error);
      toast({ title: 'Upload failed', description: 'Could not upload the selected file.', variant: 'destructive' });
    }
  };

  const handleRemoveFile = (url: string) => {
    setUploadedFiles(uploadedFiles.filter(f => f.url !== url));
  };

  const handleAddMaterial = async () => {
    if (!selectedChapter || !materialForm.title) {
      toast({
        title: 'Validation Error',
        description: 'Material title is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Store file URLs as comma-separated string
      const fileUrls = uploadedFiles.length > 0 
        ? uploadedFiles.map(f => f.url).join(',')
        : materialForm.fileUrl;

      const response = await fetch('/api/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterId: selectedChapter.id,
          title: materialForm.title,
          type: materialForm.type,
          description: materialForm.description,
          fileUrl: fileUrls,
          externalUrl: materialForm.externalUrl,
          content: materialForm.content,
        }),
      });

      if (response.ok) {
        const newMaterial = await response.json();
        setChapters(chapters.map(ch =>
          ch.id === selectedChapter.id
            ? { ...ch, materials: [...ch.materials, newMaterial] }
            : ch
        ));

        closeMaterialDialog();
        toast({
          title: 'Material Added',
          description: `${newMaterial.title} added successfully`,
        });
      }
    } catch (error) {
      console.error('Error adding material:', error);
      toast({
        title: 'Error',
        description: 'Failed to add material',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteMaterial = async (chapterId: string, materialId: string) => {
    if (!confirm('Are you sure you want to delete this material?')) return;

    try {
      const response = await fetch(`/api/materials?id=${materialId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setChapters(chapters.map(ch =>
          ch.id === chapterId
            ? { ...ch, materials: ch.materials.filter(m => m.id !== materialId) }
            : ch
        ));

        toast({
          title: 'Material Deleted',
          description: 'Material has been removed',
        });
      }
    } catch (error) {
      console.error('Error deleting material:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete material',
        variant: 'destructive',
      });
    }
  };

  const openChapterDialog = (chapter?: Chapter) => {
    if (chapter) {
      setEditingChapter(chapter);
      setChapterForm({
        title: chapter.title,
        description: chapter.description || '',
      });
    } else {
      setEditingChapter(null);
      setChapterForm({ title: '', description: '' });
    }
    setIsChapterDialogOpen(true);
  };

  const closeChapterDialog = () => {
    setIsChapterDialogOpen(false);
    setEditingChapter(null);
    setChapterForm({ title: '', description: '' });
  };

  const openTopicDialog = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setTopicForm({ topics: '' });
    setIsTopicDialogOpen(true);
  };

  const openMaterialDialog = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setMaterialForm({
      title: '',
      type: 'PDF',
      description: '',
      fileUrl: '',
      externalUrl: '',
      content: '',
    });
    setIsMaterialDialogOpen(true);
  };

  const closeMaterialDialog = () => {
    setIsMaterialDialogOpen(false);
    setSelectedChapter(null);
    setMaterialForm({
      title: '',
      type: 'PDF',
      description: '',
      fileUrl: '',
      externalUrl: '',
      content: '',
    });
    setUploadedFiles([]);
  };

  const getMaterialIcon = (type: string) => {
    const icons: { [key: string]: any } = {
      PDF: FileText,
      SLIDE: FileText,
      NOTE: FileText,
      VIDEO: Video,
      LINK: LinkIcon,
      CODE: Code,
      IMAGE: ImageIcon,
    };
    const Icon = icons[type] || FileText;
    return <Icon className="h-4 w-4" />;
  };

  const overallProgress = chapters.length > 0
    ? chapters.reduce((sum, ch) => sum + ch.progress, 0) / chapters.length
    : 0;

  const totalTopics = chapters.reduce((sum, ch) => sum + ch.totalTopics, 0);
  const completedTopics = chapters.reduce((sum, ch) => sum + ch.completedTopics, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="mb-8">
            <div className="h-8 w-32 bg-muted animate-pulse rounded mb-4"></div>
            <div className="h-12 w-96 bg-muted animate-pulse rounded mb-4"></div>
            <div className="h-32 bg-muted animate-pulse rounded"></div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-muted animate-pulse rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Course Not Found</h2>
          <Button onClick={() => router.push('/courses')}>Back to Courses</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/courses')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Courses
          </Button>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: subject.color }}
                />
                <h1 className="text-4xl font-bold">{subject.name}</h1>
                {subject.code && (
                  <Badge variant="secondary" className="text-lg">
                    {subject.code}
                  </Badge>
                )}
              </div>
              {subject.description && (
                <p className="text-lg text-muted-foreground max-w-3xl">
                  {subject.description}
                </p>
              )}
            </div>

            <Dialog open={isChapterDialogOpen} onOpenChange={setIsChapterDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" onClick={() => openChapterDialog()}>
                  <Plus className="mr-2 h-5 w-5" />
                  Add Chapter
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingChapter ? 'Edit Chapter' : 'Add New Chapter'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="chapterTitle">Chapter Title *</Label>
                    <Input
                      id="chapterTitle"
                      value={chapterForm.title}
                      onChange={(e) => setChapterForm({ ...chapterForm, title: e.target.value })}
                      placeholder="e.g., Image Enhancement Techniques"
                    />
                  </div>
                  <div>
                    <Label htmlFor="chapterDesc">Description</Label>
                    <Textarea
                      id="chapterDesc"
                      value={chapterForm.description}
                      onChange={(e) => setChapterForm({ ...chapterForm, description: e.target.value })}
                      placeholder="Brief description of the chapter"
                      rows={3}
                    />
                  </div>
                  <div className="text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950 p-3 rounded">
                    💡 After creating the chapter, use the "Add Topics" button to add topics
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={closeChapterDialog}>
                    Cancel
                  </Button>
                  <Button onClick={editingChapter ? handleUpdateChapter : handleCreateChapter}>
                    {editingChapter ? 'Update' : 'Create'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Progress Overview */}
          <Card className="mt-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Overall Progress</div>
                  <div className="flex items-center gap-3">
                    <Progress value={overallProgress} className="flex-1" />
                    <span className="text-sm font-semibold">{Math.round(overallProgress)}%</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Chapters</div>
                  <div className="text-2xl font-bold">
                    {chapters.filter(ch => ch.completed).length} / {chapters.length}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Topics</div>
                  <div className="text-2xl font-bold">
                    {completedTopics} / {totalTopics}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Materials</div>
                  <div className="text-2xl font-bold">
                    {chapters.reduce((sum, ch) => sum + ch.materials.length, 0)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Completion Rate</div>
                  <div className="text-2xl font-bold text-green-600">
                    {totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chapters List */}
        <div className="space-y-4">
          {chapters.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Chapters Yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start organizing your course by adding chapters
                </p>
                <Button onClick={() => openChapterDialog()}>
                  <Plus className="mr-2 h-5 w-5" />
                  Add First Chapter
                </Button>
              </CardContent>
            </Card>
          ) : (
            chapters.map((chapter, index) => (
              <Card
                key={chapter.id}
                className={cn(
                  "transition-all",
                  chapter.completed && "bg-green-50 dark:bg-green-950/20 border-green-200"
                )}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <button
                        className="mt-1 hover:scale-110 transition-transform"
                        onClick={() => toggleChapterComplete(chapter.id)}
                      >
                        {chapter.completed ? (
                          <CheckCircle2 className="h-7 w-7 text-green-600" />
                        ) : (
                          <Circle className="h-7 w-7 text-gray-400 hover:text-primary" />
                        )}
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Badge variant="outline">Chapter {index + 1}</Badge>
                          <h3 className={cn(
                            "text-xl font-bold",
                            chapter.completed && "line-through text-muted-foreground"
                          )}>
                            {chapter.title}
                          </h3>
                          {chapter.topics.length > 0 && (
                            <Badge variant="secondary" className="ml-2">
                              <ListChecks className="h-3 w-3 mr-1" />
                              {chapter.completedTopics}/{chapter.totalTopics}
                            </Badge>
                          )}
                        </div>
                        {chapter.description && (
                          <p className="text-sm text-muted-foreground mb-3">
                            {chapter.description}
                          </p>
                        )}
                        
                        {/* Progress Bar */}
                        {chapter.topics.length > 0 && (
                          <div className="mb-4">
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                              <span>Topic Progress</span>
                              <span>{Math.round(chapter.progress)}%</span>
                            </div>
                            <Progress value={chapter.progress} className="h-2" />
                          </div>
                        )}
                        
                        {/* Topics Section */}
                        {chapter.topics.length > 0 && (
                          <div className="mb-3">
                            <button
                              onClick={() => toggleChapterExpanded(chapter.id)}
                              className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors mb-2"
                            >
                              {chapter.expanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                              Topics ({chapter.topics.length})
                            </button>
                            
                            {chapter.expanded && (
                              <div className="space-y-2 pl-6 border-l-2 border-muted ml-2">
                                {chapter.topics.map((topic) => (
                                  <div
                                    key={topic.id}
                                    className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 transition-colors group"
                                  >
                                    <button
                                      onClick={() => toggleTopicComplete(chapter.id, topic.id)}
                                      className="hover:scale-110 transition-transform"
                                    >
                                      {topic.completed ? (
                                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                                      ) : (
                                        <Circle className="h-5 w-5 text-gray-400 hover:text-primary" />
                                      )}
                                    </button>
                                    <span className={cn(
                                      "flex-1 text-sm",
                                      topic.completed && "line-through text-muted-foreground"
                                    )}>
                                      {topic.name}
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={() => handleDeleteTopic(chapter.id, topic.id)}
                                    >
                                      <Trash2 className="h-3 w-3 text-red-500" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Materials */}
                        {chapter.materials.length > 0 && (
                          <div>
                            <div className="text-xs font-semibold text-muted-foreground mb-2">
                              Materials ({chapter.materials.length})
                            </div>
                            <div className="space-y-2">
                              {chapter.materials.map((material) => {
                                const fileUrls = material.fileUrl ? material.fileUrl.split(',') : [];
                                
                                return (
                                  <div key={material.id} className="space-y-2">
                                    {/* Material Header */}
                                    <div className="flex items-center gap-2 p-2 rounded border bg-card hover:bg-muted/50 transition-colors">
                                      {getMaterialIcon(material.type)}
                                      <div className="flex-1 min-w-0">
                                        <div className="font-medium text-sm">{material.title}</div>
                                        {material.description && (
                                          <div className="text-xs text-muted-foreground truncate">
                                            {material.description}
                                          </div>
                                        )}
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 w-7 p-0 text-destructive"
                                        onClick={() => handleDeleteMaterial(chapter.id, material.id)}
                                        title="Delete Material"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>

                                    {/* Files List */}
                                    {fileUrls.length > 0 && fileUrls[0] && (
                                      <div className="pl-8 space-y-1">
                                        {fileUrls.map((fileUrl, idx) => {
                                          const fileName = fileUrl.split('/').pop() || `File ${idx + 1}`;
                                          const isImage = fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                                          
                                          return (
                                            <div
                                              key={idx}
                                              className="flex items-center gap-2 p-2 rounded bg-muted/50 hover:bg-muted transition-colors group"
                                            >
                                              {isImage ? (
                                                <img 
                                                  src={fileUrl} 
                                                  alt={fileName}
                                                  className="h-8 w-8 object-cover rounded cursor-pointer"
                                                  onClick={() => window.open(fileUrl, '_blank')}
                                                />
                                              ) : (
                                                <FileText className="h-5 w-5 text-blue-600" />
                                              )}
                                              <button
                                                onClick={() => window.open(fileUrl, '_blank')}
                                                className="flex-1 text-left text-xs hover:underline cursor-pointer truncate"
                                                title={fileName}
                                              >
                                                {fileName}
                                              </button>
                                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  className="h-6 w-6 p-0"
                                                  onClick={() => window.open(fileUrl, '_blank')}
                                                  title="Open"
                                                >
                                                  <Eye className="h-3 w-3" />
                                                </Button>
                                                <a
                                                  href={fileUrl}
                                                  download={fileName}
                                                  onClick={(e) => e.stopPropagation()}
                                                >
                                                  <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 w-6 p-0"
                                                    title="Download"
                                                  >
                                                    <Download className="h-3 w-3" />
                                                  </Button>
                                                </a>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}

                                    {/* External URL */}
                                    {material.externalUrl && (
                                      <div className="pl-8">
                                        <a
                                          href={material.externalUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex items-center gap-2 p-2 rounded bg-muted/50 hover:bg-muted transition-colors text-xs hover:underline"
                                        >
                                          <LinkIcon className="h-4 w-4 text-blue-600" />
                                          <span className="flex-1 truncate">{material.externalUrl}</span>
                                          <Eye className="h-3 w-3" />
                                        </a>
                                      </div>
                                    )}

                                    {/* Note Content */}
                                    {material.content && (
                                      <div className="pl-8">
                                        <div className="p-2 rounded bg-muted/50 text-xs">
                                          <div className="text-muted-foreground mb-1">Note:</div>
                                          <div className="whitespace-pre-wrap">{material.content}</div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openTopicDialog(chapter)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Topics
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openMaterialDialog(chapter)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Material
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openChapterDialog(chapter)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteChapter(chapter.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </div>

        {/* Material Dialog */}
        <Dialog open={isMaterialDialogOpen} onOpenChange={setIsMaterialDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-primary" />
                Add Learning Material
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {/* Material Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="materialTitle" className="text-base font-semibold">Material Title *</Label>
                  <Input
                    id="materialTitle"
                    value={materialForm.title}
                    onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })}
                    placeholder="e.g., Chapter 3 - Neural Networks"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="materialType" className="text-base font-semibold">Type</Label>
                  <select
                    id="materialType"
                    value={materialForm.type}
                    onChange={(e) => setMaterialForm({ ...materialForm, type: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-2"
                  >
                    <option value="PDF">📄 PDF Document</option>
                    <option value="SLIDE">📊 Presentation Slides</option>
                    <option value="NOTE">📝 Notes</option>
                    <option value="VIDEO">🎥 Video</option>
                    <option value="LINK">🔗 External Link</option>
                    <option value="CODE">💻 Code File</option>
                    <option value="IMAGE">🖼️ Image</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="materialDesc" className="text-base font-semibold">Description (Optional)</Label>
                <Textarea
                  id="materialDesc"
                  value={materialForm.description}
                  onChange={(e) => setMaterialForm({ ...materialForm, description: e.target.value })}
                  placeholder="Brief description of this material"
                  rows={2}
                  className="mt-2"
                />
              </div>

              <Tabs defaultValue="file" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="file" className="text-base">
                    <FileText className="h-4 w-4 mr-2" />
                    Upload Files
                  </TabsTrigger>
                  <TabsTrigger value="link" className="text-base">
                    <LinkIcon className="h-4 w-4 mr-2" />
                    External Link
                  </TabsTrigger>
                  <TabsTrigger value="note" className="text-base">
                    <Edit2 className="h-4 w-4 mr-2" />
                    Text Notes
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="file" className="space-y-4 mt-6">
                  <div className="border-2 border-dashed border-primary/30 rounded-lg p-6 bg-primary/5 hover:bg-primary/10 transition-colors">
                    <Label htmlFor="fileUpload" className="cursor-pointer">
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-4 bg-primary/10 rounded-full">
                          <Download className="h-8 w-8 text-primary" />
                        </div>
                        <div className="text-center">
                          <div className="text-base font-semibold mb-1">Click to upload files</div>
                          <div className="text-sm text-muted-foreground">
                            PDF, PowerPoint, Excel, Word, Images
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Multiple files supported
                          </div>
                        </div>
                      </div>
                      <Input
                        id="fileUpload"
                        type="file"
                        multiple
                        accept=".pdf,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.webp,.xlsx,.xls,.doc,.docx"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </Label>
                  </div>
                  
                  {uploadedFiles.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-semibold">
                          Uploaded Files ({uploadedFiles.length})
                        </Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            uploadedFiles.forEach(f => URL.revokeObjectURL(f.url));
                            setUploadedFiles([]);
                          }}
                          className="text-xs"
                        >
                          Clear All
                        </Button>
                      </div>
                      <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-3 bg-muted/30">
                        {uploadedFiles.map((file, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-3 bg-background rounded-lg border hover:border-primary transition-colors group">
                            <div className="flex-shrink-0">
                              {file.type.startsWith('image/') ? (
                                <div className="relative">
                                  <img 
                                    src={file.url} 
                                    alt={file.name} 
                                    className="h-16 w-16 object-cover rounded border-2 border-border"
                                  />
                                  <div className="absolute inset-0 bg-black/0 hover:bg-black/10 rounded transition-colors" />
                                </div>
                              ) : (
                                <div className="h-16 w-16 flex items-center justify-center bg-blue-50 dark:bg-blue-950 rounded border-2 border-blue-200 dark:border-blue-800">
                                  <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{file.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {file.type || 'Unknown type'}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleRemoveFile(file.url)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t">
                    <Label htmlFor="fileUrl" className="text-sm font-semibold">Or paste file URL/Path</Label>
                    <Input
                      id="fileUrl"
                      value={materialForm.fileUrl}
                      onChange={(e) => setMaterialForm({ ...materialForm, fileUrl: e.target.value })}
                      placeholder="https://example.com/file.pdf or /files/document.pdf"
                      className="mt-2"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="link" className="space-y-4 mt-6">
                  <div>
                    <Label htmlFor="externalUrl" className="text-base font-semibold">External URL</Label>
                    <Input
                      id="externalUrl"
                      value={materialForm.externalUrl}
                      onChange={(e) => setMaterialForm({ ...materialForm, externalUrl: e.target.value })}
                      placeholder="https://youtube.com/watch?v=... or https://docs.google.com/..."
                      className="mt-2"
                    />
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-start gap-2 text-sm">
                        <LinkIcon className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div className="text-blue-900 dark:text-blue-100">
                          <strong>Supported:</strong> YouTube, Google Drive, Dropbox, OneDrive, or any public URL
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="note" className="space-y-4 mt-6">
                  <div>
                    <Label htmlFor="content" className="text-base font-semibold">Note Content</Label>
                    <Textarea
                      id="content"
                      value={materialForm.content}
                      onChange={(e) => setMaterialForm({ ...materialForm, content: e.target.value })}
                      placeholder="Write your notes, summaries, or important points here..."
                      rows={10}
                      className="mt-2 font-mono text-sm"
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={closeMaterialDialog} size="lg">
                Cancel
              </Button>
              <Button onClick={handleAddMaterial} size="lg" className="min-w-32">
                <Plus className="mr-2 h-5 w-5" />
                Add Material
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Topics Dialog */}
        <Dialog open={isTopicDialogOpen} onOpenChange={setIsTopicDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <ListChecks className="h-6 w-6 text-primary" />
                Add Topics to Chapter
              </DialogTitle>
            </DialogHeader>
            {selectedChapter && (
              <div className="space-y-6 py-4">
                <div className="bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-950/20 dark:to-teal-950/20 p-4 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Chapter</div>
                      <div className="font-semibold text-lg">{selectedChapter.title}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground mb-1">Current Topics</div>
                      <div className="text-2xl font-bold text-primary">{selectedChapter.topics.length}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="topicList" className="text-base font-semibold mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Add New Topics
                  </Label>
                  <Textarea
                    id="topicList"
                    value={topicForm.topics}
                    onChange={(e) => setTopicForm({ topics: e.target.value })}
                    placeholder="Enter each topic on a new line. Example:&#10;&#10;Introduction to Neural Networks&#10;Backpropagation Algorithm&#10;Convolutional Neural Networks&#10;Recurrent Neural Networks&#10;LSTM and GRU&#10;Transfer Learning"
                    rows={14}
                    className="font-mono text-sm resize-none"
                  />
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-2 text-sm">
                      <div className="text-blue-600 dark:text-blue-400 mt-0.5">💡</div>
                      <div className="text-blue-900 dark:text-blue-100">
                        <strong>Tips:</strong>
                        <ul className="mt-1 space-y-1 list-disc list-inside">
                          <li>Each line becomes a separate topic</li>
                          <li>Topics can be ticked off individually after adding</li>
                          <li>Empty lines will be ignored</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {topicForm.topics.trim() && (
                  <div className="bg-muted/50 p-4 rounded-lg border">
                    <div className="text-sm font-semibold mb-2">Preview:</div>
                    <div className="text-sm text-muted-foreground">
                      {topicForm.topics.split('\n').filter(t => t.trim()).length} topic(s) will be added
                    </div>
                  </div>
                )}
              </div>
            )}
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setIsTopicDialogOpen(false)} size="lg">
                Cancel
              </Button>
              <Button onClick={handleAddTopics} size="lg" className="min-w-32">
                <Plus className="mr-2 h-5 w-5" />
                Add Topics
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
