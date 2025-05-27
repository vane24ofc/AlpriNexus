
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
  const [activeTheme, setActiveTheme] = useState('theme-light'); // Default dashboard theme

  useEffect(() => {
    // Theme application logic for dashboard
    let initialDashboardTheme: string;
    const storedTheme = localStorage.getItem('nexusAlpriTheme');

    if (storedTheme && VALID_THEME_CLASSES.includes(storedTheme)) {
      initialDashboardTheme = storedTheme;
    } else {
      initialDashboardTheme = 'theme-light'; // Default for dashboard
      localStorage.setItem('nexusAlpriTheme', initialDashboardTheme);
    }
    
    setActiveTheme(initialDashboardTheme); // Set state once

    // Apply the determined theme
    const root = window.document.documentElement;
    VALID_THEME_CLASSES.forEach(cls => root.classList.remove(cls));
    if (VALID_THEME_CLASSES.includes(initialDashboardTheme)) {
      root.classList.add(initialDashboardTheme);
    } else {
      root.classList.add('theme-light'); // Fallback
    }
  }, []); // Runs once on mount

  // Effect to update theme if activeTheme state changes (e.g., from settings page)
  useEffect(() => {
    if (typeof window !== 'undefined') {
        const root = window.document.documentElement;
        VALID_THEME_CLASSES.forEach(cls => root.classList.remove(cls));
        if (activeTheme && VALID_THEME_CLASSES.includes(activeTheme)) { 
            root.classList.add(activeTheme);
            localStorage.setItem('nexusAlpriTheme', activeTheme); // Persist change
        } else {
            root.classList.add('theme-light'); // Fallback
            localStorage.setItem('nexusAlpriTheme', 'theme-light');
        }
    }
  }, [activeTheme]); 


  useEffect(() => {
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
      // For generic dashboard paths, use stored role or default to student
      if (roleFromStorage && ['administrador', 'instructor', 'estudiante'].includes(roleFromStorage)) {
        finalDeterminedRole = roleFromStorage;
      } else {
        finalDeterminedRole = 'estudiante'; 
      }
    }
    
    // Update localStorage if a specific path determined a role different from storage,
    // or if no role was in storage for a generic path.
    if (typeof window !== 'undefined') {
        if (['/dashboard/admin', '/dashboard/instructor', '/dashboard/student'].some(p => pathname.startsWith(p))) {
             if (localStorage.getItem('sessionRole') !== finalDeterminedRole) {
                localStorage.setItem('sessionRole', finalDeterminedRole);
             }
        } else if (!roleFromStorage && finalDeterminedRole) { 
            localStorage.setItem('sessionRole', finalDeterminedRole);
        }
    }
    
    if (currentSessionRole !== finalDeterminedRole) {
      setCurrentSessionRole(finalDeterminedRole);
    }
    setIsLoadingRole(false);
  }, [pathname]); // Only depends on pathname to re-evaluate role determination strategy

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
        {/* Re-added key to AppSidebarNav to force re-mount on role change, 
            ensuring a clean state for the sidebar.
            Use String(currentSessionRole) to handle null initial value gracefully.
        */}
        <AppSidebarNav key={String(currentSessionRole)} /> 
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
