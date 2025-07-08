
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, Send } from 'lucide-react';

type Bubble = {
  id: number;
  text: string;
};

export default function ThoughtBubblesPage() {
  const [thought, setThought] = useState('');
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [released, setReleased] = useState(false);
  const router = useRouter();

  const handleRelease = () => {
    if (!thought.trim()) return;
    setBubbles([{ id: Date.now(), text: thought }]);
    setThought('');

    setTimeout(() => {
      setBubbles([]);
      setReleased(true);
    }, 4000); // Corresponds to animation duration
  };

  if (released) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-sky-200 text-sky-800 animate-fade-in p-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 text-center shadow-lg">
          <Check className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Harika!</h1>
          <p className="mt-2">Bir düşüncenin sakince uzaklaşmasını izledin.</p>
          <p className="mt-4 font-bold text-lg text-primary">+15 XP kazandın</p>
          <Button className="mt-6" onClick={() => router.push('/dashboard/journey')}>
            Günlük Yolculuğa Dön
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-sky-300 to-sky-500 overflow-hidden p-4">
      {/* Background clouds */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white/50 rounded-full animate-pulse blur-xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-white/40 rounded-full animate-pulse blur-2xl"></div>

      {bubbles.map(bubble => (
        <div
          key={bubble.id}
          className="absolute flex items-center justify-center p-6 text-center text-blue-900 bg-white/50 backdrop-blur-md rounded-full animate-float-away shadow-lg"
          style={{ bottom: '30%', minWidth: '150px', maxWidth: '300px' }}
        >
          {bubble.text}
        </div>
      ))}

      {!bubbles.length && (
        <div className="z-10 bg-white/30 backdrop-blur-sm p-8 rounded-xl shadow-lg text-center animate-fade-in">
          <h1 className="text-2xl font-bold text-slate-800">Düşünce Balonları</h1>
          <p className="text-slate-700 mt-2">Aklını meşgul eden bir düşünceyi yaz.</p>
          <div className="flex w-full max-w-sm items-center space-x-2 mt-6">
            <Input
              type="text"
              placeholder="Aklımdaki düşünce..."
              value={thought}
              onChange={(e) => setThought(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRelease()}
            />
            <Button type="submit" onClick={handleRelease} disabled={!thought.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
