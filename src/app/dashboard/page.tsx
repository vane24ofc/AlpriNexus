
"use client";

import React, { useState, useEffect } from 'react';
import { useSessionRole, Role } from '@/app/dashboard/layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Users,
  Settings,
  BarChart3,
  Bell,
  Zap,
  Award,
  CheckCircle,
  PlusCircle,
  MessageSquare,
  BarChart as BarChartIcon,
  Star,
  Loader2,
  Library
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Course } from '@/types/course';
import { allPlatformCourses } from '@/app/dashboard/courses/explore/page';

// Admin Dashboard Content
const AdminDashboardContent = () => {
  const stats = [
    { title: "Usuarios Totales", value: "1,523", icon: Users, trend: "+5% desde el mes pasado" },
    { title: "Cursos Activos", value: "87", icon: BookOpen, trend: "+2 nuevos esta semana" },
    { title: "Salud del Sistema", value: "Óptima", icon: Settings, trend: "Todos los sistemas operativos" },
    { title: "Tasa de Participación", value: "78%", icon: BarChart3, trend: "Aumento del 3%" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Panel de Administración</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="shadow-lg hover:shadow-primary/20 transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Resumen de las actividades recientes de la plataforma.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {[
                { user: "Alice", action: "registró una nueva cuenta.", time: "hace 5m" },
                { user: "Bob (Instructor)", action: "publicó el curso 'IA Avanzada'.", time: "hace 1h" },
                { user: "Charlie", action: "completó 'Introducción a Python'.", time: "hace 2h" },
                { user: "System", action: "mantenimiento programado para mañana.", time: "hace 4h" },
              ].map((activity, index) => (
                <li key={index} className="flex items-center space-x-3 text-sm">
                  <Users className="h-4 w-4 text-primary" />
                  <div>
                    <span className="font-semibold">{activity.user}</span> {activity.action}
                  </div>
                  <span className="ml-auto text-xs text-muted-foreground">{activity.time}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>Tareas administrativas comunes.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="p-4 h-auto flex flex-col items-center text-center" asChild>
                <Link href="/dashboard/admin/users">
                    <Users className="h-8 w-8 mb-2 text-primary"/>
                    <span className="font-medium">Gestionar Usuarios</span>
                </Link>
            </Button>
            <Button variant="outline" className="p-4 h-auto flex flex-col items-center text-center" asChild>
                <Link href="/dashboard/admin/courses">
                    <BookOpen className="h-8 w-8 mb-2 text-primary"/>
                    <span className="font-medium">Gestionar Cursos</span>
                </Link>
            </Button>
            <DialogTrigger asChild>
                 <Button variant="outline" className="p-4 h-auto flex flex-col items-center text-center">
                    <Bell className="h-8 w-8 mb-2 text-accent"/>
                    <span className="font-medium">Enviar Anuncio</span>
                </Button>
            </DialogTrigger>
             <Button variant="outline" className="p-4 h-auto flex flex-col items-center text-center" asChild>
                <Link href="/dashboard/settings">
                    <Settings className="h-8 w-8 mb-2 text-muted-foreground"/>
                    <span className="font-medium">Configuración del Sistema</span>
                </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Instructor Dashboard Content
// Simulación de cursos creados por el instructor actual (similar a MyCoursesPage)
const instructorSampleCourses: Course[] = [
  { id: 'instrCourse1', title: 'Desarrollo Web Full Stack con Next.js', description: 'Curso completo sobre Next.js.', thumbnailUrl: 'https://placehold.co/150x84.png', instructorName: 'Usuario Actual', status: 'approved', lessons: [{id: 'l1', title: 'Intro'}] },
  { id: 'instrCourse2', title: 'Bases de Datos NoSQL con MongoDB', description: 'Aprende MongoDB desde cero.', thumbnailUrl: 'https://placehold.co/150x84.png', instructorName: 'Usuario Actual', status: 'pending', lessons: [{id: 'l1', title: 'Intro'}] },
  { id: 'instrCourse3', title: 'Introducción al Diseño de Experiencia de Usuario (UX)', description: 'Principios básicos de UX.', thumbnailUrl: 'https://placehold.co/150x84.png', instructorName: 'Usuario Actual', status: 'rejected', lessons: [{id: 'l1', title: 'Intro'}] },
];


const InstructorDashboardContent = () => {
  const stats = [
    { title: "Mis Cursos", value: instructorSampleCourses.length.toString(), icon: BookOpen, link: "/dashboard/instructor/my-courses" }, 
    { title: "Estudiantes Totales", value: "350", icon: Users, link: "#" }, // Placeholder
    { title: "Revisiones Pendientes", value: instructorSampleCourses.filter(c => c.status === 'pending').length.toString(), icon: MessageSquare, link: "/dashboard/instructor/my-courses" },
    { title: "Calificación Promedio", value: "4.7/5", icon: BarChartIcon, link: "#" }, // Placeholder
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Panel de Instructor</h1>
        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link href="/dashboard/courses/new">
            <PlusCircle className="mr-2 h-5 w-5" /> Crear Nuevo Curso
          </Link>
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="shadow-lg hover:shadow-primary/20 transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <Button variant="link" size="sm" asChild className="px-0 -ml-1 text-primary">
                <Link href={stat.link}>Ver detalles</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-lg">
          <CardHeader>
            <CardTitle>Mis Cursos (Resumen)</CardTitle>
            <CardDescription>Un vistazo rápido a tus cursos y su estado.</CardDescription>
          </CardHeader>
          <CardContent>
            {instructorSampleCourses.length > 0 ? (
              <ul className="space-y-4">
                {instructorSampleCourses.slice(0, 3).map((course) => { // Mostrar solo los primeros 3 como resumen
                  const students = Math.floor(Math.random() * 200) + 50; // Placeholder
                  const progress = course.status === 'approved' ? (Math.floor(Math.random() * 50) + 50) : (course.status === 'pending' ? Math.floor(Math.random() * 30) : 0) ; // Placeholder
                  return (
                  <li key={course.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{course.title}</h3>
                        <p className="text-sm text-muted-foreground">{students} estudiantes inscritos</p>
                        <Badge 
                          variant={course.status === 'approved' ? 'default' : course.status === 'pending' ? 'secondary' : 'destructive'}
                          className={`mt-1 text-xs ${
                            course.status === 'approved' ? 'bg-accent text-accent-foreground' : 
                            course.status === 'pending' ? 'bg-yellow-500 text-white' : ''
                          }`}
                        >
                          {course.status === 'approved' ? 'Aprobado' : course.status === 'pending' ? 'Pendiente' : 'Rechazado'}
                        </Badge>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/courses/${course.id}/edit`}>
                            <Edit3 className="mr-2 h-4 w-4" />Gestionar
                        </Link>
                      </Button>
                    </div>
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Progreso promedio estudiantes (simulado): {progress}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div className={`h-2.5 rounded-full ${progress > 70 ? 'bg-accent' : 'bg-primary'}`} style={{ width: `${progress}%` }}></div>
                      </div>
                    </div>
                  </li>
                )})}
              </ul>
            ) : (
              <p className="text-muted-foreground text-center py-4">Aún no has creado cursos.</p>
            )}
            {instructorSampleCourses.length > 3 && (
                <Button variant="outline" className="w-full mt-4" asChild>
                    <Link href="/dashboard/instructor/my-courses">Ver todos mis cursos</Link>
                </Button>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Comentarios Recientes</CardTitle>
            <CardDescription>Últimos comentarios de los estudiantes.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {[
                { student: "Emily R.", course: "JS Avanzado", comment: "¡Excelente curso, muy detallado!", rating: 5, time: "hace 1h" },
                { student: "John B.", course: "Python DSA", comment: "Desafiante pero gratificante.", rating: 4, time: "hace 3h" },
                { student: "Sarah K.", course: "Intro UX", comment: "Necesita más ejemplos en el capítulo 3.", rating: 3, time: "Ayer" },
              ].map((feedback, index) => (
                <li key={index} className="text-sm border-b border-border pb-2 last:border-b-0">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">{feedback.student} en <span className="text-primary">{feedback.course}</span></span>
                    <span className="text-xs text-muted-foreground">{feedback.time}</span>
                  </div>
                  <p className="text-muted-foreground mt-1">&quot;{feedback.comment}&quot;</p>
                  <div className="flex items-center mt-1">
                    {Array(5).fill(0).map((_, i) => (
                      <Star key={i} className={`h-3.5 w-3.5 ${i < feedback.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Student Dashboard Content
interface EnrolledCourseData {
  id: string;
  title: string;
  instructorName: string;
  progress: number;
  thumbnailUrl: string;
  dataAiHint?: string; 
  lessons?: Array<{id: string}>; 
}

const LOCAL_STORAGE_ENROLLED_KEY = 'simulatedEnrolledCourseIds';
const COMPLETED_COURSES_KEY = 'simulatedCompletedCourseIds';

const StudentDashboardContent = () => {
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourseData[]>([]);
  const [courseToContinue, setCourseToContinue] = useState<EnrolledCourseData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [numCompletedCourses, setNumCompletedCourses] = useState(0);
  const [numEnrolledCourses, setNumEnrolledCourses] = useState(0);

  useEffect(() => {
    setIsLoading(true);
    const storedEnrolledIdsString = localStorage.getItem(LOCAL_STORAGE_ENROLLED_KEY);
    let enrolledIds: Set<string> = new Set();
    if (storedEnrolledIdsString) {
      try {
        const parsedIds = JSON.parse(storedEnrolledIdsString);
        if (Array.isArray(parsedIds)) enrolledIds = new Set(parsedIds);
      } catch (e) { console.error("Error parsing enrolled IDs", e); }
    }
    setNumEnrolledCourses(enrolledIds.size);

    const storedCompletedIdsString = localStorage.getItem(COMPLETED_COURSES_KEY);
    let completedIds: Set<string> = new Set();
    if (storedCompletedIdsString) {
        try {
            const parsedCompletedIds = JSON.parse(storedCompletedIdsString);
            if (Array.isArray(parsedCompletedIds)) completedIds = new Set(parsedCompletedIds);
        } catch (e) { console.error("Error parsing completed IDs", e); }
    }
    setNumCompletedCourses(completedIds.size);
    
    const coursesToDisplay = allPlatformCourses
      .filter(course => enrolledIds.has(course.id))
      .map(courseFromCatalog => {
        // Find full course data from allPlatformCourses to ensure 'lessons' array is present
        const fullCourseData = allPlatformCourses.find(c => c.id === courseFromCatalog.id);
        if (!fullCourseData) return null; // Should not happen if logic is correct

        const isCompleted = completedIds.has(fullCourseData.id);
        let progress = 0;
        if (isCompleted) {
            progress = 100;
        } else {
            const courseLessonProgressKey = `${COMPLETED_COURSES_KEY}_${fullCourseData.id}`;
            const storedLessonProgressString = localStorage.getItem(courseLessonProgressKey);
            if (storedLessonProgressString && fullCourseData.lessons && fullCourseData.lessons.length > 0) {
                try {
                    const completedLessonsForThisCourse: string[] = JSON.parse(storedLessonProgressString);
                    progress = Math.round((completedLessonsForThisCourse.length / fullCourseData.lessons.length) * 100);
                } catch (e) { progress = Math.floor(Math.random() * 99); } 
            } else if (fullCourseData.lessons && fullCourseData.lessons.length > 0) {
                 progress = 0; 
            } else {
                progress = 0; 
            }
        }
        return { ...fullCourseData, progress };
      }).filter(Boolean) as EnrolledCourseData[]; // Filter out nulls and assert type
      
    setEnrolledCourses(coursesToDisplay);

    if (coursesToDisplay.length > 0) {
      const incompleteCourses = coursesToDisplay.filter(course => course.progress < 100);
      if (incompleteCourses.length > 0) {
        incompleteCourses.sort((a, b) => b.progress - a.progress); 
        setCourseToContinue(incompleteCourses[0]);
      } else {
        setCourseToContinue(coursesToDisplay[0]); 
      }
    } else {
      setCourseToContinue(null);
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-150px)] flex-col items-center justify-center space-y-4 bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">Cargando tu panel...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Mi Panel de Aprendizaje</h1>
      
      <Card className="shadow-xl bg-gradient-to-r from-primary/30 to-accent/30 border-primary/50">
        <CardHeader>
          <CardTitle className="text-2xl">Continuar Aprendiendo</CardTitle>
          <CardDescription>
            {courseToContinue 
              ? (courseToContinue.progress < 100 ? "Retoma donde lo dejaste en tu curso más reciente." : "¡Felicidades! Has completado este curso. Puedes revisarlo o explorar otros.")
              : (numEnrolledCourses > 0 ? "¡Excelente trabajo! Has completado todos tus cursos inscritos." : "Empieza tu viaje de aprendizaje.")
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row items-center gap-6">
          {courseToContinue ? (
            <>
              <Image 
                src={courseToContinue.thumbnailUrl} 
                alt={courseToContinue.title} 
                width={300} height={170} 
                className="rounded-lg shadow-md object-cover" 
                data-ai-hint={courseToContinue.dataAiHint || "education learning"}
              />
              <div>
                <h3 className="text-xl font-semibold">{courseToContinue.title}</h3>
                <p className="text-sm text-muted-foreground mb-1">Por: {courseToContinue.instructorName}</p>
                <div className="w-full bg-muted rounded-full h-2.5 mb-3">
                  <div className="bg-primary h-2.5 rounded-full" style={{ width: `${courseToContinue.progress}%` }}></div>
                </div>
                <Button asChild>
                  <Link href={`/dashboard/courses/${courseToContinue.id}/view`}>
                    {courseToContinue.progress < 100 ? "Reanudar Curso" : "Revisar Curso"}
                    <Zap className="ml-2 h-4 w-4"/>
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center w-full py-4">
              {numEnrolledCourses > 0 ? (
                <p className="text-lg">¡Felicidades por tu progreso! Considera explorar nuevos cursos.</p>
              ) : (
                <p className="text-lg">Aún no estás inscrito en ningún curso.</p>
              )}
              <Button asChild className="mt-4">
                <Link href="/dashboard/courses/explore">
                  <Library className="mr-2 h-4 w-4" /> Explorar Catálogo de Cursos
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Mis Cursos Inscritos</h2>
        <Button variant="outline" asChild>
            <Link href="/dashboard/courses/explore">
                <Library className="mr-2 h-4 w-4" /> Explorar Más Cursos
            </Link>
        </Button>
      </div>
      {enrolledCourses.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {enrolledCourses.map((course) => (
            <Card key={course.id} className="overflow-hidden shadow-lg hover:shadow-primary/20 transition-shadow">
              <Image src={course.thumbnailUrl} alt={course.title} width={600} height={300} className="w-full h-48 object-cover" data-ai-hint={course.dataAiHint || "course thumbnail"} />
              <CardHeader>
                <CardTitle className="text-lg leading-tight">{course.title}</CardTitle>
                <CardDescription>Por {course.instructorName}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between text-sm text-muted-foreground mb-1">
                  <span>Progreso</span>
                  <span>{course.progress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className={`h-2 rounded-full ${course.progress === 100 ? 'bg-accent' : 'bg-primary'}`} style={{ width: `${course.progress}%` }}></div>
                </div>
                <Button variant="outline" size="sm" asChild className="w-full mt-4">
                  <Link href={`/dashboard/courses/${course.id}/view`}>{course.progress === 100 ? 'Revisar Curso' : 'Continuar Aprendiendo'}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-10 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-3"/>
            <p className="text-muted-foreground">No tienes cursos inscritos en este momento.</p>
          </CardContent>
        </Card>
      )}
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center"><BarChart3 className="mr-2 h-5 w-5 text-primary" />Progreso General</CardTitle>
            <CardDescription>Tus estadísticas de aprendizaje.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center"><span>Cursos Completados:</span> <span className="font-semibold">{numCompletedCourses}</span></div>
            <div className="flex justify-between items-center"><span>Total Inscritos:</span> <span className="font-semibold">{numEnrolledCourses}</span></div>
            <div className="flex justify-between items-center"><span>Puntuación Promedio:</span> <span className="font-semibold">88% (Simulado)</span></div>
            <Button variant="secondary" className="w-full mt-2" disabled>Ver Estadísticas Detalladas (Próximamente)</Button>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center"><Award className="mr-2 h-5 w-5 text-accent" />Logros e Insignias</CardTitle>
            <CardDescription>Hitos que has desbloqueado.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4 items-center justify-center">
            {['Pionero AlpriNexus', 'Aprendiz Rápido', 'Mejor Rendimiento', 'Estudiante Dedicado'].map((achievement, index) => (
              <div key={achievement} className={`flex flex-col items-center p-3 bg-muted rounded-lg w-28 text-center ${index < numCompletedCourses ? '' : 'opacity-50'}`}>
                <CheckCircle className={`h-8 w-8  mb-1 ${index < numCompletedCourses ? 'text-accent' : 'text-muted-foreground' }`} />
                <span className="text-xs font-medium">{achievement}</span>
              </div>
            ))}
             {numCompletedCourses === 0 && <p className="text-sm text-muted-foreground w-full text-center">Completa cursos para desbloquear logros.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};


function AdminDashboardWrapper() {
  const [isAnnouncementDialogOpen, setIsAnnouncementDialogOpen] = React.useState(false);
  const [announcementTitle, setAnnouncementTitle] = React.useState('');
  const [announcementMessage, setAnnouncementMessage] = React.useState('');
  const [announcementAudience, setAnnouncementAudience] = React.useState('all'); 
  const { toast } = useToast();

  const handleSendAnnouncement = () => {
    if (!announcementTitle.trim() || !announcementMessage.trim()) {
      toast({
        variant: "destructive",
        title: "Campos Vacíos",
        description: "Por favor, ingresa un título y un mensaje para el anuncio.",
      });
      return;
    }
    console.log("Enviando anuncio:", { title: announcementTitle, message: announcementMessage, audience: announcementAudience });
    toast({
      title: "Anuncio Enviado (Simulado)",
      description: `El anuncio "${announcementTitle}" ha sido enviado a "${announcementAudience}".`,
    });
    setIsAnnouncementDialogOpen(false);
    setAnnouncementTitle('');
    setAnnouncementMessage('');
    setAnnouncementAudience('all'); 
  };

  return (
    <Dialog open={isAnnouncementDialogOpen} onOpenChange={setIsAnnouncementDialogOpen}>
      <AdminDashboardContent />
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
            <DialogTitle>Enviar Nuevo Anuncio</DialogTitle>
            <DialogDescription>
            Redacta y envía un anuncio a los usuarios de la plataforma.
            </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="announcement-title" className="text-right">
                    Título
                </Label>
                <Input
                    id="announcement-title"
                    placeholder="Ej: Mantenimiento Programado"
                    className="col-span-3"
                    value={announcementTitle}
                    onChange={(e) => setAnnouncementTitle(e.target.value)}
                />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="announcement-message" className="text-right pt-2">
                    Mensaje
                </Label>
                <Textarea
                    id="announcement-message"
                    placeholder="Escribe aquí el contenido del anuncio..."
                    className="col-span-3"
                    rows={5}
                    value={announcementMessage}
                    onChange={(e) => setAnnouncementMessage(e.target.value)}
                />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="announcement-audience" className="text-right">
                    Audiencia
                </Label>
                <Select value={announcementAudience} onValueChange={setAnnouncementAudience}>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Seleccionar audiencia" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los Usuarios</SelectItem>
                        <SelectItem value="students">Solo Estudiantes</SelectItem>
                        <SelectItem value="instructors">Solo Instructores</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
        <DialogFooter>
            <Button variant="outline" onClick={() => setIsAnnouncementDialogOpen(false)}>Cancelar</Button>
            <Button type="submit" onClick={handleSendAnnouncement}>Enviar Anuncio</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


export default function DashboardHomePage() {
  const { currentSessionRole, isLoadingRole } = useSessionRole(); 

  if (isLoadingRole) { 
    return (
      <div className="flex h-screen flex-col items-center justify-center space-y-4 bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">Cargando panel...</p>
      </div>
    );
  }
  
  if (!currentSessionRole) {
     return (
        <div className="flex h-screen flex-col items-center justify-center space-y-4">
            <p className="text-lg text-destructive">Error al determinar el rol.</p>
        </div>
     );
  }


  switch (currentSessionRole) {
    case 'administrador':
      return <AdminDashboardWrapper />;
    case 'instructor':
      return <InstructorDashboardContent />;
    case 'estudiante':
      return <StudentDashboardContent />;
    default:
      // Default to student dashboard or a generic error/welcome if role is somehow unexpected
      return <StudentDashboardContent />; 
  }
}

// Helper StarIcon if needed, or use lucide-react directly
// function StarIcon(props: React.SVGProps<SVGSVGElement>) { 
//   return (
//     <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
//       <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
//     </svg>
//   )
// }
    

