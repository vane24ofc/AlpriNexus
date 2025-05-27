
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
  const [activeTheme, setActiveTheme] = useState('theme-light'); // Default for dashboard
  const [hasMountedLayout, setHasMountedLayout] = useState(false);

  useEffect(() => {
    setHasMountedLayout(true);
  }, []);

  useEffect(() => {
    if (!hasMountedLayout || typeof window === 'undefined') return; // Only run on client after layout mount

    let initialDashboardTheme: string;
    const storedTheme = localStorage.getItem('nexusAlpriTheme');

    if (storedTheme && VALID_THEME_CLASSES.includes(storedTheme)) {
      initialDashboardTheme = storedTheme;
    } else {
      initialDashboardTheme = 'theme-light'; // Dashboard defaults to light theme
      localStorage.setItem('nexusAlpriTheme', initialDashboardTheme);
    }
    
    setActiveTheme(initialDashboardTheme); 

    const root = window.document.documentElement;
    VALID_THEME_CLASSES.forEach(cls => root.classList.remove(cls));
    if (VALID_THEME_CLASSES.includes(initialDashboardTheme)) {
      root.classList.add(initialDashboardTheme);
    } else {
      root.classList.add('theme-light'); // Fallback to light
    }
  }, [hasMountedLayout]); 

  useEffect(() => {
    if (!hasMountedLayout || typeof window === 'undefined') return; // Only run on client after layout mount

    if (activeTheme && VALID_THEME_CLASSES.includes(activeTheme)) { 
        const root = window.document.documentElement;
        VALID_THEME_CLASSES.forEach(cls => root.classList.remove(cls));
        root.classList.add(activeTheme);
        localStorage.setItem('nexusAlpriTheme', activeTheme); 
    }
  }, [activeTheme, hasMountedLayout]); 

  useEffect(() => {
    if (!hasMountedLayout) { // Don't determine role until layout has mounted client-side
      return;
    }

    setIsLoadingRole(true);
    let roleFromStorage: Role | null = null;
    if (typeof window !== 'undefined') {
      roleFromStorage = localStorage.getItem('sessionRole') as Role | null;
    }

    let finalDeterminedRole: Role;

    if (pathname.startsWith('/dashboard/admin')) {
      finalDeterminedRole = 'administrador';
    } else if (pathname.startsWith('/dashboard/instructor')) {
      finalDeterminedRole = 'instructor';
    } else if (pathname.startsWith('/dashboard/student')) {
      finalDeterminedRole = 'estudiante';
    } else {
      // For generic dashboard paths, rely on localStorage or default to student
      if (roleFromStorage && ['administrador', 'instructor', 'estudiante'].includes(roleFromStorage)) {
        finalDeterminedRole = roleFromStorage;
      } else {
        finalDeterminedRole = 'estudiante'; // Default if no specific path and no valid role in storage
      }
    }
    
    // If the path dictated a specific role, ensure localStorage is updated.
    if (['/dashboard/admin', '/dashboard/instructor', '/dashboard/student'].some(p => pathname.startsWith(p))) {
         if (typeof window !== 'undefined' && localStorage.getItem('sessionRole') !== finalDeterminedRole) {
            localStorage.setItem('sessionRole', finalDeterminedRole);
         }
    } else if (typeof window !== 'undefined' && !roleFromStorage) { 
        // If it was a generic path and no role in storage, save the determined (default) role
        localStorage.setItem('sessionRole', finalDeterminedRole);
    }
    
    setCurrentSessionRole(prevRole => {
      if (prevRole !== finalDeterminedRole) {
        return finalDeterminedRole;
      }
      return prevRole;
    });
    setIsLoadingRole(false);
  }, [pathname, hasMountedLayout]); // Only re-run if pathname or hasMountedLayout changes

  const contextValue = useMemo(() => ({
    currentSessionRole,
    isLoadingRole
  }), [currentSessionRole, isLoadingRole]);

  // Show loader until layout has mounted AND role is determined AND role is not null
  if (!hasMountedLayout || isLoadingRole || !currentSessionRole) { 
    return <FullPageLoader message="Cargando panel y determinando rol..." />;
  }
  
  return (
    <SessionRoleContext.Provider value={contextValue}>
      <SidebarProvider defaultOpen={true}>
        <AppSidebarNav key={String(currentSessionRole) || 'loading-sidebar'} /> 
        <SidebarInset key="sidebar-inset">
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

