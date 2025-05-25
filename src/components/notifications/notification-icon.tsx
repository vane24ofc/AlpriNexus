
"use client";

import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, AlertTriangle, MessageCircle, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Notification {
  id: string;
  type: 'message' | 'alert' | 'update' | 'course';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  link?: string;
}

const initialNotifications: Notification[] = [
  { id: '1', type: 'course', title: '¡Nuevo Curso Disponible!', description: 'Se ha añadido el curso de JavaScript Avanzado.', timestamp: 'hace 2m', read: false, link: '#' },
  { id: '2', type: 'message', title: 'Mensaje del Instructor', description: 'Tu tarea ha sido calificada.', timestamp: 'hace 1h', read: false, link: '#' },
  { id: '3', type: 'alert', title: 'Mantenimiento Programado', description: 'Mantenimiento del sistema el domingo a las 2 AM.', timestamp: 'hace 3h', read: true, link: '#' },
  { id: '4', type: 'update', title: 'Perfil Actualizado', description: 'La información de tu perfil se actualizó correctamente.', timestamp: 'hace 1d', read: true, link: '/dashboard/student/profile' },
  { id: '5', type: 'course', title: 'Confirmación de Inscripción', description: 'Ahora estás inscrito en "Introducción a Python".', timestamp: 'hace 2d', read: true, link: '#' },
  { id: '6', type: 'message', title: 'Nuevo Anuncio General', description: 'Consulta los últimos anuncios de la plataforma.', timestamp: 'hace 5m', read: false, link: '#' },
];

function NotificationItem({ notification }: { notification: Notification }) {
  const Icon = {
    message: MessageCircle,
    alert: AlertTriangle,
    update: CheckCircle,
    course: BookOpen, // Changed for course-specific icon
  }[notification.type];

  return (
    <div className="flex items-start space-x-3 p-3 hover:bg-muted/50 rounded-md">
      {!notification.read && (
        <Badge variant="default" className="h-2 w-2 p-0 shrink-0 mt-1.5 bg-primary" />
      )}
      {notification.read && (
         <div className="h-2 w-2 shrink-0 mt-1.5" /> // Placeholder for alignment
      )}
      <Icon className={`h-5 w-5 shrink-0 mt-1 ${notification.read ? 'text-muted-foreground' : 'text-primary'}`} />
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <p className={`text-sm font-medium ${notification.read ? 'text-muted-foreground' : 'text-foreground'}`}>{notification.title}</p>
          <p className="text-xs text-muted-foreground">{notification.timestamp}</p>
        </div>
        <p className={`text-sm ${notification.read ? 'text-muted-foreground/80' : 'text-foreground/90'}`}>{notification.description}</p>
        {notification.link && <a href={notification.link} className="text-xs text-primary hover:underline">Ver detalles</a>}
      </div>
    </div>
  );
}

export function NotificationIcon() {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  const handleMarkAllAsRead = () => {
    setNotifications(prevNotifications =>
      prevNotifications.map(n => ({ ...n, read: true }))
    );
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 min-w-0 justify-center p-0 text-xs">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Abrir notificaciones</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 md:w-96 p-0" align="end">
        <div className="p-4">
          <h3 className="text-lg font-medium">Notificaciones</h3>
        </div>
        <Separator />
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-2 m-2">
            <TabsTrigger value="all">Todas ({notifications.length})</TabsTrigger>
            <TabsTrigger value="unread">No Leídas ({unreadCount})</TabsTrigger>
          </TabsList>
          <ScrollArea className="h-[300px] md:h-[400px]">
            <TabsContent value="all" className="mt-0">
              {notifications.length === 0 ? (
                <p className="p-4 text-center text-sm text-muted-foreground">Aún no hay notificaciones.</p>
              ) : (
                notifications.map((notification) => (
                  <NotificationItem key={notification.id} notification={notification} />
                ))
              )}
            </TabsContent>
            <TabsContent value="unread" className="mt-0">
              {notifications.filter(n => !n.read).length === 0 ? (
                <p className="p-4 text-center text-sm text-muted-foreground">No hay notificaciones no leídas.</p>
              ) : (
                notifications.filter(n => !n.read).map((notification) => (
                  <NotificationItem key={notification.id} notification={notification} />
                ))
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
        <Separator />
        <div className="p-2 text-center">
          <Button variant="link" size="sm" className="text-primary" onClick={handleMarkAllAsRead} disabled={unreadCount === 0}>
            Marcar todas como leídas
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
