'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase/config';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
  DocumentData,
} from 'firebase/firestore';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Video, Clock, Loader2 } from 'lucide-react';

export default function ClientCalendarPage() {
  const { user, loading: authLoading } = useAuth();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [appointments, setAppointments] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const q = query(
          collection(db, 'appointments'),
          where('clientId', '==', user.uid),
          orderBy('appointmentDate', 'asc')
        );
        const querySnapshot = await getDocs(q);
        const fetchedAppointments = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Convert Firestore Timestamp to JS Date
          appointmentDate: (doc.data().appointmentDate as Timestamp).toDate(),
        }));
        setAppointments(fetchedAppointments);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchAppointments();
    }
  }, [user, authLoading]);

  const selectedDayAppointments = appointments.filter(
    app => date && app.appointmentDate.toDateString() === date.toDateString()
  );

  const appointmentDates = appointments.map(a => a.appointmentDate);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Takvim</h1>
        <p className="text-muted-foreground">
          Yaklaşan randevularınızı görüntüleyin.
        </p>
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          {loading ? (
            <div className="flex items-center justify-center p-3 h-[365px]">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="p-3 w-full"
              locale={tr}
              modifiers={{
                hasAppointment: appointmentDates,
              }}
              modifiersClassNames={{
                hasAppointment: 'has-appointment',
              }}
            />
          )}
        </Card>
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>
                {date
                  ? format(date, 'd MMMM yyyy, EEEE', { locale: tr })
                  : 'Bir tarih seçin'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </div>
              ) : selectedDayAppointments.length > 0 ? (
                <ul className="space-y-4">
                  {selectedDayAppointments.map(app => (
                    <li
                      key={app.id}
                      className="flex items-start gap-4 p-3 bg-muted/50 rounded-lg border"
                    >
                      <div className="font-semibold text-primary flex-shrink-0 mt-1">
                        {format(app.appointmentDate, 'HH:mm')}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{app.therapistName}</p>
                        <p className="text-sm text-muted-foreground">
                          {app.description}
                        </p>
                        <div className="text-sm text-muted-foreground flex items-center gap-1.5 mt-2">
                          {app.type === 'Online' ? (
                            <Badge
                              variant="outline"
                              className="text-primary border-primary/50"
                            >
                              <Video className="mr-1 h-3 w-3" /> Online
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <Clock className="mr-1 h-3 w-3" />
                              Yüz Yüze
                            </Badge>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Seçili gün için randevu yok.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
