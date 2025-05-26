
"use client";

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useRouter }
from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowLeft, BookOpen, PlayCircle, FileText, CheckCircle, Loader2, Youtube, Puzzle, Award } from 'lucide-react';
import type { Course, Lesson } from '@/types/course';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

// Sample courses to simulate fetching data
const sampleCourses: Course[] = [
  {
    id: 'course-js-adv',
    title: 'JavaScript Avanzado: Patrones y Prácticas Modernas',
    description: 'Domina los conceptos avanzados de JavaScript, incluyendo promesas, async/await, patrones de diseño y optimización de rendimiento para construir aplicaciones robustas y escalables.',
    thumbnailUrl: 'https://placehold.co/800x450.png',
    dataAiHint: 'javascript patterns',
    instructorName: 'Dr. Evelyn Woods',
    status: 'approved',
    lessons: [
      {id: 'l1-js', title: 'Introducción a ESNext', contentType: 'text', content: 'Exploraremos las últimas características de ECMAScript, como let/const, arrow functions, template literals, y más. Veremos cómo estas adiciones mejoran la legibilidad y mantenibilidad del código JavaScript. Este contenido es lo suficientemente largo como para necesitar algo de lectura antes de marcar como completado.'},
      {id: 'l2-js', title: 'Programación Asíncrona Profunda', contentType: 'video', videoUrl: 'https://www.youtube.com/embed/PkZNo7MFNFg', content: 'Este módulo cubre promesas, async/await, y cómo manejar operaciones asíncronas de manera efectiva. También discutiremos el event loop y cómo funciona en JavaScript.'},
      {id: 'l3-js', title: 'Patrones de Diseño en JS', contentType: 'text', content: 'Aprende patrones comunes como Singleton, Factory, Observer y Module, y cómo aplicarlos en JavaScript para crear soluciones más robustas y reutilizables.'},
      {id: 'l4-js', title: 'Optimización y Buenas Prácticas', contentType: 'quiz', quizPlaceholder: '¿Cuál es la principal ventaja de usar "async/await" sobre las promesas puras para manejar código asíncrono en JavaScript?', content: 'Descubre técnicas para optimizar el rendimiento de tu código JavaScript y las mejores prácticas para escribir código limpio, eficiente y fácil de mantener.'}
    ],
    interactiveContent: '<p class="text-center p-4 bg-muted rounded-md">Material complementario disponible abajo.</p>'
  },
  {
    id: 'course-python-ds',
    title: 'Python para Ciencia de Datos: De Cero a Héroe',
    description: 'Un curso completo que te llevará desde los fundamentos de Python hasta la aplicación de técnicas de ciencia de datos, incluyendo manipulación de datos con Pandas, visualización con Matplotlib y Seaborn, y una introducción al machine learning con Scikit-learn.',
    thumbnailUrl: 'https://placehold.co/800x450.png',
    dataAiHint: 'python data science',
    instructorName: 'Prof. Ian Stone',
    status: 'approved',
    lessons: [
      {id: 'l1-py', title: 'Fundamentos de Python', contentType: 'text', content: 'Comenzaremos con los conceptos básicos de Python, incluyendo tipos de datos, variables, operadores, estructuras de control (if/else, bucles) y funciones.'},
      {id: 'l2-py', title: 'Pandas para Manipulación de Datos', contentType: 'text', content: 'Introducción a la librería Pandas para la carga, limpieza, transformación y análisis de datos tabulares.'},
      {id: 'l3-py', title: 'Visualización de Datos con Matplotlib', contentType: 'video', videoUrl: 'https://www.youtube.com/embed/NgsQjG1qN4k', content: 'Aprende a crear visualizaciones efectivas utilizando Matplotlib y Seaborn para explorar y comunicar tus hallazgos.'},
      {id: 'l4-py', title: 'Intro a Machine Learning con Scikit-learn', contentType: 'quiz', quizPlaceholder: '¿Qué librería de Python se utiliza comúnmente para construir modelos de Machine Learning?', content: 'Una visión general de los conceptos de machine learning y cómo usar Scikit-learn para modelos básicos de predicción y clasificación.'}
    ],
    interactiveContent: '<div><p class="text-center p-2">Este curso incluye un Jupyter Notebook interactivo.</p><button class="w-full bg-primary text-primary-foreground hover:bg-primary/90 p-2 rounded-md">Descargar Notebook (Simulado)</button></div>'
  },
   {
    id: 'course-ux-design',
    title: 'Fundamentos del Diseño de Experiencia de Usuario (UX)',
    description: 'Aprende los principios clave del diseño UX, incluyendo investigación de usuarios, arquitectura de información, wireframing, prototipado y pruebas de usabilidad para crear productos digitales intuitivos y centrados en el usuario.',
    thumbnailUrl: 'https://placehold.co/800x450.png',
    dataAiHint: 'ux design principles',
    instructorName: 'Ana Lima',
    status: 'approved',
    lessons: [
      {id: 'l1-ux', title: '¿Qué es UX?', contentType: 'text', content: 'Definición de Experiencia de Usuario, su importancia y los diferentes roles dentro del campo del diseño UX.'},
      {id: 'l2-ux', title: 'Investigación de Usuarios', contentType: 'text', content: 'Métodos para entender a tus usuarios, sus necesidades y comportamientos, incluyendo entrevistas, encuestas y personas.'},
      {id: 'l3-ux', title: 'Wireframing y Prototipado', contentType: 'video', videoUrl: 'https://www.youtube.com/embed/6301pG42H7E', content: 'Cómo crear wireframes de baja y alta fidelidad, y prototipos interactivos para probar tus diseños.'},
      {id: 'l4-ux', title: 'Pruebas de Usabilidad', contentType: 'quiz', quizPlaceholder: '¿Cuál es el objetivo principal de una prueba de usabilidad?', content: 'Planifica y conduce pruebas de usabilidad para obtener feedback valioso y mejorar tus diseños.'}
    ],
  },
];

