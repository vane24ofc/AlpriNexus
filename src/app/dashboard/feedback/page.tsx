
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function FeedbackPage() {
  const { toast } = useToast();
  const [feedbackData, setFeedbackData] = useState({
    subject: '',
    type: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFeedbackData(prev => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (value: string) => {
    setFeedbackData(prev => ({ ...prev, type: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!feedbackData.subject.trim() || !feedbackData.type || !feedbackData.message.trim()) {
      toast({
        variant: "destructive",
        title: "Campos Incompletos",
        description: "Por favor, completa todos los campos requeridos.",
      });
      return;
    }
    setIsSubmitting(true);
    console.log("Enviando comentario (simulado):", feedbackData);

    // Simular envío
    setTimeout(() => {
      toast({
        title: "Comentario Enviado (Simulado)",
        description: "Gracias por tus comentarios. Hemos recibido tu mensaje.",
      });
      setFeedbackData({ subject: '', type: '', message: '' });
      // Reset the select value visually if using a controlled select or by resetting the form
      // For now, clearing the state is sufficient for uncontrolled aspects
      setIsSubmitting(false);
    }, 1500);
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
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="subject" className="font-semibold">Asunto <span className="text-primary">*</span></Label>
              <Input
                id="subject"
                name="subject"
                placeholder="Ej: Problema al cargar un video en el curso X"
                value={feedbackData.subject}
                onChange={handleInputChange}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="type" className="font-semibold">Tipo de Comentario <span className="text-primary">*</span></Label>
              <Select value={feedbackData.type} onValueChange={handleTypeChange} required>
                <SelectTrigger id="type" className="mt-1">
                  <SelectValue placeholder="Selecciona un tipo..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bug">Reportar un Error (Bug)</SelectItem>
                  <SelectItem value="suggestion">Sugerencia de Mejora</SelectItem>
                  <SelectItem value="question">Pregunta General</SelectItem>
                  <SelectItem value="compliment">Felicitación</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
              {/* La siguiente línea causaba el error y ha sido modificada */}
              {!feedbackData.type && isSubmitting && ( 
                 <p className="text-xs text-destructive mt-1">Este campo es requerido.</p>
              )}
            </div>

            <div>
              <Label htmlFor="message" className="font-semibold">Mensaje <span className="text-primary">*</span></Label>
              <Textarea
                id="message"
                name="message"
                placeholder="Describe detalladamente tu comentario o problema aquí..."
                rows={6}
                value={feedbackData.message}
                onChange={handleInputChange}
                required
                className="mt-1"
              />
            </div>

            <Button type="submit" className="w-full text-base py-3" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Send className="mr-2 h-5 w-5" />
              )}
              {isSubmitting ? 'Enviando...' : 'Enviar Comentario'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
