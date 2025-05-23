
"use client";

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
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
import { LogOut, Search, Settings, User as UserIcon, ShieldCheck, BookOpen, GraduationCap } from 'lucide-react';
import { Logo } from '@/components/common/logo';
import { NotificationIcon } from '@/components/notifications/notification-icon';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';

export function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { isMobile } = useSidebar();

  let currentRoleDisplay: string;
  let profileLinkPath: string;

  // Determinar el rol y el enlace del perfil basado en el pathname
  // Asegurarse de que la comprobación más específica (admin) vaya primero.
  if (pathname.startsWith('/dashboard/admin')) {
    currentRoleDisplay = 'Administrador';
    profileLinkPath = '/dashboard/admin';
  } else if (pathname.startsWith('/dashboard/instructor')) {
    currentRoleDisplay = 'Instructor';
    profileLinkPath = '/dashboard/instructor';
  } else if (pathname.startsWith('/dashboard/student')) {
    currentRoleDisplay = 'Estudiante';
    profileLinkPath = '/dashboard/student';
  } else { // Por defecto para /dashboard o cualquier otra ruta no específica del panel
    currentRoleDisplay = 'Estudiante'; // O un rol genérico si se prefiere
    profileLinkPath = '/dashboard/student'; // O un enlace de perfil genérico
  }
  
  const user = { name: 'Usuario Demo', email: 'demo@ejemplo.com', role: currentRoleDisplay, avatar: 'https://placehold.co/100x100.png' };

  const handleLogout = () => {
    router.push('/login');
  };

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'administrador':
        return <ShieldCheck className="mr-2 h-4 w-4" />;
      case 'instructor':
        return <BookOpen className="mr-2 h-4 w-4" />;
      case 'estudiante':
        return <GraduationCap className="mr-2 h-4 w-4" />;
      default:
        return <UserIcon className="mr-2 h-4 w-4" />;
    }
  };


  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-md md:px-6">
      {isMobile && <SidebarTrigger />}
      {!isMobile && (
         <Link href="/dashboard" className="hidden items-center gap-2 md:flex">
            <Logo className="h-8 w-auto" href={null} />
         </Link>
      )}
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <form className="ml-auto flex-1 sm:flex-initial">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar cursos, usuarios..."
              className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px] bg-input"
            />
          </div>
        </form>
        <NotificationIcon />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user.avatar} alt={user.name} data-ai-hint="profile avatar" />
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
                <span>Perfil de {user.role}</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onSelect={() => router.push('#')}>
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
