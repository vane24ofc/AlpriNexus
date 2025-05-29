
"use client";

import React, { useState } from 'react';
import CourseForm from '@/app/dashboard/courses/course-form';
import type { Course } from '@/types/course';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useSessionRole } from '@/app/dashboard/layout';
import { PlusCircle } from 'lucide-react';

const COURSES_STORAGE_KEY = 'nexusAlpriAllCourses';

export default function CreateCoursePage() {
  const { toast } = useToast();
  const router = useRouter();
  const { currentSessionRole, userProfile } = useSessionRole(); // Obtener userProfile
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: any, thumbnailUrl?: string) => {
    setIsSubmitting(true);
    
    // Determinar el nombre del instructor basado en el rol y el perfil del usuario
    let instructorNameToSet = "Instructor Desconocido";
    if (currentSessionRole === 'instructor' && userProfile.name) {
      instructorNameToSet = userProfile.name;
    } else if (currentSessionRole === 'administrador' && userProfile.name) {
      // Los administradores también pueden crear cursos figurando como instructores
      instructorNameToSet = userProfile.name; 
    } else if (currentSessionRole === 'administrador') {
      instructorNameToSet = "Administración AlpriNexus"; // Fallback si el admin no tiene nombre de perfil
    }


    const newCourseData: Course = {
      id: crypto.randomUUID(), // Generate a unique ID
      title: data.title,
      description: data.description,
      thumbnailUrl: thumbnailUrl || "https://placehold.co/600x400.png?text=Curso",
      instructorName: instructorNameToSet,
      status: currentSessionRole === 'instructor' ? 'pending' : 'approved',
      lessons: data.lessons.map((lesson: any) => ({
        id: lesson.id || crypto.randomUUID(),
        title: lesson.title,
        contentType: lesson.contentType || 'text',
        content: lesson.contentType === 'text' ? lesson.content || '' : undefined,
        videoUrl: lesson.contentType === 'video' ? lesson.videoUrl || undefined : undefined,
        quizPlaceholder: lesson.contentType === 'quiz' ? lesson.quizPlaceholder || '' : undefined,
        quizOptions: lesson.contentType === 'quiz' ? (lesson.quizOptions || []).filter((opt: string) => opt && opt.trim() !== '') : undefined,
        correctQuizOptionIndex: lesson.contentType === 'quiz' ? lesson.correctQuizOptionIndex : undefined,
      })),
      interactiveContent: data.interactiveContent,
      dataAiHint: data.title.substring(0,20) // Simple data-ai-hint from title
    };

    // TODO: Reemplazar con llamada a API POST /api/courses
    // try {
    //   const response = await fetch('/api/courses', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(newCourseData),
    //   });
    //   if (!response.ok) throw new Error('Fallo al crear el curso');
    //   const createdCourse = await response.json();
    //   toast({
    //     title: currentSessionRole === 'instructor' ? "Curso Enviado a Revisión" : "Curso Creado Exitosamente",
    //     description: `El curso "${createdCourse.title}" ha sido creado.`,
    //   });
    //   // Redirigir según el rol
    // } catch (error) {
    //   console.error("Error creando curso vía API:", error);
    //   toast({ variant: "destructive", title: "Error de Creación", description: "No se pudo crear el curso." });
    // }

    // Fallback a localStorage mientras la API no está lista
    try {
      const storedCourses = localStorage.getItem(COURSES_STORAGE_KEY);
      const courses: Course[] = storedCourses ? JSON.parse(storedCourses) : [];
      courses.push(newCourseData);
      localStorage.setItem(COURSES_STORAGE_KEY, JSON.stringify(courses));

      toast({
        title: currentSessionRole === 'instructor' ? "Curso Enviado a Revisión" : "Curso Creado Exitosamente",
        description: `El curso "${newCourseData.title}" ha sido ${currentSessionRole === 'instructor' ? 'enviado para su revisión' : 'creado y añadido localmente'}.`,
      });

      if (currentSessionRole === 'administrador') {
        router.push('/dashboard/admin/courses');
      } else { // Instructor
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
    
