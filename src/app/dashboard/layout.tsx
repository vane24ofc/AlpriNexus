
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image'; // Importar Image
import { AppHeader } from '@/components/layout/app-header';
import { AppSidebarNav } from '@/components/layout/app-sidebar-nav';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Loader2 } from 'lucide-react'; 

export type Role = 'administrador' | 'instructor' | 'estudiante';

interface SessionRoleContextType {
  currentSessionRole: Role | null; 
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
      determinedRole = storedRole; 
    }
    
    // Path-based role detection can override or set initial if no localStorage.
    let roleFromPath: Role | null = null;
    if (pathname.startsWith('/dashboard/admin')) {
      roleFromPath = 'administrador';
    } else if (pathname.startsWith('/dashboard/instructor')) {
      roleFromPath = 'instructor';
    } else if (pathname.startsWith('/dashboard/student') && !pathname.startsWith('/dashboard/student/profile')) {
      roleFromPath = 'estudiante';
    }

    if (roleFromPath && roleFromPath !== determinedRole) {
        determinedRole = roleFromPath;
        localStorage.setItem('sessionRole', determinedRole); // Update localStorage if path dictates a change
    } else if (!roleFromPath && !storedRole) {
        // If path is generic (e.g. /dashboard, /calendar) AND there was no stored role,
        // ensure default 'estudiante' is stored.
        localStorage.setItem('sessionRole', determinedRole); 
    }
    
    setCurrentSessionRole(determinedRole);
    setIsLoadingRole(false);

  }, [pathname]);

  if (isLoadingRole) {
    return (
      <div className="flex h-screen flex-col items-center justify-center space-y-4 bg-background selection:bg-primary/40 selection:text-white">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">Cargando panel...</p>
      </div>
    );
  }
  
  if (!currentSessionRole) {
     return (
      <div className="flex h-screen flex-col items-center justify-center space-y-4 bg-background selection:bg-primary/40 selection:text-white">
        <p className="text-lg text-destructive">Error al determinar el rol. Por favor, intenta iniciar sesión de nuevo.</p>
      </div>
     );
  }

  return (
    <SessionRoleContext.Provider value={{ currentSessionRole }}>
      <SidebarProvider defaultOpen={true}>
        <AppSidebarNav />
        <SidebarInset>
          <AppHeader />
          <main className="relative flex-1 overflow-auto p-4 md:p-6 lg:p-8"> {/* Añadido relative aquí */}
            {children}
            <Image
              src="/Logo-Manchas-SAS (2).png"
              alt="Alprigrama S.A.S"
              width={800} // Ancho original de la imagen
              height={742} // Alto original de la imagen
              className="fixed bottom-5 right-5 z-0 h-auto w-20 opacity-30 pointer-events-none"
              data-ai-hint="brand watermark logo"
            />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </SessionRoleContext.Provider>
  );
}
