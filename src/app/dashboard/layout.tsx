
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AppHeader } from '@/components/layout/app-header';
import { AppSidebarNav } from '@/components/layout/app-sidebar-nav';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

export type Role = 'administrador' | 'instructor' | 'estudiante';

interface SessionRoleContextType {
  currentSessionRole: Role;
  setCurrentSessionRole_DO_NOT_USE_DIRECTLY?: (role: Role) => void; // For internal layout use if ever needed
}

const SessionRoleContext = createContext<SessionRoleContextType | undefined>(undefined);

export function useSessionRole() {
  const context = useContext(SessionRoleContext);
  if (context === undefined) {
    throw new Error('useSessionRole must be used within a SessionRoleProvider');
  }
  return context;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  const [currentSessionRole, setCurrentSessionRole] = useState<Role>(() => {
    if (typeof window !== 'undefined') {
      const storedRole = localStorage.getItem('sessionRole') as Role;
      if (storedRole && ['administrador', 'instructor', 'estudiante'].includes(storedRole)) {
        return storedRole;
      }
    }
    return 'estudiante'; // Default if nothing in localStorage or SSR
  });

  useEffect(() => {
    // This effect primarily handles role changes based on direct navigation to specific role paths
    // (e.g., /dashboard/admin) and ensures localStorage is updated.
    // It also re-confirms role from localStorage if path is generic and role state might be stale.

    let roleFromPath: Role | null = null;
    if (pathname.startsWith('/dashboard/admin')) {
      roleFromPath = 'administrador';
    } else if (pathname.startsWith('/dashboard/instructor')) {
      roleFromPath = 'instructor';
    } else if (pathname.startsWith('/dashboard/student') && !pathname.startsWith('/dashboard/student/profile')) {
      //  Ensure /dashboard/student/profile doesn't incorrectly set role to 'estudiante' if current role is different
      //  and user is just visiting their profile.
      //  The main student dashboard is /dashboard/student or just /dashboard if role is student.
      //  The page /dashboard handles displaying student content if role is student.
      roleFromPath = 'estudiante';
    }

    if (roleFromPath) {
      // If path implies a specific role
      if (roleFromPath !== currentSessionRole) {
        setCurrentSessionRole(roleFromPath);
        if (typeof window !== 'undefined') {
          localStorage.setItem('sessionRole', roleFromPath);
        }
      }
    } else {
      // If path is generic (e.g., /dashboard, /dashboard/resources, /dashboard/calendar)
      // Ensure currentSessionRole is aligned with localStorage.
      // This is a safeguard, as initialState function for useState should handle initial load.
      if (typeof window !== 'undefined') {
        const storedRole = localStorage.getItem('sessionRole') as Role;
        if (storedRole && storedRole !== currentSessionRole && ['administrador', 'instructor', 'estudiante'].includes(storedRole)) {
           setCurrentSessionRole(storedRole);
        }
      }
    }
  }, [pathname, currentSessionRole]); // currentSessionRole in dependency to re-sync localStorage if it changes internally.

  return (
    <SessionRoleContext.Provider value={{ currentSessionRole }}>
      <SidebarProvider defaultOpen={true}>
        <AppSidebarNav />
        <SidebarInset>
          <AppHeader />
          <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </SessionRoleContext.Provider>
  );
}
