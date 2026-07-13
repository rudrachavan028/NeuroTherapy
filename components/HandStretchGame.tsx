import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LevelLayout } from './LevelLayout';
import { playWinSound } from '../utils/sound';

interface Props { onBack: () => void; onNext?: () => void; }

export const HandStretchGame: React.FC<Props> = ({ onBack, onNext }) => {
  const [level, setLevel] = useState(1);
  const [phase, setPhase] = useState<'open' | 'close'>('open');
  const [repsLeft, setRepsLeft] = useState(5);
  const [isLevelComplete, setIsLevelComplete] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    setRepsLeft(4 + level); // Increase reps with level
    setIsLevelComplete(false);
    setPhase('open');
  }, [level]);

  useEffect(() => {
    if (repsLeft <= 0 && !isLevelComplete) {
      setIsLevelComplete(true);
      if (soundEnabled) playWinSound();
      return;
    }

    const duration = Math.max(2000, 4000 - (level * 100)); // Faster as levels go up, min 2s

    const timeout = setTimeout(() => {
      if (phase === 'open') {
        setPhase('close');
      } else {
        setPhase('open');
        setRepsLeft(r => r - 1);
      }
    }, duration);

    return () => clearTimeout(timeout);
  }, [phase, repsLeft, level, isLevelComplete, soundEnabled]);

  // Finger component for the animation
  const Finger = ({ rotate, length, delay }: { rotate: number, length: number, delay: number }) => (
    <motion.div
      animate={{ 
        rotate: phase === 'open' ? rotate : 0,
        height: phase === 'open' ? length : length * 0.6,
        y: phase === 'open' ? 0 : 20
      }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
      className="origin-bottom absolute bottom-0 bg-orange-300 w-8 rounded-full border-2 border-orange-200"
      style={{ height: length, left: '50%', x: '-50%' }}
    />
  );

  return (
    <LevelLayout
      title="Hand Stretch Mirror"
      currentLevel={level}
      maxLevels={12}
      onNextLevel={() => {
        if (level >= 12) {
            onNext ? onNext() : onBack();
        } else {
            setLevel(l => l + 1);
        }
      }}
      onRestart={() => setRepsLeft(4 + level)}
      onBack={onBack}
      isLevelComplete={isLevelComplete}
      isGameComplete={level === 12 && isLevelComplete}
      soundEnabled={soundEnabled}
      toggleSound={() => setSoundEnabled(!soundEnabled)}
      encouragement="Your hands are getting stronger!"
    >
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="relative w-64 h-64 flex justify-center items-end mb-12">
           {/* Palm */}
           <motion.div 
             animate={{ scale: phase === 'open' ? 1 : 0.9 }}
             transition={{ duration: 1.5 }}
             className="relative z-10 w-40 h-44 bg-orange-300 rounded-3xl border-4 border-orange-200 shadow-xl"
           >
             {/* Fingers positioned relative to palm top */}
             <div className="absolute -top-4 w-full h-full">
                {/* Thumb */}
                <motion.div
                  animate={{ 
                    rotate: phase === 'open' ? -60 : -10,
                    x: phase === 'open' ? -50 : -20
                  }}
                  transition={{ duration: 1.5 }}
                  className="absolute left-0 bottom-10 w-8 h-24 bg-orange-300 rounded-full border-2 border-orange-200 origin-bottom"
                />
                
                {/* Index */}
                <div className="absolute left-[15%] bottom-[95%]">
                   <Finger rotate={-20} length={100} delay={0} />
                </div>
                {/* Middle */}
                <div className="absolute left-[38%] bottom-[100%]">
                   <Finger rotate={0} length={110} delay={0.1} />
                </div>
                {/* Ring */}
                <div className="absolute left-[62%] bottom-[95%]">
                   <Finger rotate={20} length={100} delay={0.2} />
                </div>
                {/* Pinky */}
                <div className="absolute left-[85%] bottom-[85%]">
                   <Finger rotate={40} length={80} delay={0.3} />
                </div>
             </div>
           </motion.div>
        </div>
        
        <h2 className="text-3xl font-bold text-slate-700 mb-2">
          {phase === 'open' ? "Stretch Open" : "Squeeze Close"}
        </h2>
        <p className="text-slate-500 text-lg">Reps remaining: {repsLeft}</p>
      </div>
    </LevelLayout>
  );
};
