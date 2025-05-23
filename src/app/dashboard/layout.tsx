
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
    let newRole: Role | null = null;
    if (pathname.startsWith('/dashboard/admin')) {
      newRole = 'administrador';
    } else if (pathname.startsWith('/dashboard/instructor')) {
      newRole = 'instructor';
    } else if (pathname.startsWith('/dashboard/student')) {
      newRole = 'estudiante';
    }

    // Solo actualiza el rol si se ha determinado un nuevo rol específico
    // y es diferente del rol actual.
    // Si newRole es null (para rutas genéricas como /dashboard/calendar o /dashboard/resources),
    // el currentSessionRole persistirá desde la última ruta específica de rol visitada.
    if (newRole && newRole !== currentSessionRole) {
      setCurrentSessionRole(newRole);
    }
    // Si el usuario aterriza directamente en una ruta genérica y el currentSessionRole
    // es aún el 'estudiante' inicial, se mantendrá como 'estudiante', lo cual es
    // el comportamiento esperado si no hay contexto de un rol previo.
  }, [pathname, currentSessionRole]); // Añadido currentSessionRole a las dependencias

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
