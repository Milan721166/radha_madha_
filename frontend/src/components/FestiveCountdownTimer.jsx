import React, { useState, useEffect } from 'react';
import { Sparkles, Clock, Flame } from 'lucide-react';

export default function FestiveCountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 4,
    minutes: 38,
    seconds: 45
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 5, minutes: 45, seconds: 30 }; // Reset for endless festive sale hype
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTwo = (num) => String(num).padStart(2, '0');

  return (
    <div className="bg-gradient-to-r from-brand-obsidian via-brand-maroonDark to-brand-obsidian text-white py-2.5 px-4 border-b border-brand-gold/30 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-medium">
        
        <div className="flex items-center gap-2 tracking-wider">
          <span className="flex items-center gap-1.5 bg-brand-gold/20 text-brand-gold px-2.5 py-0.5 rounded-full font-bold uppercase text-[11px] border border-brand-gold/40 animate-pulse">
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-current" />
            Festive Flash Sale
          </span>
          <span className="text-neutral-200">
            Extra <strong className="text-brand-gold">FLAT 20% OFF</strong> On Entire Bridal & Kanjeevaram Collection!
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-neutral-300 flex items-center gap-1 text-[11px]">
            <Clock className="w-3.5 h-3.5 text-brand-gold" /> Offer Ends In:
          </span>

          <div className="flex items-center gap-1 font-mono text-xs font-bold text-neutral-900">
            <span className="bg-brand-gold px-2 py-0.5 rounded-md shadow-sm">
              {formatTwo(timeLeft.hours)}h
            </span>
            <span className="text-brand-gold font-sans">:</span>
            <span className="bg-brand-gold px-2 py-0.5 rounded-md shadow-sm">
              {formatTwo(timeLeft.minutes)}m
            </span>
            <span className="text-brand-gold font-sans">:</span>
            <span className="bg-brand-gold px-2 py-0.5 rounded-md shadow-sm animate-pulse">
              {formatTwo(timeLeft.seconds)}s
            </span>
          </div>

          <Sparkles className="w-4 h-4 text-brand-gold hidden md:block" />
        </div>

      </div>
    </div>
  );
}
