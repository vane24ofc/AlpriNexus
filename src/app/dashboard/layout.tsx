
"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { AppHeader } from '@/components/layout/app-header';
import { AppSidebarNav } from '@/components/layout/app-sidebar-nav';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { FullPageLoader } from '@/components/ui/loader';

export type Role = 'administrador' | 'instructor' | 'estudiante';

interface UserProfileData {
  name: string;
  email: string;
}

interface SessionRoleContextType {
  currentSessionRole: Role | null;
  isLoadingRole: boolean;
  userProfile: UserProfileData;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfileData>>;
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

const USER_PROFILE_STORAGE_KEY = 'nexusAlpriUserProfile';
const SESSION_ROLE_STORAGE_KEY = 'sessionRole';
const THEME_STORAGE_KEY = 'nexusAlpriTheme';

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
  const [userProfile, setUserProfile] = useState<UserProfileData>({ name: '', email: '' });

  useEffect(() => {
    setHasMountedLayout(true);
  }, []);

  useEffect(() => {
    if (!hasMountedLayout) return;

    let initialTheme: string;
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);

    if (storedTheme && VALID_THEME_CLASSES.includes(storedTheme)) {
      initialTheme = storedTheme;
    } else {
      initialTheme = 'theme-light';
      localStorage.setItem(THEME_STORAGE_KEY, initialTheme);
    }
    setActiveTheme(initialTheme);
  }, [hasMountedLayout]);

  useEffect(() => {
    if (!hasMountedLayout || !activeTheme) return;

    if (VALID_THEME_CLASSES.includes(activeTheme)) {
      const root = window.document.documentElement;
      VALID_THEME_CLASSES.forEach(cls => root.classList.remove(cls));
      root.classList.add(activeTheme);
      localStorage.setItem(THEME_STORAGE_KEY, activeTheme);
    }
  }, [activeTheme, hasMountedLayout]);

  useEffect(() => {
    if (!hasMountedLayout) {
      setIsLoadingRole(true);
      return;
    }
    setIsLoadingRole(true);

    let roleFromStorage = localStorage.getItem(SESSION_ROLE_STORAGE_KEY) as Role | null;
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
        localStorage.setItem(SESSION_ROLE_STORAGE_KEY, finalDeterminedRole);
        roleFromStorage = finalDeterminedRole; // Update roleFromStorage for profile loading
      }
    } else if (roleFromStorage && ['administrador', 'instructor', 'estudiante'].includes(roleFromStorage)) {
      finalDeterminedRole = roleFromStorage;
    } else {
      finalDeterminedRole = 'estudiante';
      localStorage.setItem(SESSION_ROLE_STORAGE_KEY, finalDeterminedRole);
      roleFromStorage = finalDeterminedRole; // Update roleFromStorage for profile loading
    }

    if (currentSessionRole !== finalDeterminedRole) {
      setCurrentSessionRole(finalDeterminedRole);
    }

    // Load or set default user profile based on the determined role
    const storedProfile = localStorage.getItem(USER_PROFILE_STORAGE_KEY);
    if (storedProfile) {
      try {
        setUserProfile(JSON.parse(storedProfile));
      } catch (e) {
        console.error("Error parsing stored user profile", e);
        // Fallback to default if parsing fails
        const defaultName = `${finalDeterminedRole.charAt(0).toUpperCase() + finalDeterminedRole.slice(1)} Usuario`;
        const defaultEmail = `${finalDeterminedRole}@example.com`;
        const defaultProfile = { name: defaultName, email: defaultEmail };
        setUserProfile(defaultProfile);
        localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(defaultProfile));
      }
    } else {
      const defaultName = `${finalDeterminedRole.charAt(0).toUpperCase() + finalDeterminedRole.slice(1)} Usuario`;
      const defaultEmail = `${finalDeterminedRole}@example.com`;
      const defaultProfile = { name: defaultName, email: defaultEmail };
      setUserProfile(defaultProfile);
      localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(defaultProfile));
    }

    setIsLoadingRole(false);
  }, [pathname, hasMountedLayout]); // currentSessionRole removed to simplify and rely on pathname + localStorage

  // Effect to save userProfile to localStorage whenever it changes
  useEffect(() => {
    if (hasMountedLayout && userProfile.name && userProfile.email) { // Ensure it's not empty initial state
      localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(userProfile));
    }
  }, [userProfile, hasMountedLayout]);


  const contextValue = useMemo(() => ({
    currentSessionRole,
    isLoadingRole,
    userProfile,
    setUserProfile,
  }), [currentSessionRole, isLoadingRole, userProfile, setUserProfile]);

  if (!hasMountedLayout || isLoadingRole || !currentSessionRole) {
    return <FullPageLoader message="Cargando panel y determinando rol..." />;
  }

  return (
    <SessionRoleContext.Provider value={contextValue}>
      <SidebarProvider key={String(currentSessionRole)} defaultOpen={true}> {/* Keying SidebarProvider */}
        <AppSidebarNav key={`sidebar-nav-${String(currentSessionRole)}`} />
        <SidebarInset key="sidebar-inset"> {/* Static key for SidebarInset */}
          <AppHeader key={`header-${String(currentSessionRole)}`} />
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
