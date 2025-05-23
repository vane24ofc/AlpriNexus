
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
  UploadCloud,
  FolderArchive,
  MessageSquare,
  LifeBuoy,
  ChevronDown,
  ChevronRight,
  Shield, // Using Shield for Admin Overview as ShieldCheck is custom
  User as UserIconLucide, // Renaming to avoid conflict with custom User
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
import { Button } from '@/components/ui/button';
import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface NavItem {
  href?: string; // Optional if it's a parent item
  label: string;
  icon: React.ElementType;
  roles?: string[]; // 'administrador', 'instructor', 'estudiante'
  children?: NavItem[];
  badge?: string;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Panel Principal', icon: LayoutDashboard, roles: ['administrador', 'instructor', 'estudiante'] },
  {
    label: 'Gestión',
    icon: Users, // Changed to a generic icon as ShieldCheck was custom
    roles: ['administrador'],
    children: [
      { href: '/dashboard/admin', label: 'Resumen de Admin', icon: Shield },
      { href: '/dashboard/admin/users', label: 'Gestión de Usuarios', icon: Users },
      { href: '/dashboard/admin/courses', label: 'Gestión de Cursos', icon: BookOpen },
    ],
  },
  {
    label: 'Herramientas de Instructor',
    icon: BookOpen,
    roles: ['instructor'],
    children: [
      { href: '/dashboard/instructor', label: 'Mi Panel', icon: LayoutDashboard },
      { href: '/dashboard/instructor/my-courses', label: 'Mis Cursos', icon: BookOpen },
      { href: '/dashboard/instructor/students', label: 'Mis Estudiantes', icon: Users },
      { href: '/dashboard/resources', label: 'Subir Contenido', icon: UploadCloud, roles: ['instructor', 'administrador'] },
    ],
  },
  {
    label: 'Portal del Estudiante',
    icon: GraduationCap,
    roles: ['estudiante'],
    children: [
      { href: '/dashboard/student', label: 'Mi Panel', icon: LayoutDashboard },
      { href: '/dashboard/student/my-courses', label: 'Cursos Inscritos', icon: BookOpen },
      { href: '/dashboard/student/progress', label: 'Mi Progreso', icon: BarChart3 },
      { href: '/dashboard/student/profile', label: 'Mi Perfil', icon: UserIconLucide },
    ],
  },
  { href: '/dashboard/resources', label: 'Recursos', icon: FolderArchive, roles: ['administrador', 'instructor', 'estudiante'], badge: "Nuevo" },
  { href: '/dashboard/settings', label: 'Configuración', icon: Settings, roles: ['administrador', 'instructor', 'estudiante'] },
];

// Mock current user role
const currentUserRole = 'estudiante'; // Change this to 'administrador', 'instructor', or 'estudiante' to test

export function AppSidebarNav() {
  const pathname = usePathname();
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});

  const toggleSubmenu = (label: string) => {
    setOpenSubmenus(prev => ({ ...prev, [label]: !prev[label] }));
  };
  
  const filteredNavItems = navItems.filter(item => 
    !item.roles || item.roles.includes(currentUserRole)
  ).map(item => ({
    ...item,
    children: item.children?.filter(child => !child.roles || child.roles.includes(currentUserRole))
  }));

  const renderNavItems = (items: NavItem[], isSubmenu = false) => {
    return items.map((item) => {
      if (item.children && item.children.length > 0) {
        const Comp = isSubmenu ? SidebarMenuSubButton : SidebarMenuButton;
        const isOpen = openSubmenus[item.label] || item.children.some(child => child.href && pathname.startsWith(child.href)); // Keep submenu open if a child is active
        
        // Initialize open state based on active child for first render
        React.useEffect(() => {
          if (item.children.some(child => child.href && pathname.startsWith(child.href))) {
            if (!openSubmenus[item.label]) { // Only set if not already explicitly toggled
                 setOpenSubmenus(prev => ({ ...prev, [item.label]: true }));
            }
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

      const Comp = isSubmenu ? SidebarMenuSubButton : SidebarMenuButton;
      return (
        <SidebarMenuItem key={item.href || item.label}>
          <Comp
            asChild
            isActive={item.href ? pathname === item.href : false}
            tooltip={item.label}
          >
            <Link href={item.href || '#'}>
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
              {item.badge && (
                <span className={cn(
                  "ml-auto inline-block rounded-full px-2 py-0.5 text-xs",
                  item.href && pathname === item.href ? "bg-sidebar-primary-foreground text-sidebar-primary" : "bg-sidebar-accent text-sidebar-accent-foreground"
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
        <Link href="/dashboard" className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
          <Logo className="h-8 w-auto group-data-[collapsible=icon]:h-7 group-data-[collapsible=icon]:w-7" href={undefined} />
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

