
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
    setIsLoadingRole(true);
    let determinedRole: Role = 'estudiante'; // Default fallback
    const storedRole = typeof window !== 'undefined' ? localStorage.getItem('sessionRole') as Role | null : null;

    let roleFromPath: Role | null = null;
    if (pathname.startsWith('/dashboard/admin')) {
      roleFromPath = 'administrador';
    } else if (pathname.startsWith('/dashboard/instructor')) {
      roleFromPath = 'instructor';
    } else if (pathname.startsWith('/dashboard/student')) {
      roleFromPath = 'estudiante';
    }

    if (roleFromPath) {
      determinedRole = roleFromPath;
      if (typeof window !== 'undefined' && storedRole !== determinedRole) {
        localStorage.setItem('sessionRole', determinedRole);
      }
    } else if (storedRole && ['administrador', 'instructor', 'estudiante'].includes(storedRole)) {
      determinedRole = storedRole;
    } else {
      if (typeof window !== 'undefined') {
        localStorage.setItem('sessionRole', 'estudiante');
      }
      determinedRole = 'estudiante';
    }
    
    if (currentSessionRole !== determinedRole) {
      setCurrentSessionRole(determinedRole);
    }
    setIsLoadingRole(false); 
  }, [pathname]); // Removed currentSessionRole from deps to avoid potential loops

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
        <AppSidebarNav key={currentSessionRole} /> {/* Added key here */}
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
