
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, PlusCircle, MessageSquare, Loader2, Edit3 } from "lucide-react";
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

  const fetchCoursesForInstructor = useCallback(async () => {
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
  }, [userProfile.name, currentSessionRole, toast]);

  useEffect(() => {
    fetchCoursesForInstructor();
  }, [fetchCoursesForInstructor]);

  const pendingReviewCount = useMemo(() =>
    instructorCourses.filter(c => c.status === 'pending').length,
    [instructorCourses]
  );

  const stats = useMemo(() => [
    { title: "Mis Cursos Creados", value: instructorCourses.length.toString(), icon: BookOpen, link: "/dashboard/instructor/my-courses" },
    { title: "Cursos Pendientes de Revisión", value: pendingReviewCount.toString(), icon: MessageSquare, link: "/dashboard/instructor/my-courses" },
  ], [instructorCourses, pendingReviewCount]);

  if (isLoading && currentSessionRole === 'instructor') {
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2"> {/* Ajustado a 2 columnas para las métricas restantes */}
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

      <div className="grid gap-6 lg:grid-cols-1"> {/* Ajustado a 1 columna para el resumen de cursos */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Mis Cursos (Resumen)</CardTitle>
            <CardDescription>Un vistazo rápido a tus cursos y su estado actual.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && instructorCourses.length === 0 ? (
                <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="ml-3 text-muted-foreground">Cargando tus cursos...</p>
                </div>
            ) : instructorCourses.length > 0 ? (
              <ul className="space-y-4">
                {instructorCourses.slice(0, 5).map((course) => { // Mostrar hasta 5 cursos
                  const studentsSimulated = Math.floor(Math.random() * 130) + 25; 
                  const progressSimulated = course.status === 'approved' ? (Math.floor(Math.random() * 60) + 40) : (course.status === 'pending' ? Math.floor(Math.random() * 25) : 0) ;
                  return (
                  <li key={course.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg line-clamp-1" title={course.title}>{course.title}</h3>
                        <p className="text-sm text-muted-foreground">{studentsSimulated} estudiantes (simulado)</p>
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
                        <span>Participación estimada (simulada): {progressSimulated}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div className={`h-2.5 rounded-full ${progressSimulated > 70 ? 'bg-accent' : 'bg-primary'}`} style={{ width: `${progressSimulated}%` }}></div>
                      </div>
                    </div>
                  </li>
                )})}
              </ul>
            ) : (
              <p className="text-muted-foreground text-center py-4">Aún no has creado cursos. ¡Anímate a crear el primero!</p>
            )}
            {instructorCourses.length > 5 && ( // Si hay más de 5 cursos, mostrar botón
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
