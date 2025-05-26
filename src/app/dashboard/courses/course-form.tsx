
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ImageUp, PlusCircle, Trash2, Save, Send, Wand2, Loader2 as AiLoader, Sparkles, FileText, Video, Puzzle } from 'lucide-react';
import Image from 'next/image';
import type { Course, Lesson } from '@/types/course';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useSessionRole } from '@/app/dashboard/layout';
import { generateCourseOutline, type GenerateCourseOutlineInput } from '@/ai/flows/generate-course-outline-flow';
import { generateCourseThumbnail, type GenerateCourseThumbnailInput } from '@/ai/flows/generate-course-thumbnail-flow';

const lessonSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, { message: "El título de la lección debe tener al menos 3 caracteres." }),
  contentType: z.enum(['text', 'video', 'quiz']).default('text'),
  content: z.string().optional(),
  videoUrl: z.string().url({ message: "Por favor, introduce una URL válida para el video (ej: https://www.youtube.com/embed/VIDEO_ID)." }).optional().or(z.literal('')).or(z.null())
    .refine(val => val === null || val === '' || (typeof val === 'string' && val.startsWith('https://www.youtube.com/embed/')), {
        message: "La URL debe ser un enlace 'embed' de YouTube (ej: https://www.youtube.com/embed/VIDEO_ID)",
    }),
  quizPlaceholder: z.string().optional(), // Aseguramos que este campo esté en el schema
});

const courseFormSchema = z.object({
  title: z.string().min(5, { message: "El título del curso debe tener al menos 5 caracteres." }),
  description: z.string().min(20, { message: "La descripción debe tener al menos 20 caracteres." }),
  thumbnailFile: z.instanceof(File).optional().nullable(),
  lessons: z.array(lessonSchema).min(1, { message: "El curso debe tener al menos una lección." }),
  interactiveContent: z.string().optional(),
});

type CourseFormValues = z.infer<typeof courseFormSchema>;

interface CourseFormProps {
  initialData?: Course;
  onSubmitCourse: (data: CourseFormValues, thumbnailUrl?: string) => Promise<void>;
  isSubmitting: boolean;
}

const lessonTypeOptions = [
  { value: 'text', label: 'Texto', icon: FileText },
  { value: 'video', label: 'Video (YouTube Embed)', icon: Video },
  { value: 'quiz', label: 'Quiz (Interactivo)', icon: Puzzle },
];

