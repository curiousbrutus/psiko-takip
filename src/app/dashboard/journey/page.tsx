"use client";

import { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Sunrise, Sun, Sunset, Smile, Leaf, Meh, HeartPulse, Frown, Wind, BrainCircuit, Book, Sparkles } from 'lucide-react';
import Link from 'next/link';

const moodOptions = [
  { name: 'Mutlu', icon: Smile },
  { name: 'Sakin', icon: Leaf },
  { name: 'Nötr', icon: Meh },
  { name: 'Üzgün', icon: Frown },
  { name: 'Endişeli', icon: HeartPulse },
];

export default function DailyJourneyPage() {
  const [morningMood, setMorningMood] = useState<string | null>(null);
  const [eveningMood, setEveningMood] = useState<string | null>(null);

  const [tasksCompleted, setTasksCompleted] = useState({
    morning: false,
    midday: false,
    evening: false,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Günlük Yolculuk</h1>
        <p className="text-muted-foreground">Her gün küçük bir adım atarak zihinsel sağlığını güçlendir.</p>
      </div>

      <Accordion type="multiple" defaultValue={["item-1"]} className="w-full space-y-4">
        <AccordionItem value="item-1" className="border-none">
          <Card>
            <AccordionTrigger className="p-6 hover:no-underline [&[data-state=open]>div>svg.lucide-check-circle-2]:hidden">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-4">
                  <Sunrise className="h-6 w-6 text-primary" />
                  <div>
                    <CardTitle className="text-xl text-left">Sabah Başlangıcı</CardTitle>
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
                  <Textarea placeholder="Bugün kendim için yapacağım küçük bir şey... (Örn: 10 dakika mola vereceğim)" />
                </div>
                <Button onClick={() => setTasksCompleted(prev => ({...prev, morning: true}))}>Sabah Görevini Tamamla</Button>
              </div>
            </AccordionContent>
          </Card>
        </AccordionItem>

        <AccordionItem value="item-2" className="border-none">
          <Card>
             <AccordionTrigger className="p-6 hover:no-underline [&[data-state=open]>div>svg.lucide-check-circle-2]:hidden">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-4">
                  <Sun className="h-6 w-6 text-primary" />
                  <div>
                    <CardTitle className="text-xl text-left">Gün İçi Destek</CardTitle>
                    <p className="text-sm text-muted-foreground font-normal">İhtiyaç duyduğunda kendine bir mola ver.</p>
                  </div>
                </div>
                 {tasksCompleted.midday && <CheckCircle2 className="h-6 w-6 text-green-500" />}
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-6 pt-0">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Nefes Egzersizleri</h3>
                  <div className="flex gap-2">
                     <Button variant="outline" asChild>
                        <Link href="/dashboard/journey/breathing-exercise">
                            <Wind className="mr-2 h-4 w-4" /> Bir Mola Ver
                        </Link>
                    </Button>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">BDT Mini Egzersizleri</h3>
                   <Button variant="outline"><BrainCircuit className="mr-2 h-4 w-4" /> Olumsuz Düşünceye Meydan Oku</Button>
                </div>
                <Button onClick={() => setTasksCompleted(prev => ({...prev, midday: true}))}>Bir Destek Egzersizi Tamamladım</Button>
              </div>
            </AccordionContent>
          </Card>
        </AccordionItem>

        <AccordionItem value="item-3" className="border-none">
          <Card>
            <AccordionTrigger className="p-6 hover:no-underline [&[data-state=open]>div>svg.lucide-check-circle-2]:hidden">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-4">
                  <Sunset className="h-6 w-6 text-primary" />
                  <div>
                    <CardTitle className="text-xl text-left">Akşam Değerlendirmesi</CardTitle>
                    <p className="text-sm text-muted-foreground font-normal">Günü yansıt ve zihnini dinlendir.</p>
                  </div>
                </div>
                {tasksCompleted.evening && <CheckCircle2 className="h-6 w-6 text-green-500" />}
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-6 pt-0">
                <div className="space-y-6">
                    <div>
                        <h3 className="font-semibold mb-2 flex items-center gap-2"><Sparkles className="h-4 w-4 text-accent" /> Bugün minnettar olduğun 3 şey nedir?</h3>
                        <Textarea placeholder="1. ..." />
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2 flex items-center gap-2"><Book className="h-4 w-4 text-accent" /> Serbest Günlük</h3>
                        <Textarea placeholder="Aklından geçenleri buraya yazabilirsin..." />
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
                    <Button onClick={() => setTasksCompleted(prev => ({...prev, evening: true}))}>Akşam Görevini Tamamla</Button>
                </div>
            </AccordionContent>
          </Card>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
