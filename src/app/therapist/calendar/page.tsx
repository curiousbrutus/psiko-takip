'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { apiGetAppointments, apiGetClients } from '@/lib/api-client';
import { format, setHours, setMinutes } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';

import { addAppointmentAction } from './actions';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Clock, Video, Loader2, Bot } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const appointmentFormSchema = z.object({
  clientId: z.string({ required_error: 'Lütfen bir danışan seçin.' }),
  time: z.string({ required_error: 'Lütfen bir saat seçin.' }),
  type: z.enum(['Online', 'Yüz Yüze'], {
    required_error: 'Lütfen bir seans türü seçin.',
  }),
  description: z
    .string()
    .min(3, 'Açıklama en az 3 karakter olmalıdır.')
    .max(200, 'Açıklama en fazla 200 karakter olabilir.'),
});

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

export default function CalendarPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [appointments, setAppointments] = useState<any[]>([]);
  const [clients, setClients] = useState<{ id: string; displayName: string }[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
  });

  const fetchAppointments = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await apiGetAppointments('therapist');
      if (response.success && response.data) {
        const fetchedAppointments = response.data.map((app: any) => ({
          ...app,
          appointmentDate: new Date(app.appointmentDate),
        }));
        setAppointments(fetchedAppointments);
      }
    } catch {
      toast({
        title: 'Hata',
        description: 'Randevular alınamadı.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await apiGetClients();
      if (response.success && response.data) {
        setClients(
          response.data
            .filter((c: any) => c.kind !== 'invitation' && c.userId)
            .map((c: any) => ({
              id: c.userId,
              displayName: c.displayName,
            }))
        );
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchAppointments();
      fetchClients();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [user, authLoading]);

  async function onSubmit(values: AppointmentFormValues) {
    if (!user || !userData || !date) return;

    const [hours, minutes] = values.time.split(':').map(Number);
    const appointmentDate = setMinutes(setHours(date, hours), minutes);
    const selectedClient = clients.find(c => c.id === values.clientId);

    if (!selectedClient) {
      toast({
        title: 'Hata',
        description: 'Geçerli bir danışan seçilemedi.',
        variant: 'destructive',
      });
      return;
    }

    const result = await addAppointmentAction({
      ...values,
      appointmentDate,
      therapistId: user.uid,
      therapistName: userData.displayName || 'Terapist',
      clientName: selectedClient.displayName,
    });

    toast({
      title: result.success ? 'Başarılı' : 'Hata',
      description: result.message,
      variant: result.success ? 'default' : 'destructive',
    });

    if (result.success) {
      setIsDialogOpen(false);
      form.reset();
      fetchAppointments(); // Refresh the list
    }
  }

  const selectedDayAppointments = appointments
    .filter(
      app => date && app.appointmentDate.toDateString() === date.toDateString()
    )
    .sort((a, b) => a.appointmentDate.getTime() - b.appointmentDate.getTime());

  const appointmentDates = appointments.map(a => a.appointmentDate);

  // Generate time slots for the form
  const timeSlots = Array.from({ length: 20 }, (_, i) => {
    // 9:00 to 18:30
    const hour = 9 + Math.floor(i / 2);
    const minute = i % 2 === 0 ? '00' : '30';
    return `${String(hour).padStart(2, '0')}:${minute}`;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Takvim</h1>
          <p className="text-muted-foreground">
            Randevularınızı görüntüleyin ve yönetin.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled>
            <Bot className="mr-2 h-4 w-4" />
            Google Calendar&apos;a Bağlan
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Yeni Randevu Ekle
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Yeni Randevu Oluştur</DialogTitle>
                <DialogDescription>
                  Danışanınız için yeni bir seans planlayın. Seçilen tarih:{' '}
                  {date ? format(date, 'd MMMM yyyy', { locale: tr }) : ''}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="clientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Danışan</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Bir danışan seçin..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {clients.map(client => (
                              <SelectItem key={client.id} value={client.id}>
                                {client.displayName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Saat</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Saat seçin..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {timeSlots.map(slot => (
                                <SelectItem key={slot} value={slot}>
                                  {slot}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Seans Türü</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Tür seçin..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Online">Online</SelectItem>
                              <SelectItem value="Yüz Yüze">Yüz Yüze</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Açıklama (İsteğe Bağlı)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Seans hakkında kısa notlar..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button
                      type="submit"
                      disabled={form.formState.isSubmitting}
                    >
                      {form.formState.isSubmitting && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Randevu Oluştur
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
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
                        <p className="font-semibold">{app.clientName}</p>
                        <div className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
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
