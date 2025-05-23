
"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation'; 
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

  let roleDisplay: string = "Usuario"; 
  let profileLinkPath: string = "/dashboard"; // Perfil para admin e instructor es ahora /dashboard
  const dashboardPath: string = "/dashboard"; // Todos los roles van a /dashboard

  switch (currentSessionRole) {
    case 'administrador':
      roleDisplay = 'Administrador';
      // Perfil de admin es su propio dashboard, que ahora es /dashboard
      // Si tuvieras una página /dashboard/admin/profile dedicada, se usaría aquí.
      profileLinkPath = '/dashboard'; 
      break;
    case 'instructor':
      roleDisplay = 'Instructor';
      // Perfil de instructor es su propio dashboard, que ahora es /dashboard
      // Si tuvieras una página /dashboard/instructor/profile dedicada, se usaría aquí.
      profileLinkPath = '/dashboard';
      break;
    case 'estudiante':
      roleDisplay = 'Estudiante';
      profileLinkPath = '/dashboard/student/profile'; // Estudiante sí tiene página de perfil dedicada
      break;
    default:
      roleDisplay = "Estudiante"; // Fallback
      profileLinkPath = '/dashboard/student/profile'; 
  }
  
  // Simulación de datos de usuario. En una app real, vendría de la sesión/autenticación.
  const user = { name: 'Usuario Demo', email: `${currentSessionRole}@example.com`, role: roleDisplay, avatar: 'https://placehold.co/100x100.png' };

  const handleLogout = () => {
    // Aquí iría la lógica de logout real (limpiar sesión, cookies, etc.)
    router.push('/login');
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
