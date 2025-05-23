
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSessionRole } from '@/app/dashboard/layout';
import { Loader2 } from 'lucide-react';

export default function DashboardRedirectPage() {
  const router = useRouter();
  const { currentSessionRole } = useSessionRole();

  useEffect(() => {
    let targetPath = '/dashboard/student'; // Default fallback
    if (currentSessionRole === 'administrador') {
      targetPath = '/dashboard/admin';
    } else if (currentSessionRole === 'instructor') {
      targetPath = '/dashboard/instructor';
    } else if (currentSessionRole === 'estudiante') {
      targetPath = '/dashboard/student';
    }
    // Asegurarse de que la redirección ocurra solo si la ruta actual es exactamente /dashboard
    // y no una subruta de rol que ya es el destino. Esto evita bucles si el rol cambia lentamente.
    if (router.pathname === '/dashboard') {
        router.replace(targetPath);
    }
  }, [currentSessionRole, router]);

  // Solo mostrar el cargador si estamos efectivamente en /dashboard y esperando la redirección
  if (typeof window !== 'undefined' && window.location.pathname === '/dashboard') {
    return (
        <div className="flex h-screen flex-col items-center justify-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">Redirigiendo a tu panel...</p>
        </div>
    );
  }

  // Si ya estamos en una subruta o el componente se renderiza incorrectamente fuera de /dashboard,
  // no mostrar nada o un fallback mínimo para evitar contenido flash no deseado.
  // Idealmente, este componente solo se monta para la ruta /dashboard.
  return null; 
}
