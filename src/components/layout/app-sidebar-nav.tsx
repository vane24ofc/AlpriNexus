
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
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useSessionRole, type Role } from '@/app/dashboard/layout'; 

interface NavItem {
  id: string; // Added for stable keys
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
    icon: BookOpen, // Main group icon
    roles: ['instructor'],
    children: [
      { id: 'nav-instructor-create-course', href: '/dashboard/courses/new', label: 'Crear Curso', icon: PlusCircle, roles: ['instructor', 'administrador'] }, // Admin can also create
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
  const { currentSessionRole } = useSessionRole(); 
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
  }, [currentSessionRole, dashboardPath]);

  const toggleSubmenu = (itemId: string) => {
    setOpenSubmenus(prev => {
      const newState = !prev[itemId];
      manualToggleRef.current[itemId] = true; 
      return { ...prev, [itemId]: newState };
    });
  };
  
  useEffect(() => {
    const newOpenState: Record<string, boolean> = {};
    let stateChanged = false;

    filteredNavItems.forEach(item => {
      if (item.children && item.children.length > 0) {
        const isChildActive = item.children.some(child => child.href && pathname.startsWith(child.href));
        const isParentItselfActive = item.href && pathname === item.href; // Though item.href is usually undefined for groups
        const shouldBeOpenByRoute = isChildActive || isParentItselfActive;

        if (manualToggleRef.current[item.id]) {
          // If manually toggled, respect that state for this cycle
          newOpenState[item.id] = openSubmenus[item.id] || false;
        } else if (shouldBeOpenByRoute) {
          newOpenState[item.id] = true;
        } else {
          newOpenState[item.id] = false; // Default to closed if not active by route and not manually toggled
        }

        if (openSubmenus[item.id] !== newOpenState[item.id]) {
          stateChanged = true;
        }
      }
    });
    
    // Only update if the computed state is different from the current one
    if (stateChanged) {
        // We need to construct the full new state, including items not iterated if they were previously open
        const finalNewState = {...openSubmenus, ...newOpenState};
        // Filter out keys that are no longer in filteredNavItems (e.g. due to role change)
        const relevantKeys = new Set(filteredNavItems.map(i => i.id));
        const cleanedFinalState: Record<string, boolean> = {};
        for (const key in finalNewState) {
            if (relevantKeys.has(key) && finalNewState[key] !== undefined) {
                 cleanedFinalState[key] = finalNewState[key];
            }
        }
       
        if(JSON.stringify(cleanedFinalState) !== JSON.stringify(openSubmenus)){
            setOpenSubmenus(cleanedFinalState);
        }
    }
    manualToggleRef.current = {}; // Reset manual toggle tracking after each path change effect

  }, [pathname, filteredNavItems, openSubmenus]);


  const renderNavItems = (items: NavItem[], isSubmenu = false) => {
    return items.map((item) => {
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
      // More specific check for active state: exact match or prefix match if it's not the dashboard root
      let isActive = pathname === effectiveHref || (effectiveHref !== dashboardPath && pathname.startsWith(effectiveHref + '/'));
      
      // Special handling for the main "Panel Principal" link
      if (effectiveHref === dashboardPath && item.id === 'nav-panel-principal') {
         isActive = pathname === dashboardPath; // Active only if exactly /dashboard
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

    