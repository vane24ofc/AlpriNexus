
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  Trash2,
  Percent,
  FileWarning,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from 'next/navigation';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Course } from '@/types/course';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const SIMULATED_AUTH_TOKEN_KEY = 'simulatedAuthToken';

interface User {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  joinDate: string;
  avatarUrl?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

// Admin Dashboard Content
interface AdminDashboardContentProps {
  userCount: number;
  activeCourseCount: number;
  pendingReviewCourseCount: number;
  courseCompletionRate: string;
  onOpenAnnouncementDialog: () => void;
}

const AdminDashboardContent: React.FC<AdminDashboardContentProps> = ({
  userCount,
  activeCourseCount,
  pendingReviewCourseCount,
  courseCompletionRate,
  onOpenAnnouncementDialog,
}) => {

  const stats = [
    { title: "Usuarios Totales", value: userCount.toLocaleString(), icon: Users, trend: "Activos en la plataforma" },
    { title: "Cursos Activos", value: activeCourseCount.toLocaleString(), icon: BookOpen, trend: "Disponibles para inscripción" },
    { title: "Cursos Pend. Revisión", value: pendingReviewCourseCount.toLocaleString(), icon: FileWarning, trend: "Esperando aprobación" },
    { title: "Tasa de Finalización", value: courseCompletionRate, icon: Percent, trend: "Promedio de cursos" },
  ];

  const recentActivities = [
    { user: "Alice", action: "registró una nueva cuenta.", time: "hace 5m" },
    { user: "Equipo Alpri", action: "publicó el curso 'IA Avanzada'.", time: "hace 1h" },
    { user: "Charlie", action: "completó 'Introducción a Python'.", time: "hace 2h" },
    { user: "Sistema", action: "mantenimiento programado para mañana.", time: "hace 4h" },
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
            <CardTitle>Actividad Reciente (Simulada)</CardTitle>
            <CardDescription>Resumen de las actividades recientes de la plataforma.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {recentActivities.map((activity) => (
                <li key={activity.user + activity.action + activity.time} className="flex items-center space-x-3 text-sm">
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
            <Button
              variant="outline"
              className="p-4 h-auto flex flex-col items-center text-center"
              onClick={onOpenAnnouncementDialog}
            >
              <Bell className="h-8 w-8 mb-2 text-foreground"/>
              <span className="font-medium">Enviar Anuncio</span>
            </Button>
            <Button variant="outline" className="p-4 h-auto flex flex-col items-center text-center" asChild>
              <Link href="/dashboard/settings">
                <Settings className="h-8 w-8 mb-2 text-muted-foreground"/>
                <span className="font-medium">Configuración</span>
              </Link>
            </Button>
            {/* Botón de Restablecer Datos Eliminado de aquí */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Instructor Dashboard Content
interface InstructorCourseSummary extends Course {
  enrolledStudentsCount: number;
  averageCourseProgress: number;
}

interface InstructorDashboardContentProps {
  instructorCoursesSummary: InstructorCourseSummary[];
  isLoadingData: boolean;
}

const InstructorDashboardContent: React.FC<InstructorDashboardContentProps> = ({ instructorCoursesSummary, isLoadingData }) => {

  const totalCoursesCreated = useMemo(() =>
    instructorCoursesSummary.length,
    [instructorCoursesSummary]
  );

  const pendingReviewCount = useMemo(() =>
    instructorCoursesSummary.filter(c => c.status === 'pending').length,
    [instructorCoursesSummary]
  );

  const averageEnrollmentsPerCourse = useMemo(() => {
    if (instructorCoursesSummary.length === 0) return 0;
    const totalEnrollments = instructorCoursesSummary.reduce((sum, course) => sum + course.enrolledStudentsCount, 0);
    return parseFloat((totalEnrollments / instructorCoursesSummary.length).toFixed(1));
  }, [instructorCoursesSummary]);

  const overallStudentProgressAverage = useMemo(() => {
    if (instructorCoursesSummary.length === 0) return 0;
    const coursesWithEnrolledStudents = instructorCoursesSummary.filter(c => c.enrolledStudentsCount > 0);
    if (coursesWithEnrolledStudents.length === 0) return 0;
    
    const totalWeightedProgressSum = coursesWithEnrolledStudents.reduce((sum, course) => {
      return sum + (course.averageCourseProgress * course.enrolledStudentsCount);
    }, 0);
    const totalStudentsInTheseCourses = coursesWithEnrolledStudents.reduce((sum, course) => sum + course.enrolledStudentsCount, 0);

    if (totalStudentsInTheseCourses === 0) return 0;
    return parseFloat((totalWeightedProgressSum / totalStudentsInTheseCourses).toFixed(1));
  }, [instructorCoursesSummary]);

  const stats = [
    { title: "Mis Cursos Creados", value: totalCoursesCreated.toString(), icon: BookOpen, link: "/dashboard/instructor/my-courses", unit: "cursos" },
    { title: "Cursos Pendientes", value: pendingReviewCount.toString(), icon: MessageSquare, linkPathSuffix: "?tab=pending", link: "/dashboard/instructor/my-courses", unit: "para revisión" },
    { title: "Prom. Inscripciones", value: averageEnrollmentsPerCourse.toString(), icon: Users, link: "/dashboard/instructor/my-courses", unit: "estudiantes/curso" },
    { title: "Progreso Prom. Estudiantes", value: `${overallStudentProgressAverage}%`, icon: Percent, link: "/dashboard/instructor/my-courses", unit: "en mis cursos" },
  ];

  if (isLoadingData) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Panel de Instructor</h1>
          <Button disabled><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cargando...</Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array(4).fill(0).map((_, index) => (
            <Card key={`loader-stat-${index}`} className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-5 w-5 rounded-sm" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-7 w-1/3 mb-1" />
                <Skeleton className="h-3 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
         <Card className="shadow-lg">
          <CardHeader>
            <Skeleton className="h-6 w-1/2 mb-1" />
            <Skeleton className="h-4 w-3/4" />
          </CardHeader>
          <CardContent className="py-10 text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <p className="mt-2 text-muted-foreground">Cargando resumen de cursos...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              {stat.unit && <p className="text-xs text-muted-foreground">{stat.unit}</p>}
              <Button variant="link" size="sm" asChild className="px-0 -ml-1 text-primary">
                <Link href={`${stat.link}${stat.linkPathSuffix || ''}`}>Ver detalles</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-1">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Mis Cursos (Resumen)</CardTitle>
            <CardDescription>Un vistazo rápido a tus cursos, su estado, estudiantes inscritos y progreso promedio.</CardDescription>
          </CardHeader>
          <CardContent>
            {instructorCoursesSummary.length > 0 ? (
              <ul className="space-y-4">
                {instructorCoursesSummary.slice(0, 5).map((course) => (
                  <li key={course.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg line-clamp-1" title={course.title}>{course.title}</h3>
                        <p className="text-sm text-muted-foreground">{course.enrolledStudentsCount} estudiante(s) inscrito(s)</p>
                        <Badge
                          variant={course.status === 'approved' ? 'default' : course.status === 'pending' ? 'secondary' : 'destructive'}
                          className={`mt-1 text-xs ${course.status === 'approved' ? 'bg-accent text-accent-foreground hover:bg-accent/90' :
                            course.status === 'pending' ? 'bg-yellow-500 text-white hover:bg-yellow-600 border-yellow-500' : ''
                            }`}
                        >
                          {course.status === 'approved' ? 'Aprobado' : course.status === 'pending' ? 'Pendiente de Revisión' : 'Rechazado'}
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
                        <span>Progreso promedio estudiantes: {course.averageCourseProgress.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div className={`h-2.5 rounded-full ${course.averageCourseProgress > 70 ? 'bg-accent' : 'bg-primary'}`} style={{ width: `${course.averageCourseProgress}%` }}></div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-center py-4">Aún no has creado cursos. ¡Anímate a crear el primero!</p>
            )}
            {instructorCoursesSummary.length > 5 && (
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link href="/dashboard/instructor/my-courses">Ver todos mis cursos</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Student Dashboard Content
interface StudentApiEnrollment {
  enrollmentId: string;
  userId: number;
  courseId: string;
  enrolledAt: string;
  completedAt: string | null;
  progressPercent: number;
  course: {
    id: string;
    title: string;
    description: string;
    thumbnailUrl: string;
    instructorName: string;
    status: 'pending' | 'approved' | 'rejected';
    dataAiHint?: string;
    lessons?: any[];
  };
}

interface StudentDashboardCourseDisplay {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  instructorName: string;
  dataAiHint?: string;
  progress: number;
  isCompleted: boolean;
}

interface StudentDashboardContentProps {
  enrolledCourseDetails: StudentDashboardCourseDisplay[];
}

const StudentDashboardContent: React.FC<StudentDashboardContentProps> = ({ enrolledCourseDetails }) => {

  const courseToContinue = useMemo(() => {
    if (enrolledCourseDetails.length === 0) return null;
    const incompleteCourses = enrolledCourseDetails.filter(course => !course.isCompleted);
    if (incompleteCourses.length > 0) {
      incompleteCourses.sort((a, b) => b.progress - a.progress);
      return incompleteCourses[0];
    }
    return enrolledCourseDetails.sort((a,b) => b.progress - a.progress)[0];
  }, [enrolledCourseDetails]);

  const numCompletedCourses = enrolledCourseDetails.filter(c => c.isCompleted).length;
  const numEnrolledCourses = enrolledCourseDetails.length;

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
                priority
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
                  <Library className="mr-2 h-4 w-4" /> Ver Catálogo de Cursos
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
                <Library className="mr-2 h-4 w-4" /> Ver Catálogo de Cursos
            </Link>
        </Button>
      </div>
      {enrolledCourseDetails.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {enrolledCourseDetails.map((course) => (
            <Card key={course.id} className="overflow-hidden shadow-lg hover:shadow-primary/20 transition-shadow">
              <Image src={course.thumbnailUrl} alt={course.title} width={600} height={300} className="w-full h-48 object-cover" data-ai-hint={course.dataAiHint || "course thumbnail"} />
              <CardHeader>
                <CardTitle className="text-lg leading-tight line-clamp-2" title={course.title}>{course.title}</CardTitle>
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
            <Button variant="secondary" className="w-full mt-2" asChild>
                 <Link href="/dashboard/student/my-courses">Ver Mis Cursos Detallados</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center"><Award className="mr-2 h-5 w-5 text-accent" />Logros e Insignias</CardTitle>
            <CardDescription>Hitos que has desbloqueado.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center text-center min-h-[150px]">
            <Award className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              El sistema de logros e insignias está en desarrollo.
            </p>
            <p className="text-xs text-muted-foreground">¡Vuelve pronto para ver tus reconocimientos!</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

interface AdminDashboardWrapperProps {
  userCount: number;
  activeCourseCount: number;
  pendingReviewCourseCount: number;
  courseCompletionRate: string;
}

const AdminDashboardWrapper: React.FC<AdminDashboardWrapperProps> = ({
  userCount,
  activeCourseCount,
  pendingReviewCourseCount,
  courseCompletionRate
}) => {
  const [isAnnouncementDialogOpen, setIsAnnouncementDialogOpen] = React.useState(false);
  const [announcementTitle, setAnnouncementTitle] = React.useState('');
  const [announcementMessage, setAnnouncementMessage] = React.useState('');
  const [announcementAudience, setAnnouncementAudience] = React.useState('all');
  const { toast } = useToast();

  const handleSendAnnouncement = async () => {
    if (!announcementTitle.trim() || !announcementMessage.trim()) {
      toast({
        variant: "destructive",
        title: "Campos Vacíos",
        description: "Por favor, ingresa un título y un mensaje para el anuncio.",
      });
      return;
    }
    console.log("Enviando anuncio (simulado):", { title: announcementTitle, message: announcementMessage, audience: announcementAudience });
    toast({
      title: "Anuncio Enviado (Simulado)",
      description: `El anuncio "${announcementTitle}" ha sido enviado a "${announcementAudience}".`,
    });
    setIsAnnouncementDialogOpen(false);
    setAnnouncementTitle('');
    setAnnouncementMessage('');
    setAnnouncementAudience('all');
  };

  const openDialog = () => setIsAnnouncementDialogOpen(true);

  return (
    <>
      <AdminDashboardContent
        userCount={userCount}
        activeCourseCount={activeCourseCount}
        pendingReviewCourseCount={pendingReviewCourseCount}
        courseCompletionRate={courseCompletionRate}
        onOpenAnnouncementDialog={openDialog}
      />
      <Dialog open={isAnnouncementDialogOpen} onOpenChange={setIsAnnouncementDialogOpen}>
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
    </>
  );
}

const SIMULATED_STUDENT_USER_ID = 3;

interface AdminMetricsData {
  totalUsers: number;
  activeCourses: number;
  completionRate: string;
}

export default function DashboardHomePage() {
  const { currentSessionRole, isLoadingRole, userProfile } = useSessionRole();
  const { toast } = useToast();
  const router = useRouter();

  const [adminMetrics, setAdminMetrics] = useState<AdminMetricsData | null>(null);
  const [pendingReviewCourseCount, setPendingReviewCourseCount] = useState(0);
  const [studentEnrolledCourseDetails, setStudentEnrolledCourseDetails] = useState<StudentDashboardCourseDisplay[]>([]);
  const [instructorCoursesSummaryData, setInstructorCoursesSummaryData] = useState<InstructorCourseSummary[]>([]);

  const [isLoadingDashboardData, setIsLoadingDashboardData] = useState(true);

  const fetchAdminData = useCallback(async (token: string) => {
    const headers = { 'Authorization': `Bearer ${token}` };
    try {
      const [metricsResponse, coursesResponse] = await Promise.all([
        fetch('/api/metrics', { headers }),
        fetch('/api/courses', { headers }) // Assuming admin can fetch all courses
      ]);

      if (!metricsResponse.ok) {
        const errorData = await metricsResponse.json().catch(() => ({ message: 'Error cargando métricas principales.' }));
        throw new Error(errorData.message);
      }
      const metricsData: AdminMetricsData = await metricsResponse.json();
      setAdminMetrics(metricsData);

      if (!coursesResponse.ok) {
        const errorData = await coursesResponse.json().catch(() => ({ message: 'Error cargando todos los cursos.' }));
        throw new Error(errorData.message);
      }
      const allCourses: Course[] = await coursesResponse.json();
      setPendingReviewCourseCount(allCourses.filter(c => c.status === 'pending').length);

    } catch (error: any) {
      console.error("Error loading admin data:", error);
      toast({ variant: "destructive", title: "Error al Cargar Datos (Admin)", description: error.message });
      // Set to default/empty values on error to prevent crashes
      setAdminMetrics({ totalUsers: 0, activeCourses: 0, completionRate: "0%" });
      setPendingReviewCourseCount(0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast]); // Removed adminMetrics from dependencies

  const fetchInstructorDashboardData = useCallback(async (token: string) => {
    const headers = { 'Authorization': `Bearer ${token}` };
    try {
      const response = await fetch('/api/instructor/courses-summary', { headers });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error al cargar los datos del panel del instructor.' }));
        throw new Error(errorData.message);
      }
      const summaryData: InstructorCourseSummary[] = await response.json();
      setInstructorCoursesSummaryData(summaryData);
    } catch (error: any) {
      console.error("Error cargando datos del panel del instructor:", error);
      toast({ variant: "destructive", title: "Error al Cargar Datos (Instructor)", description: error.message });
      setInstructorCoursesSummaryData([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast]);

  const fetchStudentData = useCallback(async () => {
    try {
      const enrollmentsResponse = await fetch(`/api/enrollments/user/${SIMULATED_STUDENT_USER_ID}`);
      if (!enrollmentsResponse.ok) {
         if (enrollmentsResponse.status === 404) {
            setStudentEnrolledCourseDetails([]);
         } else {
            const errorData = await enrollmentsResponse.json().catch(() => ({ message: `Error cargando inscripciones: ${enrollmentsResponse.status}`}));
            throw new Error(errorData.message);
         }
      } else {
        const apiEnrollments: StudentApiEnrollment[] = await enrollmentsResponse.json();
        const processedEnrollments: StudentDashboardCourseDisplay[] = apiEnrollments
          .filter(enrollment => enrollment.course && enrollment.course.status === 'approved')
          .map(enrollment => ({
            id: enrollment.course.id,
            title: enrollment.course.title,
            description: enrollment.course.description,
            thumbnailUrl: enrollment.course.thumbnailUrl,
            instructorName: enrollment.course.instructorName,
            dataAiHint: enrollment.course.dataAiHint,
            progress: enrollment.progressPercent,
            isCompleted: !!enrollment.completedAt || enrollment.progressPercent === 100,
        }));
        setStudentEnrolledCourseDetails(processedEnrollments);
      }
    } catch (error: any) {
      console.error("Error loading student data:", error);
      toast({ variant: "destructive", title: "Error al Cargar Datos (Estudiante)", description: error.message });
      setStudentEnrolledCourseDetails([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast]);

  useEffect(() => {
    const loadDataForRole = async () => {
      if (!currentSessionRole || isLoadingRole) return;

      setIsLoadingDashboardData(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem(SIMULATED_AUTH_TOKEN_KEY) : null;

      if ((currentSessionRole === 'administrador' || currentSessionRole === 'instructor') && !token) {
        if (currentSessionRole) {
            toast({ variant: 'destructive', title: 'Error de Autenticación', description: 'Token no encontrado. Redirigiendo al login.' });
            router.push('/login');
        }
        setIsLoadingDashboardData(false);
        return;
      }

      try {
        if (currentSessionRole === 'administrador' && token) {
          await fetchAdminData(token);
        } else if (currentSessionRole === 'instructor' && token) {
          await fetchInstructorDashboardData(token);
        } else if (currentSessionRole === 'estudiante') {
          await fetchStudentData();
        }
      } catch (error) {
        console.error("Error general al cargar datos del panel:", error);
        // Toast for general error is handled within specific fetch functions
      } finally {
        setIsLoadingDashboardData(false);
      }
    };

    loadDataForRole();
  // Only re-run if role or profile changes fundamentally, or toast/router for safety.
  // Specific fetch functions handle their own data dependencies.
  }, [currentSessionRole, isLoadingRole, userProfile.name, fetchAdminData, fetchInstructorDashboardData, fetchStudentData, router, toast]);


  if (isLoadingRole || isLoadingDashboardData) {
    return (
      <div className="flex h-[calc(100vh-200px)] flex-col items-center justify-center space-y-4 bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">Cargando panel...</p>
      </div>
    );
  }

  if (!currentSessionRole) {
     return (
        <div className="flex h-screen flex-col items-center justify-center space-y-4">
            <p className="text-lg text-destructive">Error al determinar el rol. Por favor, intenta iniciar sesión de nuevo.</p>
            <Button onClick={() => {
                if (typeof window !== 'undefined') {
                  localStorage.removeItem('sessionRole');
                  localStorage.removeItem(SIMULATED_AUTH_TOKEN_KEY);
                  localStorage.removeItem('nexusAlpriUserProfile');
                }
                router.push('/login');
            }}>Ir a Inicio de Sesión</Button>
        </div>
     );
  }

  switch (currentSessionRole) {
    case 'administrador':
      return (
        <AdminDashboardWrapper
          userCount={adminMetrics?.totalUsers ?? 0}
          activeCourseCount={adminMetrics?.activeCourses ?? 0}
          pendingReviewCourseCount={pendingReviewCourseCount}
          courseCompletionRate={adminMetrics?.completionRate ?? "0%"}
        />
      );
    case 'instructor':
      return (
        <InstructorDashboardContent
          instructorCoursesSummary={instructorCoursesSummaryData}
          isLoadingData={isLoadingDashboardData}
        />
      );
    case 'estudiante':
      return <StudentDashboardContent enrolledCourseDetails={studentEnrolledCourseDetails} />;
    default:
      return <StudentDashboardContent enrolledCourseDetails={studentEnrolledCourseDetails} />;
  }
}

    