
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
    
    let roleFromStorage: Role | null = null;
    if (typeof window !== 'undefined') {
      roleFromStorage = localStorage.getItem('sessionRole') as Role | null;
    }

    let roleFromPath: Role | null = null;
    if (pathname.startsWith('/dashboard/admin')) {
      roleFromPath = 'administrador';
    } else if (pathname.startsWith('/dashboard/instructor')) {
      roleFromPath = 'instructor';
    } else if (pathname.startsWith('/dashboard/student')) {
      roleFromPath = 'estudiante';
    }
    // No asignamos un rol basado en /dashboard aquí, para que no sobreescriba
    // un rol más específico si el usuario está, por ejemplo, en /dashboard/admin/users

    let finalDeterminedRole: Role = 'estudiante'; // Fallback default

    if (roleFromPath) {
      // Si la URL actual define un rol (ej. /admin), ese es el rol que queremos usar.
      finalDeterminedRole = roleFromPath;
      if (typeof window !== 'undefined' && roleFromStorage !== finalDeterminedRole) {
        localStorage.setItem('sessionRole', finalDeterminedRole);
      }
    } else if (roleFromStorage && ['administrador', 'instructor', 'estudiante'].includes(roleFromStorage)) {
      // Si la URL no define un rol (ej. /resources), usamos el que esté en localStorage.
      finalDeterminedRole = roleFromStorage;
    } else {
      // Si no hay nada en la ruta ni en localStorage, usamos el default y lo guardamos.
      if (typeof window !== 'undefined') {
        localStorage.setItem('sessionRole', 'estudiante');
      }
      finalDeterminedRole = 'estudiante';
    }
    
    // Solo actualizamos el estado si el rol determinado es realmente diferente
    // del que ya está en el estado, para evitar bucles.
    if (currentSessionRole !== finalDeterminedRole) {
      setCurrentSessionRole(finalDeterminedRole);
    }
    
    setIsLoadingRole(false);

  }, [pathname]); // Depender solo de pathname para re-evaluar esta lógica central.
                 // currentSessionRole no debe estar aquí para evitar bucles si la lógica interna
                 // no es perfectamente idempotente con él como dependencia.

  const contextValue = useMemo(() => ({
    currentSessionRole,
    isLoadingRole
  }), [currentSessionRole, isLoadingRole]);

  // Mostrar el cargador si el rol aún se está determinando o si no hay un rol válido aún.
  // Esto es crucial para la hidratación: el servidor renderizará esto (ya que no tiene localStorage)
  // y el cliente también en su primer render antes de que useEffect se ejecute.
  if (isLoadingRole || !currentSessionRole) { 
    return <FullPageLoader message="Determinando rol y cargando panel..." />;
  }
  
  return (
    <SessionRoleContext.Provider value={contextValue}>
      <SidebarProvider defaultOpen={true}>
        {/* Forzar un re-montado de AppSidebarNav si el rol cambia, para limpiar cualquier estado interno */}
        <AppSidebarNav key={currentSessionRole} /> 
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
