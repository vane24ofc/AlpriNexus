
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Settings,
  GraduationCap,
  BarChart3,
  FolderArchive,
  MessageSquare,
  LifeBuoy,
  ChevronDown,
  ChevronRight,
  Shield, 
  User as UserIconLucide, 
  CalendarDays,
  BarChartBig,
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
  id: string; // Added unique ID
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
      { id: 'nav-admin-users', href: '/dashboard/admin/users', label: 'Gestión de Usuarios', icon: Users },
      { id: 'nav-admin-courses', href: '/dashboard/admin/courses', label: 'Gestión de Cursos', icon: BookOpen },
      { id: 'nav-admin-metrics', href: '/dashboard/admin/metrics', label: 'Métricas e Informes', icon: BarChartBig },
    ],
  },
  {
    id: 'nav-instructor-tools-group',
    label: 'Herramientas de Instructor',
    icon: BookOpen,
    roles: ['instructor'],
    children: [
      { id: 'nav-instructor-create-course', href: '/dashboard/courses/new', label: 'Crear Curso', icon: PlusCircle },
      { id: 'nav-instructor-my-courses', href: '/dashboard/instructor/my-courses', label: 'Mis Cursos Creados', icon: BookOpen }, 
    ],
  },
  {
    id: 'nav-student-portal-group',
    label: 'Portal del Estudiante',
    icon: GraduationCap,
    roles: ['estudiante'],
    children: [
      { id: 'nav-student-profile', href: '/dashboard/student/profile', label: 'Mi Perfil', icon: UserIconLucide },
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
  
  const dashboardPath = '/dashboard'; 

  const filteredNavItems = useMemo(() => {
    if (!currentSessionRole) return [];

    return navItems.reduce((acc, item) => {
      if (!item.roles || item.roles.includes(currentSessionRole)) {
        let newItem = { ...item };
        
        if (newItem.label === 'Panel Principal') {
            newItem.href = dashboardPath;
        }

        if (item.children) {
          newItem.children = item.children.filter(child => {
            if (child.roles && !child.roles.includes(currentSessionRole)) {
              return false;
            }
            return true;
          });

          if (newItem.children.length === 0 && !newItem.href) { 
            return acc; 
          }
        }
        acc.push(newItem);
      }
      return acc;
    }, [] as NavItem[]);
  }, [currentSessionRole, dashboardPath]);

  const toggleSubmenu = (label: string) => {
    setOpenSubmenus(prev => ({ ...prev, [label]: !prev[label] }));
  };
  
  useEffect(() => {
    const newActiveSubmenus: Record<string, boolean> = {};
    let needsUpdate = false;

    filteredNavItems.forEach(item => {
      if (item.children && item.children.length > 0) {
        const isChildActive = item.children.some(child => child.href && pathname.startsWith(child.href as string));
        const isParentEffectivelyActive = item.href && pathname === item.href;

        if (isChildActive || isParentEffectivelyActive) {
          if (!openSubmenus[item.label]) {
            needsUpdate = true;
          }
          newActiveSubmenus[item.label] = true;
        } else if (openSubmenus[item.label]) {
           // If submenu was open but no longer active, consider it for closing
           // (This part can be tricky to avoid closing manually opened submenus)
        }
      }
    });
    
    // Check if any currently open submenu is no longer active and wasn't manually toggled (hard to detect)
    // For simplicity, focus on auto-opening active ones
    for (const label in openSubmenus) {
        if (openSubmenus[label] && !newActiveSubmenus[label]) {
            // If a menu was open, but its associated path is not active anymore,
            // it MIGHT be a candidate for closing. This logic can be complex.
            // For now, we'll primarily focus on auto-opening.
        }
    }


    if (needsUpdate) {
      setOpenSubmenus(prevOpenSubmenus => {
        const updatedState = { ...prevOpenSubmenus };
        for (const label in newActiveSubmenus) {
          updatedState[label] = true; 
        }
        return updatedState;
      });
    }
  }, [pathname, filteredNavItems, openSubmenus]);


  const renderNavItems = (items: NavItem[], isSubmenu = false) => {
    return items.map((item) => {
      if (item.children && item.children.length === 0 && !item.href) {
        return null;
      }

      const effectiveHref = item.href || (item.label === 'Panel Principal' ? dashboardPath : undefined);

      if (item.children && item.children.length > 0) {
        const Comp = isSubmenu ? SidebarMenuSubButton : SidebarMenuButton;
        const isOpen = openSubmenus[item.label] || false;

        const isGroupActive = (effectiveHref && pathname === effectiveHref) || 
                              item.children.some(child => child.href && pathname.startsWith(child.href as string));
        
        const isActiveForButton = effectiveHref ? (pathname === effectiveHref) : isGroupActive;


        return (
          <SidebarMenuItem key={item.id}> {/* USE item.id AS KEY */}
            <Comp
              onClick={() => toggleSubmenu(item.label)}
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
      // More precise isActive check for top-level items
      let isActive;
      if (effectiveHref === dashboardPath) {
        // For /dashboard, only active if it's exactly /dashboard or /dashboard/
        // OR if it's one of the specific role paths that now map to /dashboard for content
        const isExactDashboard = pathname === dashboardPath || pathname === `${dashboardPath}/`;
        const isRoleDashboard = (currentSessionRole === 'administrador' && pathname.startsWith('/dashboard/admin')) ||
                                (currentSessionRole === 'instructor' && pathname.startsWith('/dashboard/instructor')) ||
                                (currentSessionRole === 'estudiante' && pathname.startsWith('/dashboard/student') && !pathname.startsWith('/dashboard/student/profile'));
        isActive = isExactDashboard && !isRoleDashboard; // Panel principal es activo si es /dashboard y no una subruta de rol
      } else {
          isActive = pathname === effectiveHref || 
                     (pathname.startsWith(effectiveHref) && effectiveHref !== dashboardPath);
      }


      return (
        <SidebarMenuItem key={item.id}> {/* USE item.id AS KEY */}
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

  if (!currentSessionRole) {
    return (
      <Sidebar collapsible="icon">
         <SidebarHeader>
            <Link href={dashboardPath} className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
            <Logo className="h-8 w-auto group-data-[collapsible=icon]:h-7 group-data-[collapsible=icon]:w-7" href={null} />
            <span className="font-semibold group-data-[collapsible=icon]:hidden">NexusAlpri</span>
            </Link>
        </SidebarHeader>
        <SidebarContent>
            {/* Puedes poner un skeleton loader aquí si lo deseas */}
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
