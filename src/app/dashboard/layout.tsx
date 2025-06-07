
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
  const [activeTheme, setActiveTheme] = useState(''); // Inicialmente vacío
  const [hasMountedLayout, setHasMountedLayout] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfileData>({ name: '', email: '' });

  // 1. Marcar como montado
  useEffect(() => {
    setHasMountedLayout(true);
  }, []);

  // 2. Cargar y establecer el tema DESPUÉS de que el componente se haya montado
  useEffect(() => {
    if (!hasMountedLayout) return;

    let initialTheme: string;
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);

    if (storedTheme && VALID_THEME_CLASSES.includes(storedTheme)) {
      initialTheme = storedTheme;
    } else {
      initialTheme = 'theme-light'; // Default theme
      localStorage.setItem(THEME_STORAGE_KEY, initialTheme);
    }
    setActiveTheme(initialTheme); // Esto disparará el siguiente useEffect para aplicar la clase
  }, [hasMountedLayout]);

  // 3. Aplicar la clase del tema al DOM cuando activeTheme cambie Y el layout esté montado
  useEffect(() => {
    if (!hasMountedLayout || !activeTheme) return;

    if (VALID_THEME_CLASSES.includes(activeTheme)) {
      const root = window.document.documentElement;
      VALID_THEME_CLASSES.forEach(cls => root.classList.remove(cls));
      root.classList.add(activeTheme);
      // No es necesario guardar en localStorage aquí si ya se hizo al determinar initialTheme
    }
  }, [activeTheme, hasMountedLayout]);

  // 4. Lógica de sesión (ya estaba bastante bien, pero la revisamos)
  const fetchAndSetSession = useCallback(async () => {
    // No establecer isLoadingRole aquí, se maneja en el useEffect de llamada
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
      setIsLoadingRole(false); // Marcar como cargado aquí, después de todo el proceso
    }
  }, [router]);

  useEffect(() => {
    if (!hasMountedLayout) return;

    setIsLoadingRole(true); // Iniciar carga de rol
    const roleFromStorage = localStorage.getItem(SESSION_ROLE_STORAGE_KEY) as Role | null;
    const storedProfileString = localStorage.getItem(USER_PROFILE_STORAGE_KEY);
    
    if (roleFromStorage && storedProfileString) {
      try {
        const storedProfile = JSON.parse(storedProfileString);
        setCurrentSessionRole(roleFromStorage); // Establecer tentativamente desde localStorage
        setUserProfile(storedProfile);
        fetchAndSetSession(); // Verificar con el backend
      } catch (e) {
        console.error("Error parsing stored session data, fetching from API:", e);
        fetchAndSetSession();
      }
    } else {
      fetchAndSetSession();
    }
  }, [hasMountedLayout, fetchAndSetSession]);
  
  // 5. Guardar perfil de usuario en localStorage si cambia (ya estaba bien)
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

  // El loader se muestra si el layout no ha montado O si el rol aún está cargando O si no hay rol (y no se ha redirigido aún)
  if (!hasMountedLayout || isLoadingRole) {
    return <FullPageLoader message="Verificando sesión y cargando panel..." />;
  }
  
  // Si después de cargar, no hay rol, fetchAndSetSession ya debería haber redirigido.
  // Pero si por alguna razón llegamos aquí sin rol, es un estado inválido.
  if (!currentSessionRole) {
     // Este FullPageLoader es más un fallback en caso de que la redirección de fetchAndSetSession falle o tarde.
    return <FullPageLoader message="Redirigiendo a inicio de sesión..." />;
  }

  return (
    <SessionRoleContext.Provider value={contextValue}>
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
    </SessionRoleContext.Provider>
  );
}
