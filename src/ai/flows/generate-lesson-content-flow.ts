
'use server';
/**
 * @fileOverview Un flujo de Genkit para generar un borrador de contenido para una lección de curso.
 *
 * - generateLessonContent - Genera contenido de borrador para una lección.
 * - GenerateLessonContentInput - Tipo de entrada.
 * - GenerateLessonContentOutput - Tipo de salida.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateLessonContentInputSchema = z.object({
  courseTitle: z.string().describe('El título general del curso.'),
  courseDescription: z
    .string()
    .optional()
    .describe('La descripción general del curso.'),
  lessonTitle: z.string().describe('El título específico de la lección para la cual generar contenido.'),
});
export type GenerateLessonContentInput = z.infer<
  typeof GenerateLessonContentInputSchema
>;

const GenerateLessonContentOutputSchema = z.object({
  generatedContent: z
    .string()
    .describe('El contenido de borrador generado para la lección (2-3 párrafos).'),
});
export type GenerateLessonContentOutput = z.infer<
  typeof GenerateLessonContentOutputSchema
>;

export async function generateLessonContent(
  input: GenerateLessonContentInput
): Promise<GenerateLessonContentOutput> {
  return generateLessonContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateLessonContentPrompt',
  input: {schema: GenerateLessonContentInputSchema},
  output: {schema: GenerateLessonContentOutputSchema},
  prompt: `Eres un diseñador de currículums experto y redactor de contenido educativo.
Tu tarea es generar un borrador de contenido (aproximadamente 2-3 párrafos) para una lección específica, basándote en el título del curso, su descripción (si se proporciona) y el título de la lección.
El contenido debe ser introductorio o explicativo, adecuado para el tema de la lección, y escrito de forma clara y concisa.

Título del Curso: {{{courseTitle}}}
{{#if courseDescription}}
Descripción del Curso: {{{courseDescription}}}
{{/if}}
Título de la Lección: {{{lessonTitle}}}

Genera el contenido del borrador para esta lección.
`,
});

const generateLessonContentFlow = ai.defineFlow(
  {
    name: 'generateLessonContentFlow',
    inputSchema: GenerateLessonContentInputSchema,
    outputSchema: GenerateLessonContentOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output || !output.generatedContent) {
      console.error('La IA no devolvió el contenido de la lección esperado.');
      // Devolvemos un string vacío en caso de error o contenido no generado para evitar problemas con Zod.
      // El frontend debería manejar este caso y mostrar un mensaje apropiado.
      return {
        generatedContent:
          'Error: No se pudo generar contenido. Por favor, inténtalo de nuevo o escribe el contenido manualmente.',
      };
    }
    return output;
  }
);
