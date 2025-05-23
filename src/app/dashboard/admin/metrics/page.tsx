
"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { BarChart3, Users, BookOpen, Award, UserPlus, TrendingUp, PieChart as PieChartIcon } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle
} from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import type { ChartConfig } from "@/components/ui/chart";

const userGrowthData = [
  { month: "Ene", users: 65 },
  { month: "Feb", users: 59 },
  { month: "Mar", users: 80 },
  { month: "Abr", users: 81 },
  { month: "May", users: 96 },
  { month: "Jun", users: 105 },
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


export default function AdminMetricsPage() {
  const stats = [
    { title: "Usuarios Totales", value: "1,523", icon: Users, trend: "+5% último mes" },
    { title: "Cursos Activos", value: "87", icon: BookOpen, trend: "+3 esta semana" },
    { title: "Tasa de Finalización Prom.", value: "67%", icon: Award, trend: "Estable" },
    { title: "Nuevos Estudiantes (Mes)", value: "150", icon: UserPlus, trend: "+12% vs mes anterior" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
          <BarChart3 className="mr-3 h-8 w-8 text-primary" />
          Métricas e Informes
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
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
            <CardDescription>Nuevos usuarios registrados en los últimos 6 meses.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={userGrowthChartConfig} className="h-[250px] w-full">
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
            <ChartContainer config={roleChartConfig} className="h-[250px] w-full max-w-[300px] aspect-square">
              <PieChart accessibilityLayer>
                <ChartTooltip
                  content={<ChartTooltipContent hideLabel nameKey="role" />}
                />
                <Pie data={roleDistributionData} dataKey="value" nameKey="role" labelLine={false} label={({ percent, role }) => `${role}: ${(percent * 100).toFixed(0)}%`}>
                  {roleDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartLegend content={<ChartLegendContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
