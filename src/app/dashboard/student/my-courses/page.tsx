
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Zap, Award, CheckCircle, Loader2 } from 'lucide-react';
import type { Course } from '@/types/course'; // Course type can be used for the nested course object
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"; // Keep for potential future use or other dialogs
import { useToast } from '@/hooks/use-toast';

// Constants for simulated user ID
const SIMULATED_STUDENT_USER_ID = 3;

interface ApiEnrolledCourse {
  enrollmentId: string;
  userId: number;
  courseId: string;
  enrolledAt: string;
  completedAt: string | null;
  progressPercent: number;
  course: { // This structure must match what /api/enrollments/user/[userId] returns
    id: string;
    title: string;
    description: string;
    thumbnailUrl: string;
    instructorName: string;
    status: 'pending' | 'approved' | 'rejected';
    dataAiHint?: string;
    lessons?: any[]; 
  };
}

// This will be the type for the state `enrolledCourses`
interface EnrolledCourseDisplay {
  id: string; // courseId
  title: string;
  description: string;
  thumbnailUrl: string;
  instructorName: string;
  status: 'pending' | 'approved' | 'rejected'; // course status
  lessons: any[]; // Can be simplified if not used extensively in card
  dataAiHint?: string;
  progress: number; // from enrollment.progressPercent
  isCompleted: boolean; // derived from enrollment.completedAt or progressPercent === 100
  enrollmentId?: string; // from enrollment.enrollmentId
}

interface EnrolledCourseCardProps {
  course: EnrolledCourseDisplay;
  // onCertificateClick prop removed
}

const MemoizedEnrolledCourseCard = React.memo(function EnrolledCourseCard({ course }: EnrolledCourseCardProps) {
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-primary/20 transition-shadow flex flex-col">
      <div className="relative w-full h-48">
        <Image
          src={course.thumbnailUrl || 'https://placehold.co/600x338.png'}
          alt={course.title}
          fill
          style={{ objectFit: 'cover' }}
          className="bg-muted"
          data-ai-hint={course.dataAiHint || `course ${course.title.substring(0,15)}`}
        />
        {course.isCompleted && (
            <Badge className="absolute top-2 right-2 bg-accent text-accent-foreground flex items-center">
                <CheckCircle className="mr-1 h-3.5 w-3.5" />
                Completado
            </Badge>
        )}
      </div>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg leading-tight line-clamp-2" title={course.title}>{course.title}</CardTitle>
        <CardDescription className="text-xs pt-1">Por: {course.instructorName}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-end">
        <div className="mb-3">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Progreso</span>
            <span>{course.progress}%</span>
          </div>
          <Progress value={course.progress} aria-label={`Progreso del curso ${course.title}: ${course.progress}%`} className={`h-2 ${course.isCompleted ? "[&>div]:bg-accent" : ""}`} />
        </div>
        <Button asChild className={`w-full ${course.isCompleted ? 'bg-accent hover:bg-accent/90 text-accent-foreground' : 'bg-primary hover:bg-primary/90'}`}>
            <Link href={`/dashboard/courses/${course.id}/view`}>
                {course.isCompleted ? (
                    <> <BookOpen className="mr-2 h-4 w-4" /> Revisar Curso </>
                ) : (
                    <> {course.progress > 0 ? 'Continuar Aprendiendo' : 'Empezar Curso'} <Zap className="ml-2 h-4 w-4" /> </>
                )}
            </Link>
        </Button>
      </CardContent>
    </Card>
  );
});
MemoizedEnrolledCourseCard.displayName = 'MemoizedEnrolledCourseCard';


export default function MyEnrolledCoursesPage() {
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourseDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Removed certificate dialog state
  const { toast } = useToast();

  useEffect(() => {
    const loadEnrolledCourses = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/enrollments/user/${SIMULATED_STUDENT_USER_ID}`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}`}));
          throw new Error(errorData.message || 'Error al cargar cursos inscritos.');
        }
        const apiEnrollments: ApiEnrolledCourse[] = await response.json();
        
        const coursesToDisplay: EnrolledCourseDisplay[] = apiEnrollments
          .filter(enrollment => enrollment.course && enrollment.course.status === 'approved') // Ensure course exists and is approved
          .map(enrollment => ({
            id: enrollment.course.id,
            title: enrollment.course.title,
            description: enrollment.course.description,
            thumbnailUrl: enrollment.course.thumbnailUrl,
            instructorName: enrollment.course.instructorName,
            status: enrollment.course.status,
            lessons: enrollment.course.lessons || [],
            dataAiHint: enrollment.course.dataAiHint,
            progress: enrollment.progressPercent,
            isCompleted: !!enrollment.completedAt || enrollment.progressPercent === 100,
            enrollmentId: enrollment.enrollmentId,
          }));

        setEnrolledCourses(coursesToDisplay);

      } catch (error: any) {
        console.error("Error loading enrolled courses from API:", error);
        toast({
          variant: "destructive",
          title: "Error al Cargar Cursos",
          description: error.message || "No se pudieron cargar tus cursos inscritos.",
        });
        setEnrolledCourses([]); 
      } finally {
        setIsLoading(false);
      }
    };

    loadEnrolledCourses();
  }, [toast]);

  // Removed handleCertificateClick function

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-3 text-lg">Cargando tus cursos inscritos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
          <BookOpen className="mr-3 h-8 w-8 text-primary" />
          Mis Cursos Inscritos
        </h1>
         <Button variant="outline" asChild>
            <Link href="/dashboard/courses/explore">
                Explorar Más Cursos
            </Link>
        </Button>
      </div>

      {enrolledCourses.length === 0 ? (
        <Card className="shadow-lg">
          <CardContent className="py-10 text-center">
            <BookOpen className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Aún no te has inscrito en ningún curso.</h3>
            <p className="text-muted-foreground mb-4">Explora nuestro catálogo y encuentra tu próxima aventura de aprendizaje.</p>
            <Button asChild>
              <Link href="/dashboard/courses/explore">Explorar Cursos</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrolledCourses.map((course) => (
            <MemoizedEnrolledCourseCard
                key={course.id}
                course={course}
                // onCertificateClick prop removed
            />
          ))}
        </div>
      )}

      {/* Certificate AlertDialog removed */}
    </div>
  );
}
