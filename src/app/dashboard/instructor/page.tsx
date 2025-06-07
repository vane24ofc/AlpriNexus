
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, PlusCircle, Edit3, Loader2, AlertTriangle, MessageSquare, BarChartIcon, TrendingUp, Percent } from "lucide-react";
import Link from "next/link";
import type { Course } from '@/types/course';
import { useSessionRole } from '@/app/dashboard/layout';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

interface InstructorCourseSummary extends Course {
  enrolledStudentsCount: number;
  averageCourseProgress: number; 
}

export default function InstructorDashboardPage() {
  const { userProfile, currentSessionRole } = useSessionRole();
  const { toast } = useToast();
  const [instructorCoursesSummary, setInstructorCoursesSummary] = useState<InstructorCourseSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchInstructorDashboardData = useCallback(async () => {
    if (currentSessionRole !== 'instructor' || (!userProfile.name && !userProfile.id)) {
      setIsLoading(false);
      setInstructorCoursesSummary([]);
      // No mostrar toast aquí, ya que el rol podría no estar listo inicialmente
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch('/api/instructor/courses-summary');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
        throw new Error(errorData.message || 'Error al cargar los datos del panel del instructor.');
      }
      const summaryData: InstructorCourseSummary[] = await response.json();
      setInstructorCoursesSummary(summaryData);
    } catch (error: any) {
      console.error("Error cargando datos del panel del instructor:", error);
      toast({ variant: "destructive", title: "Error al Cargar Datos", description: error.message });
      setInstructorCoursesSummary([]);
    } finally {
      setIsLoading(false);
    }
  }, [userProfile.name, userProfile.id, currentSessionRole, toast]);

  useEffect(() => {
    // Solo ejecutar si el rol de instructor está confirmado y el perfil tiene datos
    if (currentSessionRole === 'instructor' && (userProfile.name || userProfile.id)) {
        fetchInstructorDashboardData();
    } else if (currentSessionRole && currentSessionRole !== 'instructor') {
        // Si el rol es otro, no hay nada que cargar aquí y terminamos la carga.
        setIsLoading(false);
        setInstructorCoursesSummary([]);
    }
    // Si currentSessionRole es null (aún cargando), esperamos.
  }, [fetchInstructorDashboardData, currentSessionRole, userProfile.name, userProfile.id]);

  const totalCoursesCreated = useMemo(() =>
    instructorCoursesSummary.length,
    [instructorCoursesSummary]
  );

  const pendingReviewCount = useMemo(() =>
    instructorCoursesSummary.filter(c => c.status === 'pending').length,
    [instructorCoursesSummary]
  );

  const averageEnrollmentsPerCourse = useMemo(() => {
    if (instructorCoursesSummary.length === 0) return 0;
    const totalEnrollments = instructorCoursesSummary.reduce((sum, course) => sum + course.enrolledStudentsCount, 0);
    return parseFloat((totalEnrollments / instructorCoursesSummary.length).toFixed(1));
  }, [instructorCoursesSummary]);

  const overallStudentProgressAverage = useMemo(() => {
    if (instructorCoursesSummary.length === 0) return 0;
    const coursesWithProgressData = instructorCoursesSummary.filter(c => c.enrolledStudentsCount > 0); // Consider only courses with students
    if (coursesWithProgressData.length === 0) return 0;

    const totalProgressSum = coursesWithProgressData.reduce((sum, course) => sum + course.averageCourseProgress, 0);
    return parseFloat((totalProgressSum / coursesWithProgressData.length).toFixed(1));
  }, [instructorCoursesSummary]);


  const stats = useMemo(() => [
    { title: "Mis Cursos Creados", value: totalCoursesCreated.toString(), icon: BookOpen, link: "/dashboard/instructor/my-courses" },
    { title: "Cursos Pendientes de Revisión", value: pendingReviewCount.toString(), icon: MessageSquare, linkPathSuffix: "?tab=pending", link: "/dashboard/instructor/my-courses" },
    { title: "Prom. Inscripciones por Curso", value: averageEnrollmentsPerCourse.toString(), icon: Users, link: "/dashboard/instructor/my-courses", unit: "estudiantes/curso" },
    { title: "Progreso Prom. Estudiantes", value: `${overallStudentProgressAverage}%`, icon: Percent, link: "/dashboard/instructor/my-courses", unit: "en mis cursos" },
  ], [totalCoursesCreated, pendingReviewCount, averageEnrollmentsPerCourse, overallStudentProgressAverage]);


  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-150px)] flex-col items-center justify-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">Cargando panel de instructor...</p>
      </div>
    );
  }

  if (currentSessionRole !== 'instructor') {
    return (
      <div className="flex h-screen flex-col items-center justify-center space-y-4 text-center p-4">
        <AlertTriangle className="h-12 w-12 text-destructive mb-3" />
        <p className="text-xl font-semibold text-destructive">Acceso Denegado</p>
        <p className="text-muted-foreground max-w-md">Esta sección es exclusiva para instructores.</p>
        <Button onClick={() => router.push('/dashboard')} className="mt-4">Volver al Panel Principal</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Panel de Instructor</h1>
        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link href="/dashboard/courses/new">
            <PlusCircle className="mr-2 h-5 w-5" /> Crear Nuevo Curso
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="shadow-lg hover:shadow-primary/20 transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.unit && <p className="text-xs text-muted-foreground">{stat.unit}</p>}
              <Button variant="link" size="sm" asChild className="px-0 -ml-1 text-primary">
                <Link href={`${stat.link}${stat.linkPathSuffix || ''}`}>Ver detalles</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-1">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Mis Cursos (Resumen)</CardTitle>
            <CardDescription>Un vistazo rápido a tus cursos, su estado, estudiantes inscritos y progreso promedio.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && instructorCoursesSummary.length === 0 ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-3 text-muted-foreground">Cargando tus cursos...</p>
              </div>
            ) : instructorCoursesSummary.length > 0 ? (
              <ul className="space-y-4">
                {instructorCoursesSummary.slice(0, 5).map((course) => (
                  <li key={course.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg line-clamp-1" title={course.title}>{course.title}</h3>
                        <p className="text-sm text-muted-foreground">{course.enrolledStudentsCount} estudiante(s) inscrito(s)</p>
                        <Badge
                          variant={course.status === 'approved' ? 'default' : course.status === 'pending' ? 'secondary' : 'destructive'}
                          className={`mt-1 text-xs ${course.status === 'approved' ? 'bg-accent text-accent-foreground hover:bg-accent/90' :
                            course.status === 'pending' ? 'bg-yellow-500 text-white hover:bg-yellow-600 border-yellow-500' : ''
                            }`}
                        >
                          {course.status === 'approved' ? 'Aprobado' : course.status === 'pending' ? 'Pendiente de Revisión' : 'Rechazado'}
                        </Badge>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/courses/${course.id}/edit`}>
                          <Edit3 className="mr-2 h-4 w-4" />Gestionar
                        </Link>
                      </Button>
                    </div>
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Progreso promedio estudiantes: {course.averageCourseProgress.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div className={`h-2.5 rounded-full ${course.averageCourseProgress > 70 ? 'bg-accent' : 'bg-primary'}`} style={{ width: `${course.averageCourseProgress}%` }}></div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-center py-4">Aún no has creado cursos. ¡Anímate a crear el primero!</p>
            )}
            {instructorCoursesSummary.length > 5 && (
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link href="/dashboard/instructor/my-courses">Ver todos mis cursos</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    