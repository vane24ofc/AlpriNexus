
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useSessionRole, type Role } from '@/app/dashboard/layout';
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
  Library,
  Edit3,
  Trash2, // Added for Reset button
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger as ResetAlertDialogTrigger, // Renamed to avoid conflict
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Course } from '@/types/course';
import { Badge } from '@/components/ui/badge';

// Keys for localStorage
const USERS_STORAGE_KEY = 'nexusAlpriAllUsers';
const COURSES_STORAGE_KEY = 'nexusAlpriAllCourses';
const LOCAL_STORAGE_ENROLLED_KEY = 'simulatedEnrolledCourseIds';
const COMPLETED_COURSES_KEY = 'simulatedCompletedCourseIds';
const CALENDAR_EVENTS_STORAGE_KEY = 'nexusAlpriCalendarEvents';
const VIRTUAL_SESSIONS_STORAGE_KEY = 'nexusAlpriVirtualSessions';
const COMPANY_RESOURCES_STORAGE_KEY = 'simulatedCompanyResources';
const LEARNING_RESOURCES_STORAGE_KEY = 'simulatedLearningResources';
const COMPLETED_LESSONS_PREFIX = 'simulatedCompletedCourseIds_';
const QUIZ_STATE_STORAGE_PREFIX = 'simulatedQuizState_';


interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  joinDate: string;
  avatarUrl?: string;
  status: 'active' | 'inactive';
}


// Admin Dashboard Content
interface AdminDashboardContentProps {
  allUsers: User[];
  allCourses: Course[];
}
const AdminDashboardContent: React.FC<AdminDashboardContentProps> = ({ allUsers, allCourses }) => {
  const { toast } = useToast();
  const userCount = allUsers.length;
  const activeCourseCount = allCourses.filter(c => c.status === 'approved').length;

  const stats = [
    { title: "Usuarios Totales", value: userCount.toString(), icon: Users, trend: "+5% desde el mes pasado" },
    { title: "Cursos Activos", value: activeCourseCount.toString(), icon: BookOpen, trend: "+2 nuevos esta semana" },
    { title: "Salud del Sistema", value: "Óptima", icon: Settings, trend: "Todos los sistemas operativos" },
    { title: "Tasa de Participación", value: "78%", icon: BarChart3, trend: "Aumento del 3%" },
  ];

  const recentActivities = [
    { user: "Alice", action: "registró una nueva cuenta.", time: "hace 5m" },
    { user: "Bob (Instructor)", action: "publicó el curso 'IA Avanzada'.", time: "hace 1h" },
    { user: "Charlie", action: "completó 'Introducción a Python'.", time: "hace 2h" },
    { user: "System", action: "mantenimiento programado para mañana.", time: "hace 4h" },
  ];

  const handleResetPlatformData = () => {
    try {
      localStorage.removeItem(USERS_STORAGE_KEY);
      localStorage.removeItem(COURSES_STORAGE_KEY);
      localStorage.removeItem(LOCAL_STORAGE_ENROLLED_KEY);
      localStorage.removeItem(COMPLETED_COURSES_KEY);
      localStorage.removeItem(CALENDAR_EVENTS_STORAGE_KEY);
      localStorage.removeItem(VIRTUAL_SESSIONS_STORAGE_KEY);
      localStorage.removeItem(COMPANY_RESOURCES_STORAGE_KEY);
      localStorage.removeItem(LEARNING_RESOURCES_STORAGE_KEY);

      // Remove all keys related to lesson completion and quiz states
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(COMPLETED_LESSONS_PREFIX) || key.startsWith(QUIZ_STATE_STORAGE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });

      toast({
        title: "Datos Restablecidos",
        description: "Todos los datos simulados de la plataforma han sido eliminados. La página se recargará.",
      });

      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (error) {
      console.error("Error al restablecer datos:", error);
      toast({
        variant: "destructive",
        title: "Error al Restablecer",
        description: "No se pudieron eliminar todos los datos simulados.",
      });
    }
  };


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
              {recentActivities.map((activity) => (
                <li key={activity.user + activity.time} className="flex items-center space-x-3 text-sm">
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
                    <span className="font-medium">Configuración</span> {/* Changed to Configuración */}
                </Link>
            </Button>
             <ResetAlertDialogTrigger asChild>
                <Button variant="destructive" className="p-4 h-auto flex flex-col items-center text-center col-span-2">
                    <Trash2 className="h-8 w-8 mb-2"/>
                    <span className="font-medium">Restablecer Datos de Plataforma</span>
                </Button>
            </ResetAlertDialogTrigger>
          </CardContent>
        </Card>
      </div>
      <AlertDialog>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar Restablecimiento de Datos?</AlertDialogTitle>
            <AlertDialogDescription>
                Esta acción eliminará todos los usuarios, cursos, inscripciones, eventos del calendario y recursos simulados guardados en el almacenamiento local de su navegador. Los datos iniciales de ejemplo se cargarán la próxima vez. Esta acción no se puede deshacer.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetPlatformData} className="bg-destructive hover:bg-destructive/90">
                Sí, Restablecer Datos
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};


// Instructor Dashboard Content
interface InstructorDashboardContentProps {
  allCourses: Course[];
}

const InstructorDashboardContent: React.FC<InstructorDashboardContentProps> = ({ allCourses }) => {
  const currentInstructorName = "Usuario Actual (Instructor)"; 

  const instructorCourses = useMemo(() => 
    allCourses.filter(c => c.instructorName === currentInstructorName),
    [allCourses, currentInstructorName]
  );

  const pendingReviewCount = instructorCourses.filter(c => c.status === 'pending').length;

  const stats = [
    { title: "Mis Cursos", value: instructorCourses.length.toString(), icon: BookOpen, link: "/dashboard/instructor/my-courses" }, 
    { title: "Estudiantes Totales", value: "350", icon: Users, link: "#" }, // Placeholder - would need more complex data
    { title: "Revisiones Pendientes", value: pendingReviewCount.toString(), icon: MessageSquare, link: "/dashboard/instructor/my-courses" },
    { title: "Calificación Promedio", value: "4.7/5", icon: BarChartIcon, link: "#" }, // Placeholder
  ];
  
  const recentFeedbacks = [
    { student: "Emily R.", course: instructorCourses[0]?.title || "Curso Ejemplo", comment: "¡Excelente curso, muy detallado!", rating: 5, time: "hace 1h" },
    { student: "John B.", course: instructorCourses[1]?.title || "Otro Curso", comment: "Desafiante pero gratificante.", rating: 4, time: "hace 3h" },
    { student: "Sarah K.", course: instructorCourses[2]?.title || "Tercer Curso", comment: "Necesita más ejemplos en el capítulo 3.", rating: 3, time: "Ayer" },
  ].filter(f => f.course !== "Curso Ejemplo" && f.course !== "Otro Curso" && f.course !== "Tercer Curso" || instructorCourses.length > 0);


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
            {instructorCourses.length > 0 ? (
              <ul className="space-y-4">
                {instructorCourses.slice(0, 3).map((course) => { 
                  const students = Math.floor(Math.random() * 200) + 50; 
                  const progress = course.status === 'approved' ? (Math.floor(Math.random() * 50) + 50) : (course.status === 'pending' ? Math.floor(Math.random() * 30) : 0) ; 
                  return (
                  <li key={course.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{course.title}</h3>
                        <p className="text-sm text-muted-foreground">{students} estudiantes inscritos</p>
                        <Badge 
                          variant={course.status === 'approved' ? 'default' : course.status === 'pending' ? 'secondary' : 'destructive'}
                          className={`mt-1 text-xs ${
                            course.status === 'approved' ? 'bg-accent text-accent-foreground hover:bg-accent/90' : 
                            course.status === 'pending' ? 'bg-yellow-500 text-white hover:bg-yellow-600' : ''
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
            {instructorCourses.length > 3 && (
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
            {recentFeedbacks.length > 0 ? (
              <ul className="space-y-3">
                {recentFeedbacks.map((feedback) => (
                  <li key={feedback.student + feedback.course + feedback.time} className="text-sm border-b border-border pb-2 last:border-b-0">
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
            ) : (
                <p className="text-muted-foreground text-center py-4">No hay comentarios recientes para tus cursos.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Student Dashboard Content
interface EnrolledCourseData extends Course {
  progress: number;
  isCompleted: boolean;
}

interface StudentDashboardContentProps {
  allCourses: Course[];
  enrolledCourseIds: Set<string>;
  completedCourseIds: Set<string>;
}

const StudentDashboardContent: React.FC<StudentDashboardContentProps> = ({ allCourses, enrolledCourseIds, completedCourseIds }) => {
  const studentCourses = useMemo(() => {
    return allCourses
      .filter(course => enrolledCourseIds.has(course.id) && course.status === 'approved')
      .map(course => {
        const isCompleted = completedCourseIds.has(course.id);
        let progress = 0;
        if (isCompleted) {
          progress = 100;
        } else {
          const lessonProgressKey = `${COMPLETED_COURSES_KEY}_${course.id}`;
          const storedLessonProgress = localStorage.getItem(lessonProgressKey);
          if (storedLessonProgress && course.lessons && course.lessons.length > 0) {
            try {
              const completedLessonsForThisCourse: string[] = JSON.parse(storedLessonProgress);
              progress = Math.round((completedLessonsForThisCourse.length / course.lessons.length) * 100);
            } catch (e) { progress = Math.floor(Math.random() * 99); }
          } else {
            progress = (course.lessons && course.lessons.length > 0) ? 0 : Math.floor(Math.random() * 99);
          }
        }
        return { ...course, progress, isCompleted } as EnrolledCourseData;
      });
  }, [allCourses, enrolledCourseIds, completedCourseIds]);

  const courseToContinue = useMemo(() => {
    if (studentCourses.length === 0) return null;
    const incompleteCourses = studentCourses.filter(course => !course.isCompleted);
    if (incompleteCourses.length > 0) {
      incompleteCourses.sort((a, b) => b.progress - a.progress);
      return incompleteCourses[0];
    }
    return studentCourses.sort((a,b) => b.progress - a.progress)[0]; 
  }, [studentCourses]);

  const numCompletedCourses = studentCourses.filter(c => c.isCompleted).length;
  const numEnrolledCourses = studentCourses.length;

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
      {studentCourses.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {studentCourses.map((course) => (
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


interface AdminDashboardWrapperWithDataProps {
  allUsers: User[];
  allCourses: Course[];
}

const AdminDashboardWrapperWithData: React.FC<AdminDashboardWrapperWithDataProps> = ({ allUsers, allCourses }) => {
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
      <AdminDashboardContent allUsers={allUsers} allCourses={allCourses} /> 
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
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<string>>(new Set());
  const [completedCourseIds, setCompletedCourseIds] = useState<Set<string>>(new Set());
  const [isLoadingDashboardData, setIsLoadingDashboardData] = useState(true);

  useEffect(() => {
    const loadData = () => {
      setIsLoadingDashboardData(true);
      try {
        const storedCourses = localStorage.getItem(COURSES_STORAGE_KEY);
        setAllCourses(storedCourses ? JSON.parse(storedCourses) : []);

        const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
        setAllUsers(storedUsers ? JSON.parse(storedUsers) : []);

        const storedEnrolled = localStorage.getItem(LOCAL_STORAGE_ENROLLED_KEY);
        setEnrolledCourseIds(storedEnrolled ? new Set(JSON.parse(storedEnrolled)) : new Set());
        
        const storedCompleted = localStorage.getItem(COMPLETED_COURSES_KEY);
        setCompletedCourseIds(storedCompleted ? new Set(JSON.parse(storedCompleted)) : new Set());

      } catch (error) {
        console.error("Error loading data from localStorage for dashboard:", error);
        setAllCourses([]);
        setAllUsers([]);
        setEnrolledCourseIds(new Set());
        setCompletedCourseIds(new Set());
      }
      setIsLoadingDashboardData(false);
    };

    if (!isLoadingRole && currentSessionRole) { 
      loadData();
    }
  }, [isLoadingRole, currentSessionRole]);


  if (isLoadingRole || isLoadingDashboardData) { 
    return (
      <div className="flex h-[calc(100vh-150px)] flex-col items-center justify-center space-y-4 bg-background">
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
      return <AdminDashboardWrapperWithData allUsers={allUsers} allCourses={allCourses} />;
    case 'instructor':
      return <InstructorDashboardContent allCourses={allCourses} />;
    case 'estudiante':
      return <StudentDashboardContent allCourses={allCourses} enrolledCourseIds={enrolledCourseIds} completedCourseIds={completedCourseIds} />;
    default: 
      return <StudentDashboardContent allCourses={allCourses} enrolledCourseIds={enrolledCourseIds} completedCourseIds={completedCourseIds} />; 
  }
}

    