
"use client";

import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Settings, Shield, CalendarDays, BookOpen, Camera, Award, CheckCircle, Users as UsersIcon, Loader2 } from "lucide-react"; // Added Loader2
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
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
import { useSessionRole } from '@/app/dashboard/layout';

interface Achievement {
  id: string;
  name: string;
  icon: React.ElementType;
  description?: string;
}

const sampleAchievements: Achievement[] = [
  { id: "ach1", name: "Pionero de AlpriNexus", icon: Award, description: "Por ser uno de los primeros en unirse." },
  { id: "ach2", name: "Maratón de Aprendizaje", icon: BookOpen, description: "Completó 3 cursos en una semana." },
  { id: "ach3", name: "Experto en JavaScript", icon: CheckCircle, description: "Dominio demostrado en cursos de JS." },
  { id: "ach4", name: "Colaborador Destacado", icon: UsersIcon, description: "Participación activa en foros (próximamente)." },
];

const USER_PROFILE_STORAGE_KEY = 'nexusAlpriUserProfile'; // From DashboardLayout
const SIMULATED_STUDENT_USER_ID = 3; // Consistent with other student pages

interface ApiStudentEnrollment {
  enrollmentId: string;
  userId: number;
  courseId: string;
  enrolledAt: string;
  completedAt: string | null;
  progressPercent: number;
  course: {
    id: string;
    title: string;
    status: 'pending' | 'approved' | 'rejected';
  };
}

