import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Logo } from '@/components/logo';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
       <div className="absolute top-4 left-4">
        <Logo />
      </div>
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-headline font-bold text-foreground mb-4">
          Psikotakip'e Hoş Geldiniz
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Zihinsel sağlık yolculuğunuzda size nasıl yardımcı olabiliriz? Lütfen rolünüzü seçin.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="font-bold">
            <Link href="/login">
              Danışan Olarak Devam Et
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="font-bold">
            <Link href="/therapist/login">
              Terapist Olarak Devam Et
            </Link>
          </Button>
        </div>
        <div className="mt-6">
            <p className="text-sm text-muted-foreground">Terapist misiniz? Profesyonel araçlarımızı keşfedin.</p>
        </div>
      </div>
    </main>
  );
}
