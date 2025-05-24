
"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import CourseForm, { simulateFileUpload } from '@/app/dashboard/courses/course-form';
import type { Course, Lesson } from '@/types/course';
import { useToast } from '@/hooks/use-toast';
import { useSessionRole } from '@/app/dashboard/layout';
import { Edit3, Loader2 } from 'lucide-react';

// Sample courses to simulate fetching data - in a real app, this would come from an API
const sampleCourses: Course[] = [
  { id: 'course1', title: 'Fundamentos de JavaScript Moderno', description: 'Aprende JS desde cero.', thumbnailUrl: 'https://placehold.co/600x400.png?text=JS', instructorName: 'Instructor A', status: 'pending', lessons: [{id: 'l1', title: 'Intro JS'}]},
  { id: 'course2', title: 'Python para Ciencia de Datos', description: 'Análisis y visualización.', thumbnailUrl: 'https://placehold.co/600x400.png?text=Python', instructorName: 'Instructor B', status: 'pending', lessons: [{id: 'l1', title: 'Intro Python'}]},
  { id: 'course3', title: 'Diseño UX/UI para Principiantes', description: 'Crea interfaces intuitivas.', thumbnailUrl: 'https://placehold.co/600x400.png?text=UX/UI', instructorName: 'Instructor C', status: 'approved', lessons: [{id: 'l1', title: 'Intro UX'}]},
  { id: 'instrCourse1', title: 'Desarrollo Web Full Stack con Next.js', description: 'Curso completo sobre Next.js.', thumbnailUrl: 'https://placehold.co/600x400.png?text=Next.js', instructorName: 'Usuario Actual', status: 'approved', lessons: [{id: 'l1', title: 'Intro Next.js'}] },
  { id: 'instrCourse2', title: 'Bases de Datos NoSQL con MongoDB', description: 'Aprende MongoDB desde cero.', thumbnailUrl: 'https://placehold.co/600x400.png?text=MongoDB', instructorName: 'Usuario Actual', status: 'pending', lessons: [{id: 'l1', title: 'Intro MongoDB'}] },
];


export default function EditCoursePage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  
  const { currentSessionRole } = useSessionRole();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCourse, setIsLoadingCourse] = useState(true);
  const [initialCourseData, setInitialCourseData] = useState<Course | undefined>(undefined);

  useEffect(() => {
    if (courseId) {
      // Simulate API call to fetch course data
      setTimeout(() => {
        const courseToEdit = sampleCourses.find(c => c.id === courseId);
        if (courseToEdit) {
          setInitialCourseData(courseToEdit);
        } else {
          toast({
            variant: "destructive",
            title: "Curso no encontrado",
            description: "No se pudo encontrar el curso para editar.",
          });
          // Redirect based on role if course not found
          if (currentSessionRole === 'administrador') {
            router.push('/dashboard/admin/courses');
          } else if (currentSessionRole === 'instructor') {
            router.push('/dashboard/instructor/my-courses');
          } else {
            router.push('/dashboard');
          }
        }
        setIsLoadingCourse(false);
      }, 500);
    }
  }, [courseId, router, toast, currentSessionRole]);

  const handleSubmit = async (data: any, thumbnailUrl?: string) => {
    setIsSubmitting(true);
    console.log("Datos del curso a actualizar:", data);
    console.log("URL de Miniatura (simulada/existente):", thumbnailUrl);

    // Simulación de actualización de curso
    const updatedCourse: Course = {
      id: courseId, // Keep the same ID
      title: data.title,
      description: data.description,
      thumbnailUrl: thumbnailUrl || initialCourseData?.thumbnailUrl || "https://placehold.co/600x400.png?text=Curso",
      instructorName: initialCourseData?.instructorName || "Usuario Actual", // Preserve original instructor or update if logic allows
      status: initialCourseData?.status || (currentSessionRole === 'instructor' ? 'pending' : 'approved'), // Preserve status or re-evaluate
      lessons: data.lessons.map((lesson: any) => ({
        id: lesson.id || crypto.randomUUID(), // Preserve existing lesson IDs or generate new ones
        title: lesson.title,
      })),
      interactiveContent: data.interactiveContent,
    };

    // In a real app, here you would make an API call to update the course.
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simular guardado

    toast({
      title: "Curso Actualizado Exitosamente",
      description: `El curso "${updatedCourse.title}" ha sido actualizado.`,
    });

    setIsSubmitting(false);

    // Redirect based on role
    if (currentSessionRole === 'administrador') {
      router.push('/dashboard/admin/courses');
    } else if (currentSessionRole === 'instructor') {
      router.push('/dashboard/instructor/my-courses');
    } else {
      router.push('/dashboard');
    }
  };

  if (isLoadingCourse) {
    return (
      <div className="flex h-screen flex-col items-center justify-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">Cargando datos del curso...</p>
      </div>
    );
  }

  if (!initialCourseData) {
    // This case should ideally be handled by the redirect in useEffect, but as a fallback:
    return (
         <div className="flex h-screen flex-col items-center justify-center space-y-4">
            <p className="text-lg text-destructive">No se pudieron cargar los datos del curso para editar.</p>
         </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
          <Edit3 className="mr-3 h-8 w-8 text-primary" />
          Editar Curso: {initialCourseData.title}
        </h1>
      </div>
      <CourseForm 
        onSubmitCourse={handleSubmit} 
        isSubmitting={isSubmitting}
        initialData={initialCourseData} 
      />
    </div>
  );
}
