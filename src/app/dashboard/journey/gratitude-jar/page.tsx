'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Loader2, Plus, ArrowLeft, Wind } from 'lucide-react';
import { addGratitudeEntry, getGratitudeEntries } from './actions';
import { useToast } from '@/hooks/use-toast';

const JarIcon = ({ entryCount }: { entryCount: number }) => (
  <div className="relative w-48 h-48 my-4">
    <svg
      className="w-full h-full text-amber-300/50"
      viewBox="0 0 120 120"
      fill="currentColor"
    >
      <path d="M96.8,40.5H23.2c-2.4,0-4.4-2-4.4-4.4V32c0-2.4,2-4.4,4.4-4.4h73.5c2.4,0,4.4,2,4.4,4.4v4.1 C101.2,38.5,99.2,40.5,96.8,40.5z" />
      <path d="M94.1,102.3H25.9c-2.4,0-4.5-1.7-4.8-4.1L18.8,42h82.4l-2.3,56.2C98.6,100.6,96.6,102.3,94.1,102.3z" />
    </svg>
    <div className="absolute inset-0 flex flex-wrap items-end justify-center p-6 overflow-hidden">
      {Array.from({ length: Math.min(entryCount, 30) }).map((_, i) => (
        <div
          key={i}
          className="w-3 h-3 m-0.5 bg-gradient-to-tr from-amber-300 to-amber-500 rounded-full shadow-inner opacity-80"
          style={{
            transform: `translateX(${Math.random() * 20 - 10}px)`,
          }}
        />
      ))}
    </div>
  </div>
);

export default function GratitudeJarPage() {
  const [entries, setEntries] = useState<Record<string, any>[]>([]);
  const [newEntry, setNewEntry] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shownEntry, setShownEntry] = useState<Record<string, any> | null>(
    null
  );

  const router = useRouter();
  const { toast } = useToast();

  const fetchEntries = useCallback(async () => {
    setIsLoading(true);
    const result = await getGratitudeEntries();
    if (result.success && result.data) {
      setEntries(result.data);
    } else if (result.error) {
      toast({
        title: 'Hata',
        description: result.error,
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleAddEntry = async () => {
    if (!newEntry.trim()) return;
    setIsSubmitting(true);
    const result = await addGratitudeEntry(newEntry);
    if (result.success) {
      toast({
        title: 'Başarılı!',
        description: 'Minnet anın kavanoza eklendi. (+15 XP)',
      });
      fetchEntries(); // Refetch to get the latest list with the new entry
      setNewEntry('');
      setIsAdding(false);
    } else {
      toast({
        title: 'Hata',
        description: result.error,
        variant: 'destructive',
      });
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
    toast({
      title: 'Bir Anı Hatırladın!',
      description: 'İşte o güzel anlardan biri. (+5 XP)',
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-amber-50 p-4 space-y-6">
      <Button
        variant="ghost"
        className="absolute top-6 left-6 z-30"
        onClick={() => router.push('/dashboard/journey')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Günlük Yolculuğa Dön
      </Button>

      {isAdding && (
        <div
          className="fixed inset-0 bg-black/60 z-20 flex items-center justify-center p-4"
          onClick={() => setIsAdding(false)}
        >
          <Card
            className="w-full max-w-md animate-fade-in shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <CardHeader>
              <CardTitle>Yeni Bir Anı Ekle</CardTitle>
              <CardDescription>
                Bugün minnettar olduğun bir şeyi yaz.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Örn: Sabah kahvemin kokusu..."
                value={newEntry}
                onChange={e => setNewEntry(e.target.value)}
                rows={4}
              />
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setIsAdding(false)}>
                İptal
              </Button>
              <Button
                onClick={handleAddEntry}
                disabled={isSubmitting || !newEntry.trim()}
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Kavanoza Ekle
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {shownEntry && (
        <div
          className="fixed inset-0 bg-black/60 z-20 flex items-center justify-center p-4"
          onClick={() => setShownEntry(null)}
        >
          <Card
            className="w-full max-w-md animate-fade-in shadow-xl bg-amber-50"
            onClick={e => e.stopPropagation()}
          >
            <CardHeader>
              <CardTitle>İşte o güzel anlardan biri...</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-muted-foreground italic p-4 border-l-4 border-amber-300 bg-white rounded-r-md">
                &quot;{shownEntry.content}&quot;
              </p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => setShownEntry(null)} className="w-full">
                Harika!
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      <Card className="w-full max-w-lg text-center transition-all shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-3xl font-headline">
            Minnet Anı Kavanozu
          </CardTitle>
          <CardDescription>
            Hayatındaki güzel anları biriktir ve dilediğinde hatırla.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center min-h-[250px] relative">
          {isLoading ? (
            <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
          ) : (
            <>
              <JarIcon entryCount={entries.length} />
              <div className="relative z-10 text-muted-foreground font-semibold -mt-4">
                Kavanozda {entries.length} anı birikti.
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button onClick={() => setIsAdding(true)} size="lg">
            <Plus className="mr-2" /> Yeni Anı Ekle
          </Button>
          <Button
            onClick={showRandomEntry}
            variant="outline"
            size="lg"
            disabled={entries.length === 0}
          >
            <Wind className="mr-2" /> Rastgele Anı Göster
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
