
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlusCircle, Trash2, CalendarDays, Edit3, Loader2, Info } from 'lucide-react';
import { useSessionRole } from '@/app/dashboard/layout';
import { format, isSameDay, parseISO, startOfDay, parse } from 'date-fns';
import { es } from 'date-fns/locale';

interface CalendarEvent {
  id: string;
  date: Date;
  title: string;
  description?: string;
  time?: string;
}

interface StoredCalendarEvent {
  id:string;
  date: string; // ISO string
  title: string;
  description?: string;
  time?: string;
}

const CALENDAR_EVENTS_STORAGE_KEY = 'nexusAlpriCalendarEvents';

// Sample initial data - will be replaced by localStorage if available
const initialSampleEvents: StoredCalendarEvent[] = [
  { id: 'sample1', date: startOfDay(new Date()).toISOString(), title: 'Reunión de Planificación Semanal', description: 'Discutir tareas y objetivos.', time: '10:00' },
  { id: 'sample2', date: startOfDay(new Date(new Date().setDate(new Date().getDate() + 1))).toISOString(), title: 'Entrega Proyecto Alfa', description: 'Fecha límite para el proyecto Alfa.', time: '17:00' },
];


export default function CalendarPage() {
  const { currentSessionRole } = useSessionRole();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventDateForDialog, setEventDateForDialog] = useState<Date>(new Date());

  useEffect(() => {
    setIsLoading(true);
    const storedEventsString = localStorage.getItem(CALENDAR_EVENTS_STORAGE_KEY);
    let loadedEvents: CalendarEvent[] = [];
    if (storedEventsString) {
      try {
        const storedEvents: StoredCalendarEvent[] = JSON.parse(storedEventsString);
        loadedEvents = storedEvents.map(event => ({
          ...event,
          date: startOfDay(parseISO(event.date)),
          time: event.time || undefined, 
        })).sort((a, b) => { 
            const dateComparison = a.date.getTime() - b.date.getTime();
            if (dateComparison !== 0) return dateComparison;
            if (a.time && b.time) return a.time.localeCompare(b.time);
            if (a.time) return -1;
            if (b.time) return 1;
            return 0;
          });
      } catch (error) {
        console.error("Error al cargar eventos del calendario desde localStorage:", error);
        loadedEvents = initialSampleEvents.map(event => ({
          ...event,
          date: startOfDay(parseISO(event.date)),
        })).sort((a, b) => {
            const dateComparison = a.date.getTime() - b.date.getTime();
            if (dateComparison !== 0) return dateComparison;
            if (a.time && b.time) return a.time.localeCompare(b.time);
            if (a.time) return -1;
            if (b.time) return 1;
            return 0;
          });
        localStorage.setItem(CALENDAR_EVENTS_STORAGE_KEY, JSON.stringify(initialSampleEvents));
      }
    } else {
        loadedEvents = initialSampleEvents.map(event => ({
          ...event,
          date: startOfDay(parseISO(event.date)),
        })).sort((a, b) => {
            const dateComparison = a.date.getTime() - b.date.getTime();
            if (dateComparison !== 0) return dateComparison;
            if (a.time && b.time) return a.time.localeCompare(b.time);
            if (a.time) return -1;
            if (b.time) return 1;
            return 0;
          });
        localStorage.setItem(CALENDAR_EVENTS_STORAGE_KEY, JSON.stringify(initialSampleEvents));
    }
    setEvents(loadedEvents);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading && events.length >= 0) {
        const eventsToStore: StoredCalendarEvent[] = events.map(event => ({
        ...event,
        date: event.date.toISOString(), 
        time: event.time || undefined,
        }));
        localStorage.setItem(CALENDAR_EVENTS_STORAGE_KEY, JSON.stringify(eventsToStore));
    }
  }, [events, isLoading]);

  const resetFormFields = () => {
    setEventTitle('');
    setEventDescription('');
    setEventTime('');
    setEventDateForDialog(startOfDay(selectedDate || new Date()));
  };

  const handleOpenDialogForAdd = () => {
    setEditingEvent(null);
    resetFormFields();
    setEventDateForDialog(startOfDay(selectedDate || new Date()));
    setIsDialogOpen(true);
  };

  const handleOpenDialogForEdit = (event: CalendarEvent) => {
    setEditingEvent(event);
    setEventTitle(event.title);
    setEventDescription(event.description || '');
    setEventTime(event.time || '');
    setEventDateForDialog(event.date); 
    setIsDialogOpen(true);
  };

  const handleSaveEvent = () => {
    if (!eventTitle.trim()) {
      alert("El título del evento es obligatorio.");
      return;
    }

    const processedDate = startOfDay(eventDateForDialog); 

    const updatedEventsList = editingEvent
      ? events.map(ev =>
          ev.id === editingEvent.id
            ? {
                ...ev,
                title: eventTitle.trim(),
                description: eventDescription.trim(),
                date: processedDate,
                time: eventTime || undefined, 
              }
            : ev
        )
      : [
          ...events,
          {
            id: crypto.randomUUID(),
            date: processedDate,
            title: eventTitle.trim(),
            description: eventDescription.trim(),
            time: eventTime || undefined, 
          },
        ];

    setEvents(updatedEventsList.sort((a, b) => {
        const dateComparison = a.date.getTime() - b.date.getTime();
        if (dateComparison !== 0) return dateComparison;
        if (a.time && b.time) return a.time.localeCompare(b.time);
        if (a.time) return -1;
        if (b.time) return 1;
        return 0;
    }));

    setIsDialogOpen(false);
    setEditingEvent(null);
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
  };

  const eventsForSelectedDay = useMemo(() => {
    return events.filter(event =>
      selectedDate && isSameDay(event.date, selectedDate)
    );
  }, [events, selectedDate]);


  const eventDayModifier = useMemo(() => {
    const datesWithEvents = new Set(events.map(event => event.date.getTime()));
    return Array.from(datesWithEvents).map(time => new Date(time));
  }, [events]);

  const canManageEvents = currentSessionRole === 'administrador' || currentSessionRole === 'instructor';

  const formatTimeDisplay = (timeString?: string) => {
    if (!timeString) return '';
    try {
        const dateWithTime = parse(timeString, 'HH:mm', new Date());
        return format(dateWithTime, 'p', { locale: es }); 
    } catch (error) {
        return timeString; 
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-3 text-lg">Cargando calendario...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
          <CalendarDays className="mr-3 h-8 w-8 text-primary" />
          Calendario de Eventos
        </h1>
        {canManageEvents && (
          <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
              setIsDialogOpen(isOpen);
              if (!isOpen) {
                setEditingEvent(null); 
                resetFormFields();
              }
          }}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenDialogForAdd}>
                <PlusCircle className="mr-2 h-5 w-5" /> Añadir Evento
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
              <DialogHeader>
                <DialogTitle>{editingEvent ? 'Editar Evento' : 'Añadir Nuevo Evento'}</DialogTitle>
                <DialogDescription>
                  {editingEvent ? 'Modifica los detalles del evento existente.' : 'Completa los detalles para el nuevo evento.'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="event-title" className="text-right">
                    Título
                  </Label>
                  <Input
                    id="event-title"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    className="col-span-3"
                    placeholder="Ej: Reunión de equipo"
                  />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="event-description" className="text-right pt-2">
                    Descripción
                  </Label>
                  <Textarea
                    id="event-description"
                    value={eventDescription}
                    onChange={(e) => setEventDescription(e.target.value)}
                    className="col-span-3"
                    placeholder="Detalles adicionales (opcional)"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="event-date" className="text-right">
                    Fecha
                  </Label>
                  <Input
                    id="event-date"
                    type="date"
                    value={format(eventDateForDialog, 'yyyy-MM-dd')} 
                    onChange={(e) => setEventDateForDialog(startOfDay(parseISO(e.target.value)))} 
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="event-time" className="text-right">
                    Hora (Opc.)
                  </Label>
                  <Input
                    id="event-time"
                    type="time"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" onClick={() => setEditingEvent(null)}>Cancelar</Button>
                </DialogClose>
                <Button type="submit" onClick={handleSaveEvent}>{editingEvent ? 'Guardar Cambios' : 'Guardar Evento'}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        <Card className="lg:col-span-4 xl:col-span-5 shadow-lg">
          <CardContent className="p-1 sm:p-2 md:p-4 flex justify-center items-start bg-black">
            <div className="dark"> {/* Aplicamos el tema oscuro al contenedor del calendario */}
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md"
                locale={es}
                ISOWeek
                weekStartsOn={1} 
                modifiers={{ eventDay: eventDayModifier }}
                modifiersClassNames={{
                  eventDay: 'day-with-event-dot',
                }}
                classNames={{
                  day_selected: 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
                  day_today: 'bg-accent text-accent-foreground',
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 xl:col-span-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">
              {selectedDate ? format(selectedDate, 'PPPP', { locale: es }) : 'Ninguna fecha seleccionada'}
            </CardTitle>
            <CardDescription>
              {selectedDate && eventsForSelectedDay.length === 0 && "No hay eventos programados."}
              {selectedDate && eventsForSelectedDay.length > 0 && `Tienes ${eventsForSelectedDay.length} evento(s).`}
              {!selectedDate && "Selecciona un día para ver los eventos."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[400px] overflow-y-auto">
            {selectedDate && eventsForSelectedDay.length > 0 ? (
              eventsForSelectedDay.map(event => (
                <div key={event.id} className="p-3 border rounded-lg bg-card hover:bg-muted/50 transition-colors relative group">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-md mb-0.5">
                        {event.time && <span className="text-primary mr-2">{formatTimeDisplay(event.time)}</span>}
                        {event.title}
                      </h4>
                      {event.description && <p className="text-sm text-muted-foreground">{event.description}</p>}
                    </div>
                    {canManageEvents && (
                      <div className="flex space-x-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-primary"
                          onClick={() => handleOpenDialogForEdit(event)}
                          aria-label="Editar evento"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive/60 hover:text-destructive"
                          onClick={() => handleDeleteEvent(event.id)}
                          aria-label="Eliminar evento"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : selectedDate ? (
              <div className="text-center py-4">
                 <CalendarDays className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                 <p className="text-sm text-muted-foreground">
                    No hay eventos programados para este día.
                 </p>
                 {canManageEvents && (
                    <Button variant="outline" size="sm" className="mt-3" onClick={handleOpenDialogForAdd}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Añadir Evento
                    </Button>
                 )}
              </div>
            ) : (
                 <div className="text-center py-4">
                    <Info className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground">
                        Selecciona un día en el calendario para ver los eventos programados.
                    </p>
                 </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

