
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
import { PlusCircle } from 'lucide-react';

interface NavItem {
  href?: string; 
  label: string;
  icon: React.ElementType;
  roles?: Role[]; 
  children?: NavItem[];
  badge?: string;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Panel Principal', icon: LayoutDashboard, roles: ['administrador', 'instructor', 'estudiante'] },
  {
    label: 'Gestión',
    icon: Shield, 
    roles: ['administrador'],
    children: [
      { href: '/dashboard/admin/users', label: 'Gestión de Usuarios', icon: Users },
      { href: '/dashboard/admin/courses', label: 'Gestión de Cursos', icon: BookOpen },
      { href: '/dashboard/admin/metrics', label: 'Métricas e Informes', icon: BarChartBig },
    ],
  },
  {
    label: 'Herramientas de Instructor',
    icon: BookOpen,
    roles: ['instructor'],
    children: [
      { href: '/dashboard/courses/new', label: 'Crear Curso', icon: PlusCircle },
      { href: '/dashboard/instructor/my-courses', label: 'Mis Cursos Creados', icon: BookOpen }, 
    ],
  },
  {
    label: 'Portal del Estudiante',
    icon: GraduationCap,
    roles: ['estudiante'],
    children: [
      { href: '/dashboard/student/profile', label: 'Mi Perfil', icon: UserIconLucide },
    ],
  },
  { href: '/dashboard/courses/explore', label: 'Explorar Cursos', icon: Library, roles: ['administrador', 'instructor', 'estudiante'] },
  { href: '/dashboard/student/my-courses', label: 'Cursos Inscritos', icon: BookOpen, roles: ['administrador', 'instructor', 'estudiante'] }, 
  { href: '/dashboard/calendar', label: 'Calendario', icon: CalendarDays, roles: ['administrador', 'instructor', 'estudiante'] },
  { href: '/dashboard/resources', label: 'Recursos', icon: FolderArchive, roles: ['administrador', 'instructor', 'estudiante'], badge: "Nuevo" },
  { href: '/dashboard/settings', label: 'Configuración', icon: Settings, roles: ['administrador', 'instructor', 'estudiante'] },
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
            // Ensure child href is defined before using it
            if (child.href && pathname.startsWith(child.href) && child.href === dashboardPath) {
              // Avoid issues if a child link is the same as dashboardPath
              // This case might need more specific handling if sub-items point to the main dashboard
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
  }, [currentSessionRole, dashboardPath, pathname]); // Added pathname as it influences child filtering logic indirectly

  const toggleSubmenu = (label: string) => {
    setOpenSubmenus(prev => ({ ...prev, [label]: !prev[label] }));
  };
  
  useEffect(() => {
    const newActiveSubmenus: Record<string, boolean> = {};
    filteredNavItems.forEach(item => {
      if (item.children && item.children.length > 0) {
        const isChildActive = item.children.some(child => child.href && pathname.startsWith(child.href as string));
        const isParentEffectivelyActive = item.href && pathname === item.href; // Check if the parent group link itself is active

        if (isChildActive || isParentEffectivelyActive) {
          newActiveSubmenus[item.label] = true;
        }
      }
    });

    let needsUpdate = false;
    for (const label in newActiveSubmenus) {
      if (!openSubmenus[label]) { 
        needsUpdate = true;
        break;
      }
    }
    // Also check if any previously open submenus (that are path-dependent) should now be closed
    // This part is tricky: we only want to auto-close if they were auto-opened due to path.
    // Manual toggles should persist.
    // For simplicity, this effect primarily focuses on *opening* active submenus.
    // Manual toggles are handled by `toggleSubmenu`.

    if (needsUpdate) {
      setOpenSubmenus(prevOpenSubmenus => {
        const updatedState = { ...prevOpenSubmenus };
        for (const label in newActiveSubmenus) {
          updatedState[label] = true; // Ensure active ones are open
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
          <SidebarMenuItem key={item.label}>
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
      const isActive = pathname === effectiveHref || 
                   (effectiveHref && pathname.startsWith(effectiveHref) && 
                    effectiveHref !== dashboardPath && 
                    !(effectiveHref === '/dashboard/courses/explore' && pathname.includes('/dashboard/courses/') && !pathname.endsWith('/explore')) &&
                    !(effectiveHref === '/dashboard/student/my-courses' && pathname.includes('/dashboard/courses/') && !pathname.endsWith('/explore')) 
                   );

      return (
        <SidebarMenuItem key={effectiveHref || item.label}>
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
            <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Ayuda y Soporte">
                    <Link href="#">
                        <LifeBuoy />
                        <span className="group-data-[collapsible=icon]:hidden">Ayuda y Soporte</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
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
