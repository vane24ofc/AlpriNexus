
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Settings,
  GraduationCap,
  BarChartBig,
  FolderArchive,
  MessageSquare,
  LifeBuoy,
  ChevronDown,
  ChevronRight,
  Shield, 
  User as UserIconLucide, 
  CalendarDays,
  Library,
  PlusCircle,
} from 'lucide-react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/common/logo';
import React, { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useSessionRole, Role } from '@/app/dashboard/layout'; 

interface NavItem {
  id: string;
  href?: string; 
  label: string;
  icon: React.ElementType;
  roles?: Role[]; 
  children?: NavItem[];
  badge?: string;
}

const navItems: NavItem[] = [
  { id: 'nav-panel-principal', href: '/dashboard', label: 'Panel Principal', icon: LayoutDashboard, roles: ['administrador', 'instructor', 'estudiante'] },
  {
    id: 'nav-gestion-group',
    label: 'Gestión',
    icon: Shield, 
    roles: ['administrador'],
    children: [
      { id: 'nav-admin-users', href: '/dashboard/admin/users', label: 'Gestión de Usuarios', icon: Users, roles: ['administrador'] },
      { id: 'nav-admin-courses', href: '/dashboard/admin/courses', label: 'Gestión de Cursos', icon: BookOpen, roles: ['administrador'] },
      { id: 'nav-admin-metrics', href: '/dashboard/admin/metrics', label: 'Métricas e Informes', icon: BarChartBig, roles: ['administrador'] },
    ],
  },
  {
    id: 'nav-instructor-tools-group',
    label: 'Herramientas de Instructor',
    icon: BookOpen,
    roles: ['instructor'],
    children: [
      { id: 'nav-instructor-create-course', href: '/dashboard/courses/new', label: 'Crear Curso', icon: PlusCircle, roles: ['instructor'] },
      { id: 'nav-instructor-my-courses', href: '/dashboard/instructor/my-courses', label: 'Mis Cursos Creados', icon: BookOpen, roles: ['instructor'] }, 
    ],
  },
  {
    id: 'nav-student-portal-group',
    label: 'Portal del Estudiante',
    icon: GraduationCap,
    roles: ['estudiante'],
    children: [
      { id: 'nav-student-profile', href: '/dashboard/student/profile', label: 'Mi Perfil', icon: UserIconLucide, roles: ['estudiante'] },
    ],
  },
  { id: 'nav-explore-courses', href: '/dashboard/courses/explore', label: 'Explorar Cursos', icon: Library, roles: ['administrador', 'instructor', 'estudiante'] },
  { id: 'nav-enrolled-courses', href: '/dashboard/student/my-courses', label: 'Cursos Inscritos', icon: BookOpen, roles: ['administrador', 'instructor', 'estudiante'] }, 
  { id: 'nav-calendar', href: '/dashboard/calendar', label: 'Calendario', icon: CalendarDays, roles: ['administrador', 'instructor', 'estudiante'] },
  { id: 'nav-resources', href: '/dashboard/resources', label: 'Recursos', icon: FolderArchive, roles: ['administrador', 'instructor', 'estudiante'], badge: "Nuevo" },
  { id: 'nav-settings', href: '/dashboard/settings', label: 'Configuración', icon: Settings, roles: ['administrador', 'instructor', 'estudiante'] },
];