export default function CourseForm({ initialData, onSubmitCourse, isSubmitting }: CourseFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const { currentSessionRole } = useSessionRole();
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(initialData?.thumbnailUrl || null);
  const thumbnailFileRef = useRef<HTMLInputElement>(null);
  const [isAiGeneratingLessons, setIsAiGeneratingLessons] = useState(false);
  const [isAiGeneratingThumbnail, setIsAiGeneratingThumbnail] = useState(false);

  const isAnyAiWorking = isAiGeneratingLessons || isAiGeneratingThumbnail;

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      thumbnailFile: null,
      lessons: initialData?.lessons?.map(l => ({
        id: l.id,
        title: l.title,
        contentType: l.contentType || 'text',
        content: l.content || '',
        videoUrl: l.videoUrl || '',
        quizPlaceholder: l.quizPlaceholder || '',
      })) || [{ title: '', contentType: 'text', content: '', videoUrl: '', quizPlaceholder: '' }],
      interactiveContent: initialData?.interactiveContent || '',
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "lessons",
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.title || '',
        description: initialData.description || '',
        thumbnailFile: null,
        lessons: initialData.lessons?.map(l => ({
          id: l.id,
          title: l.title,
          contentType: l.contentType || 'text',
          content: l.content || '',
          videoUrl: l.videoUrl || '',
          quizPlaceholder: l.quizPlaceholder || ''
        })) || [{ title: '', contentType: 'text', content: '', videoUrl: '', quizPlaceholder: '' }],
        interactiveContent: initialData.interactiveContent || '',
      });
      setThumbnailPreview(initialData.thumbnailUrl || null);
    }
  }, [initialData, form]);


  const handleThumbnailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ variant: "destructive", title: "Archivo Demasiado Grande", description: "La imagen no debe exceder los 5MB." });
        form.setValue('thumbnailFile', null);
        setThumbnailPreview(initialData?.thumbnailUrl || null);
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
        form.setValue('thumbnailFile', file);
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

  const handleGenerateOutline = async () => {
    const title = form.getValues("title");
    const description = form.getValues("description");

    if (!title.trim() || !description.trim()) {
      toast({
        variant: "destructive",
        title: "Faltan Datos",
        description: "Por favor, introduce un título y una descripción para el curso antes de generar el esquema.",
      });
      return;
    }

    setIsAiGeneratingLessons(true);
    try {
      const input: GenerateCourseOutlineInput = { courseTitle: title, courseDescription: description };
      const result = await generateCourseOutline(input);
      if (result.lessonTitles && result.lessonTitles.length > 0) {
        const newLessons = result.lessonTitles.map(lessonTitle => ({
            title: lessonTitle,
            contentType: 'text' as 'text' | 'video' | 'quiz',
            content: '', videoUrl: '', quizPlaceholder: `Quiz sobre: ${lessonTitle}` // Placeholder dinámico
        }));
        replace(newLessons);
        toast({
          title: "Esquema de Lecciones Generado",
          description: "Se han añadido las lecciones sugeridas por la IA.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error de IA",
          description: "La IA no pudo generar un esquema de lecciones o devolvió una lista vacía.",
        });
      }
    } catch (error) {
      console.error("Error generando esquema de lecciones:", error);
      toast({
        variant: "destructive",
        title: "Error de IA",
        description: "Ocurrió un error al intentar generar el esquema de lecciones.",
      });
    } finally {
      setIsAiGeneratingLessons(false);
    }
  };

  const handleGenerateThumbnail = async () => {
    const title = form.getValues("title");
    const description = form.getValues("description");

    if (!title.trim() || !description.trim()) {
      toast({
        variant: "destructive",
        title: "Faltan Datos",
        description: "Por favor, introduce un título y una descripción para el curso antes de generar la miniatura.",
      });
      return;
    }

    setIsAiGeneratingThumbnail(true);
    try {
      const input: GenerateCourseThumbnailInput = { courseTitle: title, courseDescription: description };
      const result = await generateCourseThumbnail(input);
      if (result.thumbnailDataUri) {
        setThumbnailPreview(result.thumbnailDataUri);
        // No establecemos thumbnailFile aquí porque la IA devuelve un Data URI, no un File.
        // La lógica de envío tomará thumbnailPreview si existe.
        form.setValue('thumbnailFile', null); 
        toast({
          title: "Miniatura Generada por IA",
          description: "Se ha establecido la miniatura sugerida por la IA.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error de IA",
          description: "La IA no pudo generar una miniatura.",
        });
      }
    } catch (error) {
      console.error("Error generando miniatura con IA:", error);
      toast({
        variant: "destructive",
        title: "Error de IA",
        description: "Ocurrió un error al intentar generar la miniatura del curso.",
      });
    } finally {
      setIsAiGeneratingThumbnail(false);
    }
  };


  const processSubmit = async (data: CourseFormValues) => {
    let finalThumbnailUrl = initialData?.thumbnailUrl;

    if (thumbnailPreview && thumbnailPreview !== initialData?.thumbnailUrl) {
        finalThumbnailUrl = thumbnailPreview; // Puede ser un Data URI de la IA o un Data URI de un archivo local.
    } else if (!thumbnailPreview && initialData?.thumbnailUrl) {
        // Si no hay preview (no se cambió ni se generó nueva) pero había una inicial, se mantiene.
        finalThumbnailUrl = initialData.thumbnailUrl;
    } else if (!thumbnailPreview && !initialData?.thumbnailUrl && !data.thumbnailFile) {
        // Si no hay nada (ni preview, ni inicial, ni archivo seleccionado)
        finalThumbnailUrl = "https://placehold.co/600x400.png?text=Curso"; // Placeholder por defecto
    }
    // Si data.thumbnailFile existe, la simulación de subida y la URL final se manejarían en onSubmitCourse.
    // Por ahora, priorizamos thumbnailPreview si existe.

    const lessonsWithDefaults = data.lessons.map(lesson => ({
        ...lesson,
        id: lesson.id || crypto.randomUUID(),
        content: lesson.contentType === 'text' ? lesson.content || '' : undefined,
        videoUrl: lesson.contentType === 'video' ? lesson.videoUrl || undefined : undefined,
        quizPlaceholder: lesson.contentType === 'quiz' ? lesson.quizPlaceholder || '' : undefined,
        contentType: lesson.contentType || 'text'
    }));

    await onSubmitCourse({...data, lessons: lessonsWithDefaults}, finalThumbnailUrl);
  };
  
  const formDisabled = isSubmitting || isAnyAiWorking;

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
                      <FormControl><Input placeholder="Ej: Desarrollo Web Moderno con React" {...field} disabled={formDisabled} /></FormControl>
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
                      <FormControl><Textarea placeholder="Describe de qué trata tu curso, a quién va dirigido, y qué aprenderán los estudiantes." {...field} rows={5} disabled={formDisabled} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Lecciones del Curso</CardTitle>
                  <CardDescription>Añade y organiza las lecciones. Debes añadir al menos una.</CardDescription>
                </div>
                <Button type="button" variant="outline" onClick={handleGenerateOutline} disabled={formDisabled}>
                  {isAiGeneratingLessons ? <AiLoader className="animate-spin mr-2 h-5 w-5" /> : <Wand2 className="mr-2 h-5 w-5" />}
                  {isAiGeneratingLessons ? 'Generando...' : 'Sugerir Lecciones con IA'}
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {fields.map((field, index) => {
                  const currentLessonType = form.watch(`lessons.${index}.contentType`);
                  return (
                  <div key={field.id} className="flex flex-col gap-3 p-4 border rounded-md bg-muted/30 shadow-sm">
                    <div className="flex items-start gap-3">
                      <span className="font-semibold text-primary pt-2 text-lg">{index + 1}.</span>
                      <div className="flex-grow space-y-3">
                        <FormField
                          control={form.control}
                          name={`lessons.${index}.title`}
                          render={({ field: lessonTitleField }) => (
                            <FormItem>
                              <FormLabel>Título de la Lección</FormLabel>
                              <FormControl><Input placeholder={`Título para Lección ${index + 1}`} {...lessonTitleField} disabled={formDisabled} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`lessons.${index}.contentType`}
                          render={({ field: lessonTypeField }) => (
                            <FormItem>
                              <FormLabel>Tipo de Contenido</FormLabel>
                              <Select onValueChange={lessonTypeField.onChange} defaultValue={lessonTypeField.value} disabled={formDisabled}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar tipo de contenido" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {lessonTypeOptions.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                      <div className="flex items-center">
                                        <opt.icon className="mr-2 h-4 w-4" />
                                        {opt.label}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {currentLessonType === 'text' && (
                          <FormField
                            control={form.control}
                            name={`lessons.${index}.content`}
                            render={({ field: lessonContentField }) => (
                              <FormItem>
                                <FormLabel>Contenido de Texto</FormLabel>
                                <FormControl><Textarea placeholder="Escribe aquí el contenido de la lección..." {...lessonContentField} rows={4} disabled={formDisabled}/></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                        {currentLessonType === 'video' && (
                          <FormField
                            control={form.control}
                            name={`lessons.${index}.videoUrl`}
                            render={({ field: lessonVideoUrlField }) => (
                              <FormItem>
                                <FormLabel>URL del Video (YouTube Embed)</FormLabel>
                                <FormControl><Input placeholder="Ej: https://www.youtube.com/embed/VIDEO_ID" {...lessonVideoUrlField} disabled={formDisabled} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                        {currentLessonType === 'quiz' && (
                          <FormField
                            control={form.control}
                            name={`lessons.${index}.quizPlaceholder`}
                            render={({ field: lessonQuizField }) => (
                              <FormItem>
                                <FormLabel>Texto Descriptivo del Quiz</FormLabel>
                                <FormControl><Input placeholder="Ej: Evalúa tus conocimientos sobre el Módulo 1." {...lessonQuizField} disabled={formDisabled} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>
                      {fields.length > 1 && (
                           <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-destructive hover:text-destructive/80 shrink-0 mt-1" aria-label="Eliminar lección" disabled={formDisabled}>
                              <Trash2 className="h-5 w-5" />
                          </Button>
                      )}
                    </div>
                  </div>
                  );
                })}
                <Button type="button" variant="outline" onClick={() => append({ title: '', contentType: 'text', content: '', videoUrl: '', quizPlaceholder: '' })} className="w-full mt-4" disabled={formDisabled}>
                  <PlusCircle className="mr-2 h-5 w-5" /> Añadir Lección
                </Button>
                 {form.formState.errors.lessons?.root?.message && (
                    <p className="text-sm font-medium text-destructive">{form.formState.errors.lessons.root.message}</p>
                )}
                 {form.formState.errors.lessons?.message && (
                    <p className="text-sm font-medium text-destructive">{form.formState.errors.lessons.message}</p>
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
                  render={() => (
                    <FormItem>
                      <FormLabel className="sr-only">Archivo de Miniatura</FormLabel>
                      <FormControl>
                        <Input type="file" accept="image/*" ref={thumbnailFileRef} onChange={handleThumbnailChange} className="hidden" disabled={formDisabled}/>
                      </FormControl>
                       <Button type="button" variant="outline" onClick={triggerThumbnailSelect} className="w-full" disabled={formDisabled}>
                         <ImageUp className="mr-2 h-4 w-4" /> {thumbnailPreview ? 'Cambiar Miniatura' : 'Seleccionar Miniatura'}
                       </Button>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="button" variant="outline" onClick={handleGenerateThumbnail} className="w-full" disabled={formDisabled}>
                  {isAiGeneratingThumbnail ? <AiLoader className="animate-spin mr-2 h-5 w-5" /> : <Sparkles className="mr-2 h-5 w-5" />}
                  {isAiGeneratingThumbnail ? 'Generando...' : 'Generar Miniatura con IA'}
                </Button>
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
                      <FormControl><Textarea placeholder="Pega aquí código embed (ej: iframes de videos, quizzes interactivos) o describe el contenido." {...field} rows={4} disabled={formDisabled} /></FormControl>
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
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={formDisabled}>
            Cancelar
          </Button>
          <Button type="submit" disabled={formDisabled} className="min-w-[120px]">
            {isSubmitting ? <AiLoader className="animate-spin mr-2 h-5 w-5" /> : (currentSessionRole === 'instructor' ? <Send className="mr-2 h-5 w-5" /> : <Save className="mr-2 h-5 w-5" />)}
            {isSubmitting ? 'Guardando...' : (currentSessionRole === 'instructor' ? 'Enviar a Revisión' : 'Guardar Curso')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
