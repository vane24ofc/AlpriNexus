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
  href: string;
  label: string;
  icon: React.ElementType;
  roles?: string[]; // 'admin', 'instructor', 'student'
  children?: NavItem[];
  badge?: string;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'instructor', 'student'] },
  {
    label: 'Management',
    icon: Users,
    roles: ['admin'],
    children: [
      { href: '/dashboard/admin', label: 'Admin Overview', icon: ShieldCheck },
      { href: '/dashboard/admin/users', label: 'User Management', icon: Users },
      { href: '/dashboard/admin/courses', label: 'Course Management', icon: BookOpen },
    ],
  },
  {
    label: 'Instructor Tools',
    icon: BookOpen, // Re-using BookOpen as a general instructor icon
    roles: ['instructor'],
    children: [
      { href: '/dashboard/instructor', label: 'My Dashboard', icon: LayoutDashboard },
      { href: '/dashboard/instructor/my-courses', label: 'My Courses', icon: BookOpen },
      { href: '/dashboard/instructor/students', label: 'My Students', icon: Users },
      { href: '/dashboard/resources', label: 'Upload Content', icon: UploadCloud, roles: ['instructor', 'admin'] },
    ],
  },
  {
    label: 'Student Portal',
    icon: GraduationCap,
    roles: ['student'],
    children: [
      { href: '/dashboard/student', label: 'My Dashboard', icon: LayoutDashboard },
      { href: '/dashboard/student/my-courses', label: 'Enrolled Courses', icon: BookOpen },
      { href: '/dashboard/student/progress', label: 'My Progress', icon: BarChart3 },
      { href: '/dashboard/student/profile', label: 'My Profile', icon: User },
    ],
  },
  { href: '/dashboard/resources', label: 'Resources', icon: FolderArchive, roles: ['admin', 'instructor', 'student'], badge: "New" },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings, roles: ['admin', 'instructor', 'student'] },
];

// Mock current user role
const currentUserRole = 'student'; // Change this to 'admin', 'instructor', or 'student' to test

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
        const isOpen = openSubmenus[item.label] || false;
        return (
          <SidebarMenuItem key={item.label}>
            <Comp
              onClick={() => toggleSubmenu(item.label)}
              className="justify-between"
              isActive={item.children.some(child => pathname === child.href)}
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
        <SidebarMenuItem key={item.href}>
          <Comp
            asChild
            isActive={pathname === item.href}
            tooltip={item.label}
          >
            <Link href={item.href}>
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
              {item.badge && (
                <span className={cn(
                  "ml-auto inline-block rounded-full px-2 py-0.5 text-xs",
                  pathname === item.href ? "bg-sidebar-primary-foreground text-sidebar-primary" : "bg-sidebar-accent text-sidebar-accent-foreground"
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
          <Logo className="h-8 w-auto group-data-[collapsible=icon]:h-7 group-data-[collapsible=icon]:w-7" />
          <span className="font-semibold group-data-[collapsible=icon]:hidden">AlpriNexus</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {renderNavItems(filteredNavItems)}
        </SidebarMenu>
        
        <SidebarGroup className="mt-auto group-data-[collapsible=icon]:px-0">
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">Support</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Help & Support">
                    <Link href="#">
                        <LifeBuoy />
                        <span className="group-data-[collapsible=icon]:hidden">Help & Support</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Send Feedback">
                    <Link href="#">
                        <MessageSquare />
                        <span className="group-data-[collapsible=icon]:hidden">Send Feedback</span>
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

// Helper icon for Admin Overview
function ShieldCheck(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
  )
}
// Helper icon for User Profile
function User(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
  )
}
