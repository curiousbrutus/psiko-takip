'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { apiGetGamification, apiUpdateGamification } from '@/lib/api-client';
import {
  getCompanionVisual,
  getCompanionStageName,
  getNextStageLevel,
  getDefaultCompanionName,
  getLevelProgress,
  type CompanionType,
} from '@/lib/gamification';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Heart,
  Droplets,
  MessageCircle,
  Sun,
  Pencil,
  Check,
  Flame,
  Sparkles,
  Loader2,
} from 'lucide-react';

const AFFIRMATIONS = {
  pet: [
    'Bu ilgi çok iyi geldi, teşekkür ederim! 💚',
    'Seninle olmak beni huzurlu yapıyor.',
    'Sen kendine iyi baktıkça ben de mutlu oluyorum.',
    'Bugün burada olduğun için minnettarım.',
  ],
  feed: [
    'Ah, tam ihtiyacım olan buydu! Biraz daha güçlendim. 🌱',
    'Beslediğin her an biraz daha büyüyorum.',
    'Sabrınla besleniyorum; acele etmeye gerek yok.',
    'Küçük bakımlar, büyük değişimler yaratır.',
  ],
  talk: [
    'Bugün nasıl hissettiğini merak ediyorum. Zor bir gün olsa bile buradayım.',
    'Nefes al. Şu an güvendesin, birlikteyiz.',
    'Her duygu geçicidir; sen kalıcısın ve değerlisin.',
    'Kendine karşı biraz daha nazik olabilirsin, hak ediyorsun.',
    'Bugün küçük bir şey başardıysan, o da bir zaferdir.',
  ],
  checkin: [
    'Beni ziyaret ettiğin için çok mutluyum! Birlikte bir adım daha attık. 🌟',
    'İşte buradasın! Serimizi büyütmeye devam ediyoruz.',
    'Bugünün için teşekkürler; enerjim yükseldi!',
  ],
};

const rand = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
const todayKey = () => new Date().toISOString().slice(0, 10);

