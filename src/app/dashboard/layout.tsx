
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
    let newRoleBasedOnPath: Role | null = null;
    if (pathname.startsWith('/dashboard/admin')) {
      newRoleBasedOnPath = 'administrador';
    } else if (pathname.startsWith('/dashboard/instructor')) {
      newRoleBasedOnPath = 'instructor';
    } else if (pathname.startsWith('/dashboard/student')) {
      newRoleBasedOnPath = 'estudiante';
    }

    // Si la ruta actual define un rol específico (newRoleBasedOnPath no es null)
    // Y ese rol es diferente del rol actualmente en el estado (currentSessionRole)
    // Entonces, actualizamos el estado.
    if (newRoleBasedOnPath && newRoleBasedOnPath !== currentSessionRole) {
      setCurrentSessionRole(newRoleBasedOnPath);
    }
    // Si newRoleBasedOnPath es null (es decir, estamos en una ruta genérica como /resources o /calendar),
    // no hacemos nada, y currentSessionRole conserva su valor anterior.
    // Esto asegura que el rol persista durante la navegación a páginas compartidas.
    // El comportamiento por defecto ('estudiante') se aplica si el usuario llega directamente a
    // una ruta genérica sin haber establecido un rol previamente desde una ruta específica.
  }, [pathname, currentSessionRole]); // Es importante incluir currentSessionRole aquí para que el efecto se re-ejecute si el rol cambia por otras razones y necesita ser re-evaluado contra el pathname.

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
