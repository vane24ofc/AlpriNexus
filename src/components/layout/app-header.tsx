
"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { LogOut, Search, Settings, User as UserIconLucide, Shield, BookOpen, GraduationCap, Bell as BellIcon, Loader2 } from 'lucide-react';
import { Logo } from '@/components/common/logo';
import { NotificationIcon } from '@/components/notifications/notification-icon';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { useSessionRole } from '@/app/dashboard/layout';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';

const SIMULATED_AUTH_TOKEN_KEY = 'simulatedAuthToken';

export function AppHeader() {
  const router = useRouter();
  const { toast } = useToast();
  const { isMobile } = useSidebar();
  const { currentSessionRole, isLoadingRole, userProfile } = useSessionRole();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchPlaceholder, setSearchPlaceholder] = useState('Buscar...');
  const [roleDisplay, setRoleDisplay] = useState("Usuario");
  const [profileLinkPath, setProfileLinkPath] = useState("/dashboard");
  const [dashboardPath, setDashboardPath] = useState("/dashboard");
  const [userAvatar, setUserAvatar] = useState("https://placehold.co/100x100.png");
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!hasMounted || isLoadingRole || !currentSessionRole) return;

    let determinedRoleDisplay = "Estudiante";
    let determinedProfileLink = "/dashboard/student/profile";
    let determinedDashboardPath = "/dashboard";
    let determinedSearchPlaceholder = "Buscar cursos...";
    let avatarInitial = userProfile.name ? userProfile.name.charAt(0).toUpperCase() : "E";

    switch (currentSessionRole) {
      case 'administrador':
        determinedRoleDisplay = 'Administrador';
        determinedProfileLink = '/dashboard'; // Admin might go to general admin dashboard
        determinedDashboardPath = '/dashboard';
        determinedSearchPlaceholder = 'Buscar usuarios, cursos...';
        avatarInitial = userProfile.name ? userProfile.name.charAt(0).toUpperCase() : "A";
        break;
      case 'instructor':
        determinedRoleDisplay = 'Instructor';
        determinedProfileLink = '/dashboard'; // Instructor might go to general instructor dashboard
        determinedDashboardPath = '/dashboard';
        determinedSearchPlaceholder = 'Buscar en mis cursos...';
        avatarInitial = userProfile.name ? userProfile.name.charAt(0).toUpperCase() : "I";
        break;
      case 'estudiante':
      default:
        // Profile link and avatar initial are already set for student
        break;
    }
    setRoleDisplay(determinedRoleDisplay);
    setProfileLinkPath(determinedProfileLink);
    setDashboardPath(determinedDashboardPath);
    setSearchPlaceholder(determinedSearchPlaceholder);
    setUserAvatar(`https://placehold.co/100x100.png?text=${avatarInitial}`);
  }, [currentSessionRole, userProfile.name, hasMounted, isLoadingRole]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      // No necesitamos verificar la respuesta aquí ya que el endpoint es muy simple.
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('sessionRole');
        localStorage.removeItem('nexusAlpriUserProfile');
        localStorage.removeItem(SIMULATED_AUTH_TOKEN_KEY); // Limpiar token simulado
      }
      toast({ title: "Cierre de Sesión Exitoso", description: "Has cerrado tu sesión." });
      router.push('/login');
    } catch (error) {
      console.error("Error durante el cierre de sesión:", error);
      toast({ variant: "destructive", title: "Error", description: "No se pudo cerrar la sesión correctamente. Intenta de nuevo." });
      // Incluso si la API falla, intentar limpiar localStorage y redirigir
      if (typeof window !== 'undefined') {
        localStorage.removeItem('sessionRole');
        localStorage.removeItem('nexusAlpriUserProfile');
        localStorage.removeItem(SIMULATED_AUTH_TOKEN_KEY);
      }
      router.push('/login'); 
    } finally {
      setIsLoggingOut(false);
      setIsLogoutConfirmOpen(false);
    }
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!searchTerm.trim() || !currentSessionRole) return;

    const encodedSearchTerm = encodeURIComponent(searchTerm.trim());

    if (currentSessionRole === 'administrador') {
      // Podríamos querer que la búsqueda del admin sea más global o específica
      // Por ahora, lo dirigimos a la búsqueda de usuarios como ejemplo.
      router.push(`/dashboard/admin/users?search=${encodedSearchTerm}`);
    } else if (currentSessionRole === 'instructor') {
      router.push(`/dashboard/instructor/my-courses?search=${encodedSearchTerm}`);
    } else { // Estudiante
      router.push(`/dashboard/courses/explore?search=${encodedSearchTerm}`);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'administrador':
        return <Shield className="mr-2 h-4 w-4" />;
      case 'instructor':
        return <BookOpen className="mr-2 h-4 w-4" />;
      case 'estudiante':
        return <GraduationCap className="mr-2 h-4 w-4" />;
      default:
        return <UserIconLucide className="mr-2 h-4 w-4" />;
    }
  };

  // Render skeleton or minimal header if role/profile is still loading
  if (!hasMounted || isLoadingRole || !currentSessionRole) {
    return (
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-md md:px-6">
        {isMobile && <SidebarTrigger />}
        <div className="ml-auto flex items-center gap-2">
          <Skeleton className="h-8 w-[200px] lg:w-[300px]" />
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-md md:px-6">
      {isMobile && <SidebarTrigger />}
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <form className="ml-auto flex-1 sm:flex-initial" onSubmit={handleSearchSubmit}>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={searchPlaceholder}
              className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px] bg-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={isLoggingOut}
            />
          </div>
        </form>
        <NotificationIcon />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full" disabled={isLoggingOut}>
              <Avatar className="h-9 w-9">
                <AvatarImage src={userAvatar} alt={userProfile.name} data-ai-hint="profile avatar"/>
                <AvatarFallback>{userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{userProfile.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {userProfile.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
             <DropdownMenuItem className="cursor-pointer" onSelect={() => router.push(profileLinkPath)} disabled={isLoggingOut}>
                {getRoleIcon(roleDisplay)}
                <span>
                  {currentSessionRole === 'estudiante' ? 'Mi Perfil' : `Panel de ${roleDisplay}`}
                </span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onSelect={() => router.push('/dashboard/settings')} disabled={isLoggingOut}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Configuración</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="cursor-pointer text-red-500 hover:!text-red-500 hover:!bg-red-500/10 focus:text-red-500 focus:bg-red-500/10" 
              onSelect={() => { if(!isLoggingOut) setIsLogoutConfirmOpen(true);}}
              disabled={isLoggingOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar Sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <AlertDialog open={isLogoutConfirmOpen} onOpenChange={setIsLogoutConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro de que quieres cerrar sesión?</AlertDialogTitle>
            <AlertDialogDescription>
              Se cerrará tu sesión actual en AlpriNexus.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsLogoutConfirmOpen(false)} disabled={isLoggingOut}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="bg-destructive hover:bg-destructive/90" disabled={isLoggingOut}>
              {isLoggingOut && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoggingOut ? 'Cerrando...' : 'Sí, Cerrar Sesión'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  );
}
