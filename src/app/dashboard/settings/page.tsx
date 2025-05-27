
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings as SettingsIcon, User, Bell, Palette, Lock, Save, Loader2, Eye, EyeOff, Check } from 'lucide-react';
import { useSessionRole } from '@/app/dashboard/layout';
import { useToast } from '@/hooks/use-toast';
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
import { cn } from '@/lib/utils';

const VALID_THEME_CLASSES = [
  'theme-light',
  'dark',
  'theme-oceanic',
  'theme-sunset',
  'theme-forest',
  'theme-monochrome-midnight',
  'theme-crimson-night',
  'theme-lavender-haze',
  'theme-spring-meadow',
  'theme-steel-blue',
  'theme-vintage-paper',
  'theme-royal-gold',
  'theme-sakura-blossom',
];

interface ThemeOption {
  id: string;
  name: string;
  previewColors: { bg: string; primary: string; accent: string; text: string };
}

const themeOptions: ThemeOption[] = [
  {
    id: 'theme-light',
    name: 'Claro Predeterminado',
    previewColors: { bg: 'hsl(0 0% 100%)', primary: 'hsl(217 91% 60%)', accent: 'hsl(160 70% 45%)', text: 'hsl(0 0% 3.9%)' }
  },
  {
    id: 'dark',
    name: 'Oscuro Predeterminado',
    previewColors: { bg: 'hsl(0 0% 4%)', primary: 'hsl(217 91% 60%)', accent: 'hsl(160 70% 45%)', text: 'hsl(0 0% 95%)' }
  },
  {
    id: 'theme-oceanic',
    name: 'Oceánico Profundo',
    previewColors: { bg: 'hsl(200 50% 10%)', primary: 'hsl(180 70% 50%)', accent: 'hsl(170 80% 40%)', text: 'hsl(180 30% 90%)' }
  },
  {
    id: 'theme-sunset',
    name: 'Atardecer Cálido',
    previewColors: { bg: 'hsl(25 30% 10%)', primary: 'hsl(30 90% 55%)', accent: 'hsl(0 80% 60%)', text: 'hsl(35 80% 90%)' }
  },
  {
    id: 'theme-forest',
    name: 'Bosque Profundo',
    previewColors: { bg: 'hsl(120 20% 10%)', primary: 'hsl(100 50% 40%)', accent: 'hsl(40 60% 55%)', text: 'hsl(90 30% 90%)' }
  },
  {
    id: 'theme-monochrome-midnight',
    name: 'Medianoche Monocromático',
    previewColors: { bg: 'hsl(240 5% 5%)', primary: 'hsl(0 0% 80%)', accent: 'hsl(0 0% 50%)', text: 'hsl(0 0% 95%)' }
  },
  {
    id: 'theme-crimson-night',
    name: 'Noche Carmesí',
    previewColors: { bg: 'hsl(240 3% 8%)', primary: 'hsl(0 70% 45%)', accent: 'hsl(15 80% 55%)', text: 'hsl(0 0% 90%)' }
  },
  {
    id: 'theme-lavender-haze',
    name: 'Neblina Lavanda',
    previewColors: { bg: 'hsl(250 30% 96%)', primary: 'hsl(260 60% 65%)', accent: 'hsl(300 70% 80%)', text: 'hsl(250 20% 25%)' }
  },
  {
    id: 'theme-spring-meadow',
    name: 'Pradera Primaveral',
    previewColors: { bg: 'hsl(50 40% 97%)', primary: 'hsl(100 50% 50%)', accent: 'hsl(50 90% 60%)', text: 'hsl(80 25% 20%)' }
  },
  {
    id: 'theme-steel-blue',
    name: 'Acero Industrial (Oscuro)',
    previewColors: { bg: 'hsl(210 20% 15%)', primary: 'hsl(210 70% 60%)', accent: 'hsl(190 60% 70%)', text: 'hsl(210 15% 85%)' }
  },
  {
    id: 'theme-vintage-paper',
    name: 'Pergamino Clásico (Claro)',
    previewColors: { bg: 'hsl(40 30% 95%)', primary: 'hsl(30 30% 40%)', accent: 'hsl(45 50% 60%)', text: 'hsl(30 20% 25%)' }
  },
  {
    id: 'theme-royal-gold',
    name: 'Oro Real (Oscuro)',
    previewColors: { bg: 'hsl(270 15% 10%)', primary: 'hsl(275 50% 55%)', accent: 'hsl(45 70% 60%)', text: 'hsl(45 50% 85%)' }
  },
  {
    id: 'theme-sakura-blossom',
    name: 'Flor de Cerezo (Claro)',
    previewColors: { bg: 'hsl(340 60% 98%)', primary: 'hsl(345 80% 75%)', accent: 'hsl(0 70% 60%)', text: 'hsl(340 30% 30%)' }
  }
];


