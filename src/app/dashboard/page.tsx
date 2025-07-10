
"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase/config';
import { doc, onSnapshot } from 'firebase/firestore';
import type { DocumentData, Timestamp } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Flame, Trophy, Award, BarChart3, Lightbulb, Heart, Leaf } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Progress } from '@/components/ui/progress';

interface DailyInsight {
  title: string;
  description: string;
  link: string;
  linkText: string;
}

const getXpToNextLevel = (level: number) => 100 + (level - 1) * 50;

const getCompanionVisual = (companion: { type: 'plant' | 'animal' }, level: number): string => {
  if (companion.type === 'plant') {
    if (level >= 10) return '🌸'; // Flowering Plant
    if (level >= 5) return '🌳'; // Tree
    return '🌱'; // Sprout
  }
  if (companion.type === 'animal') {
    if (level >= 10) return '🦊'; // Fox
    if (level >= 5) return '🐾'; // Hatched
    return '🥚'; // Egg
  }
  return '❓';
}

export default function DashboardPage() {
  const { user, userData } = useAuth();
  const [gamificationData, setGamificationData] = useState<DocumentData | null>(null);
  const [dailyInsight, setDailyInsight] = useState<DailyInsight | null>(null);

  const generateDailyInsight = (lastActivityDate: Timestamp | null) => {
    let insight: DailyInsight;
    const now = new Date();
    
    if (lastActivityDate) {
        const lastActivity = lastActivityDate.toDate();
        const hoursSinceLastActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);

        if (hoursSinceLastActivity < 24) {
             insight = {
                title: "Harika Gidiyorsun!",
                description: `Dün yolculuğunu tamamladın. Serini devam ettirmek için bugünkü görevlerine göz at.`,
                link: "/dashboard/journey",
                linkText: "Yolculuğa Devam Et"
            };
        } else {
             insight = {
                title: "Yolculuğun Seni Bekliyor",
                description: `${formatDistanceToNow(lastActivity, { locale: tr, addSuffix: true })} giriş yaptın. Küçük bir adımla büyük bir fark yaratabilirsin.`,
                link: "/dashboard/journey",
                linkText: "Yolculuğa Başla"
            };
        }
    } else {
        insight = {
            title: "İlk Adımı Atmaya Hazır mısın?",
            description: "Günlük yolculuk görevlerin zihinsel esenliğini desteklemek için tasarlandı. Hadi başlayalım!",
            link: "/dashboard/journey",
            linkText: "Yolculuğa Başla"
        };
    }
    setDailyInsight(insight);
  }

  useEffect(() => {
    if (!user) {
        generateDailyInsight(null);
        return;
    };
    
    const gamificationRef = doc(db, 'gamification', user.uid);
    const unsubscribe = onSnapshot(gamificationRef, (doc) => {
        if (doc.exists()) {
            const data = doc.data();
            setGamificationData(data);
            generateDailyInsight(data.lastActivityDate);
        } else {
            generateDailyInsight(null);
        }
    });

    return () => unsubscribe();
    
  }, [user]);

  const CompanionCard = () => {
    if (!gamificationData || !gamificationData.companion) {
      return (
        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle>Ruhsal Yoldaş</CardTitle>
            <CardDescription>Yolculuğuna başlamak için bir yoldaş seç.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dashboard/companion/onboarding">Yoldaşını Seç</Link>
            </Button>
          </CardContent>
        </Card>
      );
    }
    
    const { companion, level, xp } = gamificationData;
    const xpToNextLevel = getXpToNextLevel(level);
    const progressPercentage = (xp / xpToNextLevel) * 100;

    return (
       <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {companion.type === 'plant' ? <Leaf className="text-primary"/> : <Heart className="text-primary"/>}
            Ruhsal Yoldaşın
          </CardTitle>
          <CardDescription>Seviye {level}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex justify-center items-center h-24 bg-background rounded-md">
                <span className="text-6xl transition-all duration-500">
                    {getCompanionVisual(companion, level)}
                </span>
            </div>
            <div>
              <div className="flex justify-between items-center text-sm mb-1">
                <span className="text-muted-foreground">Enerji</span>
                <span className="font-semibold">{xp} / {xpToNextLevel}</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h1 className="text-3xl font-bold font-headline">Tekrar hoş geldiniz, {userData?.displayName?.split(' ')[0] || ''}!</h1>
            <p className="text-muted-foreground">Zihinsel sağlık yolculuğun seni bekliyor.</p>
          </div>

          {dailyInsight && (
            <Card className="bg-primary/10 border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2"><Lightbulb className="h-5 w-5 text-primary" /> {dailyInsight.title}</CardTitle>
                        <CardDescription className="mt-2">{dailyInsight.description}</CardDescription>
                    </div>
                    <Button asChild>
                        <Link href={dailyInsight.link}>
                            {dailyInsight.linkText} <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </CardHeader>
            </Card>
          )}
        </div>

        <div className="lg:col-span-1 space-y-6">
             <div className="flex items-center gap-2 bg-card p-3 rounded-lg shadow-sm border justify-center">
              <Flame className="h-6 w-6 text-primary" />
              <div className="flex flex-col">
                <span className="text-xl font-bold leading-none">{gamificationData?.currentStreak || 0}</span>
                <span className="text-xs text-muted-foreground">Günlük Seri</span>
              </div>
            </div>
            <CompanionCard />
        </div>

      </div>
      
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

    