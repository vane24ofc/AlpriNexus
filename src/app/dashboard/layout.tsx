
"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { AppHeader } from '@/components/layout/app-header';
import { AppSidebarNav } from '@/components/layout/app-sidebar-nav';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { FullPageLoader } from '@/components/ui/loader';
import { Button } from '@/components/ui/button';

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
    let determinedRole: Role = 'estudiante'; // Fallback inicial

    if (typeof window !== 'undefined') {
      const storedRole = localStorage.getItem('sessionRole') as Role | null;

      // Prioridad 1: Ruta específica de rol
      let roleFromPath: Role | null = null;
      if (pathname.startsWith('/dashboard/admin')) {
        roleFromPath = 'administrador';
      } else if (pathname.startsWith('/dashboard/instructor')) {
        roleFromPath = 'instructor';
      } else if (pathname.startsWith('/dashboard/student') && !pathname.startsWith('/dashboard/student/profile')) {
        // No queremos que /dashboard/student/profile fuerce el rol a estudiante si un admin/instructor lo visita
        roleFromPath = 'estudiante';
      }

      if (roleFromPath) {
        determinedRole = roleFromPath;
        // Si el rol deducido de la ruta es diferente del almacenado, actualiza localStorage
        if (storedRole !== determinedRole) {
          localStorage.setItem('sessionRole', determinedRole);
        }
      } else if (storedRole && ['administrador', 'instructor', 'estudiante'].includes(storedRole)) {
        // Prioridad 2: Rol almacenado, si la ruta es genérica (ej. /dashboard/settings)
        determinedRole = storedRole;
      } else {
        // Prioridad 3: Por defecto a estudiante y guardarlo, si no hay ruta específica ni rol almacenado válido
        localStorage.setItem('sessionRole', 'estudiante');
        determinedRole = 'estudiante';
      }
    }
    
    // Solo actualizar el estado si el rol determinado es diferente del actual
    // para evitar bucles de renderizado.
    if (determinedRole !== currentSessionRole) {
        setCurrentSessionRole(determinedRole);
    }
    setIsLoadingRole(false);
  }, [pathname]); // Removido currentSessionRole de las dependencias

  const contextValue = useMemo(() => ({
    currentSessionRole,
    isLoadingRole
  }), [currentSessionRole, isLoadingRole]);

  if (isLoadingRole && currentSessionRole === null) { // Mostrar cargador solo si realmente estamos cargando y el rol aún no está definido
    return <FullPageLoader message="Determinando rol..." />;
  }
  
  if (!currentSessionRole && !isLoadingRole) {
     return (
      <div className="flex h-screen flex-col items-center justify-center space-y-4 bg-background selection:bg-primary/40 selection:text-white">
        <p className="text-lg text-destructive">Error al determinar el rol. Por favor, intenta iniciar sesión de nuevo.</p>
        <Button onClick={() => typeof window !== 'undefined' && window.location.assign('/login')}>Ir a Login</Button>
      </div>
     );
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
