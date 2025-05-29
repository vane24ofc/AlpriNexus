
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Bell, CheckCircle, AlertTriangle, MessageCircle, BookOpen, Loader2 } from 'lucide-react'; // Added Loader2
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

const NOTIFICATIONS_STORAGE_KEY = 'nexusAlpriNotifications';

const initialSeedNotifications: Notification[] = [
  { id: 'seed1', type: 'course', title: '¡Nuevo Curso Disponible!', description: 'Se ha añadido el curso de JavaScript Avanzado.', timestamp: 'hace 2m', read: false, link: '#' },
  { id: 'seed2', type: 'message', title: 'Mensaje del Instructor', description: 'Tu tarea ha sido calificada.', timestamp: 'hace 1h', read: false, link: '#' },
  { id: 'seed3', type: 'alert', title: 'Mantenimiento Programado', description: 'Mantenimiento del sistema el domingo a las 2 AM.', timestamp: 'hace 3h', read: true, link: '#' },
];

function NotificationItem({ notification, onToggleRead }: { notification: Notification, onToggleRead: (id: string) => void }) {
  const Icon = {
    message: MessageCircle,
    alert: AlertTriangle,
    update: CheckCircle,
    course: BookOpen,
  }[notification.type];

  return (
    <div
      className="flex items-start space-x-3 p-3 hover:bg-muted/50 rounded-md cursor-pointer"
      onClick={() => onToggleRead(notification.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onToggleRead(notification.id)}
    >
      {!notification.read && (
        <Badge variant="default" className="h-2 w-2 p-0 shrink-0 mt-1.5 bg-primary" />
      )}
      {notification.read && (
         <div className="h-2 w-2 shrink-0 mt-1.5" />
      )}
      <Icon className={`h-5 w-5 shrink-0 mt-1 ${notification.read ? 'text-muted-foreground' : 'text-primary'}`} />
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <p className={`text-sm font-medium ${notification.read ? 'text-muted-foreground' : 'text-foreground'}`}>{notification.title}</p>
          <p className="text-xs text-muted-foreground">{notification.timestamp}</p>
        </div>
        <p className={`text-sm ${notification.read ? 'text-muted-foreground/80' : 'text-foreground/90'}`}>{notification.description}</p>
        {notification.link && <a href={notification.link} className="text-xs text-primary hover:underline" onClick={(e) => e.stopPropagation()}>Ver detalles</a>}
      </div>
    </div>
  );
}

export function NotificationIcon() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadNotifications = async () => {
      setIsLoading(true);
      // TODO: API Call - GET /api/me/notifications
      // const response = await fetch('/api/me/notifications');
      // const data = await response.json();
      // setNotifications(data);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      try {
        const storedNotifications = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
        if (storedNotifications) {
          setNotifications(JSON.parse(storedNotifications));
        } else {
          setNotifications(initialSeedNotifications);
          localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(initialSeedNotifications));
        }
      } catch (error) {
        console.error("Error loading notifications from localStorage:", error);
        setNotifications(initialSeedNotifications);
      }
      setIsLoading(false);
    };
    loadNotifications();
  }, []);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const persistNotifications = useCallback((updatedNotifications: Notification[]) => {
    // TODO: This local persistence would be removed if API handles saving read status.
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updatedNotifications));
  }, []);

  const handleMarkAllAsRead = useCallback(async () => {
    // TODO: API Call - POST /api/me/notifications/mark-all-read
    // After successful API call, update local state:
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    persistNotifications(updated);
  }, [notifications, persistNotifications]);

  const handleToggleRead = useCallback(async (id: string) => {
    // TODO: API Call - PUT /api/me/notifications/:id/read { read: newReadState }
    // After successful API call, update local state:
    const updated = notifications.map(n =>
      n.id === id ? { ...n, read: !n.read } : n
    );
    setNotifications(updated);
    persistNotifications(updated);
  }, [notifications, persistNotifications]);


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
            <TabsTrigger value="all" disabled={isLoading}>Todas ({isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : notifications.length})</TabsTrigger>
            <TabsTrigger value="unread" disabled={isLoading}>No Leídas ({isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : unreadCount})</TabsTrigger>
          </TabsList>
          <ScrollArea className="h-[300px] md:h-[400px]">
            {isLoading ? (
               <div className="flex justify-center items-center h-full">
                 <Loader2 className="h-8 w-8 animate-spin text-primary" />
               </div>
            ) : (
              <>
                <TabsContent value="all" className="mt-0">
                  {notifications.length === 0 ? (
                    <p className="p-4 text-center text-sm text-muted-foreground">Aún no hay notificaciones.</p>
                  ) : (
                    notifications.map((notification) => (
                      <NotificationItem key={notification.id} notification={notification} onToggleRead={handleToggleRead} />
                    ))
                  )}
                </TabsContent>
                <TabsContent value="unread" className="mt-0">
                  {notifications.filter(n => !n.read).length === 0 ? (
                    <p className="p-4 text-center text-sm text-muted-foreground">No hay notificaciones no leídas.</p>
                  ) : (
                    notifications.filter(n => !n.read).map((notification) => (
                      <NotificationItem key={notification.id} notification={notification} onToggleRead={handleToggleRead} />
                    ))
                  )}
                </TabsContent>
              </>
            )}
          </ScrollArea>
        </Tabs>
        <Separator />
        <div className="p-2 text-center">
          <Button variant="link" size="sm" className="text-primary" onClick={handleMarkAllAsRead} disabled={isLoading || unreadCount === 0}>
            Marcar todas como leídas
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
