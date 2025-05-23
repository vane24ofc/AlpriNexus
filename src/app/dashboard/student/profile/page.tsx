
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Edit3, Shield, CalendarDays, BookOpen } from "lucide-react";

export default function StudentProfilePage() {
  const studentData = {
    name: "Estudiante Demo",
    email: "student@example.com",
    avatarUrl: "https://placehold.co/100x100.png",
    joinDate: "15 de Enero, 2023",
    coursesEnrolled: 5,
    coursesCompleted: 2,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
          <User className="mr-3 h-8 w-8 text-primary" />
          Mi Perfil
        </h1>
        <Button variant="outline">
          <Edit3 className="mr-2 h-4 w-4" />
          Editar Perfil (Próximamente)
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 shadow-lg">
          <CardHeader className="items-center">
            <Avatar className="h-24 w-24 mb-4 border-2 border-primary shadow-md">
              <AvatarImage src={studentData.avatarUrl} alt={studentData.name} data-ai-hint="profile avatar"/>
              <AvatarFallback>{studentData.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-2xl">{studentData.name}</CardTitle>
            <CardDescription className="flex items-center text-base">
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
            <CardTitle>Información de la Cuenta</CardTitle>
            <CardDescription>Detalles de tu cuenta y preferencias.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="fullName">Nombre Completo</Label>
              <Input id="fullName" defaultValue={studentData.name} readOnly className="bg-muted/50"/>
            </div>
            <div>
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input id="email" type="email" defaultValue={studentData.email} readOnly className="bg-muted/50"/>
            </div>
            <Separator />
            <CardTitle className="text-lg pt-2">Estadísticas de Aprendizaje</CardTitle>
             <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center p-3 bg-muted/30 rounded-md">
                    <BookOpen className="mr-3 h-5 w-5 text-primary"/>
                    <div>
                        <p className="font-semibold">{studentData.coursesEnrolled} Cursos Inscritos</p>
                        <p className="text-xs text-muted-foreground">Tu viaje de aprendizaje activo.</p>
                    </div>
                </div>
                <div className="flex items-center p-3 bg-muted/30 rounded-md">
                    <Shield className="mr-3 h-5 w-5 text-accent"/> {/* Usando Shield como ejemplo de logro */}
                    <div>
                        <p className="font-semibold">{studentData.coursesCompleted} Cursos Completados</p>
                        <p className="text-xs text-muted-foreground">¡Felicidades por tus logros!</p>
                    </div>
                </div>
            </div>
            <Separator />
            <Button variant="destructive" className="w-full md:w-auto">
                Eliminar Cuenta (Próximamente)
            </Button>
             <p className="text-xs text-muted-foreground">
                Contacta con soporte si deseas cambiar tu contraseña o tienes otras consultas sobre tu cuenta.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

