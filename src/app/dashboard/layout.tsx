
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AppHeader } from '@/components/layout/app-header';
import { AppSidebarNav } from '@/components/layout/app-sidebar-nav';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Loader2 } from 'lucide-react'; // For loading state

export type Role = 'administrador' | 'instructor' | 'estudiante';

interface SessionRoleContextType {
  currentSessionRole: Role | null; // Allow null during loading
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
  const [currentSessionRole, setCurrentSessionRole] = useState<Role | null>(null);
  const [isLoadingRole, setIsLoadingRole] = useState(true);

  useEffect(() => {
    // This effect runs only on the client after mount
    const storedRole = localStorage.getItem('sessionRole') as Role;
    let determinedRole: Role = 'estudiante'; // Default role

    if (storedRole && ['administrador', 'instructor', 'estudiante'].includes(storedRole)) {
      determinedRole = storedRole; // Use stored role if valid
    }
    
    // Check if the current path implies a specific role
    // Path-based role takes precedence and updates localStorage if different.
    let roleFromPath: Role | null = null;
    if (pathname.startsWith('/dashboard/admin')) {
      roleFromPath = 'administrador';
    } else if (pathname.startsWith('/dashboard/instructor')) {
      roleFromPath = 'instructor';
    } else if (pathname.startsWith('/dashboard/student') && !pathname.startsWith('/dashboard/student/profile')) {
      // Ensure profile page doesn't override if user is admin/instructor visiting student profile
      // This specific condition might need refinement based on how student profiles are accessed by other roles.
      // For now, if it's clearly a student section path, set role to student.
      roleFromPath = 'estudiante';
    }

    if (roleFromPath && roleFromPath !== determinedRole) {
        determinedRole = roleFromPath;
        localStorage.setItem('sessionRole', determinedRole);
    } else if (!roleFromPath && !storedRole) {
        // If path is generic (e.g. /dashboard) AND there was no stored role,
        // ensure default 'estudiante' is stored.
        localStorage.setItem('sessionRole', determinedRole); 
    }
    
    setCurrentSessionRole(determinedRole);
    setIsLoadingRole(false);

  }, [pathname]); // Re-evaluate when path changes

  if (isLoadingRole) {
    return (
      <div className="flex h-screen flex-col items-center justify-center space-y-4 bg-background selection:bg-primary/40 selection:text-white">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">Cargando panel...</p>
      </div>
    );
  }
  
  // Fallback if role determination fails, though 'estudiante' default should prevent currentSessionRole from being null here
  if (!currentSessionRole) {
     return (
      <div className="flex h-screen flex-col items-center justify-center space-y-4 bg-background selection:bg-primary/40 selection:text-white">
        <p className="text-lg text-destructive">Error al determinar el rol. Por favor, intenta iniciar sesión de nuevo.</p>
        {/* Optionally, add a button to redirect to login */}
      </div>
     );
  }

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
