
"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Users, BookOpen, Award, UserPlus, TrendingUp, PieChart as PieChartIcon, Activity, CheckSquare, FileText, Download, Loader2, Star } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, ResponsiveContainer, Bar, BarChart as ReBarChart, LabelList } from 'recharts';
import type { ChartConfig } from "@/components/ui/chart";
import { useToast } from "@/hooks/use-toast";
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import Image from "next/image";
import { generateReportSections, type GenerateReportSectionsInput, type GenerateReportSectionsOutput } from '@/ai/flows/generate-report-sections-flow';

const userGrowthData = [
  { month: "Ene", users: 65 },
  { month: "Feb", users: 59 },
  { month: "Mar", users: 80 },
  { month: "Abr", users: 81 },
  { month: "May", users: 96 },
  { month: "Jun", users: 105 },
  { month: "Jul", users: 120 },
  { month: "Ago", users: 135 },
];

const userGrowthChartConfig = {
  users: {
    label: "Nuevos Usuarios",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const roleDistributionData = [
  { role: "Estudiantes", value: 1250, fill: "hsl(var(--chart-1))" },
  { role: "Instructores", value: 250, fill: "hsl(var(--chart-2))" },
  { role: "Administradores", value: 23, fill: "hsl(var(--chart-3))" },
];

const roleChartConfig = {
  Estudiantes: { label: "Estudiantes", color: "hsl(var(--chart-1))" },
  Instructores: { label: "Instructores", color: "hsl(var(--chart-2))" },
  Administradores: { label: "Administradores", color: "hsl(var(--chart-3))" },
} satisfies ChartConfig;

const courseActivityData = [
  { name: 'JS Avanzado', inscritos: 120, completados: 85, color: "hsl(var(--chart-1))" },
  { name: 'Python para DS', inscritos: 150, completados: 95, color: "hsl(var(--chart-2))" },
  { name: 'Diseño UX', inscritos: 90, completados: 60, color: "hsl(var(--chart-3))" },
  { name: 'React Native', inscritos: 110, completados: 70, color: "hsl(var(--chart-4))" },
  { name: 'Marketing Digital', inscritos: 200, completados: 130, color: "hsl(var(--chart-5))" },
];

const courseActivityChartConfig = {
  inscritos: { label: "Inscritos", color: "hsl(var(--chart-1))" },
  completados: { label: "Completados", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig;


export default function AdminMetricsPage() {
  const { toast } = useToast();
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isPreviewReportOpen, setIsPreviewReportOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState('');
  const [reportText, setReportText] = useState<GenerateReportSectionsOutput | null>(null);
  const [isAiLoadingReportText, setIsAiLoadingReportText] = useState(false);

  const stats = [
    { title: "Usuarios Totales", value: "1,523", icon: Users, trend: "+5% último mes", key: 'totalUsers' },
    { title: "Cursos Activos", value: "87", icon: BookOpen, trend: "+3 esta semana", key: 'activeCourses' },
    { title: "Tasa de Finalización Prom.", value: "67%", icon: Award, trend: "Estable", key: 'completionRate' },
    { title: "Nuevos Estudiantes (Mes)", value: "150", icon: UserPlus, trend: "+12% vs mes anterior", key: 'newStudentsMonthly' },
    { title: "Instructores Activos", value: "42", icon: Users, trend: "+2 este mes", key: 'activeInstructors' }, 
    { title: "Cursos en Revisión", value: "7", icon: CheckSquare, trend: "Nuevos hoy: 1", key: 'coursesInReview' }, 
  ];


  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }));
  }, []);


  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    setIsAiLoadingReportText(true);
    setReportText(null); 
    setIsPreviewReportOpen(true); 

    toast({
      title: "Generando Informe...",
      description: "El informe de actividad de usuarios se está procesando. Esto puede tardar unos segundos.",
    });

    const inputForAI: GenerateReportSectionsInput = {
      totalUsers: parseInt(stats.find(s => s.key === 'totalUsers')?.value.replace(',', '') || '0'),
      activeCourses: parseInt(stats.find(s => s.key === 'activeCourses')?.value || '0'),
      completionRate: stats.find(s => s.key === 'completionRate')?.value || 'N/A',
      newStudentsMonthly: parseInt(stats.find(s => s.key === 'newStudentsMonthly')?.value || '0'),
    };

    try {
      const aiGeneratedText = await generateReportSections(inputForAI);
      setReportText(aiGeneratedText);
    } catch (error) {
      console.error("Error generando texto del informe con IA:", error);
      setReportText({
        executiveSummary:
          'A la fecha actual, la plataforma AlpriNexus cuenta con [Número de Usuarios Totales] usuarios registrados, lo que demuestra un interés continuo. Durante el último mes, se ha observado un incremento de [Número de Nuevos Estudiantes] estudiantes, indicando una adopción saludable. La tasa de finalización promedio de los cursos se sitúa en [Tasa de Finalización], un área que presenta oportunidades de mejora continua.',
        keyHighlights: [
          'Incremento significativo en la base de usuarios.',
          'Amplia oferta de cursos activos disponibles.',
        ],
        conclusions: [
          'El crecimiento en el número de nuevos estudiantes sugiere que las estrategias de captación están siendo efectivas.',
          'La tasa de finalización general, aunque estable, podría beneficiarse de un análisis detallado por curso para identificar aquellos con menor rendimiento.',
          'La cantidad de cursos activos proporciona una oferta diversa, pero se debe monitorear su relevancia y actualización.'
        ],
        recommendations: [
          'Implementar un sistema de seguimiento para los cursos con tasas de finalización consistentemente bajas e investigar las causas.',
          'Fomentar la creación de contenido interactivo y engageante para mejorar la retención de los estudiantes.',
          'Realizar encuestas periódicas a los usuarios para identificar necesidades de nuevos cursos y áreas de mejora en la plataforma.'
        ]
      });
      toast({
        variant: "destructive",
        title: "Error de IA",
        description: "No se pudo generar el contenido del informe. Mostrando texto de ejemplo.",
      });
    } finally {
      setIsAiLoadingReportText(false);
      setIsGeneratingReport(false);
    }
  };

  const handleDownloadSimulatedReport = () => {
    setIsPreviewReportOpen(false);
    toast({
        title: "Descarga Iniciada (Simulada)",
        description: "El informe 'Actividad_AlpriNexus_Q1_2024.pdf' ha comenzado a descargarse.",
    });
  };

  const defaultReportText: GenerateReportSectionsOutput = {
    executiveSummary: 
        'A la fecha actual, la plataforma AlpriNexus cuenta con ' +
        `${stats.find(s => s.key === 'totalUsers')?.value || '[Número de Usuarios Totales]'} usuarios registrados, lo que demuestra un interés continuo. ` +
        `Durante el último mes, se ha observado un incremento de ${stats.find(s => s.key === 'newStudentsMonthly')?.value || '[Número de Nuevos Estudiantes]'} estudiantes, indicando una adopción saludable. ` +
        `La tasa de finalización promedio de los cursos se sitúa en ${stats.find(s => s.key === 'completionRate')?.value || '[Tasa de Finalización]'}, un área que presenta oportunidades de mejora continua. ` +
        `Con ${stats.find(s => s.key === 'activeCourses')?.value || '[Número de Cursos Activos]'} cursos activos, la plataforma ofrece una base sólida para el desarrollo profesional.`,
    keyHighlights: [
        `Crecimiento notable en la base de usuarios con ${stats.find(s => s.key === 'newStudentsMonthly')?.value || 'N/A'} nuevas incorporaciones este mes.`,
        `Mantenimiento de una sólida oferta formativa con ${stats.find(s => s.key === 'activeCourses')?.value || 'N/A'} cursos activos.`,
        `Una tasa de finalización promedio del ${stats.find(s => s.key === 'completionRate')?.value || 'N/A'} que indica un buen nivel de engagement general.`
    ],
    conclusions: [
        `El crecimiento constante de ${stats.find(s => s.key === 'newStudentsMonthly')?.value || 'nuevos estudiantes'} al mes sugiere que las iniciativas de promoción y la utilidad percibida de AlpriNexus son efectivas.`,
        `Una tasa de finalización promedio del ${stats.find(s => s.key === 'completionRate')?.value || 'N/A'} es un indicador aceptable, pero un análisis más profundo por curso podría revelar variaciones significativas y oportunidades de mejora específicas.`,
        `La existencia de ${stats.find(s => s.key === 'activeCourses')?.value || 'múltiples'} cursos activos es positiva, pero es crucial asegurar su continua relevancia y la satisfacción del estudiante con los mismos.`
    ],
    recommendations: [
        'Identificar y analizar los cursos con tasas de finalización por debajo del promedio para implementar estrategias de mejora, como la actualización de contenido o la adición de elementos interactivos.',
        'Desarrollar un programa de bienvenida y onboarding más robusto para los nuevos estudiantes, con el fin de maximizar su engagement temprano y familiarizarlos con los recursos disponibles.',
        'Considerar la implementación de encuestas de satisfacción post-curso para recopilar feedback directo y guiar futuras decisiones de contenido y plataforma.'
    ]
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
          <BarChart3 className="mr-3 h-8 w-8 text-primary" />
          Métricas e Informes
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        {stats.slice(0,3).map((stat) => (
          <Card key={stat.title} className="shadow-lg hover:shadow-primary/20 transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>
       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        {stats.slice(3,6).map((stat) => (
          <Card key={stat.title} className="shadow-lg hover:shadow-primary/20 transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>


      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-primary" />
              Crecimiento de Usuarios
            </CardTitle>
            <CardDescription>Nuevos usuarios registrados en los últimos 8 meses.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={userGrowthChartConfig} className="h-[280px] w-full">
              <AreaChart
                accessibilityLayer
                data={userGrowthData}
                margin={{
                  left: 12,
                  right: 12,
                  top: 5,
                  bottom: 5,
                }}
                animationDuration={700}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Area
                  dataKey="users"
                  type="natural"
                  fill="var(--color-users)"
                  fillOpacity={0.4}
                  stroke="var(--color-users)"
                  stackId="a"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChartIcon className="mr-2 h-5 w-5 text-primary" />
              Distribución de Roles de Usuario
            </CardTitle>
            <CardDescription>Porcentaje de usuarios por cada rol en la plataforma.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ChartContainer config={roleChartConfig} className="h-[280px] w-full max-w-[350px] aspect-square">
              <PieChart 
                accessibilityLayer
                animationDuration={1000}
                animationEasing="ease-out"
              >
                <ChartTooltip
                  content={<ChartTooltipContent hideLabel nameKey="role" />}
                />
                <Pie 
                    data={roleDistributionData} 
                    dataKey="value" 
                    nameKey="role" 
                    labelLine={false} 
                    label={({ percent, role, value }) => `${role}: ${value} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    paddingAngle={2}
                >
                  {roleDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} stroke={entry.fill} />
                  ))}
                </Pie>
                <ChartLegend content={<ChartLegendContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="mr-2 h-5 w-5 text-primary" />
            Actividad de Cursos Populares
          </CardTitle>
          <CardDescription>Comparativa de inscritos vs. completados en los cursos más destacados.</CardDescription>
        </CardHeader>
        <CardContent>
           <ChartContainer config={courseActivityChartConfig} className="h-[350px] w-full">
            <ReBarChart
              accessibilityLayer
              data={courseActivityData}
              margin={{ top: 20, right: 20, left: -10, bottom: 5 }}
              barCategoryGap="20%"
              animationDuration={800}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                angle={-15}
                textAnchor="end"
                height={50}
                interval={0}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="inscritos" fill="var(--color-inscritos)" radius={[4, 4, 0, 0]}>
                 <LabelList dataKey="inscritos" position="top" offset={5} fontSize={10} />
              </Bar>
              <Bar dataKey="completados" fill="var(--color-completados)" radius={[4, 4, 0, 0]}>
                <LabelList dataKey="completados" position="top" offset={5} fontSize={10} />
              </Bar>
            </ReBarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5 text-primary" />
            Generación de Informes
          </CardTitle>
          <CardDescription>Genera informes escritos detallados para un mayor soporte y análisis.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <p className="text-muted-foreground flex-1">
              Genera un informe detallado sobre la actividad de los usuarios, incluyendo registros, finalización de cursos y participación. El resumen y las conclusiones se generarán con IA.
            </p>
            <Button 
              onClick={handleGenerateReport} 
              disabled={isGeneratingReport || isAiLoadingReportText}
              className="w-full sm:w-auto"
            >
              {(isGeneratingReport || isAiLoadingReportText) ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              {(isGeneratingReport || isAiLoadingReportText) ? "Generando..." : "Generar Informe de Actividad"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isPreviewReportOpen} onOpenChange={setIsPreviewReportOpen}>
        <DialogContent className="max-w-3xl h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-4 border-b">
            <DialogTitle className="text-2xl">Vista Previa del Informe de Actividad</DialogTitle>
            <DialogDescription>
              Este es un ejemplo de cómo se vería el informe generado. El resumen y las conclusiones son generados por IA.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto overflow-x-auto p-6 sm:p-8 bg-card text-card-foreground">
            {isAiLoadingReportText && !reportText ? (
              <div className="flex flex-col items-center justify-center h-full">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Generando contenido del informe con IA...</p>
              </div>
            ) : (
            <>
            <header className="text-center mb-10">
              <Image 
                src="/width_800.png" 
                alt="NexusAlpri Logo" 
                width={140} 
                height={140 * (326/413)} 
                className="mx-auto mb-5"
                data-ai-hint="company logo"
              />
              <h2 className="text-3xl font-semibold text-foreground mb-1">Informe de Actividad de la Plataforma AlpriNexus</h2>
              <p className="text-lg text-muted-foreground">Fecha de Generación: {currentDate}</p>
            </header>

            <section className="mb-8">
              <h3 className="text-xl font-semibold border-b border-border pb-2 mb-4 text-primary">1. Resumen Ejecutivo</h3>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {isAiLoadingReportText && !reportText?.executiveSummary ? "Generando..." : (reportText?.executiveSummary || defaultReportText.executiveSummary)}
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold border-b border-border pb-2 mb-4 text-primary">2. Puntos Clave Destacados</h3>
              {isAiLoadingReportText && !reportText?.keyHighlights ? (
                 <p className="text-sm text-muted-foreground leading-relaxed">Generando...</p>
              ) : (
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2 pl-4">
                  {(reportText?.keyHighlights || defaultReportText.keyHighlights).map((highlight, index) => (
                    <li key={`highlight-${index}`}>{highlight}</li>
                  ))}
                </ul>
              )}
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold border-b border-border pb-2 mb-4 text-primary">3. Métricas Clave de Usuarios</h3>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2 pl-4">
                <li>Usuarios Totales: <span className="font-semibold text-foreground">{stats.find(s => s.key === 'totalUsers')?.value}</span> ({stats.find(s => s.key === 'totalUsers')?.trend})</li>
                <li>Nuevos Estudiantes (Mes): <span className="font-semibold text-foreground">{stats.find(s => s.key === 'newStudentsMonthly')?.value}</span> ({stats.find(s => s.key === 'newStudentsMonthly')?.trend})</li>
                <li>Instructores Activos: <span className="font-semibold text-foreground">{stats.find(s => s.key === 'activeInstructors')?.value}</span> ({stats.find(s => s.key === 'activeInstructors')?.trend})</li>
                <li>Distribución de Roles:
                  <ul className="list-['-_'] list-inside ml-6 mt-1 space-y-0.5">
                    {roleDistributionData.map(r => <li key={r.role}>{r.role}: {r.value}</li>)}
                  </ul>
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold border-b border-border pb-2 mb-4 text-primary">4. Actividad de Cursos</h3>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2 pl-4">
                <li>Cursos Activos: <span className="font-semibold text-foreground">{stats.find(s => s.key === 'activeCourses')?.value}</span> ({stats.find(s => s.key === 'activeCourses')?.trend})</li>
                <li>Tasa de Finalización Promedio: <span className="font-semibold text-foreground">{stats.find(s => s.key === 'completionRate')?.value}</span> ({stats.find(s => s.key === 'completionRate')?.trend})</li>
                <li>Cursos en Revisión: <span className="font-semibold text-foreground">{stats.find(s => s.key === 'coursesInReview')?.value}</span> ({stats.find(s => s.key === 'coursesInReview')?.trend})</li>
                <li>Cursos más populares (Inscritos / Completados):
                  <ul className="list-['-_'] list-inside ml-6 mt-1 space-y-0.5">
                    {courseActivityData.slice(0,3).map(c => <li key={c.name}>{c.name}: {c.inscritos} / {c.completados}</li>)}
                  </ul>
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold border-b border-border pb-2 mb-4 text-primary">5. Conclusiones</h3>
              {isAiLoadingReportText && !reportText?.conclusions ? (
                 <p className="text-sm text-muted-foreground leading-relaxed">Generando...</p>
              ) : (
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2 pl-4">
                  {(reportText?.conclusions || defaultReportText.conclusions).map((conclusion, index) => (
                    <li key={`conclusion-${index}`}>{conclusion}</li>
                  ))}
                </ul>
              )}
            </section>

            <section className="mb-8">
                <h3 className="text-xl font-semibold border-b border-border pb-2 mb-4 text-primary">6. Recomendaciones</h3>
                {isAiLoadingReportText && !reportText?.recommendations ? (
                    <p className="text-sm text-muted-foreground leading-relaxed">Generando...</p>
                ) : (
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2 pl-4">
                    {(reportText?.recommendations || defaultReportText.recommendations).map((recommendation, index) => (
                        <li key={`recommendation-${index}`}>{recommendation}</li>
                    ))}
                    </ul>
                )}
            </section>
            
            <footer className="mt-12 pt-8 border-t border-border text-xs text-muted-foreground text-center flex flex-col items-center space-y-2">
                <Image
                    src="/Logo-Manchas-SAS (2).png"
                    alt="Alprigrama S.A.S"
                    width={100}
                    height={100 * (742/800)} 
                    className="mb-2 opacity-70"
                    data-ai-hint="brand watermark logo"
                />
              <p>&copy; {new Date().getFullYear()} AlpriNexus - Una iniciativa de Alprigrama S.A.S. Todos los derechos reservados.</p>
              <p>Este es un informe generado automáticamente. La información es confidencial.</p>
            </footer>
            </>
            )}
          </div>
          <DialogFooter className="p-6 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsPreviewReportOpen(false)}>Cerrar Vista Previa</Button>
            <Button onClick={handleDownloadSimulatedReport} disabled={isAiLoadingReportText}>
                <Download className="mr-2 h-4 w-4" />
                Descargar PDF (Simulado)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
    

    
