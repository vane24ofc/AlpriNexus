
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Zap } from 'lucide-react';
import type { Course } from '@/types/course'; // Asegurarnos que la importación de Course sea correcta
import { allPlatformCourses } from '@/app/dashboard/courses/explore/page'; // Importar la lista maestra de cursos

const LOCAL_STORAGE_ENROLLED_KEY = 'simulatedEnrolledCourseIds';

interface EnrolledCourseDisplay extends Course {
  // Podríamos añadir campos específicos para la visualización aquí si fuera necesario
  // Por ahora, Course tiene todo lo que necesitamos, incluyendo thumbnailUrl, instructorName.
  // Añadimos 'progress' como un campo que podría ser específico del estado del estudiante.
  progress: number;
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

    // Filtrar de 'allPlatformCourses' aquellos que están en 'enrolledIds'
    // Y añadirles un progreso simulado (0-100)
    const coursesToDisplay = allPlatformCourses
      .filter(course => enrolledIds.has(course.id) && course.status === 'approved') // Solo mostrar cursos aprobados
      .map(course => ({
        ...course,
        instructorName: course.instructorName, // Asegurar que instructorName esté
        progress: Math.floor(Math.random() * 101) // Progreso simulado entre 0 y 100
      }));
      
    setEnrolledCourses(coursesToDisplay);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <p className="text-lg">Cargando tus cursos...</p>
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
                  <Progress value={course.progress} aria-label={`Progreso del curso ${course.title}: ${course.progress}%`} className="h-2" />
                </div>
                <Button asChild className="w-full bg-primary hover:bg-primary/90">
                  <Link href={`/dashboard/courses/${course.id}/view`}> 
                    {course.progress === 100 ? 'Ver Certificado' : (course.progress > 0 ? 'Continuar Aprendiendo' : 'Empezar Curso')}
                    <Zap className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

    