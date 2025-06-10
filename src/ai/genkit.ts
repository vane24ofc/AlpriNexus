import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI()],
  // Usar gemini-pro para generación de texto general como informes.
  // gemini-1.5-flash-latest es otra opción moderna.
  // La generación de imágenes en generate-course-thumbnail-flow.ts
  // ya especifica 'googleai/gemini-2.0-flash-exp' correctamente.
  model: 'googleai/gemini-pro',
});
