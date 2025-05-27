
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
  Video as VideoIcon,
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
  SidebarMenuSkeleton,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/common/logo';
import React, { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useSessionRole, type Role } from '@/app/dashboard/layout';

export interface NavItem {
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
      { id: 'nav-student-my-courses', href: '/dashboard/student/my-courses', label: 'Mis Cursos Inscritos', icon: BookOpen, roles: ['estudiante'] },
    ],
  },
  { id: 'nav-create-course', href: '/dashboard/courses/new', label: 'Crear Curso', icon: PlusCircle, roles: ['administrador', 'instructor'] },
  { id: 'nav-explore-courses', href: '/dashboard/courses/explore', label: 'Explorar Cursos', icon: Library, roles: ['administrador', 'instructor', 'estudiante'] },
  { id: 'nav-virtual-sessions', href: '/dashboard/virtual-sessions', label: 'Sesiones Virtuales', icon: VideoIcon, roles: ['administrador', 'instructor', 'estudiante'] },
  { id: 'nav-calendar', href: '/dashboard/calendar', label: 'Calendario', icon: CalendarDays, roles: ['administrador', 'instructor', 'estudiante'] },
  { id: 'nav-resources', href: '/dashboard/resources', label: 'Recursos', icon: FolderArchive, roles: ['administrador', 'instructor', 'estudiante'] },
  { id: 'nav-settings', href: '/dashboard/settings', label: 'Configuración', icon: Settings, roles: ['administrador', 'instructor', 'estudiante'] },
];


