
export interface VirtualSession {
  id: string;
  title: string;
  date: string; // ISO string for date e.g., "2024-03-15"
  time: string; // e.g., "14:00"
  description: string;
  meetingLink: string; // URL to the actual meeting
  organizer: string; // Name of the admin/instructor
}
