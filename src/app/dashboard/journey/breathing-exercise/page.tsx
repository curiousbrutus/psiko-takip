"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Check, X } from 'lucide-react';

type Stage = 'settings' | 'exercise' | 'completed';
type Technique = 'sakin' | 'kutu';

const techniques = {
  sakin: {
    name: 'Sakinleştirici Nefes',
    description: 'Stresi azaltmak için. (4sn al, 4sn ver)',
    cycle: 8, // seconds
    prompts: [
      { text: 'Nefes Al', duration: 4 },
      { text: 'Nefes Ver', duration: 4 },
    ]
  },
  kutu: {
    name: 'Kutu Nefesi',
    description: 'Odaklanmayı artırmak için. (4sn al, 4sn tut, 4sn ver, 4sn tut)',
    cycle: 16, // seconds
    prompts: [
      { text: 'Nefes Al', duration: 4 },
      { text: 'Tut', duration: 4 },
      { text: 'Nefes Ver', duration: 4 },
      { text: 'Tut', duration: 4 },
    ]
  },
}

export default function BreathingExercisePage() {
  const [stage, setStage] = useState<Stage>('settings');
  const [duration, setDuration] = useState('1'); // in minutes
  const [selectedTechnique, setSelectedTechnique] = useState<Technique>('sakin');
  const [promptText, setPromptText] = useState('');
  const [circleClass, setCircleClass] = useState('bg-muted');

  const router = useRouter();

  const currentTechnique = useMemo(() => techniques[selectedTechnique], [selectedTechnique]);

  useEffect(() => {
    if (stage !== 'exercise') return;

    let promptIndex = 0;
    let timer: NodeJS.Timeout;
    
    const runCycle = () => {
      const currentPrompt = currentTechnique.prompts[promptIndex];
      setPromptText(currentPrompt.text);
      
      switch (currentPrompt.text) {
        case 'Nefes Al':
          setCircleClass('bg-green-500 animate-scale-up');
          break;
        case 'Nefes Ver':
          setCircleClass('bg-blue-500 animate-scale-down');
          break;
        case 'Tut':
          setCircleClass('bg-red-500');
          break;
        default:
          setCircleClass('bg-muted');
      }

      timer = setTimeout(() => {
        promptIndex = (promptIndex + 1) % currentTechnique.prompts.length;
        runCycle();
      }, currentPrompt.duration * 1000);
    };

    const initialTimeout = setTimeout(runCycle, 1000); // Initial delay

    const mainTimeout = setTimeout(() => {
        setStage('completed');
    }, parseInt(duration) * 60 * 1000 + 1000);

    return () => {
      clearTimeout(initialTimeout);
      clearTimeout(mainTimeout);
      clearTimeout(timer);
    }
  }, [stage, duration, currentTechnique]);


  const startExercise = () => {
    setStage('exercise');
    setPromptText('Hazırlan...');
  };
  
  const handleExit = () => {
      router.push('/dashboard/journey');
  }

  const BreathingCircle = () => {
    const animationStyle = {
        animationDuration: `${currentTechnique.cycle / 2}s`
    };

    return (
        <div className="relative flex items-center justify-center w-48 h-48 sm:w-64 sm:h-64">
            <div 
                className={`absolute rounded-full w-full h-full transition-colors duration-1000 ${circleClass}`}
                style={animationStyle}
            />
            <span className="relative z-10 text-2xl font-semibold text-white transition-opacity duration-500">
                {promptText}
            </span>
        </div>
    );
  }

  if (stage === 'exercise') {
    return (
        <div className="fixed inset-0 bg-[#121212] flex flex-col items-center justify-center z-50 text-white animate-fade-in">
            <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-white/70 hover:bg-white/10 hover:text-white" onClick={handleExit}>
                <X className="h-6 w-6" />
            </Button>
            <BreathingCircle />
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