const COMPLETED_COURSES_STORAGE_KEY = 'simulatedCompletedCourseIds';
const ENGAGEMENT_DURATION = 3000; // 3 segundos para simular compromiso

export default function StudentCourseViewPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const courseId = params.courseId as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [activeAccordionItem, setActiveAccordionItem] = useState<string | undefined>(undefined);
  
  const [quizState, setQuizState] = useState<Record<string, { started: boolean; answered: boolean; selectedOption: string | null }>>({});
  const [lessonsReadyForCompletion, setLessonsReadyForCompletion] = useState<Set<string>>(new Set());
  const engagementTimersRef = useRef<Record<string, NodeJS.Timeout>>({});


  useEffect(() => {
    if (courseId) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        const foundCourse = sampleCourses.find(c => c.id === courseId);
        if (foundCourse) {
          setCourse(foundCourse);
          const storedCompletedKey = `${COMPLETED_COURSES_STORAGE_KEY}_${courseId}`;
          const storedCompletedLessons = localStorage.getItem(storedCompletedKey);
          const initialCompleted = storedCompletedLessons ? new Set<string>(JSON.parse(storedCompletedLessons)) : new Set<string>();
          setCompletedLessons(initialCompleted);

          const initialQuizStateFromStorage: Record<string, { started: boolean; answered: boolean; selectedOption: string | null }> = {};
          const initialReadyForCompletionFromStorage = new Set<string>();

          foundCourse.lessons.forEach(lesson => {
            if (lesson.contentType === 'quiz') {
              const isLessonCompleted = initialCompleted.has(lesson.id);
              const storedQuizStateForLesson = localStorage.getItem(`${COMPLETED_COURSES_STORAGE_KEY}_quiz_${lesson.id}`);
              if (storedQuizStateForLesson) {
                try {
                    initialQuizStateFromStorage[lesson.id] = JSON.parse(storedQuizStateForLesson);
                    if (initialQuizStateFromStorage[lesson.id].answered) {
                        initialReadyForCompletionFromStorage.add(lesson.id);
                    }
                } catch (e) { console.error("Failed to parse quiz state for lesson", lesson.id, e); }
              } else {
                 initialQuizStateFromStorage[lesson.id] = { 
                    started: isLessonCompleted, 
                    answered: isLessonCompleted, 
                    selectedOption: isLessonCompleted ? 'Simulado' : null 
                };
              }
              if (isLessonCompleted) {
                initialReadyForCompletionFromStorage.add(lesson.id);
              }
            } else if (initialCompleted.has(lesson.id)) {
                 initialReadyForCompletionFromStorage.add(lesson.id);
            }
          });
          setQuizState(initialQuizStateFromStorage);
          setLessonsReadyForCompletion(initialReadyForCompletionFromStorage);


          if (foundCourse.lessons && foundCourse.lessons.length > 0) {
            const allDone = initialCompleted.size === foundCourse.lessons.length;
            if (!allDone) {
                const firstUncompleted = foundCourse.lessons.find(l => !initialCompleted.has(l.id));
                setActiveAccordionItem(firstUncompleted ? `lesson-${firstUncompleted.id}` : `lesson-${foundCourse.lessons[0].id}`);
            } else {
                 setActiveAccordionItem(`lesson-${foundCourse.lessons[0].id}`);
            }
          }
        } else {
          toast({
            variant: "destructive",
            title: "Curso no encontrado",
            description: "No se pudo encontrar el curso solicitado. Serás redirigido.",
          });
          router.push('/dashboard/student/my-courses');
        }
        setIsLoading(false);
      }, 500);
    }
     return () => {
        Object.values(engagementTimersRef.current).forEach(clearTimeout);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, router, toast]);

  const courseProgress = useMemo(() => {
    if (!course || !course.lessons || course.lessons.length === 0) return 0;
    return Math.round((completedLessons.size / course.lessons.length) * 100);
  }, [course, completedLessons]);

  const allLessonsCompleted = useMemo(() => {
    if (!course || !course.lessons || course.lessons.length === 0) return false; 
    return completedLessons.size === course.lessons.length;
  }, [course, completedLessons]);

  const handleToggleLessonComplete = (lessonId: string) => {
    setCompletedLessons(prev => {
      const newSet = new Set(prev);
      if (newSet.has(lessonId)) {
        // newSet.delete(lessonId); // Descomentar para permitir desmarcar
      } else {
        newSet.add(lessonId);
        const lessonTitle = course?.lessons.find(l => l.id === lessonId)?.title;
        toast({ title: "¡Lección Marcada!", description: `Has marcado la lección "${lessonTitle}" como completada.` });
        
        localStorage.setItem(`${COMPLETED_COURSES_STORAGE_KEY}_${courseId}`, JSON.stringify(Array.from(newSet)));

        if (course && newSet.size === course.lessons.length) {
            toast({ title: "¡Curso Completado!", description: `¡Felicidades! Has completado el curso "${course.title}".`, duration: 5000 });
            const globalCompleted = JSON.parse(localStorage.getItem(COMPLETED_COURSES_STORAGE_KEY) || '[]');
            if (!globalCompleted.includes(courseId)) {
                globalCompleted.push(courseId);
                localStorage.setItem(COMPLETED_COURSES_STORAGE_KEY, JSON.stringify(globalCompleted));
            }
        }
      }
      return newSet;
    });
  };


  const handleCourseAction = () => {
    if (!course || !course.lessons || course.lessons.length === 0) return;
    if (allLessonsCompleted) {
      alert(`¡Felicidades! Aquí se mostraría tu certificado para el curso "${course.title}".`);
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

  const handleStartQuiz = (lessonId: string) => {
    const newState = { ...quizState, [lessonId]: { started: true, answered: false, selectedOption: null } };
    setQuizState(newState);
    localStorage.setItem(`${COMPLETED_COURSES_STORAGE_KEY}_quiz_${lessonId}`, JSON.stringify(newState[lessonId]));
  };

  const handleAnswerQuiz = (lessonId: string, option: string) => {
    const newState = { ...quizState, [lessonId]: { ...quizState[lessonId], answered: true, selectedOption: option } };
    setQuizState(newState);
    localStorage.setItem(`${COMPLETED_COURSES_STORAGE_KEY}_quiz_${lessonId}`, JSON.stringify(newState[lessonId]));

    setLessonsReadyForCompletion(prev => {
        const newSet = new Set(prev);
        newSet.add(lessonId);
        return newSet;
    });
    toast({
        title: "Respuesta Registrada",
        description: `Has seleccionado la ${option}. ¡Buen trabajo!`,
    });
  };
  
  const handleAccordionChange = (value: string | undefined) => {
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
            delete engagementTimersRef.current[lesson.id]; 
          }, ENGAGEMENT_DURATION);
        }
      }
    }
  };


  const renderLessonContent = (lesson: Lesson) => {
    const contentType = lesson.contentType || 'text'; 
    const currentQuizState = quizState[lesson.id] || { started: false, answered: false, selectedOption: null };
    const quizOptions = ['Opción A', 'Opción B', 'Opción C']; 

    switch (contentType) {
      case 'video':
        const isYouTubeEmbed = lesson.videoUrl && lesson.videoUrl.includes("youtube.com/embed/");
        return (
          <div className="space-y-3">
            {isYouTubeEmbed ? (
              <div className="aspect-video bg-muted rounded-md overflow-hidden shadow-inner">
                <iframe
                  width="100%"
                  height="100%"
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
                <span>{lesson.videoUrl ? "URL de video no válida para incrustar." : "Video no disponible."}</span>
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
            {!currentQuizState.started ? (
              <>
                <p className="text-sm text-foreground">{lesson.quizPlaceholder || "Pon a prueba tus conocimientos."}</p>
                <Button 
                  variant="outline" 
                  onClick={() => handleStartQuiz(lesson.id)}
                  disabled={completedLessons.has(lesson.id)}
                  className="bg-card hover:bg-card/90"
                >
                  Comenzar Quiz
                </Button>
              </>
            ) : (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-foreground">{lesson.quizPlaceholder || "¿Cuál es la respuesta correcta?"}</p>
                <div className="flex flex-col gap-2">
                  {quizOptions.map((option, index) => (
                    <Button
                      key={index}
                      variant={currentQuizState.selectedOption === option ? 'default' : 'outline'}
                      onClick={() => handleAnswerQuiz(lesson.id, option)}
                      disabled={currentQuizState.answered || completedLessons.has(lesson.id)}
                      className={`w-full justify-start ${currentQuizState.selectedOption === option ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : 'bg-card hover:bg-card/90'}`}
                    >
                      {currentQuizState.selectedOption === option && <CheckCircle className="mr-2 h-4 w-4" />}
                      {option}
                    </Button>
                  ))}
                </div>
                {currentQuizState.answered && <p className="text-xs text-accent mt-2">Tu respuesta ha sido registrada. ¡Buen trabajo!</p>}
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
        <h1 className="text-2xl font-semibold">Curso no encontrado</h1>
        <p className="text-muted-foreground">El curso que buscas no existe o ha sido eliminado.</p>
        <Button onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => router.back()} className="mb-2">
        <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Mis Cursos
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
                    let isEngagementMetForButton = lessonsReadyForCompletion.has(lesson.id);
                    
                    if (lesson.contentType === 'quiz') {
                       isEngagementMetForButton = (quizState[lesson.id]?.answered || isCompleted);
                    } else if (isCompleted) {
                       isEngagementMetForButton = true; 
                    }
                    
                    const buttonDisabled = isCompleted || !isEngagementMetForButton;

                    return (
                        <AccordionItem value={`lesson-${lesson.id}`} key={lesson.id} className="border-border">
                        <AccordionTrigger className="text-lg hover:no-underline px-3 py-4 hover:bg-muted/50 rounded-t-md data-[state=open]:bg-muted/60 data-[state=open]:rounded-b-none">
                            <div className="flex items-center text-left flex-1 gap-2">
                            {isCompleted ? <CheckCircle className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" /> : <FileText className="mr-2 h-5 w-5 text-primary/70 flex-shrink-0" />}
                            <span className={`text-primary font-semibold mr-1 ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>{index + 1}.</span>
                            <span className={`${isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{lesson.title}</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 py-4 bg-card border-t-0 border-b border-x border-border rounded-b-md space-y-4">
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
                <div dangerouslySetInnerHTML={{ __html: course.interactiveContent }} />
              </CardContent>
            </Card>
          )}
           <Card>
            <CardHeader>
              <CardTitle className="text-xl">Progreso del Curso</CardTitle>
            </CardHeader>
            <CardContent className="text-center pt-4">
                {/* SVG Container */}
                <div className="relative w-32 h-32 mx-auto -mt-2"> 
                    <svg className="w-full h-full" viewBox="0 0 36 36" transform="rotate(-90 18 18)">
                        <path
                        className="text-muted/30"
                        strokeWidth="3" 
                        fill="none"
                        stroke="currentColor"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                        className={allLessonsCompleted ? "text-accent" : "text-primary"}
                        strokeWidth="3" 
                        fill="none"
                        strokeLinecap="round"
                        stroke="currentColor"
                        strokeDasharray={`${courseProgress}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                    </svg>
                    {/* Text for percentage, positioned absolutely to overlay the SVG */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-2xl font-medium ${allLessonsCompleted ? "text-accent-foreground" : "text-foreground"}`}>
                            {courseProgress}%
                        </span>
                    </div>
                </div>
                {/* Status Text Paragraph */}
                <p className={`text-sm ${allLessonsCompleted ? "text-accent font-semibold" : "text-muted-foreground font-medium"} mt-1 mb-1`}>
                    {allLessonsCompleted ? "Curso completado" : `${completedLessons.size} de ${course?.lessons?.length || 0} lecciones completadas`}
                </p>
                
                <Progress value={courseProgress} aria-label={`Progreso del curso: ${courseProgress}%`} className={`h-3 mb-2 ${allLessonsCompleted ? "[&>div]:bg-accent" : ""}`} />
                <Button className="w-full text-base py-2.5" onClick={handleCourseAction} variant={allLessonsCompleted ? "default" : "default"}>
                    {allLessonsCompleted ? <><Award className="mr-2 h-5 w-5" /> Ver Certificado (Simulado)</> : (courseProgress > 0 ? "Continuar donde lo dejaste" : "Empezar Curso")}
                </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
    

    

