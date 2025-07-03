import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Activity, FileText, Calendar } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Tekrar hoş geldiniz!</h1>
        <p className="text-muted-foreground">İşte zihinsel sağlık yolculuğunuzun bir özeti.</p>
      </div>

      <Card className="bg-primary/10 border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Yeni bir teste hazır mısınız?</CardTitle>
                <CardDescription>Yeni içgörüler kazanmak için Beck Depresyon Envanteri'ni başlatın.</CardDescription>
            </div>
            <Button asChild>
                <Link href="/dashboard/tests/beck-depression-inventory">
                    BDE-II Testine Başla <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        </CardHeader>
      </Card>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Son Etkinlik</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">BDE-II Tamamlandı</div>
            <p className="text-xs text-muted-foreground">28 Haziran 2024 tarihinde</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Test Sonuçları</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3 test yapıldı</div>
            <p className="text-xs text-muted-foreground">Tüm geçmiş sonuçlarınızı görüntüleyin</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Yaklaşan Randevular</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Randevu yok</div>
            <p className="text-xs text-muted-foreground">Terapistinizle senkronize edin</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
