
"use client";

import React, { useState, useEffect } from 'react';
import { PlusCircle, Video, Calendar, Users, Trash2, ExternalLink, Clock, Info, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { VirtualSession } from '@/types/virtual-session';
import { useSessionRole } from '@/app/dashboard/layout';
import { format, parseISO, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';

const VIRTUAL_SESSIONS_STORAGE_KEY = 'nexusAlpriVirtualSessions';
const CALENDAR_EVENTS_STORAGE_KEY = 'nexusAlpriCalendarEvents'; // Key used by CalendarPage

interface StoredCalendarEvent { // Interface for calendar events, similar to CalendarPage
  id:string;
  date: string; // ISO string
  title: string;
  description?: string;
  time?: string;
}


// Sample initial data - will be replaced by localStorage if available
const initialSampleSessions: VirtualSession[] = [
  {
    id: 'vs1',
    title: 'Introducción a AlpriNexus para Nuevos Usuarios',
    date: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().split('T')[0],
    time: '10:00',
    description: 'Un recorrido completo por las funcionalidades clave de la plataforma AlpriNexus. Ideal para nuevos miembros del equipo.',
    meetingLink: 'https://meet.jit.si/AlpriNexusIntroMeetingExample',
    organizer: 'Equipo AlpriNexus'
  },
  {
    id: 'vs2',
    title: 'Taller Avanzado: Estrategias de Contenido Efectivas',
    date: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0],
    time: '14:30',
    description: 'Aprende a crear y gestionar contenido de alto impacto para tus cursos. Dirigido a instructores y administradores.',
    meetingLink: 'https://meet.jit.si/AlpriNexusAdvancedWorkshopExample',
    organizer: 'Laura Experta'
  },
];

export default function VirtualSessionsPage() {
  const { toast } = useToast();
  const { currentSessionRole } = useSessionRole();
  const [sessions, setSessions] = useState<VirtualSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form state for new session
  const [newSessionTitle, setNewSessionTitle] = useState('');
  const [newSessionDate, setNewSessionDate] = useState('');
  const [newSessionTime, setNewSessionTime] = useState('');
  const [newSessionDescription, setNewSessionDescription] = useState('');
  const [newSessionLink, setNewSessionLink] = useState('');

  const canManageSessions = currentSessionRole === 'administrador' || currentSessionRole === 'instructor';

  useEffect(() => {
    const loadSessions = async () => {
      setIsLoading(true);
      // TODO: API Call - GET /api/virtual-sessions
      // const response = await fetch('/api/virtual-sessions');
      // if (!response.ok) {
      //   toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar las sesiones virtuales." });
      //   setSessions(initialSampleSessions); // Fallback
      // } else {
      //   const data: VirtualSession[] = await response.json();
      //   data.sort((a, b) => { // Sort sessions by date and time
      //     const dateTimeA = new Date(`${a.date}T${a.time || '00:00'}`).getTime();
      //     const dateTimeB = new Date(`${b.date}T${b.time || '00:00'}`).getTime();
      //     return dateTimeA - dateTimeB;
      //   });
      //   setSessions(data);
      // }

      // Fallback to localStorage
      try {
        const storedSessions = localStorage.getItem(VIRTUAL_SESSIONS_STORAGE_KEY);
        if (storedSessions) {
          const parsedSessions: VirtualSession[] = JSON.parse(storedSessions);
          parsedSessions.sort((a, b) => {
            const dateTimeA = new Date(`${a.date}T${a.time || '00:00'}`).getTime();
            const dateTimeB = new Date(`${b.date}T${b.time || '00:00'}`).getTime();
            return dateTimeA - dateTimeB;
          });
          setSessions(parsedSessions);
        } else {
          const sortedInitial = initialSampleSessions.sort((a, b) => {
            const dateTimeA = new Date(`${a.date}T${a.time || '00:00'}`).getTime();
            const dateTimeB = new Date(`${b.date}T${b.time || '00:00'}`).getTime();
            return dateTimeA - dateTimeB;
          });
          setSessions(sortedInitial);
          localStorage.setItem(VIRTUAL_SESSIONS_STORAGE_KEY, JSON.stringify(sortedInitial));
        }
      } catch (error) {
        console.error("Error cargando sesiones de localStorage:", error);
        setSessions(initialSampleSessions.sort((a, b) => {
            const dateTimeA = new Date(`${a.date}T${a.time || '00:00'}`).getTime();
            const dateTimeB = new Date(`${b.date}T${b.time || '00:00'}`).getTime();
            return dateTimeA - dateTimeB;
          }));
      } finally {
        setIsLoading(false);
      }
    };
    loadSessions();
  }, []);

  // This useEffect persists changes to localStorage.
  // With a backend, this would be removed, and data would be refetched or updated via optimistic updates.
  useEffect(() => {
    if (!isLoading && sessions.length >= 0) { 
        try {
            localStorage.setItem(VIRTUAL_SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
        } catch (error) {
            console.error("Error guardando sesiones en localStorage:", error);
            toast({
                variant: "destructive",
                title: "Error de Guardado Local",
                description: "No se pudieron guardar los cambios de las sesiones virtuales localmente."
            });
        }
    }
  }, [sessions, isLoading, toast]);

  const resetForm = () => {
    setNewSessionTitle('');
    setNewSessionDate('');
    setNewSessionTime('');
    setNewSessionDescription('');
    setNewSessionLink('');
  };

  const handleCreateSession = async () => {
    if (!newSessionTitle || !newSessionDate || !newSessionTime || !newSessionLink) {
      toast({
        variant: "destructive",
        title: "Campos Incompletos",
        description: "Por favor, completa el título, fecha, hora y enlace de la reunión.",
      });
      return;
    }

    try {
      new URL(newSessionLink);
    } catch (_) {
      toast({
        variant: "destructive",
        title: "Enlace Inválido",
        description: "Por favor, introduce una URL válida para el enlace de la reunión.",
      });
      return;
    }

    const newSessionData: Omit<VirtualSession, 'id'> = {
      title: newSessionTitle,
      date: newSessionDate,
      time: newSessionTime,
      description: newSessionDescription,
      meetingLink: newSessionLink,
      organizer: currentSessionRole === 'administrador' ? 'Administrador AlpriNexus' : 'Instructor AlpriNexus',
    };

    // TODO: API Call - POST /api/virtual-sessions
    // const response = await fetch('/api/virtual-sessions', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(newSessionData),
    // });
    // if (!response.ok) {
    //   toast({ variant: "destructive", title: "Error", description: "No se pudo programar la sesión." });
    //   return;
    // }
    // const createdSession: VirtualSession = await response.json();
    // setSessions(prev => [...prev, createdSession].sort((a,b) => new Date(`${a.date}T${a.time || '00:00'}`).getTime() - new Date(`${b.date}T${b.time || '00:00'}`).getTime()));
    // TODO: API Call - Optionally, if backend doesn't handle calendar event creation:
    // await fetch('/api/calendar-events', { /* ... payload for calendar event ... */ });

    // Fallback to localStorage
    const newSession: VirtualSession = {
      ...newSessionData,
      id: crypto.randomUUID(),
    };
    const updatedSessions = [...sessions, newSession].sort((a, b) => {
        const dateTimeA = new Date(`${a.date}T${a.time || '00:00'}`).getTime();
        const dateTimeB = new Date(`${b.date}T${b.time || '00:00'}`).getTime();
        return dateTimeA - dateTimeB;
    });
    setSessions(updatedSessions);
    // localStorage.setItem(VIRTUAL_SESSIONS_STORAGE_KEY, JSON.stringify(updatedSessions)); // Handled by useEffect

    // Create and save corresponding calendar event to localStorage
    try {
        const calendarEvent: StoredCalendarEvent = {
            id: `vs-${newSession.id}`,
            title: `[Sesión Virtual] ${newSession.title}`,
            date: startOfDay(parseISO(newSession.date)).toISOString(),
            time: newSession.time,
            description: newSession.description,
        };
        const storedCalendarEventsString = localStorage.getItem(CALENDAR_EVENTS_STORAGE_KEY);
        let calendarEvents: StoredCalendarEvent[] = storedCalendarEventsString ? JSON.parse(storedCalendarEventsString) : [];
        calendarEvents.push(calendarEvent);
        calendarEvents.sort((a,b) => {
            const dateTimeA = new Date(`${parseISO(a.date).toISOString().split('T')[0]}T${a.time || '00:00'}`).getTime();
            const dateTimeB = new Date(`${parseISO(b.date).toISOString().split('T')[0]}T${b.time || '00:00'}`).getTime();
            return dateTimeA - dateTimeB;
        });
        localStorage.setItem(CALENDAR_EVENTS_STORAGE_KEY, JSON.stringify(calendarEvents));
        toast({ title: "Sesión Programada y Añadida al Calendario", description: `La sesión "${newSession.title}" ha sido creada y agendada.` });
    } catch (e) {
        console.error("Error al guardar evento en calendario:", e);
        toast({ variant: "destructive", title: "Error de Calendario", description: "La sesión se programó, pero no se pudo añadir al calendario." });
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleDeleteSession = async (sessionId: string) => {
    const sessionToDelete = sessions.find(s => s.id === sessionId);
    if (!sessionToDelete) return;

    // TODO: API Call - DELETE /api/virtual-sessions/:sessionId
    // const response = await fetch(`/api/virtual-sessions/${sessionId}`, { method: 'DELETE' });
    // if (!response.ok) {
    //   toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar la sesión." });
    //   return;
    // }
    // setSessions(prev => prev.filter(s => s.id !== sessionId));
    // TODO: API Call - Optionally, delete corresponding calendar event

    // Fallback to localStorage
    const updatedSessions = sessions.filter(s => s.id !== sessionId);
    setSessions(updatedSessions);
    // localStorage.setItem(VIRTUAL_SESSIONS_STORAGE_KEY, JSON.stringify(updatedSessions)); // Handled by useEffect
    
    // Also remove from calendar in localStorage
    try {
        const storedCalendarEventsString = localStorage.getItem(CALENDAR_EVENTS_STORAGE_KEY);
        if (storedCalendarEventsString) {
            let calendarEvents: StoredCalendarEvent[] = JSON.parse(storedCalendarEventsString);
            calendarEvents = calendarEvents.filter(event => event.id !== `vs-${sessionId}`);
            localStorage.setItem(CALENDAR_EVENTS_STORAGE_KEY, JSON.stringify(calendarEvents));
        }
        toast({ title: "Sesión Eliminada", description: `La sesión "${sessionToDelete.title}" y su evento de calendario asociado han sido eliminados.`, variant: "destructive" });
    } catch (e) {
        console.error("Error eliminando evento del calendario de localStorage:", e);
        toast({ title: "Sesión Eliminada (Parcial)", description: `La sesión "${sessionToDelete.title}" ha sido eliminada, pero hubo un problema al quitarla del calendario.`, variant: "destructive" });
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'EEEE, dd MMMM yyyy', { locale: es });
    } catch (error) {
      return dateString; 
    }
  };
  
  const formatTime = (timeString: string) => {
     try {
        const [hours, minutes] = timeString.split(':');
        const date = new Date();
        date.setHours(parseInt(hours), parseInt(minutes));
        return format(date, 'p', { locale: es });
    } catch (error) {
        return timeString;
    }
  };


  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-3 text-lg">Cargando sesiones virtuales...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
          <Video className="mr-3 h-8 w-8 text-primary" />
          Sesiones Virtuales Programadas
        </h1>
        {canManageSessions && (
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-5 w-5" /> Programar Nueva Sesión
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[520px]">
              <DialogHeader>
                <DialogTitle>Programar Nueva Sesión Virtual</DialogTitle>
                <DialogDescription>
                  Completa los detalles para crear una nueva sesión.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="session-title" className="text-right">Título</Label>
                  <Input id="session-title" value={newSessionTitle} onChange={e => setNewSessionTitle(e.target.value)} className="col-span-3" placeholder="Ej: Reunión Semanal de Equipo" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="session-date" className="text-right">Fecha</Label>
                  <Input id="session-date" type="date" value={newSessionDate} onChange={e => setNewSessionDate(e.target.value)} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="session-time" className="text-right">Hora</Label>
                  <Input id="session-time" type="time" value={newSessionTime} onChange={e => setNewSessionTime(e.target.value)} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="session-description" className="text-right pt-2">Descripción</Label>
                  <Textarea id="session-description" value={newSessionDescription} onChange={e => setNewSessionDescription(e.target.value)} className="col-span-3" placeholder="Detalles de la sesión, agenda, etc." rows={3} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="session-link" className="text-right">Enlace Reunión</Label>
                  <Input id="session-link" type="url" value={newSessionLink} onChange={e => setNewSessionLink(e.target.value)} className="col-span-3" placeholder="https://meet.example.com/your-meeting-id" />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
                <Button onClick={handleCreateSession}>Programar Sesión</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {sessions.length === 0 ? (
        <Card className="shadow-lg">
          <CardContent className="py-10 text-center">
            <Info className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold">No hay sesiones programadas</h3>
            <p className="text-muted-foreground mt-1">
              {canManageSessions ? "Programa una nueva sesión para empezar." : "Consulta más tarde o contacta al administrador."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session) => (
            <Card key={session.id} className="shadow-lg flex flex-col">
              <CardHeader>
                <CardTitle className="text-xl line-clamp-2" title={session.title}>{session.title}</CardTitle>
                <CardDescription className="text-sm">
                  <div className="flex items-center text-muted-foreground mt-1">
                    <Calendar className="mr-2 h-4 w-4" /> {formatDate(session.date)}
                  </div>
                  <div className="flex items-center text-muted-foreground mt-1">
                    <Clock className="mr-2 h-4 w-4" /> {formatTime(session.time)}
                  </div>
                   <div className="flex items-center text-muted-foreground mt-1">
                    <Users className="mr-2 h-4 w-4" /> Organizado por: {session.organizer}
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-3">{session.description || "No hay descripción para esta sesión."}</p>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
                <Button 
                    onClick={() => window.open(session.meetingLink, '_blank', 'noopener,noreferrer')} 
                    className="w-full sm:flex-1 bg-primary hover:bg-primary/90"
                    disabled={!session.meetingLink}
                >
                  <ExternalLink className="mr-2 h-4 w-4" /> Unirse a la Sesión
                </Button>
                {canManageSessions && (
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => handleDeleteSession(session.id)} 
                    className="w-full sm:w-auto text-destructive hover:text-destructive hover:bg-destructive/10"
                    title="Eliminar Sesión"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

