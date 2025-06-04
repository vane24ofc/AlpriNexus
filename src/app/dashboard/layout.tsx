
"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation'; // Import useRouter
import Image from 'next/image';
import { AppHeader } from '@/components/layout/app-header';
import { AppSidebarNav } from '@/components/layout/app-sidebar-nav';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { FullPageLoader } from '@/components/ui/loader';
import { TooltipProvider } from "@/components/ui/tooltip";

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
  const router = useRouter(); // Initialize useRouter
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

    setIsLoadingRole(true);

    const roleFromStorage = localStorage.getItem(SESSION_ROLE_STORAGE_KEY) as Role | null;
    const storedProfileString = localStorage.getItem(USER_PROFILE_STORAGE_KEY);
    let storedProfile: UserProfileData | null = null;
    if (storedProfileString) {
        try {
            storedProfile = JSON.parse(storedProfileString);
        } catch (e) {
            console.error("Error parsing stored user profile for layout", e);
            localStorage.removeItem(USER_PROFILE_STORAGE_KEY); // Clear corrupted data
        }
    }

    let pathDefinesRole: Role | null = null;
    if (pathname.startsWith('/dashboard/admin')) pathDefinesRole = 'administrador';
    else if (pathname.startsWith('/dashboard/instructor')) pathDefinesRole = 'instructor';
    else if (pathname.startsWith('/dashboard/student')) pathDefinesRole = 'estudiante';


    if (!roleFromStorage && !pathDefinesRole) {
      // No role in storage and path doesn't define one, redirect to login
      router.push('/login');
      // setIsLoadingRole will be set to false in the main logic path,
      // but since we're redirecting, the component might unmount.
      // To be safe, and prevent brief rendering of loader, we could also set it here:
      // setIsLoadingRole(false);
      return; // Stop further processing in this effect if redirecting
    }
    
    if (!storedProfile && !pathname.startsWith('/login') && !pathname.startsWith('/register')) {
        // If no profile and not on auth pages, also redirect.
        // This handles cases where role might be set but profile is missing.
        router.push('/login');
        return;
    }


    let finalDeterminedRole: Role;
    if (pathDefinesRole) {
      finalDeterminedRole = pathDefinesRole;
      if (roleFromStorage !== finalDeterminedRole) {
        localStorage.setItem(SESSION_ROLE_STORAGE_KEY, finalDeterminedRole);
      }
    } else if (roleFromStorage && ['administrador', 'instructor', 'estudiante'].includes(roleFromStorage)) {
      finalDeterminedRole = roleFromStorage;
    } else {
      // This case should ideally be caught by the redirect above if roleFromStorage is null
      // If pathDefinesRole is null & roleFromStorage is invalid/null, it redirects.
      // If pathDefinesRole exists, it's used.
      // This is a fallback, might indicate an issue if reached.
      console.warn("DashboardLayout: Defaulting role unexpectedly. Check logic.");
      finalDeterminedRole = 'estudiante';
      localStorage.setItem(SESSION_ROLE_STORAGE_KEY, finalDeterminedRole);
    }
    
    setCurrentSessionRole(prevRole => (prevRole !== finalDeterminedRole ? finalDeterminedRole : prevRole));
    
    if (storedProfile) {
        setUserProfile(storedProfile);
    } else {
      // If we reach here AND storedProfile is null, it implies pathDefinesRole was set.
      // We still need a default profile for this initial setup if it was missing.
      const defaultName = `${finalDeterminedRole.charAt(0).toUpperCase() + finalDeterminedRole.slice(1)} Usuario`;
      const defaultEmail = `${finalDeterminedRole}@example.com`;
      const newProfile = { name: defaultName, email: defaultEmail };
      setUserProfile(newProfile);
      localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(newProfile));
    }

    setIsLoadingRole(false);

  }, [pathname, hasMountedLayout, router]);


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
    // Save profile to localStorage whenever it changes, but only if valid name/email exist
    if (hasMountedLayout && userProfile.name && userProfile.email) {
      localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(userProfile));
    }
  }, [userProfile, hasMountedLayout]);

  const contextValue = useMemo(() => ({
    currentSessionRole,
    isLoadingRole,
    userProfile,
    setUserProfile,
  }), [currentSessionRole, isLoadingRole, userProfile]);

  // If isLoadingRole is true, or if currentSessionRole is null (and we're not already redirecting from the effect), show loader.
  // The redirect logic in useEffect should handle cases where role/profile are missing.
  if (!hasMountedLayout || isLoadingRole || !currentSessionRole) {
    return <FullPageLoader message="Cargando panel y determinando sesión..." />;
  }

  return (
    <SessionRoleContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <SidebarProvider key={`sp-${String(currentSessionRole)}`} defaultOpen={true}>
          <AppSidebarNav key={`asn-${String(currentSessionRole)}`} />
          <SidebarInset key={`si-${String(currentSessionRole)}`}>
            <AppHeader key={`ah-${String(currentSessionRole)}`} />
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
      </TooltipProvider>
    </SessionRoleContext.Provider>
  );
}

