import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Triangle, Square, Circle, Pentagon } from 'lucide-react';
import { LevelLayout } from './LevelLayout';
import { playMatchSound, playWinSound } from '../utils/sound';

interface Props { onBack: () => void; onNext?: () => void; }

const SHAPES = [
  { id: 0, color: 'bg-red-400', icon: <Triangle size={32} /> },
  { id: 1, color: 'bg-blue-400', icon: <Square size={32} /> },
  { id: 2, color: 'bg-green-400', icon: <Circle size={32} /> },
  { id: 3, color: 'bg-yellow-400', icon: <Pentagon size={32} /> },
];

export const SequenceGame: React.FC<Props> = ({ onBack, onNext }) => {
  const [level, setLevel] = useState(1);
  const [sequence, setSequence] = useState<number[]>([]);
  const [userStep, setUserStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [isLevelComplete, setIsLevelComplete] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Init sequence
  useEffect(() => {
    const len = 2 + level; 
    const newSeq = Array.from({length: len}, () => Math.floor(Math.random() * 4));
    setSequence(newSeq);
    setUserStep(0);
    setIsLevelComplete(false);
    playSequence(newSeq);
  }, [level]);

  const playSequence = async (seq: number[]) => {
    setIsPlaying(true);
    for (let i = 0; i < seq.length; i++) {
      await new Promise(r => setTimeout(r, 500));
      setActiveIdx(seq[i]);
      if (soundEnabled) playMatchSound(); // Reuse match sound as tone
      await new Promise(r => setTimeout(r, 500));
      setActiveIdx(null);
    }
    setIsPlaying(false);
  };

  const handlePress = (id: number) => {
    if (isPlaying || isLevelComplete) return;

    if (soundEnabled) playMatchSound();
    
    // Flash button
    setActiveIdx(id);
    setTimeout(() => setActiveIdx(null), 200);

    if (id === sequence[userStep]) {
      if (userStep === sequence.length - 1) {
        setIsLevelComplete(true);
        if (soundEnabled) playWinSound();
      } else {
        setUserStep(s => s + 1);
      }
    } else {
      // Error - Shake or Reset
      alert("Oops! Try again.");
      playSequence(sequence);
      setUserStep(0);
    }
  };

  return (
    <LevelLayout
      title="Shape Sequence"
      currentLevel={level}
      maxLevels={12}
      onNextLevel={() => {
        if (level >= 12) {
            onNext ? onNext() : onBack();
        } else {
            setLevel(l => l + 1);
        }
      }}
      onRestart={() => { setLevel(level); }} 
      onBack={onBack}
      isLevelComplete={isLevelComplete}
      isGameComplete={level === 12 && isLevelComplete}
      soundEnabled={soundEnabled}
      toggleSound={() => setSoundEnabled(!soundEnabled)}
      encouragement="Excellent memory!"
    >
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <p className="mb-8 text-slate-500 font-medium">
          {isPlaying ? "Watch the sequence..." : "Repeat the sequence!"}
        </p>
        <div className="grid grid-cols-2 gap-4">
          {SHAPES.map((shape) => (
            <motion.button
              key={shape.id}
              whileTap={{ scale: 0.9 }}
              onClick={() => handlePress(shape.id)}
              className={`w-32 h-32 rounded-3xl ${shape.color} flex items-center justify-center text-white shadow-lg transition-all ${activeIdx === shape.id ? 'brightness-125 scale-105 shadow-xl ring-4 ring-white' : 'opacity-80'}`}
            >
              {shape.icon}
            </motion.button>
          ))}
        </div>
      </div>
    </LevelLayout>
  );
};
