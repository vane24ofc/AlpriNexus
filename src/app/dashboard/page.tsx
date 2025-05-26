
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
const InstructorDashboardContent = () => {
  const stats = [
    { title: "Mis Cursos", value: "12", icon: BookOpen, link: "/dashboard/instructor/my-courses" }, 
    { title: "Estudiantes Totales", value: "350", icon: Users, link: "#" }, 
    { title: "Revisiones Pendientes", value: "8", icon: MessageSquare, link: "#" },
    { title: "Calificación Promedio", value: "4.7/5", icon: BarChartIcon, link: "#" },
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
            <CardTitle>Mis Cursos Activos</CardTitle>
            <CardDescription>Resumen de tus cursos actualmente activos.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {[
                { id: "c1", name: "JavaScript Avanzado", students: 120, progress: 75, lastUpdate: "hace 2 días" },
                { id: "c2", name: "Estructuras de Datos en Python", students: 85, progress: 40, lastUpdate: "hace 5 días" },
                { id: "c3", name: "Fundamentos de Machine Learning", students: 145, progress: 60, lastUpdate: "Ayer" },
              ].map((course) => (
                <li key={course.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{course.name}</h3>
                      <p className="text-sm text-muted-foreground">{course.students} estudiantes inscritos</p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/courses/${course.id}/edit`}>Gestionar</Link>
                    </Button>
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Progreso: {course.progress}%</span>
                      <span>Última Actualización: {course.lastUpdate}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div className="bg-primary h-2.5 rounded-full" style={{ width: `${course.progress}%` }}></div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Comentarios Recientes de Estudiantes</CardTitle>
            <CardDescription>Últimos comentarios y calificaciones de los estudiantes.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {[
                { student: "Emily R.", course: "JS Avanzado", comment: "¡Excelente curso, muy detallado!", rating: 5, time: "hace 1h" },
                { student: "John B.", course: "Python DSA", comment: "Desafiante pero gratificante.", rating: 4, time: "hace 3h" },
                { student: "Sarah K.", course: "Intro ML", comment: "Necesita más ejemplos en el capítulo 3.", rating: 3, time: "Ayer" },
              ].map((feedback, index) => (
                <li key={index} className="text-sm border-b border-border pb-2 last:border-b-0">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">{feedback.student} en <span className="text-primary">{feedback.course}</span></span>
                    <span className="text-xs text-muted-foreground">{feedback.time}</span>
                  </div>
                  <p className="text-muted-foreground mt-1">&quot;{feedback.comment}&quot;</p>
                  <div className="flex items-center mt-1">
                    {Array(5).fill(0).map((_, i) => (
                      <Star key={i} className={`h-3 w-3 ${i < feedback.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
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
  dataAiHint?: string; // Make optional
}

const StudentDashboardContent = () => {
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourseData[]>([]);
  const [courseToContinue, setCourseToContinue] = useState<EnrolledCourseData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const LOCAL_STORAGE_ENROLLED_KEY = 'simulatedEnrolledCourseIds';
  const COMPLETED_COURSES_KEY = 'simulatedCompletedCourseIds';

  // Hardcoded list of all available platform courses with more details
    const allPlatformCoursesSample: Array<EnrolledCourseData & { lessons?: Array<{id: string}> }> = [ 
        { id: 'course-js-adv', title: 'JavaScript Avanzado: Patrones y Prácticas Modernas', instructorName: 'Dr. Evelyn Woods', progress: 0, thumbnailUrl: 'https://placehold.co/600x300.png', dataAiHint: 'javascript programming', lessons: [{id:'l1-js'},{id:'l2-js'}, {id:'l3-js'}, {id:'l4-js'}]},
        { id: 'course-python-ds', title: 'Python para Ciencia de Datos: De Cero a Héroe', instructorName: 'Prof. Ian Stone', progress: 0, thumbnailUrl: 'https://placehold.co/600x300.png', dataAiHint: 'python data', lessons: [{id:'l1-py'},{id:'l2-py'}, {id:'l3-py'}, {id:'l4-py'}]},
        { id: 'course-ux-design', title: 'Fundamentos del Diseño de Experiencia de Usuario (UX)', instructorName: 'Ana Lima', progress: 0, thumbnailUrl: 'https://placehold.co/600x300.png', dataAiHint: 'ux design', lessons: [{id:'l1-ux'},{id:'l2-ux'}, {id:'l3-ux'}, {id:'l4-ux'}]},
        { id: 'course-react-native', title: 'Desarrollo de Apps Móviles con React Native', instructorName: 'Carlos Vega', progress: 0, thumbnailUrl: 'https://placehold.co/600x300.png', dataAiHint: 'mobile development', lessons: []},
        { id: 'course-digital-marketing', title: 'Marketing Digital Estratégico para Negocios', description: 'Descubre cómo crear y ejecutar estrategias de marketing digital efectivas para hacer crecer tu negocio.', thumbnailUrl: 'https://placehold.co/600x338.png', instructorName: 'Laura Morales', status: 'approved', lessons: [{id: 'l1-dm', title: 'Intro DM'}], dataAiHint: 'digital marketing', progress: 0 },
        { id: 'course-project-management', title: 'Gestión de Proyectos Ágil con Scrum', description: 'Domina Scrum y aprende a gestionar proyectos de forma ágil y eficiente para entregar valor continuamente.', thumbnailUrl: 'https://placehold.co/600x338.png', instructorName: 'Roberto Diaz', status: 'approved', lessons: [{id: 'l1-pm', title: 'Intro PM'}], dataAiHint: 'project management', progress: 0 },
    ];

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

    const storedCompletedIdsString = localStorage.getItem(COMPLETED_COURSES_KEY);
    let completedIds: Set<string> = new Set();
    if (storedCompletedIdsString) {
        try {
            const parsedCompletedIds = JSON.parse(storedCompletedIdsString);
            if (Array.isArray(parsedCompletedIds)) completedIds = new Set(parsedCompletedIds);
        } catch (e) { console.error("Error parsing completed IDs", e); }
    }
    
    const coursesToDisplay = allPlatformCoursesSample
      .filter(course => enrolledIds.has(course.id))
      .map(course => {
        const isCompleted = completedIds.has(course.id);
        let progress = 0;
        if (isCompleted) {
            progress = 100;
        } else {
            const courseLessonProgressKey = `${COMPLETED_COURSES_KEY}_${course.id}`;
            const storedLessonProgressString = localStorage.getItem(courseLessonProgressKey);
            if (storedLessonProgressString && course.lessons && course.lessons.length > 0) {
                try {
                    const completedLessonsForThisCourse: string[] = JSON.parse(storedLessonProgressString);
                    progress = Math.round((completedLessonsForThisCourse.length / course.lessons.length) * 100);
                } catch (e) { progress = Math.floor(Math.random() * 99); } // Fallback for parsing error
            } else if (course.lessons && course.lessons.length > 0) {
                 progress = 0; // Default to 0 if no specific lesson progress found but lessons exist
            } else {
                // Fallback if course has no lessons (or lessons array is empty/undefined)
                // This case might imply the course structure is incomplete or it's a different type of resource
                progress = 0; // Or some other logic, e.g., consider it 100% if no lessons needed
            }
        }
        return { ...course, progress };
      });
    setEnrolledCourses(coursesToDisplay);

    if (coursesToDisplay.length > 0) {
      // Prioritize incomplete courses with the most progress (or least progress, depending on desired logic)
      // Here, we'll pick the one with the most progress that isn't 100%
      const incompleteCourses = coursesToDisplay.filter(course => course.progress < 100);
      if (incompleteCourses.length > 0) {
        incompleteCourses.sort((a, b) => b.progress - a.progress); // Sort by progress descending
        setCourseToContinue(incompleteCourses[0]);
      } else {
        // If all are complete, pick the first one (or most recently completed)
        setCourseToContinue(coursesToDisplay[0]); 
      }
    } else {
      setCourseToContinue(null);
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center space-y-4 bg-background">
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
              : (enrolledCourses.length > 0 ? "¡Felicidades! Has completado todos tus cursos inscritos." : "Empieza tu viaje de aprendizaje.")
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
              {enrolledCourses.length > 0 ? (
                <p className="text-lg">¡Excelente trabajo! Considera explorar nuevos cursos.</p>
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
            <div className="flex justify-between items-center"><span>Cursos Completados:</span> <span className="font-semibold">{enrolledCourses.filter(c => c.progress === 100).length}</span></div>
            <div className="flex justify-between items-center"><span>Certificados Obtenidos:</span> <span className="font-semibold">{enrolledCourses.filter(c => c.progress === 100).length}</span></div>
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
            {['Maestro del Curso', 'Aprendiz Rápido', 'Mejor Rendimiento', 'Estudiante Dedicado'].map(achievement => (
              <div key={achievement} className="flex flex-col items-center p-3 bg-muted rounded-lg w-28 text-center">
                <CheckCircle className="h-8 w-8 text-accent mb-1" />
                <span className="text-xs font-medium">{achievement}</span>
              </div>
            ))}
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
  const [announcementAudience, setAnnouncementAudience] = React.useState('all'); // Default to 'all'
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
    setAnnouncementAudience('all'); // Reset audience to default
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
      return <StudentDashboardContent />; 
  }
}

function StarIcon(props: React.SVGProps<SVGSVGElement>) { 
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  )
}
    

