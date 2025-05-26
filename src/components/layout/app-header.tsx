
"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation'; 
import React, { useState } from 'react';
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

  let roleDisplay: string = "Estudiante"; 
  let profileLinkPath: string = "/dashboard/student/profile";
  let dashboardPath: string = "/dashboard";

  switch (currentSessionRole) {
    case 'administrador':
      roleDisplay = 'Administrador';
      profileLinkPath = '/dashboard'; 
      dashboardPath = '/dashboard';
      break;
    case 'instructor':
      roleDisplay = 'Instructor';
      profileLinkPath = '/dashboard';
      dashboardPath = '/dashboard';
      break;
    case 'estudiante':
      roleDisplay = 'Estudiante';
      profileLinkPath = '/dashboard/student/profile'; 
      dashboardPath = '/dashboard';
      break;
    default:
      // Default to student if role is somehow null or undefined initially
      roleDisplay = "Estudiante"; 
      profileLinkPath = '/dashboard/student/profile'; 
      dashboardPath = '/dashboard';
  }
  
  const user = { name: `${roleDisplay} Usuario`, email: `${currentSessionRole || 'student'}@example.com`, role: roleDisplay, avatar: 'https://placehold.co/100x100.png' };

  const handleLogout = () => {
    localStorage.removeItem('sessionRole'); // Clear the role on logout
    router.push('/login');
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!searchTerm.trim()) return;

    if (currentSessionRole === 'estudiante') {
      router.push(`/dashboard/courses/explore?search=${encodeURIComponent(searchTerm.trim())}`);
    } else if (currentSessionRole === 'administrador') {
      // Placeholder for admin search (e.g., users or all courses)
      // For now, could also go to explore or a specific admin search page if created
      router.push(`/dashboard/courses/explore?search=${encodeURIComponent(searchTerm.trim())}`); 
      console.log("Admin search for:", searchTerm.trim());
    } else if (currentSessionRole === 'instructor') {
      // Placeholder for instructor search (e.g., their own courses)
      console.log("Instructor search for:", searchTerm.trim());
    }
    // Optionally clear search term after submission
    // setSearchTerm(''); 
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
              placeholder="Buscar cursos..."
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
