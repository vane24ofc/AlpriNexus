
"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Zap } from 'lucide-react';

interface EnrolledCourse {
  id: string;
  title: string;
  instructor: string;
  thumbnailUrl: string;
  progress: number; // 0-100
  dataAiHint: string;
}

const sampleEnrolledCourses: EnrolledCourse[] = [
  { id: 'course-js-adv', title: 'JavaScript Avanzado: Patrones y Prácticas Modernas', instructor: 'Dr. Evelyn Woods', thumbnailUrl: 'https://placehold.co/600x338.png?text=JS+Avanzado', progress: 65, dataAiHint: 'javascript programming' },
  { id: 'course-python-ds', title: 'Python para Ciencia de Datos: De Cero a Héroe', instructor: 'Prof. Ian Stone', thumbnailUrl: 'https://placehold.co/600x338.png?text=Python+DS', progress: 30, dataAiHint: 'python data' },
  { id: 'course-ux-design', title: 'Fundamentos del Diseño de Experiencia de Usuario (UX)', instructor: 'Ana Lima', thumbnailUrl: 'https://placehold.co/600x338.png?text=Diseño+UX', progress: 95, dataAiHint: 'ux design' },
  { id: 'course-react-native', title: 'Desarrollo de Apps Móviles con React Native', instructor: 'Carlos Vega', thumbnailUrl: 'https://placehold.co/600x338.png?text=React+Native', progress: 15, dataAiHint: 'mobile development' },
];

export default function MyEnrolledCoursesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
          <BookOpen className="mr-3 h-8 w-8 text-primary" />
          Mis Cursos Inscritos
        </h1>
      </div>

      {sampleEnrolledCourses.length === 0 ? (
        <Card className="shadow-lg">
          <CardContent className="py-10 text-center">
            <BookOpen className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Aún no te has inscrito en ningún curso.</h3>
            <p className="text-muted-foreground mb-4">Explora nuestro catálogo y encuentra tu próxima aventura de aprendizaje.</p>
            <Button asChild>
              <Link href="/dashboard/courses/explore">Explorar Cursos (Próximamente)</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleEnrolledCourses.map((course) => (
            <Card key={course.id} className="overflow-hidden shadow-lg hover:shadow-primary/20 transition-shadow flex flex-col">
              <div className="relative w-full h-48">
                <Image
                  src={course.thumbnailUrl}
                  alt={course.title}
                  fill
                  style={{ objectFit: 'cover' }}
                  className="bg-muted"
                  data-ai-hint={course.dataAiHint}
                />
              </div>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg leading-tight line-clamp-2" title={course.title}>{course.title}</CardTitle>
                <CardDescription className="text-xs pt-1">Por: {course.instructor}</CardDescription>
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
                  <Link href={`/dashboard/courses/${course.id}/view`}> {/* Placeholder para la vista del curso */}
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
