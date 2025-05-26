
'use server';
/**
 * @fileOverview Un flujo de Genkit para generar secciones de texto para un informe de métricas.
 *
 * - generateReportSections - Genera resumen ejecutivo y conclusiones.
 * - GenerateReportSectionsInput - Tipo de entrada.
 * - GenerateReportSectionsOutput - Tipo de salida.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateReportSectionsInputSchema = z.object({
  totalUsers: z.number().describe('Número total de usuarios en la plataforma.'),
  activeCourses: z.number().describe('Número de cursos activos.'),
  completionRate: z.string().describe('Tasa de finalización promedio de los cursos (ej. "67%").'),
  newStudentsMonthly: z.number().describe('Número de nuevos estudiantes registrados en el último mes.'),
});
export type GenerateReportSectionsInput = z.infer<
  typeof GenerateReportSectionsInputSchema
>;

const GenerateReportSectionsOutputSchema = z.object({
  executiveSummary: z
    .string()
    .describe('Un resumen ejecutivo conciso sobre el estado de la plataforma basado en las métricas.'),
  conclusionsAndRecommendations: z
    .string()
    .describe(
      'Conclusiones clave derivadas de las métricas y recomendaciones para futuras acciones.'
    ),
});
export type GenerateReportSectionsOutput = z.infer<
  typeof GenerateReportSectionsOutputSchema
>;

export async function generateReportSections(
  input: GenerateReportSectionsInput
): Promise<GenerateReportSectionsOutput> {
  return generateReportSectionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateReportSectionsPrompt',
  input: {schema: GenerateReportSectionsInputSchema},
  output: {schema: GenerateReportSectionsOutputSchema},
  prompt: `Eres un analista experto en plataformas de e-learning corporativo. Basado en las siguientes métricas clave, redacta un "Resumen Ejecutivo" y una sección de "Conclusiones y Recomendaciones" para un informe de actividad. Sé profesional, conciso y orienta tus conclusiones hacia la mejora continua.

Métricas Clave:
- Usuarios Totales: {{{totalUsers}}}
- Cursos Activos: {{{activeCourses}}}
- Tasa de Finalización Promedio: {{{completionRate}}}
- Nuevos Estudiantes (último mes): {{{newStudentsMonthly}}}

Genera un resumen ejecutivo breve (2-3 frases) y luego 2-3 conclusiones principales seguidas de 2-3 recomendaciones accionables.
`,
});

const generateReportSectionsFlow = ai.defineFlow(
  {
    name: 'generateReportSectionsFlow',
    inputSchema: GenerateReportSectionsInputSchema,
    outputSchema: GenerateReportSectionsOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      console.error('La IA no devolvió el contenido del informe esperado.');
      return {
        executiveSummary:
          'No se pudo generar el resumen ejecutivo en este momento. Revise las métricas manualmente.',
        conclusionsAndRecommendations:
          'No se pudieron generar las conclusiones y recomendaciones. Se sugiere un análisis detallado de las métricas.',
      };
    }
    return output;
  }
);
