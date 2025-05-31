
"use client";

import React, { useState } from 'react';
import CourseForm from '@/app/dashboard/courses/course-form';
import type { Course, Lesson } from '@/types/course';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useSessionRole } from '@/app/dashboard/layout';
import { PlusCircle } from 'lucide-react';

export default function CreateCoursePage() {
  const { toast } = useToast();
  const router = useRouter();
  const { currentSessionRole, userProfile } = useSessionRole();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: any, thumbnailUrlFromForm?: string) => {
    setIsSubmitting(true);
    
    let instructorNameToSet = "Instructor Desconocido";
    if (currentSessionRole === 'instructor' && userProfile.name) {
      instructorNameToSet = userProfile.name;
    } else if (currentSessionRole === 'administrador' && userProfile.name) {
      instructorNameToSet = userProfile.name; 
    } else if (currentSessionRole === 'administrador') {
      instructorNameToSet = "Administración AlpriNexus";
    }

    const coursePayload = {
      title: formData.title,
      description: formData.description,
      thumbnailUrl: thumbnailUrlFromForm || "https://placehold.co/600x400.png?text=Curso",
      instructorName: instructorNameToSet,
      status: currentSessionRole === 'instructor' ? 'pending' : 'approved',
      lessons: formData.lessons.map((lesson: any) => ({
        // id is not sent, API will generate it
        title: lesson.title,
        contentType: lesson.contentType || 'text',
        content: lesson.contentType === 'text' ? lesson.content || undefined : undefined,
        videoUrl: lesson.contentType === 'video' ? lesson.videoUrl || undefined : undefined,
        quizPlaceholder: lesson.contentType === 'quiz' ? lesson.quizPlaceholder || undefined : undefined,
        quizOptions: lesson.contentType === 'quiz' ? (lesson.quizOptions || []).filter((opt: string) => opt && opt.trim() !== '') : undefined,
        correctQuizOptionIndex: lesson.contentType === 'quiz' ? lesson.correctQuizOptionIndex : undefined,
      })),
      interactiveContent: formData.interactiveContent || null,
      dataAiHint: formData.title.substring(0,20) || null,
    };

    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(coursePayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error Data:", errorData);
        throw new Error(errorData.message || `Error ${response.status} al crear el curso.`);
      }

      const result = await response.json();
      toast({
        title: currentSessionRole === 'instructor' ? "Curso Enviado a Revisión" : "Curso Creado Exitosamente",
        description: `El curso "${result.course.title}" ha sido creado con ID ${result.course.id}.`,
      });

      if (currentSessionRole === 'administrador') {
        router.push('/dashboard/admin/courses');
      } else { 
        router.push('/dashboard/instructor/my-courses');
      }
      router.refresh(); // Forzar la actualización de datos en la página de destino
    } catch (error: any) {
        console.error("Error creando curso vía API:", error);
        toast({
            variant: "destructive",
            title: "Error de Creación",
            description: error.message || "No se pudo crear el curso. Revise los datos o inténtelo más tarde."
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
    
