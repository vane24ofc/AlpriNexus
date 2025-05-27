
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { LifeBuoy, HelpCircle, BookOpen, Mail } from 'lucide-react';
import Link from 'next/link';

const faqs = [
  {
    question: "¿Cómo creo un nuevo curso?",
    answer: "Dirígete a la sección 'Crear Curso' en tu panel de instructor o administrador. Completa el formulario con los detalles del curso, añade lecciones y envía a revisión o publícalo directamente si eres administrador."
  },
  {
    question: "¿Cómo cambio mi contraseña?",
    answer: "Puedes cambiar tu contraseña desde la página de 'Configuración', accesible desde el menú principal. Busca la sección de Seguridad."
  },
  {
    question: "¿Qué hago si encuentro un error en la plataforma?",
    answer: "Apreciamos que nos informes. Puedes utilizar la opción 'Enviar Comentarios' en la barra lateral para reportar bugs o problemas que encuentres."
  },
  {
    question: "¿Cómo puedo ver mi progreso en un curso?",
    answer: "En la página 'Mis Cursos Inscritos', cada curso muestra una barra de progreso. Al entrar a un curso, también verás un resumen detallado de tu avance."
  }
];

export default function HelpPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
          <LifeBuoy className="mr-3 h-8 w-8 text-primary" />
          Centro de Ayuda y Soporte
        </h1>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center"><HelpCircle className="mr-2 h-6 w-6 text-primary"/>Preguntas Frecuentes (FAQ)</CardTitle>
          <CardDescription>Encuentra respuestas rápidas a las dudas más comunes.</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger className="text-left hover:no-underline">{faq.question}</AccordionTrigger>
                <AccordionContent className="prose prose-sm dark:prose-invert max-w-none">
                  <p>{faq.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-1 gap-6"> 
        {/* The grid now only has one column if only one card is left */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center"><Mail className="mr-2 h-6 w-6 text-primary"/>Contactar con Soporte</CardTitle>
            <CardDescription>¿No encuentras lo que buscas? Ponte en contacto con nosotros.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">Si necesitas asistencia personalizada, puedes enviarnos un correo a:</p>
            <a href="mailto:desarrolloalprigrama@gmail.com" className="font-semibold text-primary hover:underline">
              desarrolloalprigrama@gmail.com
            </a>
            <p className="text-xs text-muted-foreground">Nuestro equipo de soporte te responderá lo antes posible (Horario de atención: Lunes a Viernes, 9 AM - 5 PM GMT-5).</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
