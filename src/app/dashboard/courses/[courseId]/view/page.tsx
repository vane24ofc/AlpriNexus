
"use client";

import React, { useEffect, useState, useMemo } from 'react';
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
      {id: 'l1-js', title: 'Introducción a ESNext', contentType: 'text', content: 'Exploraremos las últimas características de ECMAScript, como let/const, arrow functions, template literals, y más. Veremos cómo estas adiciones mejoran la legibilidad y mantenibilidad del código JavaScript.'},
      {id: 'l2-js', title: 'Programación Asíncrona Profunda', contentType: 'video', videoUrl: 'https://www.youtube.com/embed/PkZNo7MFNFg', content: 'Este módulo cubre promesas, async/await, y cómo manejar operaciones asíncronas de manera efectiva. También discutiremos el event loop y cómo funciona en JavaScript.'},
      {id: 'l3-js', title: 'Patrones de Diseño en JS', contentType: 'text', content: 'Aprende patrones comunes como Singleton, Factory, Observer y Module, y cómo aplicarlos en JavaScript para crear soluciones más robustas y reutilizables.'},
      {id: 'l4-js', title: 'Optimización y Buenas Prácticas', contentType: 'quiz', quizPlaceholder: 'Pon a prueba tus conocimientos sobre optimización en JS.', content: 'Descubre técnicas para optimizar el rendimiento de tu código JavaScript y las mejores prácticas para escribir código limpio, eficiente y fácil de mantener.'}
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
      {id: 'l4-py', title: 'Intro a Machine Learning con Scikit-learn', contentType: 'quiz', quizPlaceholder: 'Evalúa tu comprensión de los conceptos básicos de ML.', content: 'Una visión general de los conceptos de machine learning y cómo usar Scikit-learn para modelos básicos de predicción y clasificación.'}
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
      {id: 'l4-ux', title: 'Pruebas de Usabilidad', contentType: 'quiz', quizPlaceholder: 'Evalúa tus diseños con pruebas de usabilidad.', content: 'Planifica y conduce pruebas de usabilidad para obtener feedback valioso y mejorar tus diseños.'}
    ],
  },
];

const COMPLETED_COURSES_KEY = 'simulatedCompletedCourseIds';

export default function StudentCourseViewPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const courseId = params.courseId as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [activeAccordionItem, setActiveAccordionItem] = useState<string | undefined>(undefined);
  const [quizStarted, setQuizStarted] = useState<Record<string, boolean>>({});


  useEffect(() => {
    if (courseId) {
      setIsLoading(true);
      setTimeout(() => {
        const foundCourse = sampleCourses.find(c => c.id === courseId);
        if (foundCourse) {
          setCourse(foundCourse);
          // Load completed lessons for this course from localStorage
          const storedCompleted = localStorage.getItem(`${COMPLETED_COURSES_KEY}_${courseId}`);
          const initialCompleted = storedCompleted ? new Set<string>(JSON.parse(storedCompleted)) : new Set<string>();
          setCompletedLessons(initialCompleted);

          if (foundCourse.lessons && foundCourse.lessons.length > 0) {
             // If all lessons are completed, don't auto-open one, otherwise open first uncompleted or first.
            const allDone = initialCompleted.size === foundCourse.lessons.length;
            if (!allDone) {
                const firstUncompleted = foundCourse.lessons.find(l => !initialCompleted.has(l.id));
                setActiveAccordionItem(firstUncompleted ? `lesson-${firstUncompleted.id}` : `lesson-${foundCourse.lessons[0].id}`);
            } else {
                // Optionally keep the first lesson open for review if all completed
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
  }, [courseId, router, toast]);

  const courseProgress = useMemo(() => {
    if (!course || !course.lessons || course.lessons.length === 0) return 0;
    return Math.round((completedLessons.size / course.lessons.length) * 100);
  }, [course, completedLessons]);

  const allLessonsCompleted = useMemo(() => {
    if (!course || !course.lessons) return false;
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
        
        // Save to localStorage for this specific course
        localStorage.setItem(`${COMPLETED_COURSES_KEY}_${courseId}`, JSON.stringify(Array.from(newSet)));

        // Check if all lessons are now completed
        if (course && newSet.size === course.lessons.length) {
            toast({ title: "¡Curso Completado!", description: `¡Felicidades! Has completado el curso "${course.title}".`, duration: 5000 });
            // Add to global list of completed courses
            const globalCompleted = JSON.parse(localStorage.getItem(COMPLETED_COURSES_KEY) || '[]');
            if (!globalCompleted.includes(courseId)) {
                globalCompleted.push(courseId);
                localStorage.setItem(COMPLETED_COURSES_KEY, JSON.stringify(globalCompleted));
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
    } else if (course.lessons.length > 0) { // Should not happen if allLessonsCompleted is false but good fallback
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
    setQuizStarted(prev => ({ ...prev, [lessonId]: true }));
    toast({
        title: "Quiz Iniciado (Simulación)",
        description: "Has comenzado el quiz. ¡Mucha suerte!",
    });
    // En una aplicación real, aquí se redirigiría a una interfaz de quiz o se cargaría contenido de quiz.
  };

  const renderLessonContent = (lesson: Lesson) => {
    const contentType = lesson.contentType || 'text'; 
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
        const isStarted = quizStarted[lesson.id];
        return (
          <div className="p-4 bg-muted/70 rounded-md space-y-3">
            <div className="flex items-center text-primary">
              <Puzzle className="h-6 w-6 mr-2" />
              <h5 className="font-semibold text-lg">Quiz Interactivo</h5>
            </div>
            <p className="text-sm text-muted-foreground">{lesson.quizPlaceholder || "Pon a prueba tus conocimientos."}</p>
            <Button 
              variant="outline" 
              onClick={() => handleStartQuiz(lesson.id)}
              disabled={isStarted}
            >
              {isStarted ? "Quiz en Progreso..." : "Comenzar Quiz"}
            </Button>
            {isStarted && <p className="text-xs text-green-600 mt-2">Has iniciado este quiz. Completa las preguntas en la interfaz del quiz (simulado).</p>}
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
                    onValueChange={setActiveAccordionItem}
                >
                  {course.lessons.map((lesson, index) => {
                    const isCompleted = completedLessons.has(lesson.id);
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
                                    disabled={isCompleted}
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
                <div dangerouslySetInnerHTML={{ __html: course.interactiveContent }} className="prose prose-sm dark:prose-invert max-w-none"/>
              </CardContent>
            </Card>
          )}
           <Card>
            <CardHeader>
              <CardTitle className="text-xl">Progreso del Curso</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
                <div className="relative w-24 h-24 mx-auto mb-2">
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
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-2xl font-bold ${allLessonsCompleted ? "text-accent" : "text-primary"}`}>{courseProgress}%</span>
                    </div>
                </div>
                <p className={`text-sm mb-3 ${allLessonsCompleted ? "text-accent font-semibold" : "text-muted-foreground"}`}>{allLessonsCompleted ? "¡Curso Completado!" : `${completedLessons.size} de ${course.lessons?.length || 0} lecciones completadas`}</p>
                <Progress value={courseProgress} aria-label={`Progreso del curso: ${courseProgress}%`} className={`h-2 mb-4 ${allLessonsCompleted ? "[&>div]:bg-accent" : ""}`} />
                <Button className="w-full" onClick={handleCourseAction} variant={allLessonsCompleted ? "default" : "default"}>
                    {allLessonsCompleted ? <><Award className="mr-2 h-4 w-4" /> Ver Certificado (Simulado)</> : (courseProgress > 0 ? "Continuar donde lo dejaste" : "Empezar Curso")}
                </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
    

    