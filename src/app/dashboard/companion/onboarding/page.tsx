
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase/config';
import { doc, updateDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type CompanionType = 'plant' | 'animal';

export default function CompanionOnboardingPage() {
  const [selected, setSelected] = useState<CompanionType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSelect = async () => {
    if (!selected || !user) return;
    setIsLoading(true);

    const gamificationRef = doc(db, 'gamification', user.uid);
    try {
      await updateDoc(gamificationRef, {
        companion: {
          type: selected,
          createdAt: new Date(),
        }
      });
      toast({ title: "Harika seçim!", description: "Yolculuğun başlıyor." });
      
      router.push('/dashboard');
      // router.refresh(); // Removed this line. The onSnapshot listener on dashboard will handle the update.

    } catch (error) {
      console.error("Error selecting companion: ", error);
      toast({ title: "Hata", description: "Yoldaşın seçilemedi, lütfen tekrar dene.", variant: "destructive" });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4 bg-muted/30">
        <div className="text-center mb-8 max-w-2xl">
            <h1 className="text-4xl font-bold font-headline text-primary">Bir Yol Arkadaşı Seç</h1>
            <p className="text-lg text-muted-foreground mt-2">
                Zihinsel sağlık yolculuğunda sana kimin eşlik etmesini istersin? Seçimin, yolculuğunun bir yansıması olacak ve seninle birlikte büyüyecek.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
            <Card 
                className={cn("cursor-pointer transition-all duration-300 hover:shadow-xl", selected === 'plant' ? 'border-primary ring-2 ring-primary shadow-lg' : '')}
                onClick={() => setSelected('plant')}
            >
                <CardContent className="flex flex-col items-center text-center p-6 aspect-square justify-center">
                    <span className="text-8xl mb-4">🌱</span>
                    <h3 className="text-2xl font-bold">Filiz</h3>
                    <p className="text-muted-foreground mt-2">Sabırla, ilgiyle büyüyen ve zamanla çiçek açan bir can. Köklerini salarak güçlenen bir yolculuğu temsil eder.</p>
                </CardContent>
            </Card>
            <Card 
                className={cn("cursor-pointer transition-all duration-300 hover:shadow-xl", selected === 'animal' ? 'border-primary ring-2 ring-primary shadow-lg' : '')}
                onClick={() => setSelected('animal')}
            >
                <CardContent className="flex flex-col items-center text-center p-6 aspect-square justify-center">
                    <span className="text-8xl mb-4">🥚</span>
                    <h3 className="text-2xl font-bold">Töz</h3>
                    <p className="text-muted-foreground mt-2">Gizemli, keşfedilmeyi bekleyen bir dost. İçindeki potansiyeli ortaya çıkarmak için senin ilgini bekler.</p>
                </CardContent>
            </Card>
        </div>

        <Button 
            size="lg" 
            className="mt-12" 
            disabled={!selected || isLoading}
            onClick={handleSelect}
        >
            {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            Bu Yoldaşla Başla
        </Button>
    </div>
  );
}
