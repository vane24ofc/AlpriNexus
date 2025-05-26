
"use client";

import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Edit3, Shield, CalendarDays, BookOpen, Camera, Settings, Award } from "lucide-react";
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

export default function StudentProfilePage() {
  const { toast } = useToast();
  const [avatarUrl, setAvatarUrl] = useState("https://placehold.co/100x100.png?text=Perfil");
  const [studentData, setStudentData] = useState({
    name: "Estudiante Demo",
    email: "student@example.com",
    joinDate: "15 de Enero, 2023",
    coursesEnrolled: 5, // Ejemplo
    coursesCompleted: 2, // Ejemplo
  });
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

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
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
        toast({
          title: "Foto de Perfil Actualizada",
          description: "Tu nueva foto de perfil se está mostrando (simulado).",
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
                <AvatarImage src={avatarUrl} alt={studentData.name} data-ai-hint="profile avatar"/>
                <AvatarFallback>{studentData.name.charAt(0).toUpperCase()}</AvatarFallback>
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
            <CardTitle className="text-2xl">{studentData.name}</CardTitle>
            <CardDescription className="flex items-center justify-center text-base">
              <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
              {studentData.email}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground flex items-center justify-center">
              <CalendarDays className="mr-2 h-4 w-4" />
              Miembro desde: {studentData.joinDate}
            </p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 shadow-lg">
          <CardHeader>
            <CardTitle>Resumen de Actividad</CardTitle>
            <CardDescription>Tu progreso y logros en la plataforma.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div>
              <h3 className="text-lg font-semibold mb-3 text-foreground">Estadísticas de Aprendizaje</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="bg-muted/30">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Cursos Inscritos</CardTitle>
                    <BookOpen className="h-5 w-5 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{studentData.coursesEnrolled}</div>
                    <p className="text-xs text-muted-foreground">Tu viaje de aprendizaje activo.</p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/30">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Cursos Completados</CardTitle>
                    <Award className="h-5 w-5 text-accent" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{studentData.coursesCompleted}</div>
                    <p className="text-xs text-muted-foreground">¡Felicidades por tus logros!</p>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <Separator />
            
            <div>
                <h3 className="text-lg font-semibold mb-3 text-foreground">Acciones de Cuenta</h3>
                <div className="space-y-3">
                    <AlertDialogTrigger asChild>
                        <Button variant="outline" className="w-full md:w-auto" onClick={() => setIsCertificateModalOpen(true)}>
                            <Award className="mr-2 h-4 w-4" /> Ver Mis Certificados
                        </Button>
                    </AlertDialogTrigger>
                    <p className="text-xs text-muted-foreground">
                        Accede a los certificados de los cursos que has completado.
                    </p>
                    <Button variant="destructive" className="w-full md:w-auto" disabled>
                        Eliminar Cuenta (Próximamente)
                    </Button>
                     <p className="text-xs text-muted-foreground">
                        Para cambiar tu contraseña u otras opciones de seguridad, visita la página de <Link href="/dashboard/settings" className="text-primary hover:underline">Configuración</Link>.
                    </p>
                </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={isCertificateModalOpen} onOpenChange={setIsCertificateModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mis Certificados</AlertDialogTitle>
            <AlertDialogDescription>
              Esta funcionalidad estará disponible próximamente. Aquí podrás ver y descargar los certificados de los cursos que hayas completado con éxito.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsCertificateModalOpen(false)}>Entendido</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
