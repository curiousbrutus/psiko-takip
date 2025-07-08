
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2, Plus, HelpCircle, ArrowLeft } from 'lucide-react';
import { addGratitudeEntry, getGratitudeEntries } from './actions';
import { useToast } from '@/hooks/use-toast';
import type { DocumentData } from 'firebase/firestore';

export default function GratitudeJarPage() {
  const [entries, setEntries] = useState<DocumentData[]>([]);
  const [newEntry, setNewEntry] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shownEntry, setShownEntry] = useState<DocumentData | null>(null);
  
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    async function fetchEntries() {
      setIsLoading(true);
      const result = await getGratitudeEntries();
      if (result.success && result.data) {
        setEntries(result.data);
      } else if (result.error) {
         toast({ title: 'Hata', description: result.error, variant: 'destructive' });
      }
      setIsLoading(false);
    }
    fetchEntries();
  }, [toast]);
  
  const handleAddEntry = async () => {
    if (!newEntry.trim()) return;
    setIsSubmitting(true);
    const result = await addGratitudeEntry(newEntry);
    if (result.success) {
      toast({ title: 'Başarılı!', description: 'Minnet anın kavanoza eklendi. (+15 XP)' });
      // Manually add the new entry to the state to avoid a full refetch
      const newEntryData = { id: result.id, content: newEntry, createdAt: new Date() };
      setEntries(prev => [...prev, newEntryData]);
      setNewEntry('');
      setIsAdding(false);
    } else {
      toast({ title: 'Hata', description: result.error, variant: 'destructive' });
    }
    setIsSubmitting(false);
  };

  const showRandomEntry = () => {
    if (entries.length === 0) {
      toast({ title: 'Kavanoz Boş', description: 'Önce bir anı eklemelisin.' });
      return;
    }
    const randomIndex = Math.floor(Math.random() * entries.length);
    setShownEntry(entries[randomIndex]);
    toast({ title: 'Bir Anı Hatırladın!', description: 'İşte o güzel anlardan biri. (+5 XP)' });
  };
  
  const JarIcon = ({ entryCount }: { entryCount: number }) => (
    <div className="relative w-48 h-48">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-primary/20 absolute">
        <path d="M5 3.75a.75.75 0 01.75-.75h12.5a.75.75 0 010 1.5H5.75a.75.75 0 01-.75-.75zM6 6a.75.75 0 01.75.75v13.5a.75.75 0 01-1.5 0V6.75A.75.75 0 016 6zM18 6a.75.75 0 01.75.75v13.5a.75.75 0 01-1.5 0V6.75A.75.75 0 0118 6zM9.97 7.22a.75.75 0 011.06 0l4.25 4.25a.75.75 0 01-1.06 1.06L10.5 8.81l-3.72 3.72a.75.75 0 11-1.06-1.06l4.25-4.25z" />
        <path fillRule="evenodd" d="M5.22 21.78a.75.75 0 01-.72-.966l.5-2.75a.75.75 0 01.72-.514h12.56a.75.75 0 01.72.514l.5 2.75a.75.75 0 11-1.44.266l-.34-1.86H6.28l-.34 1.86a.75.75 0 01-.72.7zM7.5 7a.5.5 0 01.5.5v3.25a.5.5 0 01-1 0V7.5a.5.5 0 01.5-.5z" clipRule="evenodd" />
      </svg>
      {Array.from({ length: Math.min(entryCount, 15) }).map((_, i) => (
         <div key={i} className="absolute w-4 h-2 bg-amber-200 rounded-sm" style={{
            left: `${Math.random() * 70 + 15}%`,
            bottom: `${Math.random() * 40 + 10}%`,
            transform: `rotate(${Math.random() * 90 - 45}deg)`,
          }}/>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-amber-50 p-4 space-y-6">
      <Button variant="ghost" className="absolute top-20 left-6 z-30" onClick={() => router.push('/dashboard/journey')}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Günlük Yolculuğa Dön
      </Button>
      
      {isAdding && (
         <div className="fixed inset-0 bg-black/60 z-20 flex items-center justify-center p-4" onClick={() => setIsAdding(false)}>
            <Card className="w-full max-w-md animate-fade-in shadow-xl" onClick={(e) => e.stopPropagation()}>
                <CardHeader>
                    <CardTitle>Yeni Bir Anı Ekle</CardTitle>
                    <CardDescription>Bugün minnettar olduğun bir şeyi yaz.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Textarea 
                        placeholder="Örn: Sabah kahvemin kokusu..."
                        value={newEntry}
                        onChange={(e) => setNewEntry(e.target.value)}
                        rows={4}
                    />
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => setIsAdding(false)}>İptal</Button>
                    <Button onClick={handleAddEntry} disabled={isSubmitting || !newEntry.trim()}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Kavanoza Ekle
                    </Button>
                </CardFooter>
            </Card>
         </div>
      )}

      {shownEntry && (
          <div className="fixed inset-0 bg-black/60 z-20 flex items-center justify-center p-4" onClick={() => setShownEntry(null)}>
            <Card className="w-full max-w-md animate-fade-in shadow-xl" onClick={(e) => e.stopPropagation()}>
                <CardHeader>
                    <CardTitle>İşte o güzel anlardan biri...</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-lg text-muted-foreground italic">"{shownEntry.content}"</p>
                </CardContent>
                <CardFooter>
                    <Button onClick={() => setShownEntry(null)} className="w-full">Harika!</Button>
                </CardFooter>
            </Card>
         </div>
      )}


      <Card className="w-full max-w-lg text-center transition-all">
        <CardHeader>
          <CardTitle className="text-3xl font-headline">Minnet Anı Kavanozu</CardTitle>
          <CardDescription>Hayatındaki güzel anları biriktir ve dilediğinde hatırla.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center min-h-[250px] relative">
            {isLoading ? (
                <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
            ) : (
              <>
                <JarIcon entryCount={entries.length} />
                <div className="relative z-10 text-muted-foreground font-semibold mt-2">
                    Kavanozda {entries.length} anı birikti.
                </div>
              </>
            )}
        </CardContent>
        <CardFooter className="grid grid-cols-2 gap-4">
            <Button onClick={() => setIsAdding(true)} size="lg">
                <Plus className="mr-2" /> Yeni Anı Ekle
            </Button>
            <Button onClick={showRandomEntry} variant="outline" size="lg" disabled={entries.length === 0}>
                <HelpCircle className="mr-2" /> Rastgele Anı Göster
            </Button>
        </CardFooter>
      </Card>

    </div>
  );
}
