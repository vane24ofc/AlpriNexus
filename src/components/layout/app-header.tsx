
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
import { LogOut, Search, Settings, User as UserIconLucide, Shield, BookOpen, GraduationCap, Bell as BellIcon } from 'lucide-react';
import { Logo } from '@/components/common/logo';
import { NotificationIcon } from '@/components/notifications/notification-icon';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { useSessionRole } from '@/app/dashboard/layout';
import { Skeleton } from '@/components/ui/skeleton';

export function AppHeader() {
  const router = useRouter();
  const { isMobile } = useSidebar();
  const { currentSessionRole, isLoadingRole, userProfile } = useSessionRole(); // Get userProfile from context
  const [searchTerm, setSearchTerm] = useState('');
  const [searchPlaceholder, setSearchPlaceholder] = useState('Buscar...');
  const [roleDisplay, setRoleDisplay] = useState("Usuario");
  const [profileLinkPath, setProfileLinkPath] = useState("/dashboard");
  const [dashboardPath, setDashboardPath] = useState("/dashboard");
  const [userAvatar, setUserAvatar] = useState("https://placehold.co/100x100.png");
  // userName and userEmail will now come from userProfile context

  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (currentSessionRole) {
      let determinedRoleDisplay = "Estudiante";
      let determinedProfileLink = "/dashboard/student/profile";
      let determinedDashboardPath = "/dashboard";
      let determinedSearchPlaceholder = "Buscar cursos...";
      let avatarInitial = userProfile.name ? userProfile.name.charAt(0).toUpperCase() : "E";


      switch (currentSessionRole) {
        case 'administrador':
          determinedRoleDisplay = 'Administrador';
          determinedProfileLink = '/dashboard';
          determinedDashboardPath = '/dashboard';
          determinedSearchPlaceholder = 'Buscar usuarios, cursos...';
          avatarInitial = userProfile.name ? userProfile.name.charAt(0).toUpperCase() : "A";
          break;
        case 'instructor':
          determinedRoleDisplay = 'Instructor';
          determinedProfileLink = '/dashboard';
          determinedDashboardPath = '/dashboard';
          determinedSearchPlaceholder = 'Buscar en mis cursos...';
          avatarInitial = userProfile.name ? userProfile.name.charAt(0).toUpperCase() : "I";
          break;
        case 'estudiante':
        default:
          determinedProfileLink = "/dashboard/student/profile";
          break;
      }
      setRoleDisplay(determinedRoleDisplay);
      setProfileLinkPath(determinedProfileLink);
      setDashboardPath(determinedDashboardPath);
      setSearchPlaceholder(determinedSearchPlaceholder);
      setUserAvatar(`https://placehold.co/100x100.png?text=${avatarInitial}`);
    }
  }, [currentSessionRole, userProfile.name]); // Add userProfile.name dependency

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sessionRole');
      localStorage.removeItem('nexusAlpriUserProfile'); // Also clear profile on logout
    }
    router.push('/login');
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!searchTerm.trim()) return;

    const encodedSearchTerm = encodeURIComponent(searchTerm.trim());

    if (currentSessionRole === 'administrador') {
      router.push(`/dashboard/admin/users?search=${encodedSearchTerm}`);
    } else if (currentSessionRole === 'instructor') {
      router.push(`/dashboard/instructor/my-courses?search=${encodedSearchTerm}`);
    } else {
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

  if (!hasMounted || isLoadingRole || !currentSessionRole || !userProfile.name) {
    return (
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-md md:px-6">
        {isMobile && <SidebarTrigger />}
        {!isMobile && (
          <div className="hidden items-center gap-2 md:flex">
             <Logo className="h-8 w-auto" href={null} key="header-logo-skeleton"/>
          </div>
        )}
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
      {!isMobile && (
         <Link href={dashboardPath} className="hidden items-center gap-2 md:flex" passHref>
            <Logo className="h-8 w-auto" href={null} key="header-logo-loaded" />
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
             <DropdownMenuItem className="cursor-pointer" onSelect={() => router.push(profileLinkPath)}>
                {getRoleIcon(roleDisplay)}
                <span>
                  {currentSessionRole === 'estudiante' ? 'Mi Perfil' : `Panel de ${roleDisplay}`}
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
