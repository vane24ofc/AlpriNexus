
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
import { LogOut, Search, Settings, User as UserIconLucide, Shield, BookOpen, GraduationCap } from 'lucide-react';
import { Logo } from '@/components/common/logo';
import { NotificationIcon } from '@/components/notifications/notification-icon';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { useSessionRole } from '@/app/dashboard/layout';

export function AppHeader() {
  const router = useRouter();
  const { isMobile } = useSidebar();
  const { currentSessionRole } = useSessionRole();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchPlaceholder, setSearchPlaceholder] = useState('Buscar cursos...');

  let roleDisplay: string = "Estudiante";
  let profileLinkPath: string = "/dashboard/student/profile";
  let dashboardPath: string = "/dashboard";

  useEffect(() => {
    switch (currentSessionRole) {
      case 'administrador':
        roleDisplay = 'Administrador';
        profileLinkPath = '/dashboard'; // Admins go to their main dashboard
        dashboardPath = '/dashboard';
        setSearchPlaceholder('Buscar usuarios, cursos...');
        break;
      case 'instructor':
        roleDisplay = 'Instructor';
        profileLinkPath = '/dashboard'; // Instructors go to their main dashboard
        dashboardPath = '/dashboard';
        setSearchPlaceholder('Buscar en mis cursos...');
        break;
      case 'estudiante':
      default:
        roleDisplay = 'Estudiante';
        profileLinkPath = '/dashboard/student/profile';
        dashboardPath = '/dashboard';
        setSearchPlaceholder('Buscar cursos...');
        break;
    }
  }, [currentSessionRole]);

  const user = { name: `${roleDisplay} Usuario`, email: `${currentSessionRole || 'student'}@example.com`, role: roleDisplay, avatar: 'https://placehold.co/100x100.png' };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sessionRole');
    }
    router.push('/login');
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!searchTerm.trim()) return;

    const encodedSearchTerm = encodeURIComponent(searchTerm.trim());

    switch (currentSessionRole) {
      case 'administrador':
        // Podría buscar usuarios, cursos, etc. Por ahora, vamos a simular búsqueda de usuarios.
        router.push(`/dashboard/admin/users?search=${encodedSearchTerm}`);
        break;
      case 'instructor':
        // Podría buscar en sus propios cursos.
        router.push(`/dashboard/instructor/my-courses?search=${encodedSearchTerm}`);
        break;
      case 'estudiante':
      default:
        router.push(`/dashboard/courses/explore?search=${encodedSearchTerm}`);
        break;
    }
    // setSearchTerm(''); // Opcional: limpiar el término después de la búsqueda
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

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-md md:px-6">
      {isMobile && <SidebarTrigger />}
      {!isMobile && (
         <Link href={dashboardPath} className="hidden items-center gap-2 md:flex">
            <Logo className="h-8 w-auto" href={null} />
         </Link>
      )}
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
            />
          </div>
        </form>
        <NotificationIcon />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user.avatar} alt={user.name} data-ai-hint="profile avatar"/>
                <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
             <DropdownMenuItem className="cursor-pointer" onSelect={() => router.push(profileLinkPath)}>
                {getRoleIcon(user.role)}
                <span>
                  {currentSessionRole === 'estudiante' ? 'Mi Perfil' : `Panel de ${user.role}`}
                </span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onSelect={() => router.push('/dashboard/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Configuración</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-red-500 hover:!text-red-500 hover:!bg-red-500/10 focus:text-red-500 focus:bg-red-500/10" onSelect={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar Sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
