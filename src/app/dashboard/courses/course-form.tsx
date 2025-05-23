
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { ImageUp, PlusCircle, Trash2, Save, Send } from 'lucide-react';
import Image from 'next/image';
import type { Course, Lesson } from '@/types/course';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useSessionRole } from '@/app/dashboard/layout';

const lessonSchema = z.object({
  id: z.string().optional(), // Puede ser opcional si se genera al añadir
  title: z.string().min(3, { message: "El título de la lección debe tener al menos 3 caracteres." }),
});

const courseFormSchema = z.object({
  title: z.string().min(5, { message: "El título del curso debe tener al menos 5 caracteres." }),
  description: z.string().min(20, { message: "La descripción debe tener al menos 20 caracteres." }),
  thumbnailFile: z.instanceof(File).optional().nullable(), // Para el input de archivo
  lessons: z.array(lessonSchema).min(1, { message: "El curso debe tener al menos una lección." }),
  interactiveContent: z.string().optional(),
});

type CourseFormValues = z.infer<typeof courseFormSchema>;

interface CourseFormProps {
  initialData?: Course; // Para editar
  onSubmitCourse: (data: CourseFormValues, thumbnailUrl?: string) => Promise<void>; // thumbnailUrl es string si ya existe o se subió
  isSubmitting: boolean;
}

