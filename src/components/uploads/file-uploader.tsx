
"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, XCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface UploadedFile {
  file: File;
  id: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

export function FileUploader() {
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substring(7), // Simple unique ID
      progress: 0,
      status: 'uploading',
    }));
    setFiles(prevFiles => [...prevFiles, ...newFiles]);
  }, []);

  useEffect(() => {
    // Simulate upload progress for new files
    files.filter(f => f.status === 'uploading' && f.progress === 0).forEach(uploadedFile => {
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += Math.floor(Math.random() * 10) + 10; // Simulate variable progress
        if (currentProgress >= 100) {
          clearInterval(interval);
          setFiles(prev =>
            prev.map(f =>
              f.id === uploadedFile.id ? { ...f, progress: 100, status: Math.random() > 0.2 ? 'success' : 'error', error: Math.random() <= 0.2 ? 'Fallo al subir: Problema de red' : undefined } : f
            )
          );
        } else {
          setFiles(prev =>
            prev.map(f => (f.id === uploadedFile.id ? { ...f, progress: currentProgress } : f))
          );
        }
      }, 200 + Math.random() * 300); // Randomize interval for more realistic simulation
    });
  }, [files]);


  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.png', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
      'video/*': ['.mp4', '.mov', '.avi'],
      'application/msword': ['.doc', '.docx'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-powerpoint': ['.ppt', '.pptx'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
    }
  });

  const removeFile = (id: string) => {
    setFiles(prevFiles => prevFiles.filter(file => file.id !== id));
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']; // Standard abbreviations, often not translated
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <Card className="w-full shadow-xl">
      <CardHeader>
        <CardTitle>Subir Recursos</CardTitle>
        <CardDescription>Arrastra y suelta archivos o haz clic para buscar. Admite imágenes, PDF, videos y documentos.</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          {...getRootProps()}
          className={`flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors
            ${isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/70 hover:bg-muted/50'}`}
        >
          <input {...getInputProps()} />
          <UploadCloud className={`w-16 h-16 mb-4 ${isDragActive ? 'text-primary' : 'text-muted-foreground'}`} />
          {isDragActive ? (
            <p className="text-lg font-semibold text-primary">Suelta los archivos aquí...</p>
          ) : (
            <>
              <p className="text-lg font-semibold">Arrastra y suelta archivos aquí, o haz clic para seleccionar archivos</p>
              <p className="text-sm text-muted-foreground">Tamaño máximo de archivo: 50MB</p>
            </>
          )}
        </div>

        {files.length > 0 && (
          <div className="mt-6">
            <h4 className="text-lg font-semibold mb-3">Archivos Subidos ({files.length})</h4>
            <ScrollArea className="h-[200px] pr-3">
              <ul className="space-y-3">
                {files.map(uploadedFile => (
                  <li key={uploadedFile.id} className="flex items-center p-3 border rounded-lg bg-card space-x-3 shadow-sm">
                    <FileText className="w-8 h-8 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{uploadedFile.file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatBytes(uploadedFile.file.size)}</p>
                      {uploadedFile.status === 'uploading' && (
                        <Progress value={uploadedFile.progress} className="h-1.5 mt-1" />
                      )}
                      {uploadedFile.status === 'success' && (
                        <Badge variant="default" className="mt-1 bg-accent text-accent-foreground">
                          <CheckCircle className="w-3 h-3 mr-1" /> Éxito
                        </Badge>
                      )}
                      {uploadedFile.status === 'error' && (
                        <Badge variant="destructive" className="mt-1">
                          <XCircle className="w-3 h-3 mr-1" /> Error: {uploadedFile.error || 'Fallo al subir'}
                        </Badge>
                      )}
                    </div>
                    {uploadedFile.status === 'uploading' && (
                       <Loader2 className="w-5 h-5 text-muted-foreground animate-spin shrink-0" />
                    )}
                    {(uploadedFile.status === 'success' || uploadedFile.status === 'error') && (
                      <Button variant="ghost" size="icon" onClick={() => removeFile(uploadedFile.id)} className="text-muted-foreground hover:text-destructive shrink-0">
                        <XCircle className="w-5 h-5" />
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </div>
        )}
         {files.length > 0 && (
            <div className="mt-6 flex justify-end gap-2">
                 <Button variant="outline" onClick={() => setFiles([])}>Limpiar Todo</Button>
                 <Button className="bg-primary hover:bg-primary/90">Iniciar Subida ({files.filter(f => f.status === 'uploading' && f.progress < 100).length})</Button>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
