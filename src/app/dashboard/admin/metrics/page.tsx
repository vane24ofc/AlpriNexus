
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
import { pdf } from '@react-pdf/renderer';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import Image from "next/image";
import { generateReportSections, type GenerateReportSectionsInput, type GenerateReportSectionsOutput } from '@/ai/flows/generate-report-sections-flow';
import type { User } from '@/app/dashboard/admin/users/page'; // User type import is unique
import type { Course } from '@/types/course';

import ActivityReportDocument from '@/components/reports/ActivityReportDocument';

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


interface MetricsData {
  totalUsers: number;
  activeCourses: number;
  completionRate: string;
  newStudentsMonthly: number;
}

const SIMULATED_AUTH_TOKEN_KEY = 'simulatedAuthToken';

export default function AdminMetricsPage() {
  const { toast } = useToast();
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isPreviewReportOpen, setIsPreviewReportOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState('');
  const [reportText, setReportText] = useState<GenerateReportSectionsOutput | null>(null); // Only one declaration of reportText state
  const [isAiLoadingReportText, setIsAiLoadingReportText] = useState(false);
  
  const [apiMetrics, setApiMetrics] = useState<MetricsData | null>(null);
  const [additionalStats, setAdditionalStats] = useState({
    activeInstructors: 0,
    coursesInReview: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }));

    const fetchAllDashboardStats = async () => {
      setIsLoadingStats(true);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem(SIMULATED_AUTH_TOKEN_KEY) : null;
        if (!token) {
          toast({ variant: "destructive", title: "Error de Autenticación", description: "Token no encontrado para cargar métricas." });
          setIsLoadingStats(false);
          return;
        }
        const authHeaders = { 'Authorization': `Bearer ${token}` };

        // 1. Fetch core metrics from /api/metrics
        const metricsResponse = await fetch('/api/metrics', { headers: authHeaders });
        if (!metricsResponse.ok) {
          const errorData = await metricsResponse.json().catch(() => ({ message: "Error al cargar métricas principales."}));
          throw new Error(errorData.message);
        }
        const metricsData: MetricsData = await metricsResponse.json();
        setApiMetrics(metricsData);

        // 2. Fetch users for active instructors count
        const usersResponse = await fetch('/api/users', { headers: authHeaders });
        let activeInstructorsCount = 0;
        if (usersResponse.ok) {
          const usersData: User[] = await usersResponse.json();
          activeInstructorsCount = usersData.filter(u => u.role === 'instructor' && u.status === 'active').length;
        } else {
          console.warn("No se pudieron obtener los usuarios para contar instructores activos.");
        }

        // 3. Fetch courses for courses in review count (assuming public GET /api/courses)
        const coursesResponse = await fetch('/api/courses'); 
        let coursesInReviewCount = 0;
        if (coursesResponse.ok) {
          const coursesData: Course[] = await coursesResponse.json();
          coursesInReviewCount = coursesData.filter(c => c.status === 'pending').length;
        } else {
          console.warn("No se pudieron obtener los cursos para contar cursos en revisión.");
        }
        
        setAdditionalStats({
          activeInstructors: activeInstructorsCount,
          coursesInReview: coursesInReviewCount,
        });

      } catch (error: any) {
        console.error("Error cargando estadísticas del panel:", error);
        toast({ variant: "destructive", title: "Error al Cargar Estadísticas", description: error.message || "No se pudieron obtener todos los datos del panel." });
        setApiMetrics(null); // Reset apiMetrics on error
      } finally {
        setIsLoadingStats(false);
      }
    };
    
    fetchAllDashboardStats();
  }, [toast]);

  const dynamicStats = useMemo(() => {
    return {
      totalUsers: apiMetrics?.totalUsers || 0,
      activeCourses: apiMetrics?.activeCourses || 0,
      completionRate: apiMetrics?.completionRate || "0%",
      newStudentsMonthly: apiMetrics?.newStudentsMonthly || 0,
      activeInstructors: additionalStats.activeInstructors,
      coursesInReview: additionalStats.coursesInReview,
    };
  }, [apiMetrics, additionalStats]);


  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    setIsAiLoadingReportText(true);
    setReportText(null); 
    setIsPreviewReportOpen(true); 
    
    toast({
      title: "Generando Informe...",
      description: "El informe de actividad se está procesando con IA. Esto puede tardar unos segundos.",
    });

    try {
      let metricsForReport: MetricsData;

      if (apiMetrics) {
        metricsForReport = apiMetrics;
      } else {
        // Attempt to fetch metrics again if not available
        const token = typeof window !== 'undefined' ? localStorage.getItem(SIMULATED_AUTH_TOKEN_KEY) : null;
        if (!token) throw new Error("Token de autenticación no disponible para generar el informe.");
        
        const metricsResponse = await fetch('/api/metrics', { headers: { 'Authorization': `Bearer ${token}` } });
        if (!metricsResponse.ok) {
          const errorData = await metricsResponse.json().catch(() => ({ message: "Error al cargar métricas para el informe."}));
          throw new Error(errorData.message);
        }
        const freshMetricsData: MetricsData = await metricsResponse.json();
        setApiMetrics(freshMetricsData); // Update state if fetched again
        metricsForReport = freshMetricsData;
      }
      
      if (!metricsForReport) { // Double check after potential re-fetch
          throw new Error("No se pudieron obtener las métricas necesarias para generar el informe.");
      }

      const inputForAI: GenerateReportSectionsInput = {
        totalUsers: metricsForReport.totalUsers,
        activeCourses: metricsForReport.activeCourses,
        completionRate: metricsForReport.completionRate,
        newStudentsMonthly: metricsForReport.newStudentsMonthly,
      };
      const aiGeneratedText = await generateReportSections(inputForAI);
      setReportText(aiGeneratedText);
    } catch (error: any) {
      console.error("Error generando texto del informe con IA:", error);
      toast({ 
        variant: "destructive",
        title: "Error al generar informe",
        description: error.message || "No se pudo generar el contenido del informe con IA. Inténtalo de nuevo.",
      });
      setIsPreviewReportOpen(false); 
    } finally {
      setIsAiLoadingReportText(false);
      setIsGeneratingReport(false);
    }
  };

  const handleDownloadReportPdf = async () => { 
    if (!reportText) {
      toast({
        variant: "warning",
        title: "Informe no generado",
        description: "Por favor, genera el informe primero.",
      });
      return;
    }

    try {
      toast({
        title: "Preparando Descarga...",
        description: "Generando el archivo PDF. Esto puede tomar un momento.",
      });

      const blob = await pdf(<ActivityReportDocument reportText={reportText} />).toBlob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `informe_actividad_${new Date().toISOString().split('T')[0]}.pdf`; 
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url); 
    } catch (error) {
      console.error("Error al descargar el informe PDF:", error);
      toast({ variant: "destructive", title: "Error de Descarga", description: "No se pudo generar o descargar el archivo PDF." });
    }
  };

  const statsToDisplay = useMemo(() => [
    { title: "Usuarios Totales Activos", value: dynamicStats.totalUsers.toLocaleString(), icon: Users, trend: dynamicStats.totalUsers > 0 ? `Actualmente ${dynamicStats.totalUsers}` : "Sin usuarios activos", key: 'totalUsers' },
    { title: "Cursos Activos (Aprobados)", value: dynamicStats.activeCourses.toLocaleString(), icon: BookOpen, trend: dynamicStats.activeCourses > 0 ? `${dynamicStats.activeCourses} disponibles` : "Sin cursos activos", key: 'activeCourses' },
    { title: "Tasa de Finalización Prom.", value: dynamicStats.completionRate, icon: Award, trend: "Promedio general", key: 'completionRate' },
    { title: "Nuevos Estudiantes (Mes)", value: dynamicStats.newStudentsMonthly.toLocaleString(), icon: UserPlus, trend: `${dynamicStats.newStudentsMonthly} en los últimos 30 días`, key: 'newStudentsMonthly' },
    { title: "Instructores Activos", value: dynamicStats.activeInstructors.toLocaleString(), icon: Users, trend: `${dynamicStats.activeInstructors} enseñando`, key: 'activeInstructors' },
    { title: "Cursos en Revisión", value: dynamicStats.coursesInReview.toLocaleString(), icon: CheckSquare, trend: `${dynamicStats.coursesInReview} pendientes de aprobación`, key: 'coursesInReview' },
  ], [dynamicStats]);

  const renderStatCards = (stats: typeof statsToDisplay) => {
    return stats.map((stat) => (
      <Card key={stat.title} className="shadow-lg hover:shadow-primary/20 transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
          {isLoadingStats && !apiMetrics ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> : <stat.icon className="h-5 w-5 text-muted-foreground" />}
        </CardHeader>
        <CardContent>
          {isLoadingStats && !apiMetrics ? (
            <div className="text-2xl font-bold h-8 w-1/2 bg-muted rounded animate-pulse"></div>
          ) : (
            <div className="text-2xl font-bold">{stat.value}</div>
          )}
          <p className="text-xs text-muted-foreground">{stat.trend}</p>
        </CardContent>
      </Card>
    ));
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
        {renderStatCards(statsToDisplay.slice(0,3))}
      </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        {renderStatCards(statsToDisplay.slice(3,6))}
      </div>


      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-primary" />
              Crecimiento de Usuarios (Simulado)
            </CardTitle>
            <CardDescription>Nuevos usuarios registrados en los últimos 8 meses (datos de ejemplo).</CardDescription>
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
              Distribución de Roles (Simulado)
            </CardTitle>
            <CardDescription>Porcentaje de usuarios por cada rol en la plataforma (datos de ejemplo).</CardDescription>
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
            Actividad de Cursos Populares (Simulado)
          </CardTitle>
          <CardDescription>Comparativa de inscritos vs. completados en los cursos más destacados (datos de ejemplo).</CardDescription>
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
            <p className="text-sm text-muted-foreground flex-1">
            Genera un informe detallado sobre la actividad de los usuarios, incluyendo registros, finalización de cursos y participación. El resumen y las conclusiones se generarán con IA usando los datos reales de la plataforma.
            </p>
            <Button 
              onClick={handleGenerateReport}
              disabled={isGeneratingReport || isAiLoadingReportText || isLoadingStats}
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
              Este es un ejemplo de cómo se vería el informe generado. El resumen y las conclusiones son generados por IA usando las métricas reales de la plataforma.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto overflow-x-auto p-6 sm:p-8 bg-card text-card-foreground">
            {isAiLoadingReportText && !reportText?.executiveSummary ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
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
                {isAiLoadingReportText && !reportText ? "Generando..." : (reportText?.executiveSummary || "Esperando la generación del informe...")}
            </p>
          </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold border-b border-border pb-2 mb-4 text-primary">2. Puntos Clave Destacados</h3>
              {isAiLoadingReportText && !reportText ? (
                   <p className="text-sm text-muted-foreground leading-relaxed">Generando...</p>
              ) : (!reportText?.keyHighlights || reportText.keyHighlights.length === 0) ? (
                 <p className="text-sm text-muted-foreground leading-relaxed italic">No se generaron puntos clave destacados para este período.</p>
              ) : (
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2 pl-4">
                  {(reportText?.keyHighlights || []).map((highlight, index) => (
                    <li key={`highlight-${index}`}>{highlight}</li>
                  ))}
                </ul>
              )}
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold border-b border-border pb-2 mb-4 text-primary">3. Métricas Clave de Usuarios</h3>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2 pl-4" data-ai-hint="Display real user metrics from dynamicStats">
                <li>Usuarios Totales: <span className="font-semibold text-foreground">{isLoadingStats && !apiMetrics ? 'Cargando...' : dynamicStats.totalUsers.toLocaleString()}</span> ({statsToDisplay.find(s => s.key === 'totalUsers')?.trend})</li>
                <li>Nuevos Estudiantes (Mes): <span className="font-semibold text-foreground">{isLoadingStats && !apiMetrics ? 'Cargando...' : dynamicStats.newStudentsMonthly.toLocaleString()}</span> ({statsToDisplay.find(s => s.key === 'newStudentsMonthly')?.trend})</li> 
                <li>Instructores Activos: <span className="font-semibold text-foreground">{isLoadingStats && !apiMetrics ? 'Cargando...' : dynamicStats.activeInstructors.toLocaleString()}</span> ({statsToDisplay.find(s => s.key === 'activeInstructors')?.trend})</li> 
                <li>Distribución de Roles (Simulado):
                  <ul className="list-['-_'] list-inside ml-6 mt-1 space-y-0.5">
                    {roleDistributionData.map(r => <li key={r.role}>{r.role}: {r.value.toLocaleString()}</li>)}
                  </ul>
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold border-b border-border pb-2 mb-4 text-primary">4. Actividad de Cursos</h3>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2 pl-4" data-ai-hint="Display real course activity metrics from dynamicStats">
                 <li>Cursos Activos: <span className="font-semibold text-foreground">{isLoadingStats && !apiMetrics ? 'Cargando...' : dynamicStats.activeCourses.toLocaleString()}</span> ({statsToDisplay.find(s => s.key === 'activeCourses')?.trend})</li>
                <li>Tasa de Finalización Promedio: <span className="font-semibold text-foreground">{isLoadingStats && !apiMetrics ? 'Cargando...' : dynamicStats.completionRate}</span> ({statsToDisplay.find(s => s.key === 'completionRate')?.trend})</li>
                 <li>Cursos en Revisión: <span className="font-semibold text-foreground">{isLoadingStats && !apiMetrics ? 'Cargando...' : dynamicStats.coursesInReview.toLocaleString()}</span> ({statsToDisplay.find(s => s.key === 'coursesInReview')?.trend})</li>
                <li>Cursos más populares (Simulado - Inscritos / Completados):
                  <ul className="list-['-_'] list-inside ml-6 mt-1 space-y-0.5">
                    {courseActivityData.slice(0,3).map(c => <li key={c.name}>{c.name}: {c.inscritos} / {c.completados}</li>)}
                  </ul>
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold border-b border-border pb-2 mb-4 text-primary">5. Conclusiones</h3>
              {isAiLoadingReportText && !reportText ? (
                   <p className="text-sm text-muted-foreground leading-relaxed">Generando...</p>
              ) : (!reportText?.conclusions || reportText.conclusions.length === 0) ? (
                <p className="text-sm text-muted-foreground leading-relaxed italic">No se generaron conclusiones para este período.</p>
              ) : (
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2 pl-4">
                  {(reportText?.conclusions || []).map((conclusion, index) => (
                    <li key={`conclusion-${index}`}>{conclusion}</li>
                  ))}
                </ul>
              )}
            </section>

            <section className="mb-8">
                <h3 className="text-xl font-semibold border-b border-border pb-2 mb-4 text-primary">6. Recomendaciones</h3>
                {isAiLoadingReportText && !reportText ? (
                    <p className="text-sm text-muted-foreground leading-relaxed">Generando...</p>
                ) : (!reportText?.recommendations || reportText.recommendations.length === 0) ? (
                    <p className="text-sm text-muted-foreground leading-relaxed italic">No se generaron recomendaciones para este período.</p>
                ) : (
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2 pl-4">
                        {(reportText?.recommendations || []).map((recommendation, index) => (
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
            <Button onClick={handleDownloadReportPdf} disabled={isAiLoadingReportText || !reportText}>
                <Download className="mr-2 h-4 w-4" />
                Descargar PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