export default function CourseForm({ initialData, onSubmitCourse, isSubmitting }: CourseFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const { currentSessionRole } = useSessionRole();
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(initialData?.thumbnailUrl || null);
  const thumbnailFileRef = useRef<HTMLInputElement>(null);

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      thumbnailFile: null,
      lessons: initialData?.lessons || [{ title: '' }],
      interactiveContent: initialData?.interactiveContent || '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lessons",
  });

  const handleThumbnailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({ variant: "destructive", title: "Archivo Demasiado Grande", description: "La imagen no debe exceder los 5MB." });
        form.setValue('thumbnailFile', null);
        setThumbnailPreview(initialData?.thumbnailUrl || null); // Revertir a la imagen inicial si la hay
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast({ variant: "destructive", title: "Tipo de Archivo Inválido", description: "Por favor, selecciona un archivo de imagen." });
        form.setValue('thumbnailFile', null);
        setThumbnailPreview(initialData?.thumbnailUrl || null);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
        form.setValue('thumbnailFile', file); // Guardar el objeto File
        form.clearErrors('thumbnailFile');
      };
      reader.readAsDataURL(file);
    } else {
        form.setValue('thumbnailFile', null);
        setThumbnailPreview(initialData?.thumbnailUrl || null);
    }
  };

  const triggerThumbnailSelect = () => {
    thumbnailFileRef.current?.click();
  };

  const processSubmit = async (data: CourseFormValues) => {
    // En una app real, aquí subirías thumbnailFile a un GCS bucket y obtendrías una URL.
    // Por ahora, si hay un thumbnailFile, usamos su preview (data URL).
    // Si no hay thumbnailFile pero hay initialData.thumbnailUrl, la conservamos.
    let finalThumbnailUrl = initialData?.thumbnailUrl;
    if (data.thumbnailFile) {
      finalThumbnailUrl = thumbnailPreview!; // Usamos la dataURL de la previsualización
    } else if (!finalThumbnailUrl && !data.thumbnailFile) {
      // Si no hay archivo nuevo Y no había imagen inicial, usamos un placeholder
      finalThumbnailUrl = "https://placehold.co/600x400.png?text=Curso";
    }
    
    await onSubmitCourse(data, finalThumbnailUrl);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(processSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Información del Curso</CardTitle>
                <CardDescription>Proporciona los detalles básicos de tu curso.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título del Curso</FormLabel>
                      <FormControl><Input placeholder="Ej: Desarrollo Web Moderno con React" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción del Curso</FormLabel>
                      <FormControl><Textarea placeholder="Describe de qué trata tu curso, a quién va dirigido, y qué aprenderán los estudiantes." {...field} rows={5} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lecciones del Curso</CardTitle>
                <CardDescription>Añade y organiza las lecciones de tu curso. Debes añadir al menos una lección.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-start gap-3 p-3 border rounded-md bg-muted/30">
                    <span className="font-semibold text-primary pt-2">{index + 1}.</span>
                    <div className="flex-grow">
                      <FormField
                        control={form.control}
                        name={`lessons.${index}.title`}
                        render={({ field: lessonField }) => (
                          <FormItem>
                            <FormLabel className="sr-only">Título de la Lección {index + 1}</FormLabel>
                            <FormControl><Input placeholder={`Título de la Lección ${index + 1}`} {...lessonField} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {/* Aquí podrías añadir más campos por lección, como un textarea para contenido */}
                    </div>
                    {fields.length > 1 && (
                         <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-destructive hover:text-destructive/80 shrink-0 mt-0.5" aria-label="Eliminar lección">
                            <Trash2 className="h-5 w-5" />
                        </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={() => append({ title: '' })} className="w-full">
                  <PlusCircle className="mr-2 h-5 w-5" /> Añadir Lección
                </Button>
                 {form.formState.errors.lessons?.root?.message && (
                    <p className="text-sm font-medium text-destructive">{form.formState.errors.lessons.root.message}</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Miniatura del Curso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="aspect-video w-full rounded-md border border-dashed flex items-center justify-center overflow-hidden bg-muted/30">
                  {thumbnailPreview ? (
                    <Image src={thumbnailPreview} alt="Previsualización de miniatura" width={300} height={168} className="object-cover h-full w-full" data-ai-hint="course thumbnail" />
                  ) : (
                    <div className="text-center text-muted-foreground p-4">
                      <ImageUp className="mx-auto h-12 w-12 mb-2" />
                      <p>Previsualización</p>
                    </div>
                  )}
                </div>
                <FormField
                  control={form.control}
                  name="thumbnailFile"
                  render={() => ( // No usamos {field} directamente porque el manejo es custom
                    <FormItem>
                      <FormLabel className="sr-only">Archivo de Miniatura</FormLabel>
                      <FormControl>
                        <Input type="file" accept="image/*" ref={thumbnailFileRef} onChange={handleThumbnailChange} className="hidden" />
                      </FormControl>
                       <Button type="button" variant="outline" onClick={triggerThumbnailSelect} className="w-full">
                         <ImageUp className="mr-2 h-4 w-4" /> {thumbnailPreview ? 'Cambiar Miniatura' : 'Seleccionar Miniatura'}
                       </Button>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <p className="text-xs text-muted-foreground">Recomendado: 16:9, JPG/PNG, &lt;5MB.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contenido Interactivo (Opcional)</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="interactiveContent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="sr-only">Contenido Interactivo</FormLabel>
                      <FormControl><Textarea placeholder="Pega aquí código embed (ej: iframes de videos, quizzes interactivos) o describe el contenido." {...field} rows={4} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <p className="text-xs text-muted-foreground mt-2">Ej: Un video de bienvenida, un quiz de H5P, etc.</p>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
            {isSubmitting ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : (currentSessionRole === 'instructor' ? <Send className="mr-2 h-5 w-5" /> : <Save className="mr-2 h-5 w-5" />)}
            {isSubmitting ? 'Guardando...' : (currentSessionRole === 'instructor' ? 'Enviar a Revisión' : 'Guardar Curso')}
          </Button>
        </div>
      </form>
    </Form>
  );
}

// Helper para simular subida de archivo (en una app real, esto iría a un servicio de storage)
export const simulateFileUpload = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simular URL de archivo subido. En una app real, sería una URL de GCS, S3, etc.
      // Por ahora, usamos la Data URL generada por FileReader si está disponible, o un placeholder.
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = () => {
         resolve("https://placehold.co/600x400.png?text=Error+Subiendo");
      }
      if (file) {
        reader.readAsDataURL(file);
      } else {
        resolve("https://placehold.co/600x400.png?text=Miniatura");
      }
    }, 1500); // Simular retraso de red
  });
};
