
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
  SidebarMenuSubItem,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/common/logo';
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useSessionRole } from '@/app/dashboard/layout'; 

interface NavItem {
  href?: string; 
  label: string;
  icon: React.ElementType;
  roles?: string[]; 
  children?: NavItem[];
  badge?: string;
  isDashboardLink?: boolean; // Para identificar el enlace del Panel Principal
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Panel Principal', icon: LayoutDashboard, roles: ['administrador', 'instructor', 'estudiante'], isDashboardLink: true },
  {
    label: 'Gestión',
    icon: Users, 
    roles: ['administrador'],
    children: [
      // "Resumen de Admin" ahora es el Panel Principal (/dashboard) para el admin
      { href: '/dashboard/admin/users', label: 'Gestión de Usuarios', icon: Users },
      { href: '/dashboard/admin/courses', label: 'Gestión de Cursos', icon: BookOpen },
    ],
  },
  {
    label: 'Herramientas de Instructor',
    icon: BookOpen,
    roles: ['instructor'],
    children: [
      // "Mi Panel" ahora es el Panel Principal (/dashboard) para el instructor
      { href: '/dashboard/instructor/my-courses', label: 'Mis Cursos', icon: BookOpen },
      { href: '/dashboard/instructor/students', label: 'Mis Estudiantes', icon: Users },
    ],
  },
  {
    label: 'Portal del Estudiante',
    icon: GraduationCap,
    roles: ['estudiante'],
    children: [
      // "Mi Panel" ahora es el Panel Principal (/dashboard) para el estudiante
      { href: '/dashboard/student/my-courses', label: 'Cursos Inscritos', icon: BookOpen },
      { href: '/dashboard/student/progress', label: 'Mi Progreso', icon: BarChart3 },
      { href: '/dashboard/student/profile', label: 'Mi Perfil', icon: UserIconLucide },
    ],
  },
  { href: '/dashboard/calendar', label: 'Calendario', icon: CalendarDays, roles: ['administrador', 'instructor', 'estudiante'] },
  { href: '/dashboard/resources', label: 'Recursos', icon: FolderArchive, roles: ['administrador', 'instructor', 'estudiante'], badge: "Nuevo" },
  { href: '/dashboard/settings', label: 'Configuración', icon: Settings, roles: ['administrador', 'instructor', 'estudiante'] },
];

export function AppSidebarNav() {
  const pathname = usePathname();
  const { currentSessionRole } = useSessionRole(); 
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});
  
  // El "Panel Principal" siempre es /dashboard, que mostrará contenido específico del rol.
  const dashboardPath = '/dashboard';

  // Filtra los items de navegación y sus hijos basado en el rol actual
  const filteredNavItems = navItems.reduce((acc, item) => {
    // Si el item no tiene roles definidos o incluye el rol actual
    if (!item.roles || item.roles.includes(currentSessionRole)) {
      let newItem = { ...item };
      // Si es un enlace de "Panel Principal", su href es dashboardPath
      if (item.isDashboardLink) {
        newItem.href = dashboardPath;
      }

      // Filtrar hijos
      if (item.children) {
        newItem.children = item.children.filter(child => 
          !child.roles || child.roles.includes(currentSessionRole)
        ).map(child => {
          // Ajustar href de hijos que eran paneles específicos (ej. "Resumen Admin") para apuntar a /dashboard
          if (child.label === "Resumen de Admin" || child.label === "Mi Panel") {
            return { ...child, href: dashboardPath };
          }
          return child;
        });
        // Si después de filtrar no quedan hijos, no se añade el grupo si no tiene un href propio
        if (newItem.children.length === 0 && !newItem.href) {
          return acc;
        }
      }
      acc.push(newItem);
    }
    return acc;
  }, [] as NavItem[]);


  const toggleSubmenu = (label: string) => {
    setOpenSubmenus(prev => ({ ...prev, [label]: !prev[label] }));
  };
  
  const renderNavItems = (items: NavItem[], isSubmenu = false) => {
    return items.map((item) => {
      const effectiveHref = item.href; // href ya está ajustado

      if (item.children && item.children.length > 0) {
        const Comp = isSubmenu ? SidebarMenuSubButton : SidebarMenuButton;
        
        let isOpen = openSubmenus[item.label];
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => { 
          const isActiveChild = item.children!.some(child => child.href && pathname.startsWith(child.href!));
          if (isActiveChild && !openSubmenus[item.label]) { 
             setOpenSubmenus(prev => ({ ...prev, [item.label]: true }));
          }
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [pathname, item.label, item.children]);


        return (
          <SidebarMenuItem key={item.label}>
            <Comp
              onClick={() => toggleSubmenu(item.label)}
              className="justify-between"
              isActive={item.children.some(child => child.href && pathname === child.href)}
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

      if (!effectiveHref && !item.children) return null; // No renderizar si no hay href y no es un grupo

      const Comp = isSubmenu ? SidebarMenuSubButton : SidebarMenuButton;
      return (
        <SidebarMenuItem key={effectiveHref || item.label}>
          <Comp
            asChild
            isActive={effectiveHref ? pathname === effectiveHref : false}
            tooltip={item.label}
          >
            <Link href={effectiveHref || '#'}>
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
              {item.badge && (
                <span className={cn(
                  "ml-auto inline-block rounded-full px-2 py-0.5 text-xs",
                  effectiveHref && pathname === effectiveHref ? "bg-sidebar-primary-foreground text-sidebar-primary" : "bg-sidebar-accent text-sidebar-accent-foreground"
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
          <span className="font-semibold group-data-[collapsible=icon]:hidden">AlpriNexus</span>
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
          © {new Date().getFullYear()} AlpriNexus
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
