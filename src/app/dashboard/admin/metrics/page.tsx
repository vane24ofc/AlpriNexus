
"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Users, BookOpen, Award, UserPlus, TrendingUp, PieChart as PieChartIcon, Activity, CheckSquare, FileText, Download, Loader2 } from "lucide-react";
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
import React, { useState } from 'react';

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

  const stats = [
    { title: "Usuarios Totales", value: "1,523", icon: Users, trend: "+5% último mes" },
    { title: "Cursos Activos", value: "87", icon: BookOpen, trend: "+3 esta semana" },
    { title: "Tasa de Finalización Prom.", value: "67%", icon: Award, trend: "Estable" },
    { title: "Nuevos Estudiantes (Mes)", value: "150", icon: UserPlus, trend: "+12% vs mes anterior" },
    { title: "Instructores Activos", value: "42", icon: Users, trend: "+2 este mes" },
    { title: "Cursos en Revisión", value: "7", icon: CheckSquare, trend: "Nuevos hoy: 1" },
  ];

  const handleGenerateReport = () => {
    setIsGeneratingReport(true);
    toast({
      title: "Generando Informe...",
      description: "El informe de actividad de usuarios se está procesando.",
    });
    setTimeout(() => {
      setIsGeneratingReport(false);
      toast({
        title: "Informe Generado (Simulado)",
        description: "El informe 'Actividad de Usuarios Q1 2024.pdf' está listo para descargar.",
        action: (
          <Button variant="outline" size="sm" onClick={() => alert('Descarga simulada iniciada.')}>
            <Download className="mr-2 h-4 w-4" />
            Descargar
          </Button>
        ),
      });
    }, 2500);
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
              <PieChart accessibilityLayer>
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
              Genera un informe detallado sobre la actividad de los usuarios, incluyendo registros, finalización de cursos y participación.
            </p>
            <Button 
              onClick={handleGenerateReport} 
              disabled={isGeneratingReport}
              className="w-full sm:w-auto"
            >
              {isGeneratingReport ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              {isGeneratingReport ? "Generando..." : "Generar Informe de Actividad"}
            </Button>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}

