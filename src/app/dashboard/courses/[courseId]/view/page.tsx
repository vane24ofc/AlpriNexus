
"use client";

import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowLeft, BookOpen, PlayCircle, FileText, CheckCircle, Loader2, Youtube, Puzzle, Award, ClipboardCheck, AlertTriangle } from 'lucide-react';
import type { Course, Lesson } from '@/types/course';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const SIMULATED_STUDENT_USER_ID = 3; 
const QUIZ_STATE_STORAGE_PREFIX = 'simulatedQuizState_';
const ENGAGEMENT_DURATION = 3000;

const fallbackSampleCourse: Course = {
    id: 'fallback-course',
    title: 'Curso de Ejemplo No Encontrado',
    description: 'Este es un curso de ejemplo que se muestra si el curso solicitado no se encuentra en el almacenamiento local o la API falla.',
    thumbnailUrl: 'https://placehold.co/800x450.png',
    dataAiHint: 'placeholder example',
    instructorName: 'Sistema AlpriNexus',
    status: 'approved',
    lessons: [
      {id: 'l1-fallback', title: 'Lección de Ejemplo 1', contentType: 'text', content: 'Contenido de la lección de ejemplo.'},
      {id: 'l2-fallback', title: 'Lección de Ejemplo 2 (Video)', contentType: 'video', videoUrl: 'https://www.youtube.com/embed/PkZNo7MFNFg', content: 'Descripción del video de ejemplo.'},
      {id: 'l3-fallback', title: 'Lección de Ejemplo 3 (Quiz)', contentType: 'quiz', quizPlaceholder: '¿Es este un quiz de ejemplo?', quizOptions: ['Sí', 'No'], correctQuizOptionIndex: 0 },
    ],
    interactiveContent: '<p class="text-center p-4 bg-muted rounded-md">No hay contenido interactivo para este curso de ejemplo.</p>'
};

interface QuizAttemptState {
  started: boolean;
  answered: boolean;
  selectedOptionIndex: number | null;
  isCorrect: boolean | null;
}

