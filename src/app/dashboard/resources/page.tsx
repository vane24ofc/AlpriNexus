
"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FolderArchive } from 'lucide-react';

export default function ResourcesPagePlaceholder() {
  console.log("Rendering ResourcesPagePlaceholder...");
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight flex items-center">
        <FolderArchive className="mr-3 h-8 w-8 text-primary" />
        Recursos (Página de Prueba)
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Contenido de Prueba</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Si ves esto, la ruta /dashboard/resources está funcionando.</p>
          <p>El problema original de la página 404 está dentro del contenido complejo que tenía antes la página de Recursos, o en algún componente que utiliza.</p>
        </CardContent>
      </Card>
    </div>
  );
}
