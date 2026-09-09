'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  ChevronRight,
  Plus,
  Layers,
  FileText,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Course {
  id: string;
  name: string;
  code: string;
  color: string;
  description?: string;
  totalTopics: number;
  completedTopics: number;
  totalChapters: number;
  completedChapters: number;
}

export default function CoursesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const userId = 'cmtszibhe0000uzf04p06d1fe';

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/subjects?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      }
    } catch (error) {
      console.error('Error loading courses:', error);
      toast({
        title: 'Error',
        description: 'Failed to load courses',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="mb-8">
            <div className="h-10 w-64 bg-muted animate-pulse rounded mb-2"></div>
            <div className="h-6 w-96 bg-muted animate-pulse rounded"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 bg-muted animate-pulse rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Academic Courses</h1>
          <p className="text-lg text-muted-foreground">
            Track your progress across all subjects
          </p>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {courses.map((course) => {
            const progress = course.totalChapters > 0
              ? (course.completedChapters / course.totalChapters) * 100
              : 0;
            
            return (
              <Card
                key={course.id}
                className="cursor-pointer hover:shadow-lg transition-all"
                onClick={() => router.push(`/courses/${course.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: `${course.color}20` }}
                    >
                      <BookOpen
                        className="h-6 w-6"
                        style={{ color: course.color }}
                      />
                    </div>
                    <Badge
                      variant="secondary"
                      style={{
                        backgroundColor: `${course.color}20`,
                        color: course.color,
                      }}
                    >
                      {course.code}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{course.name}</CardTitle>
                  {course.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                      {course.description}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-semibold">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-xs text-muted-foreground">Chapters</div>
                        <div className="font-semibold">
                          {course.completedChapters} / {course.totalChapters}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-xs text-muted-foreground">Topics</div>
                        <div className="font-semibold">
                          {course.totalTopics}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/courses/${course.id}`);
                    }}
                  >
                    View Details
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}

          {/* Add New Course */}
          <Card className="border-2 border-dashed cursor-pointer hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center min-h-[350px]">
            <div className="text-center p-6">
              <div className="bg-primary/10 rounded-full p-4 inline-block mb-4">
                <Plus className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Add New Course</h3>
              <p className="text-sm text-muted-foreground">
                Track another subject
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
