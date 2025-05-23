"use client";

import { Bell, CheckCircle, AlertTriangle, MessageCircle } from 'lucide-react';
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

const mockNotifications: Notification[] = [
  { id: '1', type: 'course', title: 'New Course Available!', description: 'Advanced JavaScript course has been added.', timestamp: '2m ago', read: false, link: '/dashboard/student' },
  { id: '2', type: 'message', title: 'Message from Instructor', description: 'Your assignment has been graded.', timestamp: '1h ago', read: false, link: '#' },
  { id: '3', type: 'alert', title: 'Maintenance Scheduled', description: 'System maintenance on Sunday at 2 AM.', timestamp: '3h ago', read: true, link: '#' },
  { id: '4', type: 'update', title: 'Profile Updated', description: 'Your profile information was successfully updated.', timestamp: '1d ago', read: true, link: '/dashboard/student' },
   { id: '5', type: 'course', title: 'Enrollment Confirmation', description: 'You are now enrolled in "Intro to Python".', timestamp: '2d ago', read: true, link: '/dashboard/student' },
];

function NotificationItem({ notification }: { notification: Notification }) {
  const Icon = {
    message: MessageCircle,
    alert: AlertTriangle,
    update: CheckCircle,
    course: CheckCircle, // Could be a different icon like BookOpen
  }[notification.type];

  return (
    <div className="flex items-start space-x-3 p-3 hover:bg-muted/50 rounded-md">
      {!notification.read && (
        <Badge variant="default" className="h-2 w-2 p-0 shrink-0 mt-1.5 bg-accent" />
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
        {notification.link && <a href={notification.link} className="text-xs text-primary hover:underline">View details</a>}
      </div>
    </div>
  );
}

export function NotificationIcon() {
  const unreadCount = mockNotifications.filter(n => !n.read).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 min-w-0 justify-center p-0 text-xs">
              {unreadCount}
            </Badge>
          )}
          <span className="sr-only">Open notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 md:w-96 p-0" align="end">
        <div className="p-4">
          <h3 className="text-lg font-medium">Notifications</h3>
        </div>
        <Separator />
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-2 m-2">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
          </TabsList>
          <ScrollArea className="h-[300px] md:h-[400px]">
            <TabsContent value="all" className="mt-0">
              {mockNotifications.length === 0 ? (
                <p className="p-4 text-center text-sm text-muted-foreground">No notifications yet.</p>
              ) : (
                mockNotifications.map((notification) => (
                  <NotificationItem key={notification.id} notification={notification} />
                ))
              )}
            </TabsContent>
            <TabsContent value="unread" className="mt-0">
              {mockNotifications.filter(n => !n.read).length === 0 ? (
                <p className="p-4 text-center text-sm text-muted-foreground">No unread notifications.</p>
              ) : (
                mockNotifications.filter(n => !n.read).map((notification) => (
                  <NotificationItem key={notification.id} notification={notification} />
                ))
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
        <Separator />
        <div className="p-2 text-center">
          <Button variant="link" size="sm" className="text-primary">
            Mark all as read
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
