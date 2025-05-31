
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import CourseForm from '@/app/dashboard/courses/course-form';
import type { Course, Lesson } from '@/types/course';
import { useToast } from '@/hooks/use-toast';
import { useSessionRole } from '@/app/dashboard/layout';
import { Edit3, Loader2, AlertTriangle } from 'lucide-react';

export default function EditCoursePage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;

  const { currentSessionRole, userProfile } = useSessionRole();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCourse, setIsLoadingCourse] = useState(true);
  const [initialCourseData, setInitialCourseData] = useState<Course | undefined>(undefined);

  const fetchCourseData = useCallback(async () => {
    if (!courseId) {
        setIsLoadingCourse(false);
        toast({ variant: "destructive", title: "Error", description: "ID de curso no válido."});
        return;
    }
    setIsLoadingCourse(true);
    try {
      const response = await fetch(`/api/courses/${courseId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Curso no encontrado (ID: ${courseId}) o fallo al obtenerlo.`);
      }
      const courseToEdit: Course = await response.json();
      
      // Ensure lessons have default values for form compatibility if API doesn't provide them all
      const formattedLessons = courseToEdit.lessons.map(l => ({
        id: l.id,
        title: l.title,
        contentType: l.contentType || 'text',
        content: l.content || '',
        videoUrl: l.videoUrl || '',
        quizPlaceholder: l.quizPlaceholder || '',
        quizOptions: (l.quizOptions && l.quizOptions.length > 0) ? (l.quizOptions.concat(['','','']).slice(0,3) as [string,string,string]) : ['', '', ''],
        correctQuizOptionIndex: l.correctQuizOptionIndex,
      }));

      setInitialCourseData({ ...courseToEdit, lessons: formattedLessons });
    } catch (error: any) {
      console.error("Error cargando curso vía API:", error);
      toast({ variant: "destructive", title: "Error al Cargar", description: error.message });
      if (currentSessionRole === 'administrador') router.push('/dashboard/admin/courses');
      else if (currentSessionRole === 'instructor') router.push('/dashboard/instructor/my-courses');
      else router.push('/dashboard');
    } finally {
      setIsLoadingCourse(false);
    }
  }, [courseId, router, toast, currentSessionRole]);

  useEffect(() => {
    fetchCourseData();
  }, [fetchCourseData]);

  const handleSubmit = async (formData: any, thumbnailUrlFromForm?: string) => {
    setIsSubmitting(true);

    if (!initialCourseData) {
        toast({ variant: "destructive", title: "Error", description: "No hay datos iniciales del curso para actualizar." });
        setIsSubmitting(false);
        return;
    }
    
    // Determine instructor name - should generally not change on edit unless admin is editing
    // For simplicity, we keep the original instructor name unless admin explicitly changes it (not a feature yet)
    const instructorNameToSet = initialCourseData.instructorName || userProfile.name || "Instructor Desconocido";

    // Determine status: if instructor edits, it goes back to pending. Admin can change status directly.
    let newStatus = initialCourseData.status;
    if (currentSessionRole === 'instructor' && initialCourseData.status !== 'pending') {
      newStatus = 'pending';
    }
    // If admin is editing, they might want to change status directly (not implemented in this form, but API supports it)
    // For now, admin edits retain current status unless explicitly changed via admin course list.

    const coursePayload = {
      // We don't send id, createdAt, updatedAt to the PUT payload for the course itself.
      // The API uses the courseId from the URL.
      title: formData.title,
      description: formData.description,
      thumbnailUrl: thumbnailUrlFromForm || initialCourseData.thumbnailUrl || "https://placehold.co/600x400.png?text=Curso",
      instructorName: instructorNameToSet,
      status: newStatus, 
      lessons: formData.lessons.map((lesson: any) => ({
        // Send existing lesson ID if available for potential reuse/update by API, or API generates new if not.
        // Our current API replaces all lessons, so new IDs will be generated for all.
        id: lesson.id, // Keep original lesson id if it exists
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
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(coursePayload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error Data:", errorData);
        throw new Error(errorData.message || `Error ${response.status} al actualizar el curso.`);
      }
      const updatedCourseAPI = await response.json();
      toast({ title: "Curso Actualizado Exitosamente", description: `El curso "${updatedCourseAPI.course.title}" ha sido actualizado.` });
      
      if (currentSessionRole === 'administrador') {
        router.push('/dashboard/admin/courses');
      } else if (currentSessionRole === 'instructor') {
        router.push('/dashboard/instructor/my-courses');
      } else {
        router.push('/dashboard');
      }
      router.refresh(); 
    } catch (error: any) {
      console.error("Error actualizando curso vía API:", error);
      toast({ variant: "destructive", title: "Error de Actualización", description: error.message || "No se pudo actualizar el curso." });
    } finally {
        setIsSubmitting(false);
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
    return (
      <div className="flex h-screen flex-col items-center justify-center space-y-4 text-center p-4">
        <AlertTriangle className="h-12 w-12 text-destructive mb-3" />
        <p className="text-xl font-semibold text-destructive">Error al Cargar el Curso</p>
        <p className="text-muted-foreground">No se pudieron cargar los datos del curso para editar. Es posible que el curso no exista o haya ocurrido un problema de red.</p>
        <Button onClick={() => router.back()} className="mt-4">Volver</Button>
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
    
