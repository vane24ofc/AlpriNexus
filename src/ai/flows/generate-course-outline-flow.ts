
'use server';
/**
 * @fileOverview Un flujo de Genkit para generar un esquema de lecciones para un curso.
 *
 * - generateCourseOutline - Una función que maneja la generación del esquema de lecciones.
 * - GenerateCourseOutlineInput - El tipo de entrada para la función generateCourseOutline.
 * - GenerateCourseOutlineOutput - El tipo de retorno para la función generateCourseOutline.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCourseOutlineInputSchema = z.object({
  courseTitle: z.string().describe('El título del curso.'),
  courseDescription: z
    .string()
    .describe(
      'Una breve descripción del contenido y los objetivos del curso.'
    ),
});
export type GenerateCourseOutlineInput = z.infer<
  typeof GenerateCourseOutlineInputSchema
>;

const GenerateCourseOutlineOutputSchema = z.object({
  lessonTitles: z
    .array(z.string())
    .describe('Una lista de títulos de lecciones sugeridos para el curso.'),
});
export type GenerateCourseOutlineOutput = z.infer<
  typeof GenerateCourseOutlineOutputSchema
>;

export async function generateCourseOutline(
  input: GenerateCourseOutlineInput
): Promise<GenerateCourseOutlineOutput> {
  return generateCourseOutlineFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCourseOutlinePrompt',
  input: {schema: GenerateCourseOutlineInputSchema},
  output: {schema: GenerateCourseOutlineOutputSchema},
  prompt: `Eres un diseñador de currículos experto. Basado en el título y la descripción del curso proporcionados, genera una lista de 5-7 títulos de lecciones concisos y atractivos que formarían un esquema lógico y completo para este curso.

Título del Curso: {{{courseTitle}}}
Descripción del Curso: {{{courseDescription}}}

Devuelve solo la lista de títulos de lecciones. Asegúrate de que cada título sea una cadena de texto.`,
});

const generateCourseOutlineFlow = ai.defineFlow(
  {
    name: 'generateCourseOutlineFlow',
    inputSchema: GenerateCourseOutlineInputSchema,
    outputSchema: GenerateCourseOutlineOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output || !output.lessonTitles) {
        // Manejo de caso donde la salida no es la esperada
        console.error("La IA no devolvió los títulos de las lecciones esperados.");
        return { lessonTitles: [] };
    }
    return output;
  }
);
