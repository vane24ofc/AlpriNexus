
"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { AppHeader } from '@/components/layout/app-header';
import { AppSidebarNav } from '@/components/layout/app-sidebar-nav';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { FullPageLoader } from '@/components/ui/loader';

export type Role = 'administrador' | 'instructor' | 'estudiante';

interface SessionRoleContextType {
  currentSessionRole: Role | null;
  isLoadingRole: boolean;
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
    // This effect runs only on the client
    setIsLoadingRole(true);
    
    const storedRole = typeof window !== 'undefined' ? localStorage.getItem('sessionRole') as Role | null : null;
    let activeRoleDetermination: Role = 'estudiante'; // Fallback default

    let roleFromPath: Role | null = null;
    if (pathname.startsWith('/dashboard/admin')) {
      roleFromPath = 'administrador';
    } else if (pathname.startsWith('/dashboard/instructor')) {
      roleFromPath = 'instructor';
    } else if (pathname.startsWith('/dashboard/student')) {
      roleFromPath = 'estudiante';
    }

    if (roleFromPath) {
      activeRoleDetermination = roleFromPath;
      if (typeof window !== 'undefined' && storedRole !== activeRoleDetermination) {
        localStorage.setItem('sessionRole', activeRoleDetermination);
      }
    } else if (storedRole && ['administrador', 'instructor', 'estudiante'].includes(storedRole)) {
      activeRoleDetermination = storedRole;
    } else {
      // If no role from path and no valid stored role, default to 'estudiante' and store it.
      if (typeof window !== 'undefined') {
          localStorage.setItem('sessionRole', 'estudiante');
      }
      activeRoleDetermination = 'estudiante';
    }
    
    // Only update state if it's different, to avoid unnecessary re-renders.
    if (currentSessionRole !== activeRoleDetermination) {
      setCurrentSessionRole(activeRoleDetermination);
    }
    setIsLoadingRole(false); 
  }, [pathname]); // Depend only on pathname. currentSessionRole removed to prevent potential loops.

  const contextValue = useMemo(() => ({
    currentSessionRole,
    isLoadingRole
  }), [currentSessionRole, isLoadingRole]);

  if (isLoadingRole || !currentSessionRole) { 
    return <FullPageLoader message="Determinando rol y cargando panel..." />;
  }
  
  return (
    <SessionRoleContext.Provider value={contextValue}>
      <SidebarProvider defaultOpen={true}>
        <AppSidebarNav />
        <SidebarInset>
          <AppHeader />
          <main className="relative flex-1 overflow-auto p-4 md:p-6 lg:p-8">
            {children}
            <Image
              src="/Logo-Manchas-SAS (2).png"
              alt="Alprigrama S.A.S"
              width={800}
              height={742}
              className="fixed bottom-5 right-5 z-0 h-auto w-20 opacity-30 pointer-events-none"
              data-ai-hint="brand watermark logo"
            />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </SessionRoleContext.Provider>
  );
}
