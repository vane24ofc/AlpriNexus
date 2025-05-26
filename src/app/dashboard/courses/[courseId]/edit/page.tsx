
"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import CourseForm from '@/app/dashboard/courses/course-form';
import type { Course } from '@/types/course';
import { useToast } from '@/hooks/use-toast';
import { useSessionRole } from '@/app/dashboard/layout';
import { Edit3, Loader2 } from 'lucide-react';

const COURSES_STORAGE_KEY = 'nexusAlpriAllCourses';

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
      setIsLoadingCourse(true);
      try {
        const storedCourses = localStorage.getItem(COURSES_STORAGE_KEY);
        if (storedCourses) {
          const courses: Course[] = JSON.parse(storedCourses);
          const courseToEdit = courses.find(c => c.id === courseId);
          if (courseToEdit) {
            // Ensure lessons are in the correct format for the form
            const formattedCourse = {
              ...courseToEdit,
              lessons: courseToEdit.lessons.map(l => ({
                id: l.id,
                title: l.title,
                contentType: l.contentType || 'text',
                content: l.content || '',
                videoUrl: l.videoUrl || '',
                quizPlaceholder: l.quizPlaceholder || ''
              }))
            };
            setInitialCourseData(formattedCourse);
          } else {
            toast({
              variant: "destructive",
              title: "Curso no encontrado",
              description: "No se pudo encontrar el curso para editar en el almacenamiento local.",
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
        } else {
             toast({
                variant: "destructive",
                title: "Datos no encontrados",
                description: "No hay cursos guardados localmente para editar.",
            });
             if (currentSessionRole === 'administrador') {
                router.push('/dashboard/admin/courses');
            } else if (currentSessionRole === 'instructor') {
                router.push('/dashboard/instructor/my-courses');
            } else {
                router.push('/dashboard');
            }
        }
      } catch (error) {
        console.error("Error loading course for editing from localStorage:", error);
        toast({ variant: "destructive", title: "Error al Cargar", description: "No se pudo cargar el curso para editar." });
      } finally {
        setIsLoadingCourse(false);
      }
    }
  }, [courseId, router, toast, currentSessionRole]);

  const handleSubmit = async (data: any, thumbnailUrlFromForm?: string) => {
    setIsSubmitting(true);

    if (!initialCourseData) {
        toast({ variant: "destructive", title: "Error", description: "No hay datos iniciales del curso para actualizar." });
        setIsSubmitting(false);
        return;
    }
    
    const updatedCourse: Course = {
      ...initialCourseData, // Preserve existing ID, instructorName
      title: data.title,
      description: data.description,
      thumbnailUrl: thumbnailUrlFromForm || initialCourseData.thumbnailUrl,
      lessons: data.lessons.map((lesson: any) => ({
        id: lesson.id || crypto.randomUUID(),
        title: lesson.title,
        contentType: lesson.contentType || 'text',
        content: lesson.contentType === 'text' ? lesson.content || '' : undefined,
        videoUrl: lesson.contentType === 'video' ? lesson.videoUrl || undefined : undefined,
        quizPlaceholder: lesson.contentType === 'quiz' ? lesson.quizPlaceholder || '' : undefined,
      })),
      interactiveContent: data.interactiveContent,
      dataAiHint: data.title.substring(0,20), // Update dataAiHint
      // Admin can change status directly, instructor's edits might revert to 'pending'
      status: currentSessionRole === 'administrador' ? (data.status || initialCourseData.status) : 'pending',
    };
     // For instructors, if they edit an approved/rejected course, it should go back to pending.
     // Admins can change status directly if we add a status field to CourseForm (not done yet).
     // For now, admin edits retain original status unless explicitly changed.
    if (currentSessionRole === 'instructor') {
        updatedCourse.status = 'pending';
    } else if (currentSessionRole === 'administrador') {
        // If admin edits, keep existing status unless they specifically change it.
        // (We haven't added a status field to the form for direct admin change yet)
        updatedCourse.status = initialCourseData.status; 
    }


    try {
        const storedCourses = localStorage.getItem(COURSES_STORAGE_KEY);
        let courses: Course[] = storedCourses ? JSON.parse(storedCourses) : [];
        const courseIndex = courses.findIndex(c => c.id === courseId);

        if (courseIndex > -1) {
            courses[courseIndex] = updatedCourse;
            localStorage.setItem(COURSES_STORAGE_KEY, JSON.stringify(courses));
            toast({
                title: "Curso Actualizado Exitosamente",
                description: `El curso "${updatedCourse.title}" ha sido actualizado localmente.`,
            });
        } else {
            toast({ variant: "destructive", title: "Error de Actualización", description: "No se encontró el curso para actualizar." });
        }

        if (currentSessionRole === 'administrador') {
            router.push('/dashboard/admin/courses');
        } else if (currentSessionRole === 'instructor') {
            router.push('/dashboard/instructor/my-courses');
        } else {
            router.push('/dashboard');
        }
    } catch (error) {
        console.error("Error updating course in localStorage:", error);
        toast({ variant: "destructive", title: "Error al Guardar", description: "No se pudo guardar el curso actualizado localmente." });
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
    // Message already shown by useEffect if course not found
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
    