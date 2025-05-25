
"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter }
from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowLeft, BookOpen, PlayCircle, FileText, CheckCircle, Loader2 } from 'lucide-react';
import type { Course, Lesson } from '@/types/course';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress'; // Importar Progress

// Sample courses to simulate fetching data
const sampleCourses: Course[] = [
  { id: 'course-js-adv', title: 'JavaScript Avanzado: Patrones y Prácticas Modernas', description: 'Domina los conceptos avanzados de JavaScript, incluyendo promesas, async/await, patrones de diseño y optimización de rendimiento para construir aplicaciones robustas y escalables.', thumbnailUrl: 'https://placehold.co/800x450.png?text=JS+Avanzado', instructorName: 'Dr. Evelyn Woods', status: 'approved', lessons: [{id: 'l1-js', title: 'Introducción a ESNext'}, {id: 'l2-js', title: 'Programación Asíncrona Profunda'}, {id: 'l3-js', title: 'Patrones de Diseño en JS'}, {id: 'l4-js', title: 'Optimización y Buenas Prácticas'}], interactiveContent: '<iframe width="100%" height="315" src="https://www.youtube.com/embed/PkZNo7MFNFg" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>' },
  { id: 'course-python-ds', title: 'Python para Ciencia de Datos: De Cero a Héroe', description: 'Un curso completo que te llevará desde los fundamentos de Python hasta la aplicación de técnicas de ciencia de datos, incluyendo manipulación de datos con Pandas, visualización con Matplotlib y Seaborn, y una introducción al machine learning con Scikit-learn.', thumbnailUrl: 'https://placehold.co/800x450.png?text=Python+DS', instructorName: 'Prof. Ian Stone', status: 'approved', lessons: [{id: 'l1-py', title: 'Fundamentos de Python'}, {id: 'l2-py', title: 'Pandas para Manipulación de Datos'}, {id: 'l3-py', title: 'Visualización de Datos'}, {id: 'l4-py', title: 'Intro a Machine Learning'}], interactiveContent: '<div><p>Este curso incluye un Jupyter Notebook interactivo que puedes descargar.</p><Button>Descargar Notebook</Button></div>' },
  { id: 'course-ux-design', title: 'Fundamentos del Diseño de Experiencia de Usuario (UX)', description: 'Aprende los principios clave del diseño UX, incluyendo investigación de usuarios, arquitectura de información, wireframing, prototipado y pruebas de usabilidad para crear productos digitales intuitivos y centrados en el usuario.', thumbnailUrl: 'https://placehold.co/800x450.png?text=Diseño+UX', instructorName: 'Ana Lima', status: 'approved', lessons: [{id: 'l1-ux', title: '¿Qué es UX?'}, {id: 'l2-ux', title: 'Investigación de Usuarios'}, {id: 'l3-ux', title: 'Wireframing y Prototipado'}, {id: 'l4-ux', title: 'Pruebas de Usabilidad'}], interactiveContent: '<p class="text-center p-4 bg-muted rounded-md">Contenido interactivo de UX próximamente. ¡Un quiz para probar tus conocimientos!</p>' },
  { id: 'course-react-native', title: 'Desarrollo de Apps Móviles con React Native', description: 'Construye aplicaciones móviles nativas para iOS y Android utilizando React Native. Cubriremos componentes, navegación, manejo de estado, APIs nativas y despliegue.', thumbnailUrl: 'https://placehold.co/800x450.png?text=React+Native', instructorName: 'Carlos Vega', status: 'approved', lessons: [{id: 'l1-rn', title: 'Setup y Fundamentos'}, {id: 'l2-rn', title: 'Componentes y Estilos'}, {id: 'l3-rn', title: 'Navegación'}, {id: 'l4-rn', title: 'APIs Nativas'}], },
];

