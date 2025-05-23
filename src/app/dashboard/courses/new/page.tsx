
"use client";

import React, { useState } from 'react';
import CourseForm, { simulateFileUpload } from '@/app/dashboard/courses/course-form';
import type { Course, Lesson } from '@/types/course';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useSessionRole } from '@/app/dashboard/layout';
import { PlusCircle, Loader2 } from 'lucide-react';

export default function CreateCoursePage() {
  const { toast } = useToast();
  const router = useRouter();
  const { currentSessionRole } = useSessionRole();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: any, thumbnailUrl?: string) => {
    setIsSubmitting(true);
    console.log("Datos del curso a crear:", data);
    console.log("URL de Miniatura (simulada/existente):", thumbnailUrl);

    // Simulación de creación de curso
    const newCourse: Course = {
      id: crypto.randomUUID(),
      title: data.title,
      description: data.description,
      thumbnailUrl: thumbnailUrl || "https://placehold.co/600x400.png?text=Curso",
      instructorName: "Usuario Actual", // Debería venir de la sesión
      status: currentSessionRole === 'instructor' ? 'pending' : 'approved',
      lessons: data.lessons.map((lesson: any, index: number) => ({
        id: crypto.randomUUID(),
        title: lesson.title,
      })),
      interactiveContent: data.interactiveContent,
    };

    // En una app real, aquí harías una llamada API para guardar el curso.
    // Y si es un instructor, se enviaría para revisión.
    // Si es admin, se publicaría directamente o se guardaría como borrador.

    await new Promise(resolve => setTimeout(resolve, 1500)); // Simular guardado

    toast({
      title: currentSessionRole === 'instructor' ? "Curso Enviado a Revisión" : "Curso Creado Exitosamente",
      description: `El curso "${newCourse.title}" ha sido ${currentSessionRole === 'instructor' ? 'enviado para su revisión' : 'creado'}.`,
    });

    setIsSubmitting(false);

    if (currentSessionRole === 'administrador') {
      router.push('/dashboard/admin/courses'); // Redirigir a la lista de cursos del admin
    } else {
      router.push('/dashboard/instructor'); // Redirigir al panel del instructor
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
