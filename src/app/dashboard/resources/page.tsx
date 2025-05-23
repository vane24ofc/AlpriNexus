
"use client";

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { FileUploader } from "@/components/uploads/file-uploader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, FileText, Shield, BookOpen } from 'lucide-react';

interface ResourceFile {
  id: string;
  name: string;
  type: string; // e.g., 'PDF', 'Video', 'Documento'
  size: string;
  uploadDate: string;
  url?: string; // Para la descarga, por ahora #
}

const sampleCompanyResources: ResourceFile[] = [
  { id: 'cr1', name: 'Políticas Internas Q4 2023.pdf', type: 'PDF', size: '2.5 MB', uploadDate: '2023-10-15', url: '#' },
  { id: 'cr2', name: 'Plan Estratégico 2024.docx', type: 'Documento', size: '1.2 MB', uploadDate: '2023-11-01', url: '#' },
  { id: 'cr3', name: 'Guía de Marca AlpriNexus.pdf', type: 'PDF', size: '5.0 MB', uploadDate: '2023-09-20', url: '#' },
];

const sampleLearningResources: ResourceFile[] = [
  { id: 'lr1', name: 'Introducción a JavaScript - Módulo 1.mp4', type: 'Video', size: '150 MB', uploadDate: '2023-11-05', url: '#' },
  { id: 'lr2', name: 'Ejercicios Prácticos de Python.pdf', type: 'PDF', size: '800 KB', uploadDate: '2023-11-02', url: '#' },
  { id: 'lr3', name: 'Presentación - Desarrollo Web Moderno.pptx', type: 'Presentación', size: '3.5 MB', uploadDate: '2023-10-28', url: '#' },
  { id: 'lr4', name: 'Glosario de Términos de IA.docx', type: 'Documento', size: '450 KB', uploadDate: '2023-11-10', url: '#' },
];

export default function ResourcesPage() {
  const pathname = usePathname();
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (pathname.startsWith('/dashboard/admin')) {
      setCurrentUserRole('administrador');
    } else if (pathname.startsWith('/dashboard/instructor')) {
      setCurrentUserRole('instructor');
    } else if (pathname.startsWith('/dashboard/student')) {
      setCurrentUserRole('estudiante');
    } else {
      // Por defecto, podría ser estudiante o un rol base si se accede a /dashboard/resources directamente
      // Asumamos estudiante si no es específico, o adaptarlo según la lógica de roles global
      setCurrentUserRole('estudiante'); 
    }
  }, [pathname]);

  const canUpload = currentUserRole === 'administrador' || currentUserRole === 'instructor';

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight">Gestión de Recursos</CardTitle>
          <CardDescription>
            {canUpload
              ? "Sube y gestiona los materiales de tu curso, documentos y otros recursos. Los estudiantes podrán visualizar los 'Archivos de Aprendizaje'."
              : "Visualiza y descarga los archivos de aprendizaje disponibles para tus cursos."}
          </CardDescription>
        </CardHeader>
      </Card>

      {canUpload && (
        <FileUploader />
      )}

      {currentUserRole === 'administrador' && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center"><Shield className="mr-2 h-6 w-6 text-primary" />Recursos de la Empresa</CardTitle>
            <CardDescription>Archivos importantes y documentos internos de la organización. Visible solo para administradores.</CardDescription>
          </CardHeader>
          <CardContent>
            {sampleCompanyResources.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px] hidden md:table-cell"></TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead className="hidden sm:table-cell">Tipo</TableHead>
                    <TableHead className="hidden md:table-cell">Tamaño</TableHead>
                    <TableHead className="hidden lg:table-cell">Fecha de Subida</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sampleCompanyResources.map((file) => (
                    <TableRow key={file.id}>
                      <TableCell className="hidden md:table-cell">
                        <FileText className="h-6 w-6 text-muted-foreground" />
                      </TableCell>
                      <TableCell className="font-medium">{file.name}</TableCell>
                      <TableCell className="hidden sm:table-cell">{file.type}</TableCell>
                      <TableCell className="hidden md:table-cell">{file.size}</TableCell>
                      <TableCell className="hidden lg:table-cell">{file.uploadDate}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" asChild>
                          <a href={file.url} download={file.name}><Download className="mr-2 h-4 w-4" /> Descargar</a>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No hay recursos de empresa disponibles.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center"><BookOpen className="mr-2 h-6 w-6 text-accent" />Archivos de Aprendizaje</CardTitle>
          <CardDescription>Materiales de estudio, videos, y documentos para los cursos. Visible para todos los usuarios.</CardDescription>
        </CardHeader>
        <CardContent>
          {sampleLearningResources.length > 0 ? (
             <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px] hidden md:table-cell"></TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead className="hidden sm:table-cell">Tipo</TableHead>
                    <TableHead className="hidden md:table-cell">Tamaño</TableHead>
                    <TableHead className="hidden lg:table-cell">Fecha de Subida</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sampleLearningResources.map((file) => (
                    <TableRow key={file.id}>
                      <TableCell className="hidden md:table-cell">
                        <FileText className="h-6 w-6 text-muted-foreground" />
                      </TableCell>
                      <TableCell className="font-medium">{file.name}</TableCell>
                      <TableCell className="hidden sm:table-cell">{file.type}</TableCell>
                      <TableCell className="hidden md:table-cell">{file.size}</TableCell>
                      <TableCell className="hidden lg:table-cell">{file.uploadDate}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" asChild>
                          <a href={file.url} download={file.name}><Download className="mr-2 h-4 w-4" /> Descargar</a>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No hay archivos de aprendizaje disponibles en este momento.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
