
"use client";

import React, { useState, useEffect } from 'react';
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
import { PlusCircle, Trash2, CalendarDays } from 'lucide-react';
import { useSessionRole } from '@/app/dashboard/layout';
import { format, isSameDay, parseISO, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';

interface CalendarEvent {
  id: string;
  date: Date;
  title: string;
  description?: string;
}

export default function CalendarPage() {
  const { currentSessionRole } = useSessionRole();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: 'sample1',
      date: startOfDay(new Date()), // Evento de ejemplo para hoy
      title: 'Reunión de Planificación Semanal',
      description: 'Discutir tareas y objetivos para la próxima semana.'
    }
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form state for new event
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDescription, setNewEventDescription] = useState('');
  const [eventDateForDialog, setEventDateForDialog] = useState<Date>(new Date());

  const handleOpenDialog = () => {
    // Set date for dialog to selectedDate or today when dialog is opened
    setEventDateForDialog(startOfDay(selectedDate || new Date()));
    setNewEventTitle('');
    setNewEventDescription('');
    setIsDialogOpen(true);
  };

  const handleAddEvent = () => {
    if (!newEventTitle.trim()) {
      alert("El título del evento es obligatorio.");
      return;
    }
    const newEvent: CalendarEvent = {
      id: crypto.randomUUID(),
      date: startOfDay(eventDateForDialog), // Ensure only date part is stored consistently
      title: newEventTitle.trim(),
      description: newEventDescription.trim(),
    };
    setEvents(prevEvents => [...prevEvents, newEvent].sort((a, b) => a.date.getTime() - b.date.getTime()));
    setIsDialogOpen(false);
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
  };

  const eventsForSelectedDay = events.filter(event =>
    selectedDate && isSameDay(event.date, selectedDate)
  );

  const eventDayModifier = events.map(event => event.date);

  const canManageEvents = currentSessionRole === 'administrador' || currentSessionRole === 'instructor';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
          <CalendarDays className="mr-3 h-8 w-8 text-primary" />
          Calendario de Eventos
        </h1>
        {canManageEvents && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenDialog}>
                <PlusCircle className="mr-2 h-5 w-5" /> Añadir Evento
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
              <DialogHeader>
                <DialogTitle>Añadir Nuevo Evento</DialogTitle>
                <DialogDescription>
                  Completa los detalles para el nuevo evento.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="event-title" className="text-right">
                    Título
                  </Label>
                  <Input
                    id="event-title"
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                    className="col-span-3"
                    placeholder="Ej: Reunión de equipo"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="event-description" className="text-right">
                    Descripción
                  </Label>
                  <Textarea
                    id="event-description"
                    value={newEventDescription}
                    onChange={(e) => setNewEventDescription(e.target.value)}
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
                        onChange={(e) => setEventDateForDialog(parseISO(e.target.value))}
                        className="col-span-3"
                    />
                 </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button type="submit" onClick={handleAddEvent}>Guardar Evento</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        <Card className="lg:col-span-4 xl:col-span-5 shadow-lg">
            <CardContent className="p-1 sm:p-2 md:p-4 flex justify-center items-start">
                 <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md"
                    locale={es}
                    ISOWeek
                    weekStartsOn={1} // Lunes como inicio de semana
                    modifiers={{ eventDay: eventDayModifier }}
                    modifiersClassNames={{
                        eventDay: 'day-with-event-dot',
                    }}
                    classNames={{
                      day_selected: 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
                      day_today: 'bg-accent text-accent-foreground',
                    }}
                 />
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
                  <h4 className="font-semibold text-md mb-0.5">{event.title}</h4>
                  {event.description && <p className="text-sm text-muted-foreground">{event.description}</p>}
                  {canManageEvents && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute top-1 right-1 h-7 w-7 text-destructive/60 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity" 
                        onClick={() => handleDeleteEvent(event.id)}
                        aria-label="Eliminar evento"
                      >
                          <Trash2 className="h-4 w-4" />
                      </Button>
                  )}
                </div>
              ))
            ) : selectedDate ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay eventos para este día.
              </p>
            ) : (
               <p className="text-sm text-muted-foreground text-center py-4">
                Selecciona un día en el calendario.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

