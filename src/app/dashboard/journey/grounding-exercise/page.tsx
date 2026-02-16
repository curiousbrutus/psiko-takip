'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

const steps = [
  { count: 5, prompt: 'Etrafında Gördüğün 5 Şey' },
  { count: 4, prompt: 'Bedeninde Hissettiğin 4 Şey' },
  { count: 3, prompt: 'Duyduğun 3 Ses' },
  { count: 2, prompt: 'Koku Aldığın 2 Şey' },
  { count: 1, prompt: 'Tadabildiğin 1 Şey' },
];

export default function GroundingExercisePage() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [taps, setTaps] = useState(0);
  const [completed, setCompleted] = useState(false);
  const router = useRouter();

  const currentStep = steps[currentStepIndex];

  const handleTap = () => {
    if (completed) return;

    if (taps < currentStep.count - 1) {
      setTaps(taps + 1);
    } else {
      if (currentStepIndex < steps.length - 1) {
        setCurrentStepIndex(currentStepIndex + 1);
        setTaps(0);
      } else {
        setCompleted(true);
      }
    }
  };

  // Use a key to force re-render on step change for animation
  const animationKey = `step-${currentStepIndex}`;

  if (completed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-teal-100 text-teal-800 animate-fade-in p-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 text-center shadow-lg">
          <Check className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Şimdi ve buradasın.</h1>
          <p className="mt-2">Harika bir iş çıkardın.</p>
          <p className="mt-4 font-bold text-lg text-primary">+20 XP kazandın</p>
          <Button
            className="mt-6"
            onClick={() => router.push('/dashboard/journey')}
          >
            Günlük Yolculuğa Dön
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-teal-50 text-teal-900 cursor-pointer transition-colors duration-500"
      onClick={handleTap}
    >
      <div key={animationKey} className="text-center p-8 animate-fade-in">
        <h1 className="text-3xl md:text-5xl font-bold mb-8 transition-opacity duration-300">
          {currentStep.prompt}
        </h1>
        <div className="flex justify-center gap-4">
          {Array.from({ length: currentStep.count }).map((_, i) => (
            <div
              key={i}
              className={`w-8 h-8 md:w-12 md:h-12 rounded-full border-2 border-teal-500 transition-all duration-300 ${
                i <= taps ? 'bg-teal-500 scale-110' : 'bg-transparent'
              }`}
            ></div>
          ))}
        </div>
        <p className="mt-12 text-teal-600 animate-pulse">
          Devam etmek için ekrana dokun.
        </p>
      </div>
      <Button
        variant="ghost"
        className="absolute bottom-8"
        onClick={e => {
          e.stopPropagation();
          router.push('/dashboard/journey');
        }}
      >
        Egzersizi Sonlandır
      </Button>
    </div>
  );
}
