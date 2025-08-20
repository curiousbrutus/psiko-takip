import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Phone, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function EmergencySupportPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-destructive/10 p-4">
      <Card className="w-full max-w-lg border-destructive shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive text-destructive-foreground">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <CardTitle className="text-3xl font-bold text-destructive mt-4">
            Acil Destek
          </CardTitle>
          <CardDescription className="text-lg">
            Yalnız değilsin ve yardım mevcut.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-muted-foreground">
            Zor bir zamandan geçtiğini anlıyoruz. Lütfen aşağıdaki kaynaklardan
            biriyle hemen iletişime geç. Konuşacak birileri her zaman var.
          </p>
          <div className="space-y-4">
            <a href="tel:112" className="block w-full">
              <Button variant="destructive" size="lg" className="w-full">
                <Phone className="mr-2 h-5 w-5" />
                112 Acil Çağrı Merkezi'ni Ara
              </Button>
            </a>
            <a
              href="https://www.psikolog.org.tr/acil-durum"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full"
            >
              <Button variant="outline" size="lg" className="w-full">
                Türkiye Psikologlar Derneği Acil Durum
              </Button>
            </a>
            <p className="text-xs text-center text-muted-foreground pt-4">
              Not: Kurumsal bir hesaba bağlıysanız, kurumunuzun yetkili birimine
              de bir kriz durumu sinyali (kimliğiniz gizli tutularak) iletilmiş
              olabilir. Lütfen kurumunuzun acil durum prosedürlerini de takip
              edin.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="ghost" className="w-full" asChild>
            <Link href="/dashboard">Kontrol Paneline Dön</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
