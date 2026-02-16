import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Users, Calendar, BarChart } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const recentActivity = [
  {
    id: 1,
    client: 'Ali V.',
    activity: 'Beck Depresyon Envanterini tamamladı.',
    time: '1 saat önce',
  },
  {
    id: 2,
    client: 'Ayşe Y.',
    activity: 'Günlük yolculuk görevini tamamladı.',
    time: '3 saat önce',
  },
  {
    id: 3,
    client: 'Mehmet K.',
    activity: 'Yeni bir randevu talep etti.',
    time: 'dün',
  },
];

export default function TherapistDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold font-headline">Kontrol Paneli</h1>
          <p className="text-muted-foreground">
            Danışanlarınızı ve randevularınızı yönetin.
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Yeni Danışan Ekle
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Toplam Danışan
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-muted-foreground">+2 yeni bu ay</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Yaklaşan Randevular
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Bugün için</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Bekleyen Talepler
            </CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">
              Yeni test sonuçları ve randevu talepleri
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Son Aktiviteler</CardTitle>
          <CardDescription>Danışanlarınızın son aktiviteleri.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Danışan</TableHead>
                <TableHead>Aktivite</TableHead>
                <TableHead className="text-right">Zaman</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentActivity.map(activity => (
                <TableRow key={activity.id}>
                  <TableCell className="font-medium">
                    {activity.client}
                  </TableCell>
                  <TableCell>{activity.activity}</TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {activity.time}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
