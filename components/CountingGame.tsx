import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { LevelLayout } from './LevelLayout';
import { playMatchSound, playWinSound } from '../utils/sound';

interface Props { onBack: () => void; onNext?: () => void; }

export const CountingGame: React.FC<Props> = ({ onBack, onNext }) => {
  const [level, setLevel] = useState(1);
  const [stars, setStars] = useState<{id: number, x: number, y: number, color: string}[]>([]);
  const [options, setOptions] = useState<number[]>([]);
  const [isLevelComplete, setIsLevelComplete] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    setIsLevelComplete(false);
    const count = 3 + level; // Levels 1-12 -> 4 to 15 stars
    const newStars = [];
    const colors = ['#FCD34D', '#F87171', '#60A5FA', '#34D399'];
    
    for (let i = 0; i < count; i++) {
      newStars.push({
        id: i,
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
    setStars(newStars);

    // Generate options
    const correct = count;
    const opts = new Set([correct]);
    while(opts.size < 3) {
      opts.add(correct + Math.floor(Math.random() * 5) - 2);
    }
    setOptions(Array.from(opts).sort((a,b) => a-b));
  }, [level]);

  const handleGuess = (guess: number) => {
    if (guess === stars.length) {
      if (soundEnabled) playWinSound();
      setIsLevelComplete(true);
    } else {
        // Shake logic could go here
    }
  };

  return (
    <LevelLayout
      title="Counting Stars"
      currentLevel={level}
      maxLevels={12}
      onNextLevel={() => {
        if (level >= 12) {
            onNext ? onNext() : onBack();
        } else {
            setLevel(l => l + 1);
        }
      }}
      onRestart={() => setLevel(level)} 
      onBack={onBack}
      isLevelComplete={isLevelComplete}
      isGameComplete={level === 12 && isLevelComplete}
      soundEnabled={soundEnabled}
      toggleSound={() => setSoundEnabled(!soundEnabled)}
      encouragement="You're a brilliant counter!"
    >
      <div className="flex-1 flex flex-col">
        <div className="relative flex-1 bg-slate-900 rounded-3xl m-4 overflow-hidden border-4 border-slate-700 shadow-inner">
           {stars.map(s => (
             <motion.div
               key={s.id}
               initial={{ scale: 0 }}
               animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
               transition={{ duration: 0.5, delay: Math.random() * 0.5 }}
               className="absolute"
               style={{ left: `${s.x}%`, top: `${s.y}%`, color: s.color }}
             >
               <Star fill="currentColor" size={level > 6 ? 24 : 32} />
             </motion.div>
           ))}
        </div>
        <div className="flex justify-center gap-4 pb-8">
          {options.map(opt => (
            <button
              key={opt}
              onClick={() => handleGuess(opt)}
              className="w-20 h-20 bg-indigo-500 hover:bg-indigo-600 text-white text-3xl font-bold rounded-2xl shadow-lg transform transition active:scale-95"
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </LevelLayout>
  );
};
