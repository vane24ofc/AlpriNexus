
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AppHeader } from '@/components/layout/app-header';
import { AppSidebarNav } from '@/components/layout/app-sidebar-nav';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

type Role = 'administrador' | 'instructor' | 'estudiante';

interface SessionRoleContextType {
  currentSessionRole: Role;
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
  const [currentSessionRole, setCurrentSessionRole] = useState<Role>('estudiante'); // Default

  useEffect(() => {
    if (pathname.startsWith('/dashboard/admin')) {
      setCurrentSessionRole('administrador');
    } else if (pathname.startsWith('/dashboard/instructor')) {
      setCurrentSessionRole('instructor');
    } else if (pathname.startsWith('/dashboard/student')) {
      setCurrentSessionRole('estudiante');
    }
    // If pathname is generic (e.g., /dashboard/resources, /dashboard/settings, /dashboard),
    // currentSessionRole will retain its value from the last specific path.
  }, [pathname]);

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
