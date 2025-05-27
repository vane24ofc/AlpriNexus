
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

const VALID_THEME_CLASSES = ['theme-light', 'dark', 'theme-oceanic', 'theme-sunset']; // Add 'theme-forest' if defined

interface ThemeOption {
  id: string; // Corresponds to CSS class and localStorage value
  name: string;
  previewColors: { bg: string; primary: string; accent: string; text: string }; // Example structure
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
  // Add more themes here if defined in globals.css
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
  
  const [currentTheme, setCurrentTheme] = useState('dark'); // Default to dark for initial state
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

    const storedTheme = localStorage.getItem('nexusAlpriTheme') || 'dark';
    if (VALID_THEME_CLASSES.includes(storedTheme)) {
      setCurrentTheme(storedTheme);
    } else {
        setCurrentTheme('dark'); // Fallback to dark
    }
  }, [currentSessionRole]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleThemeChange = (newThemeId: string) => {
    setCurrentTheme(newThemeId);
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      VALID_THEME_CLASSES.forEach(cls => root.classList.remove(cls));
      
      if (newThemeId !== 'theme-light') { // Assuming 'theme-light' is base :root style
        root.classList.add(newThemeId);
      } else {
         root.classList.add('theme-light'); // Or just rely on :root if no 'theme-light' class
      }
      localStorage.setItem('nexusAlpriTheme', newThemeId);
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
    console.log("Tema de apariencia:", currentTheme);

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
            <CardContent className="space-y-4">
                <Label>Seleccionar Tema</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {themeOptions.map((theme) => (
                        <Card 
                            key={theme.id} 
                            className={cn(
                                "cursor-pointer hover:shadow-lg transition-shadow overflow-hidden",
                                currentTheme === theme.id ? "ring-2 ring-primary shadow-primary/50" : "ring-1 ring-border"
                            )}
                            onClick={() => handleThemeChange(theme.id)}
                        >
                            <CardContent className="p-0">
                                <div className="h-20 w-full flex items-stretch">
                                    <div style={{ backgroundColor: theme.previewColors.bg }} className="w-1/3"></div>
                                    <div style={{ backgroundColor: theme.previewColors.primary }} className="w-1/3"></div>
                                    <div style={{ backgroundColor: theme.previewColors.accent }} className="w-1/3"></div>
                                </div>
                                <div className="p-3">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium truncate" style={{color: theme.previewColors.text, backgroundColor: theme.previewColors.bg }}>{theme.name}</p>
                                        {currentTheme === theme.id && <Check className="h-5 w-5 text-primary" />}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
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

    