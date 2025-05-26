
"use client";

import React, { useState } from 'react';
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
                    <span className="font-medium">Configuración</span>
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
  dataAiHint: string;
}

const StudentDashboardContent = () => {
  // Consistent data structure for enrolled courses
  const enrolledCourses: EnrolledCourseData[] = [
    { id: "course-js-adv", title: "JavaScript Avanzado: Patrones y Prácticas Modernas", instructorName: "Dr. Evelyn Woods", progress: 65, thumbnailUrl: "https://placehold.co/600x300.png?text=JS+Avanzado", dataAiHint: "javascript programming" },
    { id: "course-python-ds", title: "Python para Ciencia de Datos: De Cero a Héroe", instructorName: "Prof. Ian Stone", progress: 30, thumbnailUrl: "https://placehold.co/600x300.png?text=Python+DS", dataAiHint: "python data" },
    { id: "course-ux-design", title: "Fundamentos del Diseño de Experiencia de Usuario (UX)", instructorName: "Ana Lima", progress: 95, thumbnailUrl: "https://placehold.co/600x300.png?text=Diseño+UX", dataAiHint: "ux design" },
    { id: "course-react-native", title: "Desarrollo de Apps Móviles con React Native", instructorName: "Carlos Vega", progress: 100, thumbnailUrl: "https://placehold.co/600x300.png?text=React+Native", dataAiHint: "mobile development"},
  ];

  let courseToContinue: EnrolledCourseData | null = null;
  if (enrolledCourses.length > 0) {
    const incompleteCourses = enrolledCourses.filter(course => course.progress < 100);
    if (incompleteCourses.length > 0) {
      incompleteCourses.sort((a, b) => a.progress - b.progress); // Sort by progress ascending
      courseToContinue = incompleteCourses[0];
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Mi Panel de Aprendizaje</h1>
      
      <Card className="shadow-xl bg-gradient-to-r from-primary/30 to-accent/30 border-primary/50">
        <CardHeader>
          <CardTitle className="text-2xl">Continuar Aprendiendo</CardTitle>
          <CardDescription>
            {courseToContinue 
              ? "Retoma donde lo dejaste en tu curso más reciente." 
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
                  <Link href={`/dashboard/courses/${courseToContinue.id}/view`}>Reanudar Curso <Zap className="ml-2 h-4 w-4"/></Link>
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
              <Image src={course.thumbnailUrl} alt={course.title} width={600} height={300} className="w-full h-48 object-cover" data-ai-hint={course.dataAiHint} />
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
    console.log("Enviando anuncio:", { title: announcementTitle, message: announcementMessage });
    toast({
      title: "Anuncio Enviado (Simulado)",
      description: `El anuncio "${announcementTitle}" ha sido enviado.`,
    });
    setIsAnnouncementDialogOpen(false);
    setAnnouncementTitle('');
    setAnnouncementMessage('');
  };

  return (
    <Dialog open={isAnnouncementDialogOpen} onOpenChange={setIsAnnouncementDialogOpen}>
      <AdminDashboardContent />
      <DialogContent className="sm:max-w-[480px]">
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
            <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="announcement-message" className="text-right">
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
  const { currentSessionRole } = useSessionRole(); // isLoadingRole ya no es necesario aquí porque DashboardLayout lo maneja

  if (!currentSessionRole) { // Esta condición es importante si currentSessionRole puede ser null inicialmente
    return (
      <div className="flex h-screen flex-col items-center justify-center space-y-4 bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">Cargando panel...</p>
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
      return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Bienvenido a NexusAlpri</h1>
            <p>Tu panel de control se está cargando o no se ha reconocido tu rol.</p>
          </div>
      );
  }
}

function StarIcon(props: React.SVGProps<SVGSVGElement>) { // renombrado para consistencia, aunque no se usa directamente aquí
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  )
}
    
