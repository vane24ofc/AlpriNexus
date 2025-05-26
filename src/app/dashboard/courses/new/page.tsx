
"use client";

import React, { useState } from 'react';
import CourseForm from '@/app/dashboard/courses/course-form';
import type { Course } from '@/types/course';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useSessionRole } from '@/app/dashboard/layout';
import { PlusCircle, Loader2 } from 'lucide-react';

const COURSES_STORAGE_KEY = 'nexusAlpriAllCourses';

export default function CreateCoursePage() {
  const { toast } = useToast();
  const router = useRouter();
  const { currentSessionRole } = useSessionRole();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: any, thumbnailUrl?: string) => {
    setIsSubmitting(true);
    
    const newCourse: Course = {
      id: crypto.randomUUID(), // Generate a unique ID
      title: data.title,
      description: data.description,
      thumbnailUrl: thumbnailUrl || "https://placehold.co/600x400.png?text=Curso",
      instructorName: currentSessionRole === 'instructor' ? "Usuario Actual (Instructor)" : "Administrador", // Placeholder
      status: currentSessionRole === 'instructor' ? 'pending' : 'approved',
      lessons: data.lessons.map((lesson: any) => ({
        id: lesson.id || crypto.randomUUID(),
        title: lesson.title,
        contentType: lesson.contentType || 'text',
        content: lesson.contentType === 'text' ? lesson.content || '' : undefined,
        videoUrl: lesson.contentType === 'video' ? lesson.videoUrl || undefined : undefined,
        quizPlaceholder: lesson.contentType === 'quiz' ? lesson.quizPlaceholder || '' : undefined,
      })),
      interactiveContent: data.interactiveContent,
      dataAiHint: data.title.substring(0,20) // Simple data-ai-hint from title
    };

    try {
      const storedCourses = localStorage.getItem(COURSES_STORAGE_KEY);
      const courses: Course[] = storedCourses ? JSON.parse(storedCourses) : [];
      courses.push(newCourse);
      localStorage.setItem(COURSES_STORAGE_KEY, JSON.stringify(courses));

      toast({
        title: currentSessionRole === 'instructor' ? "Curso Enviado a Revisión" : "Curso Creado Exitosamente",
        description: `El curso "${newCourse.title}" ha sido ${currentSessionRole === 'instructor' ? 'enviado para su revisión' : 'creado y añadido localmente'}.`,
      });

      if (currentSessionRole === 'administrador') {
        router.push('/dashboard/admin/courses');
      } else {
        router.push('/dashboard/instructor/my-courses');
      }
    } catch (error) {
        console.error("Error saving new course to localStorage:", error);
        toast({
            variant: "destructive",
            title: "Error al Guardar",
            description: "No se pudo guardar el nuevo curso localmente."
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
          <PlusCircle className="mr-3 h-8 w-8 text-primary" />
          {currentSessionRole === 'instructor' ? 'Crear y Enviar Nuevo Curso' : 'Crear Nuevo Curso'}
        </h1>
      </div>
      <CourseForm onSubmitCourse={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}
    