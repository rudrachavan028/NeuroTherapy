import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LevelLayout } from './LevelLayout';
import { playWinSound } from '../utils/sound';

interface Props { onBack: () => void; onNext?: () => void; }

export const FollowDotGame: React.FC<Props> = ({ onBack, onNext }) => {
  const [level, setLevel] = useState(1);
  const [timeLeft, setTimeLeft] = useState(15);
  const [isLevelComplete, setIsLevelComplete] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Reset for new level
  useEffect(() => {
    setTimeLeft(15 + level * 2); // Longer duration for higher levels
    setIsLevelComplete(false);
  }, [level]);

  // Timer
  useEffect(() => {
    if (timeLeft <= 0 && !isLevelComplete) {
      setIsLevelComplete(true);
      if (soundEnabled) playWinSound();
      return;
    }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isLevelComplete, soundEnabled]);

  // Define animation paths based on level
  const getAnimation = () => {
    const duration = Math.max(2, 6 - level * 0.2); // Faster with levels
    
    // Different patterns
    if (level <= 2) {
      // Horizontal
      return {
        x: [-120, 120, -120],
        transition: { duration: duration, repeat: Infinity, ease: "linear" as const }
      };
    } else if (level <= 4) {
      // Vertical
      return {
        y: [-100, 100, -100],
        transition: { duration: duration, repeat: Infinity, ease: "linear" as const }
      };
    } else if (level <= 6) {
      // Square box
      return {
        x: [-100, 100, 100, -100, -100],
        y: [-100, -100, 100, 100, -100],
        transition: { duration: duration * 1.5, repeat: Infinity, ease: "linear" as const }
      };
    } else if (level <= 9) {
      // Figure 8 (approx using keyframes)
      return {
        x: [0, 100, 0, -100, 0],
        y: [0, 80, 0, -80, 0],
        transition: { duration: duration * 1.5, repeat: Infinity, ease: "easeInOut" as const }
      };
    } else {
       // Random-ish Zig Zag
       return {
         x: [0, 120, -120, 80, -80, 0],
         y: [0, -100, 50, -50, 100, 0],
         transition: { duration: duration * 2, repeat: Infinity, ease: "linear" as const }
       };
    }
  };

  return (
    <LevelLayout
      title="Follow the Dot"
      currentLevel={level}
      maxLevels={12}
      onNextLevel={() => {
        if (level >= 12) {
            onNext ? onNext() : onBack();
        } else {
            setLevel(l => l + 1);
        }
      }}
      onRestart={() => setTimeLeft(15 + level * 2)}
      onBack={onBack}
      isLevelComplete={isLevelComplete}
      isGameComplete={level === 12 && isLevelComplete}
      
      soundEnabled={soundEnabled}
      toggleSound={() => setSoundEnabled(!soundEnabled)}
      encouragement="Great focus! Your eyes are sharp."
    >
      <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden bg-slate-50/50 m-4 rounded-3xl border border-slate-200 shadow-inner">
        
        {/* Tracking Grid Background (Subtle) */}
        <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-10 pointer-events-none">
           {Array.from({length: 36}).map((_, i) => (
             <div key={i} className="border border-slate-400" />
           ))}
        </div>

        {/* The Dot */}
        <motion.div
          animate={getAnimation()}
          className="w-12 h-12 bg-indigo-500 rounded-full shadow-lg border-4 border-white z-10"
        />

        <div className="absolute bottom-8 bg-white/80 backdrop-blur px-6 py-2 rounded-full shadow-sm">
           <p className="text-slate-600 font-semibold">Keep following: {timeLeft}s</p>
        </div>
      </div>
    </LevelLayout>
  );
};
