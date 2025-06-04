
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, PlusCircle, MessageSquare, BarChart as BarChartIcon, Star, Edit3, Loader2 } from "lucide-react";
import Link from "next/link";
import type { Course } from '@/types/course';
import { useSessionRole } from '@/app/dashboard/layout';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';


export default function InstructorDashboardPage() {
  const { userProfile, currentSessionRole } = useSessionRole();
  const { toast } = useToast();
  const [instructorCourses, setInstructorCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCoursesForInstructor = async () => {
      if (currentSessionRole !== 'instructor' || !userProfile.name) {
        setIsLoading(false);
        setInstructorCourses([]);
        return;
      }
      setIsLoading(true);
      try {
        const response = await fetch('/api/courses');
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}`}));
          throw new Error(errorData.message || 'Error al cargar los cursos de la plataforma.');
        }
        const allPlatformCourses: Course[] = await response.json();
        const filteredForInstructor = allPlatformCourses.filter(
          course => course.instructorName === userProfile.name
        );
        setInstructorCourses(filteredForInstructor);
      } catch (error: any) {
        console.error("Error cargando cursos para el instructor:", error);
        toast({ variant: "destructive", title: "Error al Cargar Cursos", description: error.message });
        setInstructorCourses([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoursesForInstructor();
  }, [userProfile.name, currentSessionRole, toast]);

  const pendingReviewCount = useMemo(() =>
    instructorCourses.filter(c => c.status === 'pending').length,
    [instructorCourses]
  );

  const stats = useMemo(() => [
    { title: "Mis Cursos", value: instructorCourses.length.toString(), icon: BookOpen, link: "/dashboard/instructor/my-courses" },
    { title: "Estudiantes Totales (Simulado)", value: (instructorCourses.length * (Math.floor(Math.random() * 20) + 5)).toLocaleString(), icon: Users, link: "#" }, // Simulación basada en cursos
    { title: "Revisiones Pendientes", value: pendingReviewCount.toString(), icon: MessageSquare, link: "/dashboard/instructor/my-courses" },
    { title: "Calificación Promedio (Simulado)", value: instructorCourses.length > 0 ? `${(Math.random() * 1 + 4).toFixed(1)}/5` : "N/A", icon: BarChartIcon, link: "#" },
  ], [instructorCourses, pendingReviewCount]);

  const recentFeedbacks = useMemo(() => {
    if (instructorCourses.length === 0) return [];
    return instructorCourses.slice(0, 3).map((course, index) => ({
        student: `Estudiante ${String.fromCharCode(65 + index)}`, // Estudiante A, B, C
        course: course.title,
        comment: `Comentario de ejemplo para "${course.title.substring(0,20)}"...`,
        rating: Math.floor(Math.random() * 3) + 3, // Rating entre 3 y 5
        time: `hace ${index+1}h`
    }));
  }, [instructorCourses]);


  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-150px)] flex-col items-center justify-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">Cargando panel de instructor...</p>
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
              <Button variant="link" size="sm" asChild className="px-0 -ml-1 text-primary">
                <Link href={stat.link}>Ver detalles</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-lg">
          <CardHeader>
            <CardTitle>Mis Cursos (Resumen)</CardTitle>
            <CardDescription>Un vistazo rápido a tus cursos y su estado.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && instructorCourses.length === 0 ? (
                <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : instructorCourses.length > 0 ? (
              <ul className="space-y-4">
                {instructorCourses.slice(0, 3).map((course) => {
                  const students = Math.floor(Math.random() * 150) + 20; // Simulación de estudiantes inscritos
                  // Simulación de progreso, podría basarse en si está aprobado o no.
                  const progress = course.status === 'approved' ? (Math.floor(Math.random() * 70) + 30) : (course.status === 'pending' ? Math.floor(Math.random() * 20) : 0) ;
                  return (
                  <li key={course.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg line-clamp-1" title={course.title}>{course.title}</h3>
                        <p className="text-sm text-muted-foreground">{students} estudiantes inscritos (simulado)</p>
                        <Badge
                          variant={course.status === 'approved' ? 'default' : course.status === 'pending' ? 'secondary' : 'destructive'}
                          className={`mt-1 text-xs ${
                            course.status === 'approved' ? 'bg-accent text-accent-foreground hover:bg-accent/90' :
                            course.status === 'pending' ? 'bg-yellow-500 text-white hover:bg-yellow-600' : ''
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
                        <span>Progreso promedio estudiantes (simulado): {progress}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div className={`h-2.5 rounded-full ${progress > 70 ? 'bg-accent' : 'bg-primary'}`} style={{ width: `${progress}%` }}></div>
                      </div>
                    </div>
                  </li>
                )})}
              </ul>
            ) : (
              <p className="text-muted-foreground text-center py-4">Aún no has creado cursos.</p>
            )}
            {instructorCourses.length > 3 && (
                <Button variant="outline" className="w-full mt-4" asChild>
                    <Link href="/dashboard/instructor/my-courses">Ver todos mis cursos</Link>
                </Button>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Comentarios Recientes (Simulado)</CardTitle>
            <CardDescription>Últimos comentarios de los estudiantes.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentFeedbacks.length > 0 ? (
              <ul className="space-y-3">
                {recentFeedbacks.map((feedback, index) => (
                  <li key={index} className="text-sm border-b border-border pb-2 last:border-b-0">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">{feedback.student} en <span className="text-primary line-clamp-1" title={feedback.course}>{feedback.course.length > 20 ? feedback.course.substring(0,20) + "..." : feedback.course}</span></span>
                      <span className="text-xs text-muted-foreground">{feedback.time}</span>
                    </div>
                    <p className="text-muted-foreground mt-1 line-clamp-2">&quot;{feedback.comment}&quot;</p>
                    <div className="flex items-center mt-1">
                      {Array(5).fill(0).map((_, i) => (
                        <Star key={i} className={`h-3.5 w-3.5 ${i < feedback.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
                <p className="text-muted-foreground text-center py-4">No hay comentarios recientes para tus cursos.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
