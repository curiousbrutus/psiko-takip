"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Flame, Trophy, Award, BarChart3 } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const fetchGamificationData = async () => {
      if (user) {
        const gamificationRef = doc(db, 'gamification', user.uid);
        const docSnap = await getDoc(gamificationRef);
        if (docSnap.exists()) {
          setStreak(docSnap.data().currentStreak || 0);
        }
      }
    };
    fetchGamificationData();
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold font-headline">Tekrar hoş geldiniz!</h1>
          <p className="text-muted-foreground">Zihinsel sağlık yolculuğun seni bekliyor.</p>
        </div>
        <div className="flex items-center gap-2 bg-card p-3 rounded-lg shadow-sm border">
          <Flame className="h-6 w-6 text-primary" />
          <div className="flex flex-col">
            <span className="text-xl font-bold leading-none">{streak}</span>
            <span className="text-xs text-muted-foreground">Günlük Seri</span>
          </div>
        </div>
      </div>

      <Card className="bg-primary/10 border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Bugünkü Yolculuğuna Hazır mısın?</CardTitle>
                <CardDescription>Zihinsel esenliğin için günlük görevlerini tamamla ve serini devam ettir.</CardDescription>
            </div>
            <Button asChild>
                <Link href="/dashboard/journey">
                    Yolculuğa Başla <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        </CardHeader>
      </Card>
      
      <div className="space-y-4">
        <h2 className="text-2xl font-bold font-headline">İlerleme Paneli</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Lig Sıralaması</CardTitle>
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">Elmas Ligi</div>
                    <p className="text-xs text-muted-foreground">Sıralamada #3 sıradasın</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Başarımlar</CardTitle>
                    <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">12 Rozet</div>
                    <p className="text-xs text-muted-foreground">Son kazanılan: Zen Ustası</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Ruh Hali Takvimi</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">Çoğunlukla Sakin</div>
                    <p className="text-xs text-muted-foreground">Son 7 günün analizi</p>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  )
}