export default function StudentProfilePage() {
  const { toast } = useToast();
  const { userProfile } = useSessionRole();

  const [avatarUrl, setAvatarUrl] = useState("https://placehold.co/100x100.png?text=P");
  const [studentStats, setStudentStats] = useState({
    joinDate: "Consultando...",
    coursesEnrolled: 0,
    coursesCompleted: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (userProfile.name) {
      setAvatarUrl(`https://placehold.co/100x100.png?text=${userProfile.name.charAt(0).toUpperCase()}`);
    }

    const fetchStudentStats = async () => {
      setIsLoadingStats(true);
      const joinDateSimulated = "15 de Enero, 2023"; // Static for now
      let enrolledCount = 0;
      let completedCount = 0;

      try {
        const response = await fetch(`/api/enrollments/user/${SIMULATED_STUDENT_USER_ID}`);
        if (response.ok) {
          const enrollments: ApiStudentEnrollment[] = await response.json();
          const approvedEnrollments = enrollments.filter(e => e.course && e.course.status === 'approved');
          enrolledCount = approvedEnrollments.length;
          completedCount = approvedEnrollments.filter(e => e.completedAt || e.progressPercent === 100).length;
        } else {
          // Handle cases where user might have no enrollments (404) or other errors
          if (response.status !== 404) {
            const errorData = await response.json().catch(() => ({ message: "Error desconocido al cargar estadísticas de inscripción." }));
            console.error("Error fetching student enrollment stats:", errorData.message);
             toast({ variant: "destructive", title: "Error de Estadísticas", description: "No se pudieron cargar las estadísticas de inscripción." });
          }
        }
      } catch (e: any) {
        console.error("Error fetching student stats from API:", e);
        toast({ variant: "destructive", title: "Error de Carga", description: e.message || "No se pudieron cargar las estadísticas." });
      }

      setStudentStats({
        joinDate: joinDateSimulated,
        coursesEnrolled: enrolledCount,
        coursesCompleted: completedCount,
      });
      setIsLoadingStats(false);
    };

    fetchStudentStats();
  }, [userProfile.name, toast]);


  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
          variant: "destructive",
          title: "Archivo Demasiado Grande",
          description: "Por favor, selecciona una imagen de menos de 2MB.",
        });
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast({
          variant: "destructive",
          title: "Tipo de Archivo Inválido",
          description: "Por favor, selecciona un archivo de imagen (ej: JPG, PNG).",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        const newAvatarDataUrl = reader.result as string;
        // TODO: API Call - POST /api/me/avatar to upload and save the new avatar.
        // The API should return the new URL of the avatar.
        // For now, just update client-side.
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
        setAvatarUrl(newAvatarDataUrl);
        toast({
          title: "Foto de Perfil Actualizada (Simulado)",
          description: "Tu nueva foto de perfil se está mostrando.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
          <User className="mr-3 h-8 w-8 text-primary" />
          Mi Perfil
        </h1>
         <Button variant="outline" asChild>
          <Link href="/dashboard/settings">
            <Settings className="mr-2 h-4 w-4" />
            Ir a Configuración
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 shadow-lg">
          <CardHeader className="items-center text-center">
            <div className="relative group mx-auto">
              <Avatar className="h-24 w-24 mb-2 border-2 border-primary shadow-md">
                <AvatarImage src={avatarUrl} alt={userProfile.name} data-ai-hint="profile avatar"/>
                <AvatarFallback>{userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'E'}</AvatarFallback>
              </Avatar>
              <Button
                variant="outline"
                size="icon"
                className="absolute bottom-2 right-0 h-8 w-8 rounded-full bg-background/80 group-hover:opacity-100 opacity-0 md:opacity-0 transition-opacity"
                onClick={triggerFileSelect}
                aria-label="Cambiar foto de perfil"
              >
                <Camera className="h-4 w-4" />
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                className="hidden"
              />
            </div>
            <CardTitle className="text-2xl">{userProfile.name || 'Estudiante'}</CardTitle>
            <CardDescription className="flex items-center justify-center text-base">
              <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
              {userProfile.email || 'estudiante@example.com'}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground flex items-center justify-center">
              <CalendarDays className="mr-2 h-4 w-4" />
              Miembro desde: {isLoadingStats ? <Loader2 className="h-4 w-4 animate-spin ml-1" /> : studentStats.joinDate}
            </p>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>Resumen de Actividad</CardTitle>
                    <CardDescription>Tu progreso en la plataforma AlpriNexus.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoadingStats ? (
                        <div className="flex justify-center items-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Card className="bg-muted/30">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Cursos Inscritos</CardTitle>
                            <BookOpen className="h-5 w-5 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{studentStats.coursesEnrolled}</div>
                            <p className="text-xs text-muted-foreground">Tu viaje de aprendizaje activo.</p>
                        </CardContent>
                        </Card>
                        <Card className="bg-muted/30">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Cursos Completados</CardTitle>
                            <Award className="h-5 w-5 text-accent" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{studentStats.coursesCompleted}</div>
                            <p className="text-xs text-muted-foreground">¡Felicidades por tus logros!</p>
                        </CardContent>
                        </Card>
                    </div>
                    )}
                </CardContent>
            </Card>

            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>Mis Logros e Insignias</CardTitle>
                    <CardDescription>Reconocimientos obtenidos por tu dedicación y aprendizaje.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoadingStats ? (
                        <div className="flex justify-center items-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : sampleAchievements.length > 0 ? (
                        <ul className="space-y-3">
                            {sampleAchievements.map(ach => (
                                <li key={ach.id} className="flex items-center p-3 border rounded-md bg-card hover:bg-muted/50 transition-colors">
                                    <ach.icon className="h-6 w-6 mr-3 text-accent flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold text-foreground">{ach.name}</p>
                                        {ach.description && <p className="text-sm text-muted-foreground">{ach.description}</p>}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-muted-foreground text-center py-4">Aún no has obtenido logros. ¡Sigue aprendiendo!</p>
                    )}
                </CardContent>
            </Card>

             <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>Acciones de Cuenta</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" className="w-full md:w-auto">
                                Eliminar Cuenta
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro de que quieres eliminar tu cuenta?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta acción no se puede deshacer. Todos tus datos y progreso serán eliminados permanentemente.
                                Considera esto cuidadosamente antes de proceder.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={async () => {
                                    // TODO: API Call - DELETE /api/me/account
                                    await new Promise(resolve => setTimeout(resolve, 1000));
                                    toast({ title: "Solicitud de Eliminación (Simulada)", description: "Tu solicitud para eliminar la cuenta ha sido recibida. Serás redirigido.", variant: "destructive" });
                                    // TODO: Redirect to login or a "account deleted" page after API call
                                }}
                            >
                                Sí, Eliminar mi Cuenta
                            </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    <p className="text-xs text-muted-foreground">
                        Para cambiar tu contraseña u otras opciones de seguridad, visita la página de <Link href="/dashboard/settings" className="text-primary hover:underline">Configuración</Link>.
                    </p>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
