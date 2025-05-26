
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Zap, Award, CheckCircle, Loader2 } from 'lucide-react'; // Added Loader2
import type { Course } from '@/types/course'; 
import { allPlatformCourses } from '@/app/dashboard/courses/explore/page'; 

const LOCAL_STORAGE_ENROLLED_KEY = 'simulatedEnrolledCourseIds';
const COMPLETED_COURSES_KEY = 'simulatedCompletedCourseIds';

interface EnrolledCourseDisplay extends Course {
  progress: number;
  isCompleted: boolean;
}


export default function MyEnrolledCoursesPage() {
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourseDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const storedEnrolledIdsString = localStorage.getItem(LOCAL_STORAGE_ENROLLED_KEY);
    let enrolledIds: Set<string> = new Set();

    if (storedEnrolledIdsString) {
      try {
        const parsedIds = JSON.parse(storedEnrolledIdsString);
        if (Array.isArray(parsedIds)) {
          enrolledIds = new Set(parsedIds);
        }
      } catch (error) {
        console.error("Error al parsear IDs de cursos inscritos desde localStorage:", error);
      }
    }

    const storedCompletedIdsString = localStorage.getItem(COMPLETED_COURSES_KEY);
    let completedIds: Set<string> = new Set();
    if (storedCompletedIdsString) {
        try {
            const parsedCompletedIds = JSON.parse(storedCompletedIdsString);
            if (Array.isArray(parsedCompletedIds)) {
                completedIds = new Set(parsedCompletedIds);
            }
        } catch (error) {
            console.error("Error al parsear IDs de cursos completados desde localStorage:", error);
        }
    }

    const coursesToDisplay = allPlatformCourses
      .filter(course => enrolledIds.has(course.id) && course.status === 'approved') 
      .map(course => {
        const isCompleted = completedIds.has(course.id);
        let progress = 0;
        if (isCompleted) {
            progress = 100;
        } else {
            // Simulate progress for non-completed courses by checking individual lesson progress
            const courseLessonProgressKey = `${COMPLETED_COURSES_KEY}_${course.id}`;
            const storedLessonProgressString = localStorage.getItem(courseLessonProgressKey);
            if (storedLessonProgressString && course.lessons && course.lessons.length > 0) {
                try {
                    const completedLessonsForThisCourse: string[] = JSON.parse(storedLessonProgressString);
                    progress = Math.round((completedLessonsForThisCourse.length / course.lessons.length) * 100);
                } catch (e) {
                    progress = Math.floor(Math.random() * 99); // Fallback random progress if parsing fails
                }
            } else if (course.lessons && course.lessons.length > 0) {
                 progress = 0; // Default to 0 if no specific lesson progress found
            } else {
                progress = Math.floor(Math.random() * 99); // Fallback for courses with no lessons defined
            }
        }

        return {
          ...course,
          instructorName: course.instructorName,
          progress: progress,
          isCompleted: isCompleted,
        };
      });
      
    setEnrolledCourses(coursesToDisplay);
    setIsLoading(false);
  }, []);

  const handleCertificateClick = (courseTitle: string) => {
    alert(`¡Felicidades! Aquí se mostraría tu certificado para el curso "${courseTitle}".`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-3 text-lg">Cargando tus cursos...</p>
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
            <Card key={course.id} className="overflow-hidden shadow-lg hover:shadow-primary/20 transition-shadow flex flex-col">
              <div className="relative w-full h-48">
                <Image
                  src={course.thumbnailUrl}
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
                {course.isCompleted ? (
                     <Button onClick={() => handleCertificateClick(course.title)} className="w-full bg-primary hover:bg-primary/90">
                        <Award className="mr-2 h-4 w-4" /> Ver Certificado (Simulado)
                    </Button>
                ) : (
                    <Button asChild className="w-full bg-primary hover:bg-primary/90">
                        <Link href={`/dashboard/courses/${course.id}/view`}> 
                            {course.progress > 0 ? 'Continuar Aprendiendo' : 'Empezar Curso'}
                            <Zap className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

    