export function AppSidebarNav() {
  const pathname = usePathname();
  const { currentSessionRole, isLoadingRole } = useSessionRole();
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const filteredNavItems = useMemo(() => {
    if (isLoadingRole || !currentSessionRole) return [];
    return navItems.reduce((acc, item) => {
      if (!item.roles || item.roles.includes(currentSessionRole!)) {
        let newItem = { ...item };
        if (item.children) {
          newItem.children = item.children.filter(child => !child.roles || child.roles.includes(currentSessionRole!));
          if (newItem.children.length > 0 || newItem.href) {
            acc.push(newItem);
          }
        } else {
          acc.push(newItem);
        }
      }
      return acc;
    }, [] as NavItem[]);
  }, [currentSessionRole, isLoadingRole]);

  useEffect(() => {
    if (!hasMounted || isLoadingRole || !currentSessionRole || filteredNavItems.length === 0) {
      setOpenSubmenus(currentOpen => {
        if (Object.keys(currentOpen).length > 0) return {};
        return currentOpen;
      });
      return;
    }

    const calculateNewOpenState = (): Record<string, boolean> => {
      const state: Record<string, boolean> = {};
      const checkItems = (items: NavItem[], currentPath: string) => {
        items.forEach(item => {
          if (item.children && item.children.length > 0) {
            const isActiveGroup = item.children.some(child => child.href && currentPath.startsWith(child.href as string));
            state[item.id] = isActiveGroup;
            if (isActiveGroup) {
              checkItems(item.children, currentPath);
            }
          }
        });
      };
      checkItems(filteredNavItems, pathname);
      return state;
    };

    const newCalculatedOpenState = calculateNewOpenState();

    setOpenSubmenus(prevOpenSubmenus => {
      const currentKeys = Object.keys(prevOpenSubmenus);
      const newKeys = Object.keys(newCalculatedOpenState);
      let needsUpdate = currentKeys.length !== newKeys.length;

      if (!needsUpdate) {
        for (const key of newKeys) {
          if (prevOpenSubmenus[key] !== newCalculatedOpenState[key]) {
            needsUpdate = true;
            break;
          }
        }
      }

      if (needsUpdate) {
        return newCalculatedOpenState;
      }
      return prevOpenSubmenus;
    });

  }, [pathname, filteredNavItems, hasMounted, isLoadingRole, currentSessionRole]);


  const toggleSubmenu = (itemId: string) => {
    setOpenSubmenus(prev => ({ ...prev, [itemId]: !(prev[itemId] || false) }));
  };

  const renderNavItems = (items: NavItem[], isSubmenu = false): (React.ReactNode | null)[] => {
    return items.map((item) => {
      if (item.children && item.children.length === 0 && !item.href) return null;
      
      const effectiveHref = item.href || (item.children && item.children.length > 0 ? `#${item.id}` : undefined);

      if (item.children && item.children.length > 0) {
        const Comp = isSubmenu ? SidebarMenuSubButton : SidebarMenuButton;
        const isOpen = openSubmenus[item.id] || false;
        const isGroupActive = item.children.some(child => child.href && (pathname === child.href || pathname.startsWith(child.href + '/')));
        const isActiveForButton = (effectiveHref && effectiveHref !== `#${item.id}` && (pathname === effectiveHref || pathname.startsWith(effectiveHref + '/'))) ? true : isGroupActive;
        
        return (
          <SidebarMenuItem key={item.id}>
            <Comp onClick={() => toggleSubmenu(item.id)} className="justify-between" isActive={isActiveForButton} aria-expanded={isOpen}>
              <div className="flex items-center gap-2">
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </div>
              {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Comp>
            {isOpen && (<SidebarMenuSub>{renderNavItems(item.children, true)}</SidebarMenuSub>)}
          </SidebarMenuItem>
        );
      }
      if (!effectiveHref) return null;
      const Comp = isSubmenu ? SidebarMenuSubButton : SidebarMenuButton;
      
      let isActive = false;
      if (effectiveHref === "/dashboard" && item.id === 'nav-panel-principal') {
        // For the main dashboard link, only active if pathname is exactly /dashboard
        isActive = pathname === "/dashboard";
      } else if (effectiveHref) {
        // For other links, active if pathname starts with or is equal to the href
        isActive = pathname === effectiveHref || pathname.startsWith(effectiveHref + '/');
      }
      
      return (
        <SidebarMenuItem key={item.id}>
          <Comp asChild isActive={isActive} tooltip={item.label}>
            <Link href={effectiveHref}>
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
              {item.badge && (<span className={cn("ml-auto inline-block rounded-full px-2 py-0.5 text-xs", isActive ? "bg-sidebar-primary-foreground text-sidebar-primary" : "bg-sidebar-accent text-sidebar-accent-foreground")}>{item.badge}</span>)}
            </Link>
          </Comp>
        </SidebarMenuItem>
      );
    });
  };

  if (!hasMounted || isLoadingRole || !currentSessionRole) {
    return (
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <Link href="/dashboard" className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
            <Logo className="h-8 w-auto group-data-[collapsible=icon]:h-7 group-data-[collapsible=icon]:w-7" href={null} />
            <span className="font-semibold group-data-[collapsible=icon]:hidden">AlpriNexus</span>
          </Link>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarMenu>
            {Array.from({ length: 8 }).map((_, index) => (
              <SidebarMenuSkeleton key={`skeleton-direct-${index}`} showIcon className="my-1 h-8" />
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="group-data-[collapsible=icon]:hidden">
          <div className="text-xs text-muted-foreground p-2 text-center">
            Copyright Alprigrama S.A.S © {new Date().getFullYear()} Todos los derechos reservados.
          </div>
        </SidebarFooter>
      </Sidebar>
    );
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link href="/dashboard" className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
          <Logo className="h-8 w-auto group-data-[collapsible=icon]:h-7 group-data-[collapsible=icon]:w-7" href={null} />
          <span className="font-semibold group-data-[collapsible=icon]:hidden">AlpriNexus</span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {renderNavItems(filteredNavItems)}
        </SidebarMenu>
        <SidebarMenu className="mt-auto"> {/* Use SidebarMenu for proper styling of bottom items */}
            <SidebarMenuItem key="nav-help-link">
              <SidebarMenuButton asChild tooltip="Ayuda y Soporte" isActive={pathname === '/dashboard/help'}>
                <Link href="/dashboard/help">
                  <LifeBuoy className="h-4 w-4" />
                  <span className="group-data-[collapsible=icon]:hidden">Ayuda y Soporte</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem key="nav-feedback-link">
              <SidebarMenuButton asChild tooltip="Enviar Comentarios" isActive={pathname === '/dashboard/feedback'}>
                <Link href="/dashboard/feedback">
                  <MessageSquare className="h-4 w-4" />
                  <span className="group-data-[collapsible=icon]:hidden">Enviar Comentarios</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="group-data-[collapsible=icon]:hidden">
        <div className="text-xs text-muted-foreground p-2 text-center">
          Copyright Alprigrama S.A.S © {new Date().getFullYear()} Todos los derechos reservados.
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