export default function SettingsPage() {
  const { currentSessionRole } = useSessionRole();
  const { toast } = useToast();

  const [userData, setUserData] = useState({
    name: '',
    email: '',
  });

  const [notificationPrefs, setNotificationPrefs] = useState({
    emailNewCourses: true,
    emailAnnouncements: true,
    appUpdates: false,
  });

  const [activeTheme, setActiveTheme] = useState('dark');
  const [isSaving, setIsSaving] = useState(false);

  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  useEffect(() => {
    if (currentSessionRole) {
      setUserData({
        name: `${currentSessionRole.charAt(0).toUpperCase() + currentSessionRole.slice(1)} Usuario`,
        email: `${currentSessionRole}@example.com`,
      });
    } else {
      setUserData({
        name: 'Usuario Demo',
        email: 'demo@example.com',
      });
    }

    let initialTheme = 'dark';
    const storedTheme = localStorage.getItem('nexusAlpriTheme');

    if (storedTheme && VALID_THEME_CLASSES.includes(storedTheme)) {
      initialTheme = storedTheme;
    } else {
      if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
         initialTheme = 'theme-light';
      }
    }
    setActiveTheme(initialTheme);
    if (!storedTheme && typeof window !== 'undefined') {
      localStorage.setItem('nexusAlpriTheme', initialTheme);
      const root = window.document.documentElement;
      VALID_THEME_CLASSES.forEach(cls => root.classList.remove(cls));
      root.classList.add(initialTheme);
    }

  }, [currentSessionRole]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleThemeChange = (newThemeId: string) => {
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      VALID_THEME_CLASSES.forEach(cls => root.classList.remove(cls));

      root.classList.add(newThemeId);

      localStorage.setItem('nexusAlpriTheme', newThemeId);
      setActiveTheme(newThemeId);
      toast({
        title: "Tema Aplicado",
        description: `El tema de la aplicación ha cambiado a "${themeOptions.find(t => t.id === newThemeId)?.name || newThemeId}".`,
      });
    }
  };

  const handleSaveChanges = () => {
    setIsSaving(true);
    console.log("Datos de usuario actualizados:", userData);
    console.log("Preferencias de notificación:", notificationPrefs);
    console.log("Tema de apariencia:", activeTheme);

    setTimeout(() => {
      toast({
        title: "Configuración Guardada",
        description: "Tus preferencias han sido actualizadas (simulado).",
      });
      setIsSaving(false);
    }, 1000);
  };

  const handlePasswordChangeSubmit = () => {
    setPasswordError('');
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPasswordError('Todos los campos de contraseña son obligatorios.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError('La nueva contraseña y la confirmación no coinciden.');
      return;
    }
    console.log("Simulando cambio de contraseña...");
    setTimeout(() => {
      toast({
        title: "Contraseña Actualizada (Simulado)",
        description: "Tu contraseña ha sido actualizada exitosamente.",
      });
      setIsPasswordDialogOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    }, 1000);
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
        <div className="lg:col-span-3 space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center"><User className="mr-2 h-5 w-5 text-primary"/>Información de la Cuenta</CardTitle>
              <CardDescription>Actualiza tu información personal.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre Completo</Label>
                <Input id="name" name="name" value={userData.name} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input id="email" name="email" type="email" value={userData.email} onChange={handleInputChange} />
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
              <AlertDialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="outline">Cambiar Contraseña</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cambiar Contraseña</AlertDialogTitle>
                    <AlertDialogDescription>
                      Introduce tu contraseña actual y la nueva contraseña.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-1">
                      <Label htmlFor="currentPassword">Contraseña Actual</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showCurrentPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Introduce tu contraseña actual"
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-primary"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          tabIndex={-1}
                        >
                          {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="newPassword">Nueva Contraseña</Label>
                       <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Mínimo 6 caracteres"
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-primary"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          tabIndex={-1}
                        >
                          {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="confirmNewPassword">Confirmar Nueva Contraseña</Label>
                      <div className="relative">
                        <Input
                          id="confirmNewPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          placeholder="Repite la nueva contraseña"
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-primary"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </Button>
                      </div>
                    </div>
                    {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => { setPasswordError(''); setCurrentPassword(''); setNewPassword(''); setConfirmNewPassword(''); }}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handlePasswordChangeSubmit}>Guardar Nueva Contraseña</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <p className="text-xs text-muted-foreground mt-2">Se recomienda cambiar la contraseña periódicamente.</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center"><Palette className="mr-2 h-5 w-5 text-primary"/>Apariencia</CardTitle>
              <CardDescription>Personaliza la apariencia visual de la plataforma.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                <Label>Seleccionar Tema</Label>
                <div className="flex flex-col space-y-2">
                    {themeOptions.map((theme) => (
                        <Button
                            key={theme.id}
                            variant="outline"
                            className={cn(
                                "w-full justify-start py-4 transition-all text-left h-auto",
                                activeTheme === theme.id ? "ring-2 ring-primary border-primary" : "hover:bg-muted/50"
                            )}
                            onClick={() => handleThemeChange(theme.id)}
                        >
                            <div className="flex items-center justify-between w-full">
                                <span className="text-sm font-medium">{theme.name}</span>
                                <div className="flex space-x-1.5">
                                    {Object.entries(theme.previewColors).slice(0, 4).map(([key, color]) => (
                                        <div
                                            key={key}
                                            className="h-5 w-5 rounded-full border border-border/50"
                                            style={{ backgroundColor: color }}
                                            title={`${key}: ${color}`}
                                        />
                                    ))}
                                </div>
                            </div>
                            {activeTheme === theme.id && (
                                <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                            )}
                        </Button>
                    ))}
                </div>
            </CardContent>
          </Card>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSaveChanges} className="min-w-[150px]" disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {isSaving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}


    