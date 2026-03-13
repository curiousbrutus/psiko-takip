'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  PlusCircle,
  Users,
  Calendar,
  Activity,
  UserCheck,
  ClipboardList,
  ChevronRight,
} from 'lucide-react';
import { apiGetClients, apiGetAppointments } from '@/lib/api-client';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

export default function TherapistDashboardPage() {
  const [stats, setStats] = useState({
    clients: 0,
    appointments: 0,
    assessments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsRes, appointmentsRes] = await Promise.all([
          apiGetClients(),
          apiGetAppointments('terapist'),
        ]);

        setStats({
          clients: clientsRes.data?.length || 0,
          appointments: appointmentsRes.data?.length || 0,
          assessments: 0, // Placeholder for pending assessments
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const StatCard = ({
    title,
    value,
    description,
    icon: Icon,
    color,
  }: {
    title: string;
    value: number | string;
    description: string;
    icon: any;
    color: string;
  }) => (
    <Card className="overflow-hidden border-none shadow-sm card-hover-lift">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg ${color} bg-opacity-15`}>
          <Icon className={`h-4 w-4 ${color.replace('bg-', 'text-')}`} />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-16 mb-1" />
        ) : (
          <div className="text-3xl font-bold">{value}</div>
        )}
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold font-headline tracking-tight text-foreground">
            Klinik Özet
          </h1>
          <p className="text-muted-foreground mt-1">
            Bugün için planlanmış 1 randevunuz var.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="rounded-xl border-emerald-100 bg-emerald-50/30 text-emerald-800 hover:bg-emerald-50"
          >
            <Calendar className="mr-2 h-4 w-4" /> Takvimi Aç
          </Button>
          <Button className="rounded-xl bg-[#1a5c45] hover:bg-[#154d39] text-white shadow-lg shadow-emerald-900/10">
            <PlusCircle className="mr-2 h-4 w-4" /> Yeni Danışan
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Toplam Danışan"
          value={stats.clients}
          description="+2 yeni bu ay"
          icon={Users}
          color="bg-blue-500"
        />
        <StatCard
          title="Bugünkü Randevular"
          value={stats.appointments}
          description="En yakını: 14:30'da"
          icon={UserCheck}
          color="bg-emerald-500"
        />
        <StatCard
          title="Bekleyen Testler"
          value={5}
          description="3 yeni değerlendirme bekliyor"
          icon={ClipboardList}
          color="bg-amber-500"
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-none shadow-sm flex flex-col h-full bg-gradient-to-br from-white to-emerald-50/30 dark:from-card dark:to-emerald-950/10">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-600" />
              Klinik Aktivite Akışı
            </CardTitle>
            <CardDescription>
              Danışanlarınızın son sistem etkileşimleri
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-6">
              {[
                {
                  name: 'Ali V.',
                  task: 'Beck Depresyon',
                  status: 'Tamamlandı',
                  time: '45 dk önce',
                },
                {
                  name: 'Ayşe Y.',
                  task: 'Günlük Günlük',
                  status: 'Paylaşıldı',
                  time: '2 sa önce',
                },
                {
                  name: 'Zeynep T.',
                  task: 'Randevu Talebi',
                  status: 'Beklemede',
                  time: 'Dün',
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between group cursor-pointer hover:bg-white/50 dark:hover:bg-accent/50 p-2 -mx-2 rounded-xl transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                      {item.name[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.task} —{' '}
                        <span className="text-emerald-600 font-medium">
                          {item.status}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-muted-foreground font-medium">
                      {item.time}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
            <Button
              variant="ghost"
              className="w-full mt-6 text-sm text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 font-medium"
            >
              Tüm Aktiviteyi Gör
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-none shadow-sm flex flex-col h-full">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Günün Ajandası
            </CardTitle>
            <CardDescription>Planlanmış randevu ve görevler</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 px-0">
            <div className="space-y-1">
              {[
                { time: '10:30', title: 'Danışan Görüşmesi', with: 'Can D.' },
                { time: '14:00', title: 'Vaka Analizi', with: 'Klinik Ekip' },
                { time: '16:30', title: 'Yeni Değerlendirme', with: 'Merve S.' },
              ].map((slot, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-muted/50 transition-colors border-l-2 border-transparent hover:border-blue-500"
                >
                  <span className="text-sm font-bold text-blue-600 w-12 shrink-0">
                    {slot.time}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{slot.title}</p>
                    <p className="text-xs text-muted-foreground font-medium">
                      {slot.with}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

