'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { apiGetGamification, apiGetTestSubmissions } from '@/lib/api-client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

import {
  ArrowRight,
  Flame,
  Lightbulb,
  Heart,
  Leaf,
  BrainCircuit,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Progress } from '@/components/ui/progress';
import { useRouter } from 'next/navigation';
import { getXpToNextLevel, getCompanionVisual } from '@/lib/gamification';
import { Skeleton } from '@/components/ui/skeleton';


interface DailyInsight {
  title: string;
  description: string;
  link: string;
  linkText: string;
}

export default function DashboardPage() {
  const { user, userData } = useAuth();
  const [gamificationData, setGamificationData] = useState<Record<
    string,
    any
  > | null>(null);
  const [testSubmissions, setTestSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dailyInsight, setDailyInsight] = useState<DailyInsight | null>(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const router = useRouter();

  const prevLevel = useRef<number | null>(null);

  const generateDailyInsight = useCallback(
    (lastActivityDate: string | Date | null) => {
      let insight: DailyInsight;
      const now = new Date();

      if (lastActivityDate) {
        const lastActivity = new Date(lastActivityDate);
        const hoursSinceLastActivity =
          (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);

        if (hoursSinceLastActivity < 24) {
          insight = {
            title: 'Harika Gidiyorsun!',
            description: `Dün yolculuğunu tamamladın. Serini devam ettirmek için bugünkü görevlerine göz at.`,
            link: '/dashboard/journey',
            linkText: 'Yolculuğa Devam Et',
          };
        } else {
          insight = {
            title: 'Yolculuğun Seni Bekliyor',
            description: `${formatDistanceToNow(lastActivity, { locale: tr, addSuffix: true })} giriş yaptın. Küçük bir adımla büyük bir fark yaratabilirsin.`,
            link: '/dashboard/journey',
            linkText: 'Yolculuğa Başla',
          };
        }
      } else {
        insight = {
          title: 'İlk Adımı Atmaya Hazır mısın?',
          description:
            'Günlük yolculuk görevlerin zihinsel esenliğini desteklemek için tasarlandı. Hadi başlayalım!',
          link: '/dashboard/journey',
          linkText: 'Yolculuğa Başla',
        };
      }
      setDailyInsight(insight);
    },
    []
  );

  useEffect(() => {
    if (!user) {
      generateDailyInsight(null);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [gamificationRes, testsRes] = await Promise.all([
          apiGetGamification(),
          apiGetTestSubmissions(),
        ]);

        if (gamificationRes.success && gamificationRes.data) {
          const data = gamificationRes.data;
          if (prevLevel.current !== null && data.level > prevLevel.current) {
            setShowLevelUp(true);
            setTimeout(() => setShowLevelUp(false), 3000);
          }
          prevLevel.current = data.level;
          setGamificationData(data);
          generateDailyInsight(data.lastActivityDate);
          if (!data.companion) {
            router.push('/dashboard/companion/onboarding');
          }
        }

        if (testsRes.success) {
          setTestSubmissions(testsRes.data || []);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, userData, router, generateDailyInsight]);

  const CompanionCard = () => {
    if (!gamificationData || !gamificationData.companion) {
      return (
        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle>Ruhsal Yoldaş</CardTitle>
            <CardDescription>
              Yolculuğuna başlamak için bir yoldaş seç.
            </CardDescription>
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
      <Card className="bg-gradient-to-br from-muted/30 to-muted/10 card-hover-lift relative overflow-hidden">
        {showLevelUp && (
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 flex items-center justify-center z-10 animate-level-up-fade">
            <div className="text-center text-primary">
              <p className="text-2xl font-bold">🎉 Seviye Atladın!</p>
              <p className="text-lg">Yeni Seviye: {level}</p>
              <p className="text-sm opacity-80">
                Tebrikler! Harika bir gelişim! 🌟
              </p>
            </div>
          </div>
        )}
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="animate-gentle-pulse">
              {companion.type === 'plant' ? (
                <Leaf className="text-primary" />
              ) : (
                <Heart className="text-primary" />
              )}
            </div>
            Ruhsal Yoldaşın
            <span className="text-sm bg-primary/10 px-2 py-1 rounded-full">
              Seviye {level}
            </span>
          </CardTitle>
          <CardDescription className="flex items-center gap-2">
            <span>🌸 Birlikte büyüyoruz</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center items-center h-28 bg-gradient-to-br from-background to-muted/50 rounded-xl border">
            <div className="animate-breath">
              <span className="text-7xl transition-all duration-500 drop-shadow-sm">
                {getCompanionVisual(companion, level)}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                ⚡ Enerji
              </span>
              <span className="font-semibold">
                {xp} / {xpToNextLevel}
              </span>
            </div>
            <div className="relative">
              <Progress
                value={progressPercentage}
                className="h-3 progress-turkish"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full animate-pulse" />
            </div>
            <p className="text-xs text-center text-muted-foreground italic">
              💪 Her küçük adım, büyük değişimlerin başlangıcı
            </p>
          </div>
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link href="/dashboard/companion">
              Yoldaşınla vakit geçir <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-3">
            <h1 className="text-4xl font-bold font-headline bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent animate-slide-up-gentle">
              Hoş geldin, {userData?.displayName?.split(' ')[0] || 'Değerli'}!
              🌟
            </h1>
            <div className="space-y-1">
              <p className="text-muted-foreground text-lg">
                Zihinsel sağlık yolculuğun seni bekliyor.
              </p>
              <p className="text-sm text-primary font-medium flex items-center gap-2">
                <span>🌱</span>
                <span>Her gün biraz daha güçlü, biraz daha huzurlu.</span>
              </p>
            </div>
          </div>

          {dailyInsight && (
            <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20 card-hover-lift">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="space-y-2">
                  <CardTitle className="flex items-center gap-2">
                    <div className="animate-gentle-pulse">
                      <Lightbulb className="h-5 w-5 text-primary" />
                    </div>
                    {dailyInsight.title}
                  </CardTitle>
                  <CardDescription className="mt-2 text-base leading-relaxed">
                    {dailyInsight.description}
                  </CardDescription>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>💝</span>
                    <span className="italic">Günlük motivasyon desteğiniz</span>
                  </div>
                </div>
                <Button asChild className="animate-breath">
                  <Link href={dailyInsight.link}>
                    {dailyInsight.linkText}{' '}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
            </Card>
          )}

          {testSubmissions.length > 0 && (
            <Card className="border-none shadow-sm bg-card overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center gap-2">
                  <BrainCircuit className="h-5 w-5 text-primary" />
                  Son Test Sonuçlarınız
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {testSubmissions.slice(0, 3).map((sub, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-muted"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                          <BrainCircuit className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">
                            {sub.testName}
                          </p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                            {format(
                              new Date(sub.submittedAt || sub.assignedAt),
                              'd MMM yyyy',
                              { locale: tr }
                            )}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-white">
                        {sub.totalScore} Puan
                      </Badge>
                    </div>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="w-full text-primary hover:bg-primary/5 mt-2"
                  >
                    <Link href="/dashboard/tests">
                      Tüm Testleri Gör <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="flex items-center gap-2 bg-gradient-to-r from-card to-card/80 p-4 rounded-xl shadow-sm border justify-center card-hover-lift">
            <div className="animate-gentle-pulse">
              <Flame className="h-6 w-6 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold leading-none">
                {gamificationData?.currentStreak || 0}
              </span>
              <span className="text-xs text-muted-foreground">Günlük Seri</span>
              <span className="text-xs text-primary font-medium">
                🎯 Harika gidiyorsun!
              </span>
            </div>
          </div>
          <CompanionCard />
        </div>
      </div>
    </div>
  );
}