export function AppSidebarNav() {
  const pathname = usePathname();
  const { currentSessionRole, isLoadingRole } = useSessionRole(); 
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});
  const manualToggleRef = React.useRef<Record<string, boolean>>({});
  
  const dashboardPath = '/dashboard'; 

  const filteredNavItems = useMemo(() => {
    if (isLoadingRole || !currentSessionRole) return [];

    return navItems.reduce((acc, item) => {
      if (!item.roles || item.roles.includes(currentSessionRole)) {
        let newItem = { ...item };
        
        if (newItem.href === '/dashboard' && item.id === 'nav-panel-principal') {
            // No special override needed here as /dashboard is the unified panel
        }

        if (item.children) {
          newItem.children = item.children.filter(child => {
            if (child.roles && !child.roles.includes(currentSessionRole!)) {
              return false;
            }
            return true;
          });

          if (newItem.children.length === 0 && !newItem.href && item.id !== 'nav-panel-principal') { 
            return acc; 
          }
        }
        acc.push(newItem);
      }
      return acc;
    }, [] as NavItem[]);
  }, [currentSessionRole, isLoadingRole, dashboardPath]);

  const toggleSubmenu = (itemId: string) => { // Use itemId
    setOpenSubmenus(prev => {
      const newState = !prev[itemId];
      manualToggleRef.current[itemId] = true; 
      return { ...prev, [itemId]: newState };
    });
  };
  
  useEffect(() => {
    const nextOpenSubmenus = { ...openSubmenus };
    let updated = false;

    filteredNavItems.forEach(item => {
        if (item.children && item.children.length > 0) {
            const isChildActive = item.children.some(child => child.href && pathname.startsWith(child.href));
            const isParentItselfActive = item.href && pathname === item.href;
            const shouldBeOpenDueToRoute = isChildActive || isParentItselfActive;

            if (shouldBeOpenDueToRoute && !nextOpenSubmenus[item.id] && !manualToggleRef.current[item.id]) {
                nextOpenSubmenus[item.id] = true;
                updated = true;
            }
            // Optionally auto-close if not active and not manually toggled:
            // else if (!shouldBeOpenDueToRoute && nextOpenSubmenus[item.id] && !manualToggleRef.current[item.id]) {
            //     nextOpenSubmenus[item.id] = false;
            //     updated = true;
            // }
        }
    });

    if (updated) {
        setOpenSubmenus(nextOpenSubmenus);
    }
    // Reset manual toggle tracker after each path change effect
    // This ensures that route-based auto-opening works again if user navigates away and back
    manualToggleRef.current = {}; 

  }, [pathname, filteredNavItems]); // openSubmenus removed from deps to make this effect primarily about route changes


  const renderNavItems = (items: NavItem[], isSubmenu = false) => {
    return items.map((item) => {
      if (item.id !== 'nav-panel-principal' && item.children && item.children.length === 0 && !item.href) {
         // Don't render empty groups unless it's the main panel link
        return null;
      }

      const effectiveHref = item.href || (item.id === 'nav-panel-principal' ? dashboardPath : undefined);

      if (item.children && item.children.length > 0) {
        const Comp = isSubmenu ? SidebarMenuSubButton : SidebarMenuButton;
        const isOpen = openSubmenus[item.id] || false; // Use item.id

        const isGroupActive = (effectiveHref && pathname === effectiveHref) || 
                              item.children.some(child => child.href && pathname.startsWith(child.href as string));
        
        const isActiveForButton = effectiveHref ? (pathname === effectiveHref) : isGroupActive;

        return (
          <SidebarMenuItem key={item.id}>
            <Comp
              onClick={() => toggleSubmenu(item.id)} // Use item.id
              className="justify-between"
              isActive={isActiveForButton}
              aria-expanded={isOpen}
            >
              <div className="flex items-center gap-2">
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </div>
              {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Comp>
            {isOpen && (
              <SidebarMenuSub>
                {renderNavItems(item.children, true)}
              </SidebarMenuSub>
            )}
          </SidebarMenuItem>
        );
      }

      if (!effectiveHref) return null; 

      const Comp = isSubmenu ? SidebarMenuSubButton : SidebarMenuButton;
      let isActive = pathname === effectiveHref || (pathname.startsWith(effectiveHref) && effectiveHref !== dashboardPath);
      
      if (effectiveHref === dashboardPath && item.id === 'nav-panel-principal') {
        // Special handling for the main "Panel Principal" link
        // It's active if the pathname is exactly /dashboard, or /dashboard/admin, /dashboard/instructor, /dashboard/student
        // (since /dashboard now shows role-specific content)
        isActive = pathname === dashboardPath || 
                     pathname.startsWith(`${dashboardPath}/admin`) || 
                     pathname.startsWith(`${dashboardPath}/instructor`) ||
                     pathname.startsWith(`${dashboardPath}/student`);
         // Make sure it's not active if a more specific child of /dashboard is active, like /dashboard/settings
        if (pathname !== dashboardPath && (
            pathname.startsWith(`${dashboardPath}/admin/`) ||
            pathname.startsWith(`${dashboardPath}/instructor/`) ||
            pathname.startsWith(`${dashboardPath}/student/profile`) || // Example of more specific student route
            pathname.startsWith(`${dashboardPath}/courses/`) ||
            pathname.startsWith(`${dashboardPath}/calendar`) ||
            pathname.startsWith(`${dashboardPath}/resources`) ||
            pathname.startsWith(`${dashboardPath}/settings`)
            ) && !isActive // if already active due to /admin etc, keep it
        ) {
            // If we are on a sub-page like /dashboard/settings, "Panel Principal" should not be active
            // unless the current role's main dashboard IS /dashboard (which it is for all now)
            // The previous complex logic for isActive might be better:
            // The main "Panel Principal" link should only be active if pathname is exactly /dashboard
            // OR if the user is on their role's specific base path (/dashboard/admin, /dashboard/instructor, /dashboard/student)
            // which now all resolve to /dashboard.
             isActive = pathname === dashboardPath; // Simplified: active only if exactly /dashboard
        }

      }


      return (
        <SidebarMenuItem key={item.id}>
          <Comp
            asChild
            isActive={isActive}
            tooltip={item.label}
          >
            <Link href={effectiveHref}>
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
              {item.badge && (
                <span className={cn(
                  "ml-auto inline-block rounded-full px-2 py-0.5 text-xs",
                  isActive ? "bg-sidebar-primary-foreground text-sidebar-primary" : "bg-sidebar-accent text-sidebar-accent-foreground"
                )}>
                  {item.badge}
                </span>
              )}
            </Link>
          </Comp>
        </SidebarMenuItem>
      );
    });
  };

  if (isLoadingRole) {
    return (
      <Sidebar collapsible="icon">
         <SidebarHeader>
            <Link href={dashboardPath} className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
            <Logo className="h-8 w-auto group-data-[collapsible=icon]:h-7 group-data-[collapsible=icon]:w-7" href={null} />
            <span className="font-semibold group-data-[collapsible=icon]:hidden">NexusAlpri</span>
            </Link>
        </SidebarHeader>
        <SidebarContent className="p-2">
            {/* Skeleton for loading state */}
            {[...Array(5)].map((_, i) => (
                <div key={i} className="h-8 w-full bg-muted/50 rounded-md animate-pulse mb-2" />
            ))}
        </SidebarContent>
      </Sidebar>
    );
  }


  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link href={dashboardPath} className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
          <Logo className="h-8 w-auto group-data-[collapsible=icon]:h-7 group-data-[collapsible=icon]:w-7" href={null} />
          <span className="font-semibold group-data-[collapsible=icon]:hidden">NexusAlpri</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {renderNavItems(filteredNavItems)}
        </SidebarMenu>
        
        <SidebarGroup className="mt-auto group-data-[collapsible=icon]:px-0">
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">Soporte</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem key="nav-help">
                <SidebarMenuButton asChild tooltip="Ayuda y Soporte">
                    <Link href="#">
                        <LifeBuoy />
                        <span className="group-data-[collapsible=icon]:hidden">Ayuda y Soporte</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem key="nav-feedback">
                <SidebarMenuButton asChild tooltip="Enviar Comentarios">
                    <Link href="#">
                        <MessageSquare />
                        <span className="group-data-[collapsible=icon]:hidden">Enviar Comentarios</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

      </SidebarContent>
      <SidebarFooter className="group-data-[collapsible=icon]:hidden">
        <div className="text-xs text-muted-foreground p-2 text-center">
        Copyright Alprigrama S.A.S
          © {new Date().getFullYear()} Todos los derechos reservados.
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
