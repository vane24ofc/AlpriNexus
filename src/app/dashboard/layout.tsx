
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
  const [activeTheme, setActiveTheme] = useState(''); // Default to empty, let useEffect handle it
  const [hasMountedLayout, setHasMountedLayout] = useState(false);

  useEffect(() => {
    setHasMountedLayout(true);
  }, []);

  useEffect(() => {
    if (!hasMountedLayout) return; // Only run on client after mount

    let initialDashboardTheme: string;
    const storedTheme = localStorage.getItem('nexusAlpriTheme');

    if (storedTheme && VALID_THEME_CLASSES.includes(storedTheme)) {
      initialDashboardTheme = storedTheme;
    } else {
      // Default to light theme for the dashboard if no preference is stored
      initialDashboardTheme = 'theme-light'; 
      localStorage.setItem('nexusAlpriTheme', initialDashboardTheme);
    }
    
    setActiveTheme(initialDashboardTheme);
    const root = window.document.documentElement;
    VALID_THEME_CLASSES.forEach(cls => root.classList.remove(cls));
    if (VALID_THEME_CLASSES.includes(initialDashboardTheme)) {
      root.classList.add(initialDashboardTheme);
    } else { // Fallback if somehow an invalid theme was stored
      root.classList.add('theme-light');
    }
  }, [hasMountedLayout]);

  // Effect for applying theme changes when activeTheme state changes
  useEffect(() => {
    if (!hasMountedLayout || !activeTheme) return; // Don't run if not mounted or no theme set

    if (VALID_THEME_CLASSES.includes(activeTheme)) {
        const root = window.document.documentElement;
        VALID_THEME_CLASSES.forEach(cls => root.classList.remove(cls));
        root.classList.add(activeTheme);
        localStorage.setItem('nexusAlpriTheme', activeTheme);
    }
  }, [activeTheme, hasMountedLayout]);

  // Effect for determining and persisting user role
  useEffect(() => {
    if (!hasMountedLayout) return; // Only run on client after layout has mounted

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
      finalDeterminedRole = 'estudiante'; // Default if no specific path and nothing in storage
      localStorage.setItem('sessionRole', finalDeterminedRole);
    }
    
    // Only update state if the role has actually changed to prevent unnecessary re-renders
    if (currentSessionRole !== finalDeterminedRole) {
      setCurrentSessionRole(finalDeterminedRole);
    }
    setIsLoadingRole(false);

  }, [pathname, hasMountedLayout]); // currentSessionRole removed from dependencies here

  const contextValue = useMemo(() => ({
    currentSessionRole,
    isLoadingRole
  }), [currentSessionRole, isLoadingRole]);

  // Show loader until layout is mounted and role is determined
  if (!hasMountedLayout || isLoadingRole || !currentSessionRole) {
    return <FullPageLoader message="Cargando panel y determinando rol..." />;
  }
  
  return (
    <SessionRoleContext.Provider value={contextValue}>
      {/* Keying SidebarProvider ensures its children (including AppSidebarNav) remount cleanly if role changes */}
      <SidebarProvider key={String(currentSessionRole)} defaultOpen={true}>
        <AppSidebarNav /> {/* AppSidebarNav will use its own hasMounted for its skeleton */}
        <SidebarInset key="sidebar-inset"> {/* Static key for SidebarInset */}
          <AppHeader /> {/* AppHeader also has its own hasMounted for its skeleton */}
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
