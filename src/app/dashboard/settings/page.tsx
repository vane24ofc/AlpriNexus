
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings as SettingsIcon, User, Bell, Palette, Lock } from 'lucide-react';
import { useSessionRole } from '@/app/dashboard/layout'; // Para obtener el rol si es necesario
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { currentSessionRole } = useSessionRole();
  const { toast } = useToast();
  
  // Mock user data - en una app real, vendría de la sesión/API
  const [userData, setUserData] = useState({
    name: currentSessionRole ? `${currentSessionRole.charAt(0).toUpperCase() + currentSessionRole.slice(1)} User` : 'Demo User',
    email: currentSessionRole ? `${currentSessionRole}@example.com` : 'demo@example.com',
  });

  // Mock settings state
  const [notificationPrefs, setNotificationPrefs] = useState({
    emailNewCourses: true,
    emailAnnouncements: true,
    appUpdates: false,
  });
  const [appearanceTheme, setAppearanceTheme] = useState('dark');

  const handleSaveChanges = () => {
    // Simular guardado de cambios
    console.log("Preferencias de notificación:", notificationPrefs);
    console.log("Tema de apariencia:", appearanceTheme);
    toast({
      title: "Configuración Guardada",
      description: "Tus preferencias han sido actualizadas (simulado).",
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
          <SettingsIcon className="mr-3 h-8 w-8 text-primary" />
          Configuración General
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna de Navegación de Configuración (opcional, más útil si hay muchas secciones) */}
        {/* Por ahora, lo mantenemos simple y ponemos todo en una columna principal */}
        
        {/* Contenido Principal de Configuración */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center"><User className="mr-2 h-5 w-5 text-primary"/>Información de la Cuenta</CardTitle>
              <CardDescription>Visualiza la información básica de tu cuenta.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="fullName">Nombre Completo</Label>
                <Input id="fullName" value={userData.name} readOnly className="bg-muted/50"/>
              </div>
              <div>
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input id="email" type="email" value={userData.email} readOnly className="bg-muted/50"/>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center"><Bell className="mr-2 h-5 w-5 text-primary"/>Preferencias de Notificación</CardTitle>
              <CardDescription>Elige cómo y cuándo deseas recibir notificaciones.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between space-x-2 p-3 border rounded-md">
                <Label htmlFor="emailNewCourses" className="flex flex-col space-y-1">
                  <span>Nuevos Cursos</span>
                  <span className="font-normal leading-snug text-muted-foreground">
                    Recibir correos sobre nuevos cursos y recomendaciones.
                  </span>
                </Label>
                <Switch
                  id="emailNewCourses"
                  checked={notificationPrefs.emailNewCourses}
                  onCheckedChange={(checked) => setNotificationPrefs(prev => ({...prev, emailNewCourses: checked}))}
                  aria-label="Notificaciones de nuevos cursos"
                />
              </div>
              <div className="flex items-center justify-between space-x-2 p-3 border rounded-md">
                <Label htmlFor="emailAnnouncements" className="flex flex-col space-y-1">
                  <span>Anuncios de la Plataforma</span>
                  <span className="font-normal leading-snug text-muted-foreground">
                    Mantente informado sobre noticias importantes y anuncios.
                  </span>
                </Label>
                <Switch
                  id="emailAnnouncements"
                  checked={notificationPrefs.emailAnnouncements}
                  onCheckedChange={(checked) => setNotificationPrefs(prev => ({...prev, emailAnnouncements: checked}))}
                  aria-label="Notificaciones de anuncios"
                />
              </div>
               <div className="flex items-center justify-between space-x-2 p-3 border rounded-md">
                <Label htmlFor="appUpdates" className="flex flex-col space-y-1">
                  <span>Actualizaciones de la Aplicación</span>
                  <span className="font-normal leading-snug text-muted-foreground">
                    Notificaciones sobre nuevas características y mejoras.
                  </span>
                </Label>
                <Switch
                  id="appUpdates"
                  checked={notificationPrefs.appUpdates}
                  onCheckedChange={(checked) => setNotificationPrefs(prev => ({...prev, appUpdates: checked}))}
                  aria-label="Notificaciones de actualizaciones de la aplicación"
                />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center"><Lock className="mr-2 h-5 w-5 text-primary"/>Seguridad</CardTitle>
               <CardDescription>Gestiona la seguridad de tu cuenta.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button variant="outline">Cambiar Contraseña (Próximamente)</Button>
                <p className="text-xs text-muted-foreground mt-2">Se recomienda cambiar la contraseña periódicamente.</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center"><Palette className="mr-2 h-5 w-5 text-primary"/>Apariencia</CardTitle>
              <CardDescription>Personaliza la apariencia de la plataforma.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Label htmlFor="theme-select">Tema</Label>
              <Select value={appearanceTheme} onValueChange={setAppearanceTheme}>
                <SelectTrigger id="theme-select" className="w-[180px]">
                  <SelectValue placeholder="Seleccionar tema" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dark">Oscuro (Actual)</SelectItem>
                  <SelectItem value="light" disabled>Claro (Próximamente)</SelectItem>
                  <SelectItem value="system" disabled>Sistema (Próximamente)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Más opciones de personalización estarán disponibles pronto.</p>
            </CardContent>
          </Card>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSaveChanges} className="min-w-[150px]">Guardar Cambios</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
