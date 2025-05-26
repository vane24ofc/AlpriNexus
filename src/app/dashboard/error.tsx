
"use client";

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Opcionalmente, registrar el error en un servicio de monitoreo
    console.error("Dashboard Error Boundary Caught:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-6 bg-background">
      <AlertTriangle className="h-16 w-16 text-destructive mb-6" />
      <h2 className="text-3xl font-semibold text-destructive mb-3">
        ¡Ups! Algo salió mal en el panel.
      </h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        Hemos encontrado un error inesperado. Puedes intentar recargar la página o volver más tarde.
      </p>
      {error?.message && (
         <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md mb-6 max-w-xl">
            Detalle del error: {error.message}
        </p>
      )}
      <Button
        onClick={
          // Intenta recuperarte volviendo a renderizar el segmento
          () => reset()
        }
        className="bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        Intentar de Nuevo
      </Button>
    </div>
  );
}
