
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
  SidebarMenuSkeleton,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/common/logo';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useSessionRole, type Role } from '@/app/dashboard/layout'; 

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
      { id: 'nav-instructor-create-course', href: '/dashboard/courses/new', label: 'Crear Curso', icon: PlusCircle, roles: ['instructor', 'administrador'] },
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
  const manualToggleRef = useRef<Record<string, boolean>>({});
  
  const dashboardPath = '/dashboard'; 

  const filteredNavItems = useMemo(() => {
    if (!currentSessionRole) return []; 

    return navItems.reduce((acc, item) => {
      if (!item.roles || item.roles.includes(currentSessionRole)) {
        let newItem = { ...item };
        
        if (item.children) {
          newItem.children = item.children.filter(child => {
            if (child.roles && !child.roles.includes(currentSessionRole!)) {
              return false;
            }
            // Ensure child has href to be considered, unless it's a group with further children
            if (!child.href && (!child.children || child.children.length === 0)) {
                 //return false; // Potential: filter out children that are not links and have no sub-children
            }
            return true;
          });

          // If after filtering, the group has no children AND it's not a direct link itself (and not panel principal)
          if (newItem.children.length === 0 && !newItem.href && item.id !== 'nav-panel-principal') { 
            return acc; 
          }
        }
        acc.push(newItem);
      }
      return acc;
    }, [] as NavItem[]);
  }, [currentSessionRole]);

  const toggleSubmenu = (itemId: string) => {
    setOpenSubmenus(prev => {
      const newState = !prev[itemId];
      manualToggleRef.current[itemId] = true; 
      return { ...prev, [itemId]: newState };
    });
  };
  
  useEffect(() => {
    const newOpenState: Record<string, boolean> = {};
    let stateChangedBasedOnPath = false;

    filteredNavItems.forEach(item => {
      if (item.children && item.children.length > 0) {
        const isChildActive = item.children.some(child => child.href && pathname.startsWith(child.href as string));
        const shouldBeOpenByRoute = isChildActive;

        if (manualToggleRef.current[item.id]) {
          newOpenState[item.id] = openSubmenus[item.id] || false;
        } else if (shouldBeOpenByRoute) {
          newOpenState[item.id] = true;
          if (openSubmenus[item.id] !== true) stateChangedBasedOnPath = true;
        } else {
          // If not manually toggled and no child is active, it should be closed.
          newOpenState[item.id] = false;
          if (openSubmenus[item.id] !== false) stateChangedBasedOnPath = true;
        }
      }
    });
    
    // More robust check if state needs updating
    let needsUpdate = false;
    const currentOpenKeys = Object.keys(openSubmenus);
    const newOpenKeys = Object.keys(newOpenState);

    if (currentOpenKeys.length !== newOpenKeys.length) {
        needsUpdate = true;
    } else {
        for (const key of newOpenKeys) {
            if (openSubmenus[key] !== newOpenState[key]) {
                needsUpdate = true;
                break;
            }
        }
    }
    // Also consider if some keys were removed from newOpenState but exist in openSubmenus
    if (!needsUpdate) {
        for (const key of currentOpenKeys) {
            if (!(key in newOpenState) && openSubmenus[key] === true) { // A previously open menu is no longer relevant
                needsUpdate = true;
                break;
            }
        }
    }


    if (needsUpdate) {
        // Construct the final state ensuring all relevant keys from filteredNavItems are present.
        const finalState: Record<string, boolean> = {};
        filteredNavItems.forEach(item => {
            if (item.children && item.children.length > 0) {
                finalState[item.id] = newOpenState[item.id] || false;
            }
        });
        setOpenSubmenus(finalState);
    }
    manualToggleRef.current = {}; // Reset manual toggle state after path change effect
  }, [pathname, filteredNavItems]); // Removed openSubmenus from dependencies


  const renderNavItems = (items: NavItem[], isSubmenu = false) => {
    return items.map((item) => {
      // Do not render a group if it has no children and is not a link itself
      if (item.id !== 'nav-panel-principal' && item.children && item.children.length === 0 && !item.href) {
        return null;
      }

      const effectiveHref = item.href || (item.id === 'nav-panel-principal' ? dashboardPath : undefined);

      if (item.children && item.children.length > 0) {
        const Comp = isSubmenu ? SidebarMenuSubButton : SidebarMenuButton;
        const isOpen = openSubmenus[item.id] || false;

        const isGroupActive = item.children.some(child => child.href && pathname.startsWith(child.href as string));
        const isActiveForButton = (effectiveHref && pathname === effectiveHref) ? true : isGroupActive;

        return (
          <SidebarMenuItem key={item.id}>
            <Comp
              onClick={() => toggleSubmenu(item.id)}
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
      let isActive = pathname === effectiveHref || (effectiveHref !== dashboardPath && pathname.startsWith(effectiveHref + '/'));
      
      if (effectiveHref === dashboardPath && item.id === 'nav-panel-principal') {
         isActive = pathname === dashboardPath; 
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
                <SidebarMenu>
                    {Array.from({ length: 5 }).map((_, index) => (
                        <SidebarMenuSkeleton key={index} showIcon={true} />
                    ))}
                </SidebarMenu>
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
      <SidebarContent className="p-2">
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

