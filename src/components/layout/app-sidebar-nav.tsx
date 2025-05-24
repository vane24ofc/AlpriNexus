
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
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useSessionRole, Role } from '@/app/dashboard/layout'; 
// Importación faltante
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
      { href: '/dashboard/instructor/my-courses', label: 'Mis Cursos', icon: BookOpen }, 
    ],
  },
  {
    label: 'Portal del Estudiante',
    icon: GraduationCap,
    roles: ['estudiante'],
    children: [
      { href: '/dashboard/student/my-courses', label: 'Cursos Inscritos', icon: BookOpen }, 
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
  
  const dashboardPath = '/dashboard'; // Todos los roles van a /dashboard para el panel principal

  const getFilteredNavItems = (): NavItem[] => {
    if (!currentSessionRole) return [];

    return navItems.reduce((acc, item) => {
      if (!item.roles || item.roles.includes(currentSessionRole)) {
        let newItem = { ...item };
        
        if (newItem.label === 'Panel Principal') {
            newItem.href = dashboardPath;
        }

        if (item.children) {
          newItem.children = item.children.filter(child => {
            // Si el hijo tiene roles definidos, verificar si el rol actual está incluido.
            // Si el hijo no tiene roles definidos, se asume que es visible para el rol padre.
            if (child.roles && !child.roles.includes(currentSessionRole)) {
              return false;
            }
            // Eliminar los enlaces redundantes a paneles principales de rol si es que aún existieran en la definición
             if (['Resumen de Admin', 'Mi Panel (Instructor)', 'Mi Panel (Estudiante)'].includes(child.label)) {
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
  };
  
  const filteredNavItems = getFilteredNavItems();

  const toggleSubmenu = (label: string) => {
    setOpenSubmenus(prev => ({ ...prev, [label]: !prev[label] }));
  };
  
 useEffect(() => {
    const activeSubmenus: Record<string, boolean> = {};
    filteredNavItems.forEach(item => {
      if (item.children) {
        // Abre el submenú si la ruta actual comienza con la ruta de alguno de sus hijos
        // O si la ruta actual es exactamente la del item padre (si el item padre es un enlace)
        const isChildActive = item.children.some(child => child.href && pathname.startsWith(child.href as string));
        const isParentActive = item.href && pathname === item.href;

        if (isChildActive || isParentActive) {
          activeSubmenus[item.label] = true;
        }
      }
    });
    if (Object.keys(activeSubmenus).length > 0) {
        setOpenSubmenus(prev => ({ ...prev, ...activeSubmenus }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, currentSessionRole]); // No añadir filteredNavItems directamente para evitar bucles si su referencia cambia


  const renderNavItems = (items: NavItem[], isSubmenu = false) => {
    return items.map((item) => {
      // El href efectivo es el href del item, o el dashboardPath si el label es "Panel Principal"
      const effectiveHref = item.href || (item.label === 'Panel Principal' ? dashboardPath : undefined);

      if (item.children && item.children.length > 0) {
        const Comp = isSubmenu ? SidebarMenuSubButton : SidebarMenuButton;
        const isOpen = openSubmenus[item.label] || false;

        // Un grupo está activo si su propio enlace (si existe) está activo, o si alguno de sus hijos está activo.
        const isGroupActive = (effectiveHref && pathname === effectiveHref) || 
                              item.children.some(child => child.href && pathname.startsWith(child.href as string));
        
        // Si el ítem es un agrupador sin href propio (solo tiene hijos),
        // el estado activo se determina puramente por sus hijos.
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

      // Si no tiene hijos o los hijos fueron filtrados y no tiene un href propio, no renderizar nada.
      if (!effectiveHref) return null; 

      const Comp = isSubmenu ? SidebarMenuSubButton : SidebarMenuButton;
      return (
        <SidebarMenuItem key={effectiveHref || item.label}>
          <Comp
            asChild
            isActive={pathname === effectiveHref || (effectiveHref && pathname.startsWith(effectiveHref) && effectiveHref !== dashboardPath) }
            tooltip={item.label}
          >
            <Link href={effectiveHref}>
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
              {item.badge && (
                <span className={cn(
                  "ml-auto inline-block rounded-full px-2 py-0.5 text-xs",
                  (pathname === effectiveHref || (effectiveHref && pathname.startsWith(effectiveHref))) ? "bg-sidebar-primary-foreground text-sidebar-primary" : "bg-sidebar-accent text-sidebar-accent-foreground"
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

