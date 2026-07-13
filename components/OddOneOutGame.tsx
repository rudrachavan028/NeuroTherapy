import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, HeartCrack, Hexagon, Octagon, Smile, Meh } from 'lucide-react';
import { LevelLayout } from './LevelLayout';
import { playWinSound } from '../utils/sound';

interface Props { onBack: () => void; onNext?: () => void; }

export const OddOneOutGame: React.FC<Props> = ({ onBack, onNext }) => {
  const [level, setLevel] = useState(1);
  const [gridSize, setGridSize] = useState(3);
  const [oddIndex, setOddIndex] = useState(0);
  const [icons, setIcons] = useState<any[]>([]);
  const [isLevelComplete, setIsLevelComplete] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    setIsLevelComplete(false);
    // Level 1: 3x3, Level 12: 6x6
    const size = Math.min(6, 3 + Math.floor((level-1)/3));
    setGridSize(size);
    const total = size * size;
    const odd = Math.floor(Math.random() * total);
    setOddIndex(odd);

    // Choose themes based on level
    let mainIcon, oddIcon;
    if (level % 3 === 0) { mainIcon = <Hexagon />; oddIcon = <Octagon />; }
    else if (level % 2 === 0) { mainIcon = <Smile />; oddIcon = <Meh />; }
    else { mainIcon = <Heart />; oddIcon = <HeartCrack />; }

    setIcons([mainIcon, oddIcon]);
  }, [level]);

  const handleClick = (index: number) => {
    if (index === oddIndex) {
      setIsLevelComplete(true);
      if (soundEnabled) playWinSound();
    }
  };

  return (
    <LevelLayout
      title="Odd One Out"
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
      encouragement="What an eye for detail!"
    >
      <div className="flex-1 flex items-center justify-center p-4">
        <div 
          className="grid gap-3"
          style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
        >
          {Array.from({length: gridSize * gridSize}).map((_, i) => (
             <motion.button
               key={i}
               whileHover={{ scale: 1.1 }}
               whileTap={{ scale: 0.9 }}
               onClick={() => handleClick(i)}
               className={`p-4 rounded-xl shadow-sm bg-white border-2 border-slate-100 text-indigo-500`}
             >
               {i === oddIndex ? icons[1] : icons[0]}
             </motion.button>
          ))}
        </div>
      </div>
    </LevelLayout>
  );
};
