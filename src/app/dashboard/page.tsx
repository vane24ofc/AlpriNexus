
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
    router.replace(targetPath);
  }, [currentSessionRole, router]);

  return (
    <div className="flex h-screen flex-col items-center justify-center space-y-4">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="text-lg text-muted-foreground">Redirigiendo a tu panel...</p>
    </div>
  );
}
