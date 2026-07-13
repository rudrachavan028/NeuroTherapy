import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LevelLayout } from './LevelLayout';
import { playWinSound } from '../utils/sound';

interface Props { onBack: () => void; onNext?: () => void; }

export const BreathingGame: React.FC<Props> = ({ onBack, onNext }) => {
  const [level, setLevel] = useState(1);
  const [phase, setPhase] = useState<'in' | 'hold' | 'out'>('in');
  const [cyclesLeft, setCyclesLeft] = useState(3);
  const [isLevelComplete, setIsLevelComplete] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Level determines number of cycles: 3, 4, 5...
  useEffect(() => {
    setCyclesLeft(2 + level);
    setIsLevelComplete(false);
    setPhase('in');
  }, [level]);

  useEffect(() => {
    if (cyclesLeft <= 0 && !isLevelComplete) {
      setIsLevelComplete(true);
      if (soundEnabled) playWinSound();
      return;
    }
    
    if (cyclesLeft > 0) {
      let timeout: ReturnType<typeof setTimeout>;
      if (phase === 'in') {
        timeout = setTimeout(() => setPhase('hold'), 4000);
      } else if (phase === 'hold') {
        timeout = setTimeout(() => setPhase('out'), 2000);
      } else if (phase === 'out') {
        timeout = setTimeout(() => {
          setCyclesLeft(c => c - 1);
          if (cyclesLeft > 1) setPhase('in');
        }, 4000);
      }
      return () => clearTimeout(timeout);
    }
  }, [phase, cyclesLeft, isLevelComplete, soundEnabled]);

  const getText = () => {
    if (isLevelComplete) return "Relaxed & Ready";
    switch(phase) {
      case 'in': return "Breathe In...";
      case 'hold': return "Hold...";
      case 'out': return "Breathe Out...";
    }
  };

  return (
    <LevelLayout
      title="Breathing Circle"
      currentLevel={level}
      maxLevels={12}
      onNextLevel={() => {
          if (level >= 12) {
              onNext ? onNext() : onBack();
          } else {
              setLevel(l => l + 1);
          }
      }}
      onRestart={() => setCyclesLeft(2 + level)}
      onBack={onBack}
      isLevelComplete={isLevelComplete}
      isGameComplete={level === 12 && isLevelComplete}
      soundEnabled={soundEnabled}
      toggleSound={() => setSoundEnabled(!soundEnabled)}
      encouragement="Feel the calmness spread through you."
    >
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="relative flex items-center justify-center w-80 h-80">
          <motion.div
            animate={{
              scale: phase === 'in' ? 1.5 : phase === 'hold' ? 1.5 : 1,
              opacity: phase === 'hold' ? 0.8 : 1
            }}
            transition={{ duration: phase === 'in' || phase === 'out' ? 4 : 0 }}
            className="absolute w-40 h-40 bg-blue-300 rounded-full blur-xl opacity-50"
          />
          <motion.div
            animate={{
              scale: phase === 'in' ? 1.5 : phase === 'hold' ? 1.5 : 1,
            }}
            transition={{ duration: phase === 'in' || phase === 'out' ? 4 : 0, ease: "easeInOut" }}
            className="w-40 h-40 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 shadow-2xl flex items-center justify-center z-10"
          >
            <span className="text-white font-bold text-lg">{getText()}</span>
          </motion.div>
          {/* Ripple rings */}
          <motion.div 
             animate={{ scale: [1, 2], opacity: [0.5, 0] }}
             transition={{ repeat: Infinity, duration: 4 }}
             className="absolute w-40 h-40 border-2 border-blue-200 rounded-full"
          />
        </div>
        <p className="mt-8 text-slate-500 text-lg">Cycles remaining: {cyclesLeft}</p>
      </div>
    </LevelLayout>
  );
};