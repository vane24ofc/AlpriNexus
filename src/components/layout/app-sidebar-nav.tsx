
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
  BarChartBig, // Icono para Métricas
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
import { useSessionRole, Role } from '@/app/dashboard/layout'; 

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
      { href: '/dashboard', label: 'Resumen de Admin', icon: LayoutDashboard }, // Apunta al panel unificado
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
      { href: '/dashboard', label: 'Mi Panel', icon: LayoutDashboard }, // Apunta al panel unificado
      { href: '/dashboard/instructor/my-courses', label: 'Mis Cursos', icon: BookOpen }, // Ruta placeholder, podría ser /dashboard/courses/new o una lista propia
      { href: '/dashboard/instructor/students', label: 'Mis Estudiantes', icon: Users }, // Ruta placeholder
    ],
  },
  {
    label: 'Portal del Estudiante',
    icon: GraduationCap,
    roles: ['estudiante'],
    children: [
      { href: '/dashboard', label: 'Mi Panel', icon: LayoutDashboard }, // Apunta al panel unificado
      { href: '/dashboard/student/my-courses', label: 'Cursos Inscritos', icon: BookOpen }, // Ruta placeholder
      { href: '/dashboard/student/progress', label: 'Mi Progreso', icon: BarChart3 }, // Ruta placeholder
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
  
  const dashboardPath = '/dashboard'; // El panel unificado

  const getFilteredNavItems = () => {
    if (!currentSessionRole) return []; // Si el rol aún no está cargado, no mostrar nada o un loader

    return navItems.reduce((acc, item) => {
      if (!item.roles || item.roles.includes(currentSessionRole)) {
        let newItem = { ...item };
        
        // Ajustar href para el panel principal
        if (item.label === 'Panel Principal') {
            newItem.href = dashboardPath;
        }

        if (item.children) {
          newItem.children = item.children.filter(child => 
            !child.roles || child.roles.includes(currentSessionRole)
          ).map(child => {
            // Si el hijo es un "Resumen de Rol" o "Mi Panel", también apunta a /dashboard
            if (child.label === "Resumen de Admin" || child.label === "Mi Panel") {
              return { ...child, href: dashboardPath };
            }
            return child;
          });
          if (newItem.children.length === 0 && !newItem.href) {
            return acc;
          }
        }
        acc.push(newItem);
      }
      return acc;
    }, [] as NavItem[]);
  };
  
  const filteredNavItems = getFilteredNavItems();

  const toggleSubmenu = (label: string) => {
    setOpenSubmenus(prev => ({ ...prev, [label]: !prev[label] }));
  };
  
  // Efecto para abrir submenús si un hijo está activo
  useEffect(() => {
    const activeSubmenus: Record<string, boolean> = {};
    filteredNavItems.forEach(item => {
      if (item.children && item.children.some(child => child.href && pathname.startsWith(child.href))) {
        activeSubmenus[item.label] = true;
      }
    });
    if (Object.keys(activeSubmenus).length > 0) {
        setOpenSubmenus(prev => ({ ...prev, ...activeSubmenus }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, currentSessionRole]); // Re-evaluar cuando cambie el rol o la ruta


  const renderNavItems = (items: NavItem[], isSubmenu = false) => {
    return items.map((item) => {
      const effectiveHref = item.href; 

      if (item.children && item.children.length > 0) {
        const Comp = isSubmenu ? SidebarMenuSubButton : SidebarMenuButton;
        const isOpen = openSubmenus[item.label] || false; // Asegurar que isOpen tenga un valor booleano

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

      if (!effectiveHref && !item.children) return null; 

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

