"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type Stage = 'settings' | 'exercise' | 'completed';
type Technique = 'sakin' | 'kutu';

const techniques = {
  sakin: {
    name: 'Sakinleştirici Nefes',
    description: 'Stresi azaltmak için.',
    animation: 'breath 10s ease-in-out infinite',
    texts: ['Nefes Al', 'Tut', 'Nefes Ver'],
    durations: [40, 20, 40], // 4s, 2s, 4s percentages of 10s
  },
  kutu: {
    name: 'Kutu Nefesi',
    description: 'Odaklanmayı artırmak için.',
    animation: 'breath 8s ease-in-out infinite',
    texts: ['Nefes Al', 'Tut', 'Nefes Ver', 'Tut'],
    durations: [25, 25, 25, 25], // 4s, 4s, 4s, 4s percentages of 8s
  },
}

export default function BreathingExercisePage() {
  const [stage, setStage] = useState<Stage>('settings');
  const [duration, setDuration] = useState('1'); // in minutes
  const [selectedTechnique, setSelectedTechnique] = useState<Technique>('sakin');
  const [exerciseKey, setExerciseKey] = useState(0); // To reset animation
  const [promptText, setPromptText] = useState('');

  const router = useRouter();

  useEffect(() => {
    if (stage !== 'exercise') return;

    const techniqueData = techniques[selectedTechnique];
    const cycleDuration = parseFloat(techniqueData.animation.match(/(\d+)s/)![1]) * 1000;
    let index = 0;

    const updateText = () => {
      setPromptText(techniqueData.texts[index % techniqueData.texts.length]);
      index++;
    };

    updateText();
    const interval = setInterval(updateText, cycleDuration / techniqueData.texts.length);
    
    return () => clearInterval(interval);

  }, [stage, selectedTechnique, exerciseKey]);


  const startExercise = () => {
    setStage('exercise');
    setExerciseKey(prev => prev + 1); // Reset animation state
    
    const timeoutId = setTimeout(() => {
      setStage('completed');
    }, parseInt(duration) * 60 * 1000);

    return () => clearTimeout(timeoutId);
  };
  
  const handleExit = () => {
      router.push('/dashboard/journey');
  }

  if (stage === 'exercise') {
    const techniqueData = techniques[selectedTechnique];
    return (
        <div key={exerciseKey} className="fixed inset-0 bg-[#121212] flex flex-col items-center justify-center z-50 text-white animate-fade-in">
            <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-white/70 hover:bg-white/10 hover:text-white" onClick={handleExit}>
                <X className="h-6 w-6" />
            </Button>
            <div 
                className="relative flex items-center justify-center w-48 h-48 sm:w-64 sm:h-64"
            >
                <div 
                    className={cn(
                        "absolute bg-primary rounded-full",
                    )}
                    style={{ 
                        animation: techniqueData.animation,
                        width: '100%', 
                        height: '100%'
                     }}
                />
                 <span className="relative z-10 text-2xl font-semibold text-primary-foreground transition-opacity duration-500">
                    {promptText}
                 </span>
            </div>
            <div className="mt-8 text-lg text-white/80">
                <p>Gözlerini kapat ve ritme odaklan.</p>
            </div>
        </div>
    );
  }

  if (stage === 'completed') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <Card className="max-w-md w-full text-center animate-fade-in">
          <CardHeader>
            <div className="mx-auto bg-primary/20 rounded-full p-4 w-fit">
                <Check className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl mt-4">Mola Tamamlandı!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Harika gidiyorsun! Kendine zaman ayırdığın için teşekkürler.</p>
            <p className="font-bold text-lg text-primary">+25 XP kazandın</p>
            <Button className="w-full mt-6" onClick={handleExit}>
              Günlük Yolculuğa Dön
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
      <Card className="w-full max-w-lg animate-fade-in">
        <CardHeader>
          <CardTitle className="text-3xl font-headline">Nefes Molası</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Süre</Label>
            <RadioGroup value={duration} onValueChange={setDuration} className="grid grid-cols-3 gap-4">
              {['1', '3', '5'].map(value => (
                <div key={value}>
                  <RadioGroupItem value={value} id={`d-${value}`} className="sr-only" />
                  <Label htmlFor={`d-${value}`} className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-colors">
                    {value} Dakika
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Teknik</Label>
            <RadioGroup value={selectedTechnique} onValueChange={(v) => setSelectedTechnique(v as Technique)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(techniques).map(([key, tech]) => (
                <div key={key}>
                  <RadioGroupItem value={key} id={`t-${key}`} className="sr-only" />
                  <Label htmlFor={`t-${key}`} className="flex flex-col items-start h-full rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-colors">
                    <span className="font-bold">{tech.name}</span>
                    <span className="text-sm text-muted-foreground mt-1">{tech.description}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <div className="flex flex-col gap-2">
            <Button size="lg" className="w-full" onClick={startExercise}>Başla</Button>
            <Button size="lg" variant="ghost" className="w-full" onClick={handleExit}>İptal</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
