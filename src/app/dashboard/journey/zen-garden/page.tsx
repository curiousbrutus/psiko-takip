'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Eraser, Feather } from 'lucide-react';

export default function ZenGardenPage() {
  const [paths, setPaths] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const router = useRouter();

  useEffect(() => {
    setStartTime(new Date());
  }, []);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    if (!svgRef.current) return null;
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();

    if ('touches' in e) {
      pt.x = e.touches[0].clientX;
      pt.y = e.touches[0].clientY;
    } else {
      pt.x = e.clientX;
      pt.y = e.clientY;
    }

    const ctm = svg.getScreenCTM();
    if (ctm) {
      return pt.matrixTransform(ctm.inverse());
    }
    return null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDrawing(true);
    const point = getCoordinates(e);
    if (point) {
      setCurrentPath(`M ${point.x} ${point.y}`);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    const point = getCoordinates(e);
    if (point) {
      setCurrentPath(prev => `${prev} L ${point.x} ${point.y}`);
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    if (currentPath) {
      setPaths(prev => [...prev, currentPath]);
    }
    setCurrentPath('');
  };

  // Touch events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDrawing(true);
    const point = getCoordinates(e);
    if (point) {
      setCurrentPath(`M ${point.x} ${point.y}`);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault(); // Prevent scrolling
    const point = getCoordinates(e);
    if (point) {
      setCurrentPath(prev => `${prev} L ${point.x} ${point.y}`);
    }
  };

  const handleTouchEnd = () => {
    handleMouseUp();
  };

  const handleFinish = () => {
    setIsFinished(true);
    // In a real app, you would add XP here based on time spent.
    // For example:
    // if (hasSpentEnoughTime) {
    //   updateGamificationStats(20);
    // } else {
    //   updateGamificationStats(5);
    // }
  };

  const hasSpentEnoughTime =
    startTime && new Date().getTime() - startTime.getTime() > 30000; // 30 seconds
  const xpGained = hasSpentEnoughTime ? 20 : 5;

  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#eaddc7] text-[#5c4b37] animate-fade-in p-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 text-center shadow-lg">
          <Feather className="h-16 w-16 text-[#8b7e6a] mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Zihnini dinlendirdin.</h1>
          <p className="mt-2">
            Kendine zaman ayırdığın için bu bile değerli bir adım.
          </p>
          <p className="mt-4 font-bold text-lg text-primary">
            +{xpGained} XP kazandın
          </p>
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
    <div className="flex flex-col h-screen bg-[#d7c6b2]">
      <div
        className="flex-grow relative w-full h-full overflow-hidden touch-none"
        onMouseLeave={handleMouseUp}
      >
        <svg
          ref={svgRef}
          className="w-full h-full bg-[#eaddc7] cursor-pointer"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <defs>
            <filter id="sand-texture" x="0" y="0" width="200%" height="200%">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.8"
                numOctaves="4"
                result="turbulence"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="turbulence"
                scale="3"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="#d7c6b2"
            filter="url(#sand-texture)"
          />

          {paths.map((path, i) => (
            <path
              key={i}
              d={path}
              stroke="#5c4b37"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.2"
            />
          ))}
          {currentPath && (
            <path
              d={currentPath}
              stroke="#5c4b37"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.3"
            />
          )}
        </svg>
      </div>
      <div className="flex-shrink-0 bg-white/30 backdrop-blur-sm p-4 flex justify-between items-center">
        <p className="text-sm text-[#5c4b37]">
          Parmağını kumda gezdirerek desenler çiz.
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setPaths([]);
              setCurrentPath('');
            }}
          >
            <Eraser />
          </Button>
          <Button onClick={handleFinish}>Bitir</Button>
        </div>
      </div>
    </div>
  );
}
