
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, BarChart3, Zap, Award, CheckCircle, Library, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useSessionRole } from '@/app/dashboard/layout';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation'; // Import useRouter

const SIMULATED_STUDENT_USER_ID = 3; 

interface ApiEnrolledCourse {
  enrollmentId: string;
  userId: number;
  courseId: string;
  enrolledAt: string;
  completedAt: string | null;
  progressPercent: number;
  course: {
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

interface StudentDashboardCourseDisplay {
  id: string; 
  title: string;
  description: string;
  thumbnailUrl: string;
  instructorName: string;
  dataAiHint?: string;
  progress: number; 
  isCompleted: boolean; 
}

export default function StudentDashboardPage() {
  const { userProfile } = useSessionRole(); 
  const { toast } = useToast();
  const [enrolledCourseDetails, setEnrolledCourseDetails] = useState<StudentDashboardCourseDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchEnrolledCourses = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/enrollments/user/${SIMULATED_STUDENT_USER_ID}`);
      if (!response.ok) {
        if (response.status === 404) { 
          setEnrolledCourseDetails([]);
        } else {
          const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}`}));
          throw new Error(errorData.message || 'Error al cargar los cursos inscritos.');
        }
      } else {
        const apiEnrollments: ApiEnrolledCourse[] = await response.json();
        const processedEnrollments: StudentDashboardCourseDisplay[] = apiEnrollments
          .filter(enrollment => enrollment.course && enrollment.course.status === 'approved') 
          .map(enrollment => ({
            id: enrollment.course.id,
            title: enrollment.course.title,
            description: enrollment.course.description,
            thumbnailUrl: enrollment.course.thumbnailUrl,
            instructorName: enrollment.course.instructorName,
            dataAiHint: enrollment.course.dataAiHint,
            progress: enrollment.progressPercent,
            isCompleted: !!enrollment.completedAt || enrollment.progressPercent === 100,
          }));
        setEnrolledCourseDetails(processedEnrollments);
      }
    } catch (error: any) {
      console.error("Error cargando cursos inscritos para el estudiante:", error);
      toast({ variant: "destructive", title: "Error al Cargar Cursos", description: error.message });
      setEnrolledCourseDetails([]); 
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchEnrolledCourses();
  }, [fetchEnrolledCourses]);

  const courseToContinue = useMemo(() => {
    if (enrolledCourseDetails.length === 0) return null;
    const incompleteCourses = enrolledCourseDetails.filter(course => !course.isCompleted);
    if (incompleteCourses.length > 0) {
      incompleteCourses.sort((a, b) => {
        if (b.progress !== a.progress) return b.progress - a.progress;
        return a.title.localeCompare(b.title);
      });
      return incompleteCourses[0];
    }
    const completedCourses = enrolledCourseDetails.filter(course => course.isCompleted);
    if (completedCourses.length > 0) {
        completedCourses.sort((a,b) => a.title.localeCompare(b.title)); 
        return completedCourses[0];
    }
    return null; 
  }, [enrolledCourseDetails]);

  const numCompletedCourses = useMemo(() => enrolledCourseDetails.filter(c => c.isCompleted).length, [enrolledCourseDetails]);
  const numEnrolledCourses = enrolledCourseDetails.length;

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-150px)] flex-col items-center justify-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">Cargando tu panel de aprendizaje...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Mi Panel de Aprendizaje</h1>
      
      <Card className="shadow-xl bg-gradient-to-r from-primary/30 to-accent/30 border-primary/50">
        <CardHeader>
          <CardTitle className="text-2xl">Continuar Aprendiendo</CardTitle>
          <CardDescription>
            {courseToContinue 
              ? (courseToContinue.progress < 100 ? "Retoma donde lo dejaste en tu curso más reciente." : "¡Felicidades! Has completado este curso. Puedes revisarlo o explorar otros.")
              : (numEnrolledCourses > 0 ? "¡Excelente trabajo! Parece que has completado todos tus cursos inscritos." : "Empieza tu viaje de aprendizaje explorando el catálogo.")
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row items-center gap-6">
          {courseToContinue ? (
            <>
              <Image 
                src={courseToContinue.thumbnailUrl} 
                alt={courseToContinue.title} 
                width={300} height={170} 
                className="rounded-lg shadow-md object-cover" 
                data-ai-hint={courseToContinue.dataAiHint || "education learning"}
                priority
              />
              <div>
                <h3 className="text-xl font-semibold">{courseToContinue.title}</h3>
                <p className="text-sm text-muted-foreground mb-1">Por: {courseToContinue.instructorName}</p>
                <div className="w-full bg-muted rounded-full h-2.5 mb-3">
                  <div className={`h-2.5 rounded-full ${courseToContinue.isCompleted ? 'bg-accent' : 'bg-primary'}`} style={{ width: `${courseToContinue.progress}%` }}></div>
                </div>
                <Button asChild className={`${courseToContinue.isCompleted ? 'bg-accent hover:bg-accent/90 text-accent-foreground' : 'bg-primary hover:bg-primary/90'}`}>
                  <Link href={`/dashboard/courses/${courseToContinue.id}/view`}>
                    {courseToContinue.progress < 100 ? "Reanudar Curso" : "Revisar Curso"}
                    <Zap className="ml-2 h-4 w-4"/>
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center w-full py-4">
              {numEnrolledCourses > 0 ? (
                <p className="text-lg">¡Felicidades por tu progreso! Considera explorar nuevos cursos.</p>
              ) : (
                <p className="text-lg">Aún no estás inscrito en ningún curso.</p>
              )}
              <Button asChild className="mt-4">
                <Link href="/dashboard/courses/explore">
                  <Library className="mr-2 h-4 w-4" /> Ver Catálogo de Cursos
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Mis Cursos Inscritos ({numEnrolledCourses})</h2>
        <Button variant="outline" asChild>
            <Link href="/dashboard/courses/explore">
                <Library className="mr-2 h-4 w-4" /> Ver Catálogo
            </Link>
        </Button>
      </div>
      {enrolledCourseDetails.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {enrolledCourseDetails.map((course) => (
            <Card key={course.id} className="overflow-hidden shadow-lg hover:shadow-primary/20 transition-shadow">
              <Image src={course.thumbnailUrl} alt={course.title} width={600} height={300} className="w-full h-48 object-cover" data-ai-hint={course.dataAiHint || "course thumbnail"} />
              <CardHeader>
                <CardTitle className="text-lg leading-tight line-clamp-2" title={course.title}>{course.title}</CardTitle>
                <CardDescription>Por: {course.instructorName}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between text-sm text-muted-foreground mb-1">
                  <span>Progreso</span>
                  <span>{course.progress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className={`h-2 rounded-full ${course.progress === 100 ? 'bg-accent' : 'bg-primary'}`} style={{ width: `${course.progress}%` }}></div>
                </div>
                <Button variant="outline" size="sm" asChild className="w-full mt-4">
                  <Link href={`/dashboard/courses/${course.id}/view`}>{course.progress === 100 ? 'Revisar Curso' : 'Continuar Aprendiendo'}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-10 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-3"/>
            <p className="text-muted-foreground">No tienes cursos inscritos en este momento.</p>
          </CardContent>
        </Card>
      )}
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center"><BarChart3 className="mr-2 h-5 w-5 text-primary" />Progreso General</CardTitle>
            <CardDescription>Tus estadísticas de aprendizaje.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center"><span>Cursos Completados:</span> <span className="font-semibold">{numCompletedCourses}</span></div>
            <div className="flex justify-between items-center"><span>Total Inscritos:</span> <span className="font-semibold">{numEnrolledCourses}</span></div>
            {/* Puntuación Promedio eliminada */}
            <Button variant="secondary" className="w-full mt-2" asChild>
                 <Link href="/dashboard/student/my-courses">Ver Mis Cursos Detallados</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center"><Award className="mr-2 h-5 w-5 text-accent" />Logros e Insignias</CardTitle>
            <CardDescription>Hitos que has desbloqueado.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center text-center min-h-[150px]">
            <Award className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              El sistema de logros e insignias está en desarrollo.
            </p>
            <p className="text-xs text-muted-foreground">¡Vuelve pronto para ver tus reconocimientos!</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    

    