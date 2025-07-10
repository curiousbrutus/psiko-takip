
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp, query, where, getDocs, limit, doc, updateDoc, getDoc, increment } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Sunrise, Sun, Sunset, Smile, Leaf, Meh, HeartPulse, Frown, Wind, BrainCircuit, Book, Sparkles, Loader2, Share2, Feather, Droplets, Flame, Waves } from 'lucide-react';
import Link from 'next/link';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const moodOptions = [
  { name: 'Mutlu', icon: Smile },
  { name: 'Sakin', icon: Leaf },
  { name: 'Nötr', icon: Meh },
  { name: 'Üzgün', icon: Frown },
  { name: 'Endişeli', icon: HeartPulse },
];

export default function DailyJourneyPage() {
  const { user, userData } = useAuth();
  const { toast } = useToast();

  const [morningMood, setMorningMood] = useState<string | null>(null);
  const [morningNiyet, setMorningNiyet] = useState("");
  const [eveningMood, setEveningMood] = useState<string | null>(null);
  const [minnettar, setMinnettar] = useState("");
  const [gunluk, setGunluk] = useState("");
  
  const [isMinnettarShared, setIsMinnettarShared] = useState(false);
  const [isGunlukShared, setIsGunlukShared] = useState(false);

  const [tasksCompleted, setTasksCompleted] = useState({
    morning: false,
    evening: false,
  });

  const [loading, setLoading] = useState({ morning: false, evening: false });

  // Function to check if a task was completed today
  const checkIfTaskCompletedToday = async (taskName: string) => {
    if (!user) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const q = query(
        collection(db, 'journalEntries'), 
        where('userId', '==', user.uid),
        where('prompt', '==', taskName),
        where('createdAt', '>=', today),
        limit(1)
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  useEffect(() => {
    const checkCompletionStatus = async () => {
        if (user) {
            const morningDone = await checkIfTaskCompletedToday("Günün Niyeti");
            // This is a simplified check. A full implementation would check all evening tasks.
            const eveningDone = await checkIfTaskCompletedToday("Serbest Günlük"); 
            setTasksCompleted({ morning: morningDone, evening: eveningDone });
        }
    };
    checkCompletionStatus();
  }, [user]);

  const updateGamificationStats = async (xp: number) => {
      if (!user) return;
      
      const gamificationRef = doc(db, 'gamification', user.uid);
      
      try {
        const docSnap = await getDoc(gamificationRef);
        if (docSnap.exists()) {
             await updateDoc(gamificationRef, {
                xp: increment(xp),
                lastActivityDate: serverTimestamp(),
            });
        }
      } catch (e) {
        console.error("Error updating gamification stats:", e);
      }
  };

  const completeTask = async (task: 'morning' | 'evening') => {
    if (!user) {
        toast({
            title: "Giriş Gerekli",
            description: "Bu özelliği kullanmak için lütfen kayıt olun veya giriş yapın.",
            variant: "destructive",
        });
        return;
    }
    
    setLoading(prev => ({ ...prev, [task]: true }));

    try {
        let xpGained = 0;
        if (task === 'morning') {
            if (!morningMood) {
                toast({ title: "Hata", description: "Lütfen sabah ruh halinizi seçin.", variant: "destructive" });
                setLoading(prev => ({...prev, morning: false}));
                return;
            }
            await addDoc(collection(db, 'moodEntries'), {
                userId: user.uid,
                mood: morningMood,
                triggers: [], 
                createdAt: serverTimestamp(),
                period: 'morning'
            });
            await addDoc(collection(db, 'journalEntries'), {
                userId: user.uid,
                content: morningNiyet,
                prompt: "Günün Niyeti",
                isShared: false, // Morning intentions are private by default
                createdAt: serverTimestamp(),
            });
            xpGained = 10;
        }
        
        if (task === 'evening') {
             if (!eveningMood) {
                toast({ title: "Hata", description: "Lütfen akşam ruh halinizi seçin.", variant: "destructive" });
                setLoading(prev => ({...prev, evening: false}));
                return;
            }
            await addDoc(collection(db, 'moodEntries'), {
                userId: user.uid,
                mood: eveningMood,
                triggers: [],
                createdAt: serverTimestamp(),
                period: 'evening'
            });
             await addDoc(collection(db, 'journalEntries'), {
                userId: user.uid,
                content: minnettar,
                prompt: "Bugün minnettar olduğun 3 şey nedir?",
                isShared: isMinnettarShared,
                createdAt: serverTimestamp(),
            });
             await addDoc(collection(db, 'journalEntries'), {
                userId: user.uid,
                content: gunluk,
                prompt: "Serbest Günlük",
                isShared: isGunlukShared,
                createdAt: serverTimestamp(),
            });
            xpGained = 15;
        }
        
        await updateGamificationStats(xpGained);

        toast({ title: "Kaydedildi!", description: `Günün bu bölümünü başarıyla tamamladın. +${xpGained} XP kazandın!` });
        setTasksCompleted(prev => ({...prev, [task]: true}));

    } catch (error) {
        console.error("Error completing task: ", error);
        toast({ title: "Hata", description: "Göreviniz kaydedilemedi. Lütfen tekrar deneyin.", variant: "destructive" });
    } finally {
        setLoading(prev => ({ ...prev, [task]: false }));
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Günlük Yolculuk</h1>
        <p className="text-muted-foreground">Her gün küçük bir adım atarak zihinsel sağlığını güçlendir.</p>
      </div>

      <Accordion type="multiple" defaultValue={["item-1"]} className="w-full space-y-4">
        <AccordionItem value="item-1" className="border-none">
          <Card>
            <AccordionTrigger className="p-6 hover:no-underline [&[data-state=open]>div>svg.lucide-check-circle-2]:hidden" disabled={tasksCompleted.morning}>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-4">
                  <Sunrise className="h-6 w-6 text-primary" />
                  <div>
                    <CardTitle className="text-xl text-left">Sabah Başlangıcı (+10 XP)</CardTitle>
                    <p className="text-sm text-muted-foreground font-normal">Güne bilinçli bir başlangıç yap.</p>
                  </div>
                </div>
                {tasksCompleted.morning && <CheckCircle2 className="h-6 w-6 text-green-500" />}
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-6 pt-0">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Bugün nasıl hissediyorsun?</h3>
                  <div className="flex gap-2 flex-wrap">
                    {moodOptions.map(mood => (
                      <Button 
                        key={mood.name} 
                        variant={morningMood === mood.name ? "default" : "outline"} 
                        className="flex-col h-20 w-20"
                        onClick={() => setMorningMood(mood.name)}
                      >
                        <mood.icon className="h-6 w-6 mb-1" />
                        <span>{mood.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Günün Niyeti</h3>
                  <Textarea placeholder="Bugün kendim için yapacağım küçük bir şey... (Örn: 10 dakika mola vereceğim)" value={morningNiyet} onChange={(e) => setMorningNiyet(e.target.value)} />
                </div>
                <Button onClick={() => completeTask('morning')} disabled={loading.morning || tasksCompleted.morning}>
                  {loading.morning && <Loader2 className="animate-spin mr-2" />}
                  {tasksCompleted.morning ? "Tamamlandı" : "Sabah Görevini Tamamla"}
                </Button>
              </div>
            </AccordionContent>
          </Card>
        </AccordionItem>
        <AccordionItem value="item-2" className="border-none">
          <Card>
            <AccordionTrigger className="p-6 hover:no-underline [&[data-state=open]>div>svg.lucide-check-circle-2]:hidden" disabled={tasksCompleted.evening}>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-4">
                  <Sunset className="h-6 w-6 text-primary" />
                  <div>
                    <CardTitle className="text-xl text-left">Akşam Değerlendirmesi (+15 XP)</CardTitle>
                    <p className="text-sm text-muted-foreground font-normal">Günü yansıt ve zihnini dinlendir.</p>
                  </div>
                </div>
                {tasksCompleted.evening && <CheckCircle2 className="h-6 w-6 text-green-500" />}
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-6 pt-0">
                <div className="space-y-6">
                    <div>
                        <h3 className="font-semibold mb-2 flex items-center gap-2"><Flame className="h-4 w-4 text-accent" /> Bugün minnettar olduğun 3 şey nedir?</h3>
                        <Textarea placeholder="1. ..." value={minnettar} onChange={(e) => setMinnettar(e.target.value)} />
                        {userData?.connectedTherapist && (
                          <div className="flex items-center space-x-2 mt-2">
                            <Switch id="share-minnettar" checked={isMinnettarShared} onCheckedChange={setIsMinnettarShared} />
                            <Label htmlFor="share-minnettar" className="text-sm text-muted-foreground flex items-center gap-1"><Share2 className="h-3 w-3"/> Terapistle paylaş</Label>
                          </div>
                        )}
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2 flex items-center gap-2"><Book className="h-4 w-4 text-accent" /> Serbest Günlük</h3>
                        <Textarea placeholder="Aklından geçenleri buraya yazabilirsin..." value={gunluk} onChange={(e) => setGunluk(e.target.value)} />
                         {userData?.connectedTherapist && (
                          <div className="flex items-center space-x-2 mt-2">
                            <Switch id="share-gunluk" checked={isGunlukShared} onCheckedChange={setIsGunlukShared} />
                            <Label htmlFor="share-gunluk" className="text-sm text-muted-foreground flex items-center gap-1"><Share2 className="h-3 w-3"/> Terapistle paylaş</Label>
                          </div>
                        )}
                    </div>
                     <div>
                        <h3 className="font-semibold mb-2">Günü nasıl bitiriyorsun?</h3>
                        <div className="flex gap-2 flex-wrap">
                            {moodOptions.map(mood => (
                            <Button 
                                key={mood.name} 
                                variant={eveningMood === mood.name ? "default" : "outline"} 
                                className="flex-col h-20 w-20"
                                onClick={() => setEveningMood(mood.name)}
                            >
                                <mood.icon className="h-6 w-6 mb-1" />
                                <span>{mood.name}</span>
                            </Button>
                            ))}
                        </div>
                    </div>
                    <Button onClick={() => completeTask('evening')} disabled={loading.evening || tasksCompleted.evening}>
                      {loading.evening && <Loader2 className="animate-spin mr-2" />}
                      {tasksCompleted.evening ? "Tamamlandı" : "Akşam Görevini Tamamla"}
                    </Button>
                </div>
            </AccordionContent>
          </Card>
        </AccordionItem>
      </Accordion>

       <Card>
            <CardHeader>
                <CardTitle className="text-xl flex items-center gap-3">
                    <Sun className="h-6 w-6 text-primary" /> İyi Oluş Aktiviteleri
                </CardTitle>
                <CardDescription>Zihnini dinlendirecek ve ana odaklanmanı sağlayacak interaktif egzersizler.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link href="/dashboard/journey/breathing-exercise" className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors h-full">
                    <div className="flex items-center gap-3">
                        <Wind className="h-5 w-5 text-accent"/>
                        <h4 className="font-semibold">Nefes Molası</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 pl-8">Stresi azaltmak ve odaklanmak için yönlendirmeli nefes egzersizleri.</p>
                </Link>
                <Link href="/dashboard/journey/thought-bubbles" className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors h-full">
                    <div className="flex items-center gap-3">
                        <Feather className="h-5 w-5 text-accent"/>
                        <h4 className="font-semibold">Düşünce Balonları</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 pl-8">Düşüncelerini gözlemle ve sakince gitmelerine izin ver.</p>
                </Link>
                 <Link href="/dashboard/journey/grounding-exercise" className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors h-full">
                    <div className="flex items-center gap-3">
                        <Droplets className="h-5 w-5 text-accent"/>
                        <h4 className="font-semibold">5-4-3-2-1 Topraklanma</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 pl-8">5 duyunla şimdiki ana demir at.</p>
                </Link>
                 <Link href="/dashboard/journey/gratitude-jar" className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors h-full">
                    <div className="flex items-center gap-3">
                         <Sparkles className="h-5 w-5 text-accent"/>
                        <h4 className="font-semibold">Minnet Anı Kavanozu</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 pl-8">İyi anları biriktir ve dilediğinde hatırla.</p>
                </Link>
                <Link href="/dashboard/journey/zen-garden" className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors h-full">
                    <div className="flex items-center gap-3">
                         <Waves className="h-5 w-5 text-accent"/>
                        <h4 className="font-semibold">Zen Bahçesi</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 pl-8">Sanal kumda desenler çizerek zihnini sakinleştir.</p>
                </Link>
            </CardContent>
        </Card>

    </div>
  );
}
