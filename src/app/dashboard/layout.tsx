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

const VALID_THEME_CLASSES = [
  'theme-light',
  'dark',
  'theme-oceanic',
  'theme-sunset',
  'theme-forest',
  'theme-monochrome-midnight',
  'theme-crimson-night',
  'theme-lavender-haze',
  'theme-spring-meadow',
  'theme-steel-blue',
  'theme-vintage-paper',
  'theme-royal-gold',
  'theme-sakura-blossom',
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [currentSessionRole, setCurrentSessionRole] = useState<Role | null>(null);
  const [isLoadingRole, setIsLoadingRole] = useState(true);
  const [activeTheme, setActiveTheme] = useState('');
  const [hasMountedLayout, setHasMountedLayout] = useState(false);

  useEffect(() => {
    setHasMountedLayout(true);
  }, []);

  useEffect(() => {
    if (!hasMountedLayout) return;

    let initialDashboardTheme: string;
    const storedTheme = localStorage.getItem('nexusAlpriTheme');

    if (storedTheme && VALID_THEME_CLASSES.includes(storedTheme)) {
      initialDashboardTheme = storedTheme;
    } else {
      initialDashboardTheme = 'theme-light'; 
      localStorage.setItem('nexusAlpriTheme', initialDashboardTheme);
    }
    
    setActiveTheme(initialDashboardTheme);
    // Apply theme here directly
    const root = window.document.documentElement;
    VALID_THEME_CLASSES.forEach(cls => root.classList.remove(cls));
    if (VALID_THEME_CLASSES.includes(initialDashboardTheme)) {
      root.classList.add(initialDashboardTheme);
    } else {
      root.classList.add('theme-light');
    }
  }, [hasMountedLayout]);

  useEffect(() => {
    if (!hasMountedLayout || !activeTheme) return;

    if (VALID_THEME_CLASSES.includes(activeTheme)) {
        const root = window.document.documentElement;
        VALID_THEME_CLASSES.forEach(cls => root.classList.remove(cls));
        root.classList.add(activeTheme);
        localStorage.setItem('nexusAlpriTheme', activeTheme);
    }
  }, [activeTheme, hasMountedLayout]);

  useEffect(() => {
    if (!hasMountedLayout) {
      setIsLoadingRole(true); 
      return;
    }

    setIsLoadingRole(true);
    let roleFromStorage: Role | null = localStorage.getItem('sessionRole') as Role | null;
    let pathDefinesRole: Role | null = null;

    if (pathname.startsWith('/dashboard/admin')) {
      pathDefinesRole = 'administrador';
    } else if (pathname.startsWith('/dashboard/instructor')) {
      pathDefinesRole = 'instructor';
    } else if (pathname.startsWith('/dashboard/student')) {
      pathDefinesRole = 'estudiante';
    }

    let finalDeterminedRole: Role;

    if (pathDefinesRole) {
      finalDeterminedRole = pathDefinesRole;
      if (roleFromStorage !== finalDeterminedRole) {
        localStorage.setItem('sessionRole', finalDeterminedRole);
      }
    } else if (roleFromStorage && ['administrador', 'instructor', 'estudiante'].includes(roleFromStorage)) {
      finalDeterminedRole = roleFromStorage;
    } else {
      finalDeterminedRole = 'estudiante'; 
      localStorage.setItem('sessionRole', finalDeterminedRole);
    }
    
    if (currentSessionRole !== finalDeterminedRole) {
      setCurrentSessionRole(finalDeterminedRole);
    }
    setIsLoadingRole(false);

  }, [pathname, hasMountedLayout]); // currentSessionRole is intentionally not a dependency here to avoid loops based on its own update


  const contextValue = useMemo(() => ({
    currentSessionRole,
    isLoadingRole
  }), [currentSessionRole, isLoadingRole]);

  if (!hasMountedLayout || isLoadingRole || !currentSessionRole) {
    return <FullPageLoader message="Cargando panel y determinando rol..." />;
  }
  
  return (
    <SessionRoleContext.Provider value={contextValue}>
      {/* Keying SidebarProvider ensures its children remount cleanly if role changes */}
      <SidebarProvider key={currentSessionRole || 'provider-loading'} defaultOpen={true}>
        <AppSidebarNav key={`sidebar-nav-${currentSessionRole || 'loading'}`} />
        <SidebarInset key="sidebar-inset"> {/* Static key for SidebarInset */}
          <AppHeader key={`header-${currentSessionRole || 'loading'}`} />
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
