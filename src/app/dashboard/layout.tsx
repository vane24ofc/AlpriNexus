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
  // Theme state and effect moved here from RootLayout
  const [activeTheme, setActiveTheme] = useState('dark'); // Default theme for dashboard

  useEffect(() => {
    // Theme application logic
    let initialTheme = 'dark'; // Default for dashboard if nothing else is set
    const storedTheme = localStorage.getItem('nexusAlpriTheme');

    if (storedTheme && VALID_THEME_CLASSES.includes(storedTheme)) {
      initialTheme = storedTheme;
    } else {
      // Check system preference ONLY if no theme is stored for the dashboard
      if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
         initialTheme = 'theme-light';
      }
    }
    setActiveTheme(initialTheme);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Runs once on mount to load initial dashboard theme

  useEffect(() => {
    // Apply the active theme to the <html> tag
    if (typeof window !== 'undefined') {
        const root = window.document.documentElement;
        // Remove all known theme classes first
        VALID_THEME_CLASSES.forEach(cls => root.classList.remove(cls));
        // Add the current active theme class
        if (activeTheme) { // activeTheme should always have a value here
            root.classList.add(activeTheme);
        }
    }
  }, [activeTheme]); // Re-apply when activeTheme changes (e.g., from settings)


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
        finalDeterminedRole = 'estudiante'; // Default role if no specific path and no valid role in storage
      }
    }
    
    // Update localStorage if the path-derived role is different from what's stored
    // or if nothing was stored initially for a generic path
    if (typeof window !== 'undefined') {
        if ((pathname.startsWith('/dashboard/admin') || pathname.startsWith('/dashboard/instructor') || pathname.startsWith('/dashboard/student')) && localStorage.getItem('sessionRole') !== finalDeterminedRole) {
            localStorage.setItem('sessionRole', finalDeterminedRole);
        } else if (!roleFromStorage && !pathname.startsWith('/dashboard/admin') && !pathname.startsWith('/dashboard/instructor') && !pathname.startsWith('/dashboard/student')) {
            // If on a generic dashboard path and no role was in storage, set the default.
            localStorage.setItem('sessionRole', finalDeterminedRole);
        }
    }
    
    // Only update state if the determined role is different from the current state
    if (currentSessionRole !== finalDeterminedRole) {
      setCurrentSessionRole(finalDeterminedRole);
    }
    setIsLoadingRole(false);
  }, [pathname, currentSessionRole]); // Added currentSessionRole to dependencies to re-evaluate if it changes from other sources, though pathname is primary driver.

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
        <AppSidebarNav /> {/* Removed key={currentSessionRole || 'loading'} to see if it helps with key prop error */}
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
