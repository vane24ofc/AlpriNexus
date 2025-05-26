
"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label'; // No se usa directamente con FormField, pero puede ser útil en otros contextos.
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const feedbackFormSchema = z.object({
  subject: z.string().min(5, { message: "El asunto debe tener al menos 5 caracteres." }),
  type: z.string({ required_error: "Por favor, selecciona un tipo de comentario." }).min(1, { message: "Por favor, selecciona un tipo de comentario."}),
  message: z.string().min(10, { message: "El mensaje debe tener al menos 10 caracteres." }),
});

type FeedbackFormValues = z.infer<typeof feedbackFormSchema>;

export default function FeedbackPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false); // Todavía se usa para el estado del botón

  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: {
      subject: '',
      type: '',
      message: '',
    },
  });

  const onSubmit = async (data: FeedbackFormValues) => {
    setIsSubmitting(true);
    console.log("Enviando comentario (simulado):", data);

    // Simular envío
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast({
      title: "Comentario Enviado (Simulado)",
      description: "Gracias por tus comentarios. Hemos recibido tu mensaje.",
    });
    form.reset(); // Resetea el formulario usando react-hook-form
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="text-center">
        <MessageSquare className="mx-auto mb-4 h-12 w-12 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Enviar Comentarios</h1>
        <p className="text-muted-foreground mt-2">
          Tu opinión es importante para nosotros. Ayúdanos a mejorar AlpriNexus.
        </p>
      </div>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle>Detalles del Comentario</CardTitle>
          <CardDescription>
            Utiliza este formulario para informarnos sobre errores, sugerencias o cualquier otra consulta que tengas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asunto <span className="text-primary">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Problema al cargar un video en el curso X" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Comentario <span className="text-primary">*</span></FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un tipo..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="bug">Reportar un Error (Bug)</SelectItem>
                        <SelectItem value="suggestion">Sugerencia de Mejora</SelectItem>
                        <SelectItem value="question">Pregunta General</SelectItem>
                        <SelectItem value="compliment">Felicitación</SelectItem>
                        <SelectItem value="other">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mensaje <span className="text-primary">*</span></FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe detalladamente tu comentario o problema aquí..."
                        rows={6}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full text-base py-3" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Send className="mr-2 h-5 w-5" />
                )}
                {isSubmitting ? 'Enviando...' : 'Enviar Comentario'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
