
'use server';
/**
 * @fileOverview Un flujo de Genkit para generar una imagen de miniatura para un curso.
 *
 * - generateCourseThumbnail - Una función que maneja la generación de la miniatura.
 * - GenerateCourseThumbnailInput - El tipo de entrada para la función.
 * - GenerateCourseThumbnailOutput - El tipo de retorno para la función.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCourseThumbnailInputSchema = z.object({
  courseTitle: z.string().describe('El título del curso.'),
  courseDescription: z
    .string()
    .min(10) // Asegurar una descripción mínima para un mejor prompt
    .describe(
      'Una breve descripción del contenido del curso, utilizada para guiar la generación de la imagen.'
    ),
});
export type GenerateCourseThumbnailInput = z.infer<
  typeof GenerateCourseThumbnailInputSchema
>;

const GenerateCourseThumbnailOutputSchema = z.object({
  thumbnailDataUri: z
    .string()
    .describe(
      "La imagen de miniatura generada como un Data URI (ej: 'data:image/png;base64,...')."
    ),
});
export type GenerateCourseThumbnailOutput = z.infer<
  typeof GenerateCourseThumbnailOutputSchema
>;

export async function generateCourseThumbnail(
  input: GenerateCourseThumbnailInput
): Promise<GenerateCourseThumbnailOutput> {
  return generateCourseThumbnailFlow(input);
}

// Este es el flujo principal que llama al modelo de generación de imágenes.
const generateCourseThumbnailFlow = ai.defineFlow(
  {
    name: 'generateCourseThumbnailFlow',
    inputSchema: GenerateCourseThumbnailInputSchema,
    outputSchema: GenerateCourseThumbnailOutputSchema,
  },
  async (input) => {
    const prompt = `Genera una imagen de miniatura atractiva y profesional para un curso titulado "${input.courseTitle}". La descripción del curso es: "${input.courseDescription}". La imagen debe ser adecuada para una plataforma de aprendizaje corporativo, visualmente clara y conceptualmente relacionada con el tema del curso. Evita texto superpuesto en la imagen. Estilo moderno y limpio.`;

    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp', // Modelo experimental para generación de imágenes
      prompt: prompt,
      config: {
        responseModalities: ['IMAGE', 'TEXT'], // Debe incluir IMAGE
        // Podríamos añadir safetySettings aquí si fuera necesario
      },
    });

    if (!media || !media.url) {
      throw new Error(
        'La IA no devolvió una imagen o la URL de la imagen es inválida.'
      );
    }

    // La URL devuelta por Gemini 2.0 Flash exp para imágenes es un Data URI.
    return {thumbnailDataUri: media.url};
  }
);