export default function StudentCourseViewPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [currentEnrollmentId, setCurrentEnrollmentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [activeAccordionItem, setActiveAccordionItem] = useState<string | undefined>(undefined);
  const [quizState, setQuizState] = useState<Record<string, QuizAttemptState>>({});
  const [lessonsReadyForCompletion, setLessonsReadyForCompletion] = useState<Set<string>>(new Set());
  const engagementTimersRef = useRef<Record<string, NodeJS.Timeout>>({});
  const [isCertificateDialogOpen, setIsCertificateDialogOpen] = useState(false);
  const [initialProgressFromDB, setInitialProgressFromDB] = useState<number | null>(null);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (courseId) {
        setIsLoading(true);
        let fetchedCourseData: Course & { enrollment?: { enrollmentId: string, progressPercent: number, completedAt: string | null } } | null = null;

        try {
          const courseResponse = await fetch(`/api/courses/${courseId}?userId=${SIMULATED_STUDENT_USER_ID}`);
          if (courseResponse.ok) {
            fetchedCourseData = await courseResponse.json();
          } else {
            const errorData = await courseResponse.json().catch(() => ({ message: `HTTP error! status: ${courseResponse.status}`}));
            throw new Error(errorData.message || `Error cargando curso: ${courseResponse.status}`);
          }

          if (fetchedCourseData) {
            setCourse(fetchedCourseData);
            if (fetchedCourseData.enrollment?.enrollmentId) {
                setCurrentEnrollmentId(fetchedCourseData.enrollment.enrollmentId);
            }
            if (fetchedCourseData.enrollment?.progressPercent !== undefined) {
                setInitialProgressFromDB(fetchedCourseData.enrollment.progressPercent);
            }


            const completedLessonsResponse = await fetch(`/api/courses/${courseId}/user/${SIMULATED_STUDENT_USER_ID}/completed-lessons`);
            let initialCompleted = new Set<string>();
            if (completedLessonsResponse.ok) {
              const completedLessonIds: string[] = await completedLessonsResponse.json();
              initialCompleted = new Set<string>(completedLessonIds);
            } else {
              console.warn(`Could not fetch completed lessons for course ${courseId}`);
            }
            setCompletedLessons(initialCompleted);

            const initialQuizStateFromStorage: Record<string, QuizAttemptState> = {};
            const initialReadyForCompletionFromStorage = new Set<string>();

            fetchedCourseData.lessons.forEach(lesson => {
              const isLessonMarkedCompletedByApi = initialCompleted.has(lesson.id);
              if (lesson.contentType === 'quiz') {
                const storedQuizStateForLesson = localStorage.getItem(`${QUIZ_STATE_STORAGE_PREFIX}${lesson.id}`);
                let parsedState: QuizAttemptState = { started: false, answered: false, selectedOptionIndex: null, isCorrect: null };
                if (storedQuizStateForLesson) {
                  try {
                      parsedState = JSON.parse(storedQuizStateForLesson) as QuizAttemptState;
                  } catch (e) { console.error("Failed to parse quiz state for lesson", lesson.id, e); }
                }
                initialQuizStateFromStorage[lesson.id] = parsedState;
                if (parsedState.answered || isLessonMarkedCompletedByApi) { 
                  initialReadyForCompletionFromStorage.add(lesson.id);
                }
              } else if (isLessonMarkedCompletedByApi) {
                   initialReadyForCompletionFromStorage.add(lesson.id);
              }
            });
            setQuizState(initialQuizStateFromStorage);
            setLessonsReadyForCompletion(initialReadyForCompletionFromStorage);

            if (fetchedCourseData.lessons && fetchedCourseData.lessons.length > 0) {
              const allDone = initialCompleted.size === fetchedCourseData.lessons.length;
              if (!allDone) {
                  const firstUncompleted = fetchedCourseData.lessons.find(l => !initialCompleted.has(l.id));
                  setActiveAccordionItem(firstUncompleted ? `lesson-${firstUncompleted.id}` : `lesson-${fetchedCourseData.lessons[0].id}`);
              } else {
                   setActiveAccordionItem(`lesson-${fetchedCourseData.lessons[0].id}`);
              }
            }
          } else {
            throw new Error("No course data received from API.");
          }

        } catch (apiError: any) {
          console.error("API error fetching course details:", apiError);
          toast({
            variant: "destructive",
            title: "Error al Cargar Curso",
            description: apiError.message || "No se pudo cargar el curso desde el servidor.",
          });
          setCourse(fallbackSampleCourse); 
          setCompletedLessons(new Set());
          setQuizState({});
          setLessonsReadyForCompletion(new Set());
          if (fallbackSampleCourse.lessons.length > 0) {
            setActiveAccordionItem(`lesson-${fallbackSampleCourse.lessons[0].id}`);
          }
        }
        setIsLoading(false);
      } else {
        setIsLoading(false);
        setCourse(fallbackSampleCourse);
         toast({
            variant: "destructive",
            title: "ID de Curso Inválido",
            description: "No se proporcionó un ID de curso válido.",
          });
      }
    };
    fetchCourseDetails();
     return () => {
        Object.values(engagementTimersRef.current).forEach(clearTimeout);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, toast]);

  const courseProgress = useMemo(() => {
    if (initialProgressFromDB !== null && completedLessons.size === 0 && course && course.lessons.length > 0) {
        if (initialProgressFromDB > 0 && completedLessons.size / course.lessons.length * 100 < initialProgressFromDB ) {
           return initialProgressFromDB;
        }
    }
    if (!course || !course.lessons || course.lessons.length === 0) return 0;
    return Math.round((completedLessons.size / course.lessons.length) * 100);
  }, [course, completedLessons, initialProgressFromDB]);

  const allLessonsCompleted = useMemo(() => {
    if (!course || !course.lessons || course.lessons.length === 0) return false;
    return completedLessons.size === course.lessons.length;
  }, [course, completedLessons]);

  const handleToggleLessonComplete = useCallback(async (lessonId: string) => {
    if (!course) {
        toast({ variant: "destructive", title: "Error", description: "No se pudo obtener la información del curso." });
        return;
    }

    try {
      const completeLessonResponse = await fetch(`/api/lessons/${lessonId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: SIMULATED_STUDENT_USER_ID, courseId: course.id }),
      });

      if (!completeLessonResponse.ok) {
        const errorData = await completeLessonResponse.json();
        throw new Error(errorData.message || `Error ${completeLessonResponse.status} al marcar la lección.`);
      }
      
      let newProgressPercent = 0;
      let allCompletedAfterThis = false;

      setCompletedLessons(prev => {
        const newSet = new Set(prev);
        newSet.add(lessonId);
        const lessonTitle = course?.lessons.find(l => l.id === lessonId)?.title;
        toast({ title: "¡Lección Marcada!", description: `Has marcado la lección "${lessonTitle}" como completada.` });

        if (course && course.lessons.length > 0) {
            newProgressPercent = Math.round((newSet.size / course.lessons.length) * 100);
        }

        allCompletedAfterThis = (course && newSet.size === course.lessons.length) || false;
        if (allCompletedAfterThis) {
            toast({ title: "¡Curso Completado!", description: `¡Felicidades! Has completado el curso "${course.title}".`, duration: 5000, className: "bg-accent text-accent-foreground border-accent" });
        }
        return newSet;
      });

      // Now, update the overall course progress in the database
      if (currentEnrollmentId) {
        const progressResponse = await fetch(`/api/enrollments/${currentEnrollmentId}/progress`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ progressPercent: newProgressPercent }),
        });

        if (!progressResponse.ok) {
          const errorData = await progressResponse.json();
          console.error("Error actualizando el progreso general del curso:", errorData.message || `Error ${progressResponse.status}`);
          toast({ variant: "destructive", title: "Error de Progreso", description: "No se pudo actualizar el progreso general del curso en la base de datos." });
        } else {
          // Update initialProgressFromDB to reflect the new DB state for UI consistency.
          setInitialProgressFromDB(newProgressPercent);
          if (allCompletedAfterThis && newProgressPercent === 100) {
            // Optionally, re-fetch course details to get the completedAt timestamp if backend sets it and UI needs it.
            // For now, the toast and UI update are likely sufficient.
          }
        }
      } else {
        console.warn("No enrollmentId found, cannot update course progress in DB.");
        toast({ variant: "destructive", title: "Advertencia", description: "No se encontró la inscripción para actualizar el progreso general." });
      }

    } catch (error: any) {
      console.error("Error marking lesson complete or updating progress:", error);
      toast({ variant: "destructive", title: "Error", description: error.message || "No se pudo marcar la lección como completada o actualizar el progreso." });
    }
  }, [course, toast, currentEnrollmentId]);

  const handleCourseAction = () => {
    if (!course || !course.lessons || course.lessons.length === 0) return;
    if (allLessonsCompleted) {
      setIsCertificateDialogOpen(true);
      return;
    }
    const firstUncompletedLesson = course.lessons.find(lesson => !completedLessons.has(lesson.id));
    if (firstUncompletedLesson) {
      setActiveAccordionItem(`lesson-${firstUncompletedLesson.id}`);
    } else if (course.lessons.length > 0) {
      setActiveAccordionItem(`lesson-${course.lessons[0].id}`);
    }
  };

  const handleNextLesson = (currentIndex: number) => {
    if (course && course.lessons && currentIndex < course.lessons.length - 1) {
      const nextLessonId = course.lessons[currentIndex + 1].id;
      setActiveAccordionItem(`lesson-${nextLessonId}`);
    }
  };

  const handleStartQuiz = useCallback((lessonId: string) => {
    const currentQuiz = quizState[lessonId] || { started: false, answered: false, selectedOptionIndex: null, isCorrect: null };
    if (currentQuiz.answered && completedLessons.has(lessonId)) return;

    const newStateForQuiz = { ...currentQuiz, started: true, answered: false, selectedOptionIndex: null, isCorrect: null };
    setQuizState(prev => ({ ...prev, [lessonId]: newStateForQuiz }));
    localStorage.setItem(`${QUIZ_STATE_STORAGE_PREFIX}${lessonId}`, JSON.stringify(newStateForQuiz));
    toast({ title: "Quiz Iniciado", description: "¡Mucha suerte!" });
  }, [quizState, completedLessons, toast]);

  const handleAnswerQuiz = useCallback(async (lessonId: string, selectedOptionIndex: number) => {
    const lesson = course?.lessons.find(l => l.id === lessonId);
    if (!lesson || !lesson.quizOptions) return;
    if (quizState[lessonId]?.answered && !completedLessons.has(lessonId)) return;

    const isCorrect = lesson.correctQuizOptionIndex !== undefined && selectedOptionIndex === lesson.correctQuizOptionIndex;

    const newStateForQuiz: QuizAttemptState = { started: true, answered: true, selectedOptionIndex, isCorrect };
    
    setQuizState(prev => ({ ...prev, [lessonId]: newStateForQuiz }));
    localStorage.setItem(`${QUIZ_STATE_STORAGE_PREFIX}${lessonId}`, JSON.stringify(newStateForQuiz));

    setLessonsReadyForCompletion(prev => {
        const newSet = new Set(prev);
        newSet.add(lessonId);
        return newSet;
    });

    toast({
        title: "Respuesta Registrada",
        description: "Tu respuesta ha sido guardada. Marca la lección como completada para ver la revisión.",
    });
  }, [course, quizState, completedLessons, toast]);


  const handleAccordionChange = useCallback((value: string | undefined) => {
    const prevActiveLessonIdKey = activeAccordionItem?.replace('lesson-', '');
    const currentActiveLessonIdKey = value?.replace('lesson-', '');

    if (prevActiveLessonIdKey && engagementTimersRef.current[prevActiveLessonIdKey]) {
      if (!lessonsReadyForCompletion.has(prevActiveLessonIdKey) && !completedLessons.has(prevActiveLessonIdKey)) {
        clearTimeout(engagementTimersRef.current[prevActiveLessonIdKey]);
        delete engagementTimersRef.current[prevActiveLessonIdKey];
      }
    }

    setActiveAccordionItem(value);

    if (value && currentActiveLessonIdKey) {
      const lesson = course?.lessons.find(l => l.id === currentActiveLessonIdKey);
      if (lesson && (lesson.contentType === 'text' || lesson.contentType === 'video')) {
        if (!completedLessons.has(lesson.id) && !lessonsReadyForCompletion.has(lesson.id)) {
          engagementTimersRef.current[lesson.id] = setTimeout(() => {
            setLessonsReadyForCompletion(prev => {
                const newSet = new Set(prev);
                newSet.add(lesson.id);
                return newSet;
            });
            if (engagementTimersRef.current[lesson.id]) {
                delete engagementTimersRef.current[lesson.id];
            }
          }, ENGAGEMENT_DURATION);
        }
      }
    }
  }, [activeAccordionItem, lessonsReadyForCompletion, completedLessons, course]);

  const renderLessonContent = (lesson: Lesson) => {
    const contentType = lesson.contentType || 'text';
    const currentQuizData = quizState[lesson.id] || { started: false, answered: false, selectedOptionIndex: null, isCorrect: null };
    const isLessonMarkedCompleted = completedLessons.has(lesson.id);

    const quizOptionsToDisplay = (lesson.quizOptions && lesson.quizOptions.filter(opt => typeof opt === 'string' && opt.trim() !== '').length > 0)
        ? lesson.quizOptions.filter(opt => typeof opt === 'string' && opt.trim() !== '')
        : ['Opción Ejemplo A', 'Opción Ejemplo B', 'Opción Ejemplo C'];

    switch (contentType) {
      case 'video':
        const isYouTubeEmbed = lesson.videoUrl && lesson.videoUrl.includes("youtube.com/embed/");
        return (
          <div className="space-y-3">
            {isYouTubeEmbed ? (
              <div className="bg-muted rounded-md overflow-hidden shadow-inner">
                <iframe
                  width="100%"
                  style={{ aspectRatio: '16/9' }}
                  src={lesson.videoUrl}
                  title={`Video: ${lesson.title}`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="block"
                ></iframe>
              </div>
            ) : (
              <div className="p-4 bg-muted rounded-md flex flex-col items-center justify-center text-muted-foreground aspect-video">
                <Youtube className="h-12 w-12 mb-2" />
                <span>{lesson.videoUrl ? "URL de video no válida para incrustar o el formato no es soportado." : "Video no disponible."}</span>
              </div>
            )}
            {lesson.content && <p className="text-sm text-muted-foreground mt-2">{lesson.content}</p>}
          </div>
        );
      case 'quiz':
        return (
          <div className="p-4 bg-muted/70 rounded-md space-y-4">
            <div className="flex items-center text-primary mb-2">
              <Puzzle className="h-6 w-6 mr-2" />
              <h5 className="font-semibold text-lg">Quiz Interactivo</h5>
            </div>
            <p className="text-sm font-semibold text-foreground">{lesson.quizPlaceholder || "Pon a prueba tus conocimientos."}</p>

            {!currentQuizData.started && !isLessonMarkedCompleted && (
              <Button
                variant="outline"
                onClick={() => handleStartQuiz(lesson.id)}
                className="bg-card hover:bg-card/90"
              >
                Comenzar Quiz
              </Button>
            )}

            {(currentQuizData.started || isLessonMarkedCompleted) && (
              <div className="space-y-3">
                <div className="flex flex-col gap-2">
                  {quizOptionsToDisplay.map((option, index) => {
                    const isSelected = currentQuizData.selectedOptionIndex === index;
                    let buttonStyleClasses = "w-full justify-start text-left h-auto py-2.5 px-3 ";

                    if (isLessonMarkedCompleted && currentQuizData.answered) {
                       if (isSelected) { 
                           buttonStyleClasses += currentQuizData.isCorrect
                               ? "bg-green-500 text-white hover:bg-green-600 border-green-500"
                               : "bg-destructive text-destructive-foreground hover:bg-destructive/90 border-destructive";
                       } else if (lesson.correctQuizOptionIndex === index && currentQuizData.isCorrect === false) { 
                           buttonStyleClasses += "bg-green-500/20 border-2 border-green-500 text-green-700 dark:text-green-300";
                       } else {
                           buttonStyleClasses += "bg-card hover:bg-card/90 opacity-70";
                       }
                    } else if (currentQuizData.answered && isSelected) {
                        buttonStyleClasses += "bg-primary/20 border-primary";
                    } else if (currentQuizData.started && isSelected) {
                         buttonStyleClasses += "bg-primary/20 border-primary";
                    } else {
                        buttonStyleClasses += "bg-card hover:bg-card/90";
                    }

                    return (
                        <Button
                            key={`${lesson.id}-option-${index}`}
                            variant="outline"
                            onClick={() => !currentQuizData.answered && handleAnswerQuiz(lesson.id, index)}
                            disabled={currentQuizData.answered || (isLessonMarkedCompleted && currentQuizData.answered)}
                            className={buttonStyleClasses}
                        >
                        {option}
                        </Button>
                    );
                   })}
                </div>
                {currentQuizData.answered && !isLessonMarkedCompleted && (
                    <p className="text-xs mt-2 font-medium text-muted-foreground">
                        Tu respuesta ha sido registrada. Marca la lección como completada para ver la revisión.
                    </p>
                )}
                 {isLessonMarkedCompleted && currentQuizData.answered && (
                    <div className="mt-3 p-3 border rounded-md text-sm font-medium">
                        {currentQuizData.isCorrect ? (
                            <p className="text-green-600">¡Correcto! Has seleccionado la respuesta acertada.</p>
                        ) : (
                            <p className="text-destructive">Incorrecto. La respuesta seleccionada no fue la correcta.</p>
                        )}
                    </div>
                )}
              </div>
            )}
          </div>
        );
      case 'text':
      default:
        return (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p>{lesson.content || "Contenido no disponible."}</p>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-3 text-lg">Cargando curso...</p>
      </div>
    );
  }

  if (!course) { 
    return (
      <div className="text-center py-10">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h1 className="text-2xl font-semibold text-destructive">Curso no encontrado</h1>
        <p className="text-muted-foreground">El curso que buscas no existe o ha sido eliminado.</p>
        <Button onClick={() => router.back()} className="mt-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => router.back()} className="mb-2">
        <ArrowLeft className="mr-2 h-4 w-4" /> Volver
      </Button>

      <Card className="shadow-xl overflow-hidden">
        <div className="relative w-full h-64 md:h-80 lg:h-96">
          <Image
            src={course.thumbnailUrl}
            alt={course.title}
            fill
            style={{ objectFit: 'cover' }}
            className="bg-muted"
            priority
            data-ai-hint={course.dataAiHint || `course ${course.title.substring(0,20)}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-6 flex flex-col justify-end">
            <h1 className="text-3xl md:text-4xl font-bold text-white shadow-md leading-tight">{course.title}</h1>
            <p className="text-md text-slate-200 mt-1">Por: {course.instructorName}</p>
          </div>
        </div>
        <CardContent className="pt-6">
          <CardDescription className="text-base leading-relaxed">{course.description}</CardDescription>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <BookOpen className="mr-3 h-6 w-6 text-primary" />
                Lecciones del Curso
              </CardTitle>
              <CardDescription>Explora el contenido del curso lección por lección. Marca las lecciones como completadas.</CardDescription>
            </CardHeader>
            <CardContent>
              {course.lessons && course.lessons.length > 0 ? (
                <Accordion
                    type="single"
                    collapsible
                    className="w-full"
                    value={activeAccordionItem}
                    onValueChange={handleAccordionChange}
                >
                  {course.lessons.map((lesson, index) => {
                    const isCompleted = completedLessons.has(lesson.id);
                    const isReadyForCompletion = lessonsReadyForCompletion.has(lesson.id);
                    const buttonDisabled = isCompleted || !isReadyForCompletion;

                    let LessonIcon = FileText;
                    let iconClassName = "text-primary/70";

                    if (isCompleted) {
                        LessonIcon = CheckCircle;
                        iconClassName = "text-green-500";
                    } else if (isReadyForCompletion) {
                        LessonIcon = ClipboardCheck;
                        iconClassName = "text-blue-500";
                    }

                    return (
                        <AccordionItem value={`lesson-${lesson.id}`} key={lesson.id} className="border-border">
                        <AccordionTrigger className="text-lg hover:no-underline px-3 py-4 hover:bg-muted/50 rounded-t-md data-[state=open]:bg-muted/60 data-[state=open]:rounded-b-none">
                            <div className="flex items-center text-left flex-1 gap-2">
                            <LessonIcon className={`mr-2 h-5 w-5 ${iconClassName} flex-shrink-0`} />
                            <span className={`text-primary font-semibold mr-1 ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>{index + 1}.</span>
                            <span className={`${isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{lesson.title}</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 py-4 bg-card border-t-0 border-b border-x border-border rounded-b-md space-y-4 max-h-[60vh] overflow-y-auto">
                            {renderLessonContent(lesson)}
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4 pt-4 border-t border-border">
                                <Button
                                    size="sm"
                                    onClick={() => handleToggleLessonComplete(lesson.id)}
                                    disabled={buttonDisabled}
                                    variant={isCompleted ? "secondary" : "default"}
                                    className="w-full sm:w-auto"
                                >
                                    {isCompleted ? (
                                        <> <CheckCircle className="mr-2 h-4 w-4" /> Lección Completada </>
                                    ) : (
                                        <> <PlayCircle className="mr-2 h-4 w-4" /> Marcar como Completada </>
                                    )}
                                </Button>
                                {index < course.lessons.length - 1 && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleNextLesson(index)}
                                        className="w-full sm:w-auto"
                                    >
                                        Siguiente Lección <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                                    </Button>
                                )}
                            </div>
                        </AccordionContent>
                        </AccordionItem>
                    );
                  })}
                </Accordion>
              ) : (
                <p className="text-muted-foreground">No hay lecciones definidas para este curso todavía.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          {course.interactiveContent && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Contenido Interactivo Adicional</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: course.interactiveContent }} />
              </CardContent>
            </Card>
          )}
           <Card>
            <CardHeader style={{ padding: '16px 20px 8px' }}>
                <CardTitle style={{ fontSize: '1.5rem' }} className="text-foreground">Progreso del Curso</CardTitle>
            </CardHeader>
            <CardContent className="text-center pt-4 pb-5 px-5">
                <div className="relative w-32 h-32 mx-auto -mt-4">
                    <svg className="w-full h-full" viewBox="0 0 36 36" transform="rotate(-90 18 18)">
                        <path
                        className="text-muted/30"
                        strokeWidth="4"
                        fill="none"
                        stroke="currentColor"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                        className={allLessonsCompleted ? "text-accent" : "text-primary"}
                        strokeWidth="4"
                        fill="none"
                        strokeLinecap="round"
                        stroke="currentColor"
                        strokeDasharray={`${courseProgress}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                    </svg>
                    <div className="absolute inset-0 z-10 flex items-center justify-center">
                        <span className={`text-xl font-normal ${allLessonsCompleted ? "text-accent-foreground" : "text-foreground"}`}>
                            {courseProgress}%
                        </span>
                    </div>
                </div>
                <p className={`text-sm font-normal mt-2 mb-4 ${allLessonsCompleted ? "text-foreground" : "text-muted-foreground"}`}>
                    {allLessonsCompleted ? "Curso completado" : `${completedLessons.size} de ${course?.lessons?.length || 0} lecciones completadas`}
                </p>
                <Progress value={courseProgress} aria-label={`Progreso del curso: ${courseProgress}%`} className={`h-3 mb-3 ${allLessonsCompleted ? "[&>div]:bg-accent" : "[&>div]:bg-primary"}`} />
                <Button
                  className="w-full text-base py-2.5"
                  onClick={handleCourseAction}
                  variant={allLessonsCompleted ? "default" : "default"}
                  style={allLessonsCompleted ? { backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' } : {}}
              >
                  {allLessonsCompleted ? <><Award className="mr-2 h-5 w-5" /> Ver Certificado (Simulado)</> : (courseProgress > 0 ? "Continuar donde lo dejaste" : "Empezar Curso")}
              </Button>

            </CardContent>
          </Card>
        </div>
      </div>
      <AlertDialog open={isCertificateDialogOpen} onOpenChange={setIsCertificateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
                <Award className="mr-2 h-6 w-6 text-accent" />
                ¡Felicidades!
            </AlertDialogTitle>
            <AlertDialogDescription>
              Has completado el curso "{course?.title}". Aquí se mostraría tu certificado digital.
              Esta es una simulación, ¡pero tu esfuerzo es real!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsCertificateDialogOpen(false)}>Entendido</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