export default function CompanionPage() {
  const { user, userData } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [data, setData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [message, setMessage] = useState('');
  const [reacting, setReacting] = useState(false);
  const [checkedInToday, setCheckedInToday] = useState(false);
  const [busy, setBusy] = useState(false);

  const companionType: CompanionType | null =
    (data?.companion?.type as CompanionType) ??
    (data?.companionType as CompanionType) ??
    null;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGetGamification();
      if (res.success && res.data) {
        if (!res.data.companion && !res.data.companionType) {
          router.push('/dashboard/companion/onboarding');
          return;
        }
        setData(res.data);
      }
    } catch (error) {
      console.error('Error loading companion:', error);
      toast({
        title: 'Hata',
        description: 'Yoldaşın yüklenemedi.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [router, toast]);

  useEffect(() => {
    if (user) {
      load();
    } else {
      setLoading(false);
    }
  }, [user, load]);

  // Load name + daily check-in state from localStorage (per user).
  useEffect(() => {
    if (!user || !companionType) return;
    const uid = user.userId || user.uid;
    const savedName = localStorage.getItem(`companion_name_${uid}`);
    setName(savedName || getDefaultCompanionName(companionType));
    setCheckedInToday(
      localStorage.getItem(`companion_checkin_${uid}`) === todayKey()
    );
    setMessage(rand(AFFIRMATIONS.talk));
  }, [user, companionType]);

  const react = (bucket: keyof typeof AFFIRMATIONS) => {
    setMessage(rand(AFFIRMATIONS[bucket]));
    setReacting(true);
    setTimeout(() => setReacting(false), 700);
  };

  const saveName = () => {
    const trimmed = nameDraft.trim();
    if (trimmed && user) {
      const uid = user.userId || user.uid;
      localStorage.setItem(`companion_name_${uid}`, trimmed);
      setName(trimmed);
      toast({ title: 'Kaydedildi', description: `Yoldaşının adı: ${trimmed}` });
    }
    setEditingName(false);
  };

  const handleCheckIn = async () => {
    if (!user || checkedInToday || busy) return;
    setBusy(true);
    const prevLevel = data?.level ?? 1;
    try {
      await apiUpdateGamification(20, 'companion-checkin');
      const uid = user.userId || user.uid;
      localStorage.setItem(`companion_checkin_${uid}`, todayKey());
      setCheckedInToday(true);
      react('checkin');
      const res = await apiGetGamification();
      if (res.success && res.data) {
        setData(res.data);
        if ((res.data.level ?? 1) > prevLevel) {
          toast({
            title: '🎉 Seviye Atladın!',
            description: `Yoldaşın büyüdü — yeni seviye ${res.data.level}!`,
          });
        } else {
          toast({
            title: 'Günlük selam tamam! +20 enerji',
            description: 'Yarın tekrar uğramayı unutma.',
          });
        }
      }
    } catch (error) {
      console.error('Check-in error:', error);
      toast({
        title: 'Hata',
        description: 'Günlük selam kaydedilemedi.',
        variant: 'destructive',
      });
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-72 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    );
  }

  if (!companionType) {
    return (
      <Card className="max-w-xl mx-auto text-center">
        <CardHeader>
          <CardTitle>Henüz bir yoldaşın yok</CardTitle>
          <CardDescription>
            Yolculuğuna eşlik edecek bir yoldaş seç.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.push('/dashboard/companion/onboarding')}>
            Yoldaşını Seç
          </Button>
        </CardContent>
      </Card>
    );
  }

  const level = data?.level ?? 1;
  const xp = data?.xp ?? 0;
  const streak = data?.currentStreak ?? 0;
  const { xpIntoLevel, xpForLevel, progressPct } = getLevelProgress(xp, level);
  const stageName = getCompanionStageName(companionType, level);
  const nextStageLevel = getNextStageLevel(level);
  const visual = getCompanionVisual({ type: companionType }, level);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Yoldaşın: {name}
          </h1>
          <p className="text-muted-foreground">
            {stageName} · Seviye {level} · Sen büyüdükçe o da büyüyor.
          </p>
        </div>
        <Badge variant="secondary" className="gap-1 text-sm">
          <Flame className="h-4 w-4 text-primary" /> {streak} gün
        </Badge>
      </div>

      {/* Companion stage */}
      <Card className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-accent/5">
        <CardContent className="pt-8 pb-6 flex flex-col items-center">
          <div
            className="flex items-center justify-center h-44 w-44 rounded-full bg-gradient-to-br from-background to-muted/60 border shadow-inner mb-4"
            aria-live="polite"
          >
            <span
              className="text-8xl drop-shadow-sm transition-transform duration-300"
              style={{
                transform: reacting ? 'scale(1.25) rotate(-6deg)' : 'scale(1)',
                display: 'inline-block',
                animation: reacting ? undefined : 'breath 4s ease-in-out infinite',
              }}
            >
              {visual}
            </span>
          </div>

          {/* Speech bubble */}
          <div className="relative max-w-md text-center bg-card border rounded-2xl px-5 py-3 shadow-sm">
            <span
              className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 bg-card border-l border-t"
              aria-hidden
            />
            <p className="text-sm text-foreground/90 italic">“{message}”</p>
          </div>

          {/* Name editor */}
          <div className="mt-4">
            {editingName ? (
              <div className="flex items-center gap-2">
                <Input
                  value={nameDraft}
                  onChange={e => setNameDraft(e.target.value)}
                  maxLength={20}
                  placeholder="Bir isim ver"
                  className="h-8 w-40"
                  onKeyDown={e => e.key === 'Enter' && saveName()}
                  autoFocus
                />
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={saveName}>
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                onClick={() => {
                  setNameDraft(name);
                  setEditingName(true);
                }}
              >
                <Pencil className="mr-1 h-3 w-3" /> İsmini değiştir
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Progress */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> Büyüme
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              ⚡ Enerji
            </span>
            <span className="font-semibold">
              {xpIntoLevel} / {xpForLevel}
            </span>
          </div>
          <Progress value={progressPct} className="h-3" />
          <p className="text-xs text-muted-foreground">
            {nextStageLevel
              ? `Bir sonraki aşama için Seviye ${nextStageLevel}. Yolculuk görevleri ve günlük selam enerji kazandırır.`
              : 'Yoldaşın tümüyle büyüdü — ama yolculuk hiç bitmez. 🌸'}
          </p>
        </CardContent>
      </Card>

      {/* Interactions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Etkileşim</CardTitle>
          <CardDescription>
            Yoldaşınla vakit geçir. Günlük selam enerji kazandırır.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Button
            variant="default"
            className="flex-col h-auto py-4 gap-1"
            onClick={handleCheckIn}
            disabled={checkedInToday || busy}
          >
            {busy ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <Sun className="h-6 w-6" />
            )}
            <span className="text-xs">
              {checkedInToday ? 'Bugün selamladın' : 'Günlük Selam +20'}
            </span>
          </Button>
          <Button
            variant="outline"
            className="flex-col h-auto py-4 gap-1"
            onClick={() => react('pet')}
          >
            <Heart className="h-6 w-6 text-rose-500" />
            <span className="text-xs">Sev</span>
          </Button>
          <Button
            variant="outline"
            className="flex-col h-auto py-4 gap-1"
            onClick={() => react('feed')}
          >
            <Droplets className="h-6 w-6 text-sky-500" />
            <span className="text-xs">
              {companionType === 'plant' ? 'Su Ver' : 'Besle'}
            </span>
          </Button>
          <Button
            variant="outline"
            className="flex-col h-auto py-4 gap-1"
            onClick={() => react('talk')}
          >
            <MessageCircle className="h-6 w-6 text-primary" />
            <span className="text-xs">Konuş</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
