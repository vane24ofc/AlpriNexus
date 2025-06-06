
"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { AppHeader } from '@/components/layout/app-header';
import { AppSidebarNav } from '@/components/layout/app-sidebar-nav';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { FullPageLoader } from '@/components/ui/loader';

export type Role = 'administrador' | 'instructor' | 'estudiante';

interface UserProfileData {
  id?: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
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
  const router = useRouter();
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
    }
  }, [activeTheme, hasMountedLayout]);

  const fetchAndSetSession = useCallback(async () => {
    try {
      const response = await fetch('/api/me');
      if (response.ok) {
        const data = await response.json();
        if (data && data.role && data.name && data.email) {
          setCurrentSessionRole(data.role as Role);
          setUserProfile({ id: data.id, name: data.name, email: data.email, avatarUrl: data.avatarUrl });
          localStorage.setItem(SESSION_ROLE_STORAGE_KEY, data.role);
          localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify({ id: data.id, name: data.name, email: data.email, avatarUrl: data.avatarUrl }));
        } else {
          throw new Error('Datos de sesión incompletos desde /api/me');
        }
      } else {
        localStorage.removeItem(SESSION_ROLE_STORAGE_KEY);
        localStorage.removeItem(USER_PROFILE_STORAGE_KEY);
        router.push('/login?sessionError=true');
      }
    } catch (error) {
      console.error("Error fetching session from /api/me:", error);
      localStorage.removeItem(SESSION_ROLE_STORAGE_KEY);
      localStorage.removeItem(USER_PROFILE_STORAGE_KEY);
      router.push('/login?fetchError=true');
    } finally {
      setIsLoadingRole(false); 
    }
  }, [router]);

  useEffect(() => {
    if (!hasMountedLayout) return;

    setIsLoadingRole(true); 
    const roleFromStorage = localStorage.getItem(SESSION_ROLE_STORAGE_KEY) as Role | null;
    const storedProfileString = localStorage.getItem(USER_PROFILE_STORAGE_KEY);
    
    if (roleFromStorage && storedProfileString) {
      try {
        const storedProfile = JSON.parse(storedProfileString);
        setCurrentSessionRole(roleFromStorage); 
        setUserProfile(storedProfile);
        fetchAndSetSession(); 
      } catch (e) {
        console.error("Error parsing stored session data, fetching from API:", e);
        fetchAndSetSession();
      }
    } else {
      fetchAndSetSession();
    }
  }, [hasMountedLayout, fetchAndSetSession]);
  
  useEffect(() => {
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

  if (!hasMountedLayout || isLoadingRole) {
    return <FullPageLoader message="Verificando sesión y cargando panel..." />;
  }
  
  if (!currentSessionRole) {
    return <FullPageLoader message="Redirigiendo a inicio de sesión..." />;
  }

  return (
    <SessionRoleContext.Provider value={contextValue}>
      <SidebarProvider defaultOpen={true}> {/* Removed role-based key */}
        <AppSidebarNav /> {/* Removed role-based key */}
        <SidebarInset> {/* Removed role-based key */}
          <AppHeader /> {/* Removed role-based key */}
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
