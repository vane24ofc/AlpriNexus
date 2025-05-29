
'use server';
/**
 * @fileOverview Un flujo de Genkit para generar secciones de texto para un informe de métricas.
 *
 * - generateReportSections - Genera resumen ejecutivo y conclusiones/recomendaciones.
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
    .describe('Un resumen ejecutivo conciso y narrativo sobre el estado de la plataforma basado en las métricas.'),
  keyHighlights: z
    .array(z.string())
    .describe(
      'Una lista de 2-3 puntos clave o logros destacados derivados de las métricas, presentados como puntos individuales.'
    ),
  conclusions: z
    .array(z.string())
    .describe(
      'Una lista de 2-3 conclusiones clave derivadas de las métricas, presentadas como puntos individuales.'
    ),
  recommendations: z
    .array(z.string())
    .describe(
      'Una lista de 2-3 recomendaciones accionables y concretas para futuras acciones, presentadas como puntos individuales y justificadas.'
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
  prompt: `Eres un analista experto en plataformas de e-learning corporativo y estás redactando un informe de actividad para la dirección.
Tu tarea es generar un "Resumen Ejecutivo", una lista de "Puntos Clave Destacados", y listas separadas de "Conclusiones" y "Recomendaciones" que sean detallados, narrativos, profesionales y basados en las métricas proporcionadas.

Por favor, incluye frases como "A la fecha actual, la plataforma AlpriNexus cuenta con..." o "Durante el último periodo, se observó un cambio en..." para darle un contexto temporal. Analiza las métricas para destacar tendencias o puntos significativos. Por ejemplo, si el número de nuevos estudiantes es alto, coméntalo como un indicador positivo.

Métricas Clave (para el periodo actual):
- Usuarios Totales en AlpriNexus: {{{totalUsers}}}
- Cursos Activos disponibles en la plataforma: {{{activeCourses}}}
- Tasa de Finalización Promedio de los cursos: {{{completionRate}}}
- Nuevos Estudiantes registrados en el último mes: {{{newStudentsMonthly}}}

Resumen Ejecutivo:
Debe ser narrativo y resaltar los aspectos más importantes del estado actual de la plataforma, mencionando las cifras clave y su posible impacto. Por ejemplo, "A la fecha, AlpriNexus cuenta con {{{totalUsers}}} usuarios totales, lo que representa una base sólida para nuestras iniciativas de capacitación. Durante el último mes, se unieron {{{newStudentsMonthly}}} nuevos estudiantes, indicando un interés creciente..." (Aproximadamente 3-5 frases).

Puntos Clave Destacados:
Identifica 2-3 logros o aspectos positivos más significativos que se desprenden directamente de las métricas. Presenta cada punto como una cadena de texto en una lista. Por ejemplo: "Crecimiento notable en la base de usuarios con {{{newStudentsMonthly}}} nuevas incorporaciones este mes." o "Mantenimiento de una sólida oferta formativa con {{{activeCourses}}} cursos activos."

Conclusiones:
Extrae 2-3 conclusiones principales, presentadas como una lista de cadenas de texto. Cada conclusión debe basarse en un análisis detallado de las métricas. Por ejemplo: "La tasa de finalización promedio del {{{completionRate}}} es un buen indicador, pero podría mejorarse en cursos específicos." o "El flujo constante de {{{newStudentsMonthly}}} nuevos estudiantes sugiere una buena adopción inicial de la plataforma."

Recomendaciones:
Proporciona 2-3 recomendaciones accionables, concretas y justificadas, presentadas como una lista de cadenas de texto. Cada recomendación debe ser para mejorar o capitalizar los hallazgos de las conclusiones. Por ejemplo: "Implementar un sistema de seguimiento más cercano para los cursos con baja tasa de finalización." o "Considerar una campaña de bienvenida para los nuevos estudiantes para fomentar su engagement temprano."
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
    if (!output || !output.executiveSummary || !output.keyHighlights || !output.conclusions || !output.recommendations) {
      console.error('La IA no devolvió el contenido del informe esperado con la estructura correcta.');
      return {
        executiveSummary:
          'No se pudo generar el resumen ejecutivo en este momento. Revise las métricas manualmente.',
        keyHighlights: [
          'No se pudieron generar los puntos clave. Se sugiere un análisis manual de los logros principales.',
        ],
        conclusions: [
          'No se pudieron generar las conclusiones. Se sugiere un análisis detallado de las métricas.',
        ],
        recommendations: [
          'No se pudieron generar las recomendaciones. Se sugiere un análisis detallado de las métricas.',
        ],
      };
    }
    return output;
  }
);
