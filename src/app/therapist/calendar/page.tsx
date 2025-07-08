"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Clock, Video } from 'lucide-react';
import { addDays, startOfToday } from 'date-fns';

// Dummy data for appointments
const appointments = [
    {
        date: new Date(new Date().setHours(10, 0, 0, 0)),
        client: 'Ali V.',
        type: 'Bireysel Seans',
        isOnline: true,
    },
    {
        date: new Date(new Date().setHours(14, 0, 0, 0)),
        client: 'Ayşe Y.',
        type: 'Bireysel Seans',
        isOnline: false,
    },
    {
        date: addDays(startOfToday(), 2).setHours(11, 30, 0, 0),
        client: 'Zeynep K.',
        type: 'Çift Terapisi',
        isOnline: true,
    }
].map(a => ({...a, date: new Date(a.date)}));

export default function CalendarPage() {
    const [date, setDate] = useState<Date | undefined>(new Date());

    const selectedDayAppointments = appointments.filter(
        (app) => date && app.date.toDateString() === date.toDateString()
    ).sort((a, b) => a.date.getTime() - b.date.getTime());

    const appointmentDates = appointments.map(a => a.date);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Takvim</h1>
                    <p className="text-muted-foreground">Randevularınızı görüntüleyin ve yönetin.</p>
                </div>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Yeni Randevu Ekle
                </Button>
            </div>
            <div className="grid lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="p-3 w-full"
                        modifiers={{
                            hasAppointment: appointmentDates
                        }}
                        modifiersClassNames={{
                            hasAppointment: 'has-appointment'
                        }}
                    />
                </Card>
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                {date ? new Intl.DateTimeFormat('tr-TR', { dateStyle: 'full' }).format(date) : "Bir tarih seçin"}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {selectedDayAppointments.length > 0 ? (
                                <ul className="space-y-4">
                                    {selectedDayAppointments.map((app, index) => (
                                        <li key={index} className="flex items-start gap-4 p-3 bg-muted/50 rounded-lg border">
                                            <div className="font-semibold text-primary flex-shrink-0 mt-1">
                                                {app.date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-semibold">{app.client}</p>
                                                <div className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                                                    {app.isOnline ? <Badge variant="outline" className="text-primary border-primary/50"><Video className="mr-1 h-3 w-3"/> Online</Badge> : <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" />Yüz Yüze</Badge>}
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
