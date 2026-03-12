export interface Appointment {
  appointmentId: string;
  therapistId: string;
  clientId: string;
  title: string;
  notes?: string;
  appointmentDate: string;
  durationMinutes?: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  createdAt?: string;
}