export default function StudentCourseViewPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const courseId = params.courseId as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [activeAccordionItem, setActiveAccordionItem] = useState<string | undefined>(undefined);


  useEffect(() => {
    if (courseId) {
      setIsLoading(true);
      setTimeout(() => {
        const foundCourse = sampleCourses.find(c => c.id === courseId);
        if (foundCourse) {
          setCourse(foundCourse);
          // Simular carga de progreso guardado (ej. primeras N lecciones)
          const initialCompleted = new Set<string>();
          // if (foundCourse.lessons && foundCourse.lessons.length > 0) {
          //   initialCompleted.add(foundCourse.lessons[0].id); // Ejemplo: primera lección completada
          // }
          setCompletedLessons(initialCompleted);
          if (foundCourse.lessons && foundCourse.lessons.length > 0) {
            setActiveAccordionItem(`lesson-${foundCourse.lessons[0].id}`); // Abrir la primera lección por defecto
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

  const handleToggleLessonComplete = (lessonId: string) => {
    setCompletedLessons(prev => {
      const newSet = new Set(prev);
      if (newSet.has(lessonId)) {
        // newSet.delete(lessonId); // Permitir desmarcar si se desea, por ahora solo marca como completo
      } else {
        newSet.add(lessonId);
        toast({ title: "¡Lección Marcada!", description: `Has marcado la lección como completada.` });
      }
      return newSet;
    });
  };

  const courseProgress = course && course.lessons && course.lessons.length > 0
    ? Math.round((completedLessons.size / course.lessons.length) * 100)
    : 0;

  const allLessonsCompleted = course && course.lessons && completedLessons.size === course.lessons.length;

  const handleContinueCourse = () => {
    if (!course || !course.lessons || course.lessons.length === 0) return;
    if (allLessonsCompleted) {
        setActiveAccordionItem(`lesson-${course.lessons[0].id}`); // Abrir la primera si todo está completo
        return;
    }
    const firstUncompletedLesson = course.lessons.find(lesson => !completedLessons.has(lesson.id));
    if (firstUncompletedLesson) {
      setActiveAccordionItem(`lesson-${firstUncompletedLesson.id}`);
    } else if (course.lessons.length > 0) {
       // Si no hay incompletas (pero no todas completas, raro) o para el caso de todas completas
      setActiveAccordionItem(`lesson-${course.lessons[0].id}`);
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
            data-ai-hint={`course ${course.title.substring(0,20)}`}
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
                        <AccordionItem value={`lesson-${lesson.id}`} key={lesson.id}>
                        <AccordionTrigger className="text-lg hover:no-underline">
                            <div className="flex items-center">
                            {isCompleted && <CheckCircle className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" />}
                            <span className={`text-primary font-semibold mr-3 ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>{index + 1}.</span>
                            <span className={`${isCompleted ? 'line-through text-muted-foreground' : ''}`}>{lesson.title}</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pl-8 pr-4 py-4 bg-muted/30 rounded-b-md">
                            <p className="text-muted-foreground mb-3">Contenido de la lección "{lesson.title}" estará disponible aquí.</p>
                            <Button 
                                size="sm" 
                                onClick={() => handleToggleLessonComplete(lesson.id)}
                                disabled={isCompleted}
                                variant={isCompleted ? "secondary" : "default"}
                            >
                                {isCompleted ? (
                                    <>
                                        <CheckCircle className="mr-2 h-4 w-4" /> Lección Completada
                                    </>
                                ) : (
                                    <>
                                        <PlayCircle className="mr-2 h-4 w-4" /> Marcar como Completada
                                    </>
                                )}
                            </Button>
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
                <CardTitle className="text-xl">Contenido Interactivo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video" dangerouslySetInnerHTML={{ __html: course.interactiveContent }} />
              </CardContent>
            </Card>
          )}
           <Card>
            <CardHeader>
              <CardTitle className="text-xl">Progreso del Curso</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
                <div className="relative w-24 h-24 mx-auto mb-2">
                    <svg className="w-full h-full" viewBox="0 0 36 36">
                        <path
                        className="text-muted/30"
                        strokeWidth="3"
                        fill="none"
                        stroke="currentColor"
                        d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                        className="text-primary"
                        strokeWidth="3"
                        fill="none"
                        stroke="currentColor"
                        strokeDasharray={`${courseProgress}, 100`}
                        d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-primary">{courseProgress}%</span>
                    </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{allLessonsCompleted ? "¡Curso Completado!" : "Completado"}</p>
                <Progress value={courseProgress} aria-label={`Progreso del curso: ${courseProgress}%`} className="h-2 mb-4" />
                <Button className="w-full" onClick={handleContinueCourse}>
                    {allLessonsCompleted ? "Revisar Curso" : "Continuar donde lo dejaste"}
                </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

    