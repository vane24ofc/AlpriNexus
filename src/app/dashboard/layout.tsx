
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
    
    if (activeTheme !== initialDashboardTheme) {
      setActiveTheme(initialDashboardTheme);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  useEffect(() => {
    if (typeof window !== 'undefined') {
        const root = window.document.documentElement;
        VALID_THEME_CLASSES.forEach(cls => root.classList.remove(cls));
        if (activeTheme && VALID_THEME_CLASSES.includes(activeTheme)) { 
            root.classList.add(activeTheme);
        } else {
            root.classList.add('theme-light'); // Fallback
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
      if (roleFromStorage && ['administrador', 'instructor', 'estudiante'].includes(roleFromStorage)) {
        finalDeterminedRole = roleFromStorage;
      } else {
        finalDeterminedRole = 'estudiante'; 
      }
    }
    
    if (typeof window !== 'undefined') {
        if (['/dashboard/admin', '/dashboard/instructor', '/dashboard/student'].some(p => pathname.startsWith(p))) {
             if (localStorage.getItem('sessionRole') !== finalDeterminedRole) {
                localStorage.setItem('sessionRole', finalDeterminedRole);
             }
        } else if (!roleFromStorage) { // If on a generic dashboard path and no role was in storage, set the determined role.
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
        {/* Re-added key to AppSidebarNav to force re-mount on role change */}
        <AppSidebarNav key={String(currentSessionRole) || 'loading-sidebar'} />
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
