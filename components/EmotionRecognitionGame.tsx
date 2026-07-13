
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LevelLayout } from './LevelLayout';
import { playWinSound } from '../utils/sound';

interface Props { onBack: () => void; onNext?: () => void; }

interface Emotion {
  id: string;
  name: string;
  image: string;
}

const EMOTIONS: Emotion[] = [
  // Basic Emotions
  { id: 'happy', name: 'Happiness', image: '/emotiongame/happy.jpg' },
  { id: 'sad', name: 'Sadness', image: '/emotiongame/sad.jpg' },
  { id: 'fear', name: 'Fear', image: '/emotiongame/f.jpg' },
  { id: 'anger', name: 'Anger', image: '/emotiongame/anger.jpg' },
  
  // Intermediate
  { id: 'surprise', name: 'Surprise', image: '/emotiongame/s.jpg' },
  { id: 'disgust', name: 'Disgust', image: '/emotiongame/d.jpg' },
  { id: 'love', name: 'Love', image: '/emotiongame/l.jpg' },
  { id: 'relief', name: 'Relief', image: '/emotiongame/r.jpg' },
  { id: 'hope', name: 'Hope', image: '/emotiongame/h.jpg' },

  // Complex
  { id: 'jealousy', name: 'Jealousy', image: '/emotiongame/j.jpg' },
  { id: 'guilt', name: 'Guilt', image: '/emotiongame/g.jpg' },
  { id: 'shame', name: 'Shame', image: '/emotiongame/shame.jpg' },
  { id: 'envy', name: 'Envy', image: '/emotiongame/e.jpg' },
];

export const EmotionRecognitionGame: React.FC<Props> = ({ onBack, onNext }) => {
  const [level, setLevel] = useState(1);
  const [target, setTarget] = useState<Emotion | null>(null);
  const [options, setOptions] = useState<Emotion[]>([]);
  const [isLevelComplete, setIsLevelComplete] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [wrongShake, setWrongShake] = useState<string | null>(null);
  const [optionsCount, setOptionsCount] = useState(2);

  useEffect(() => {
    // Reset state when level changes
    setIsLevelComplete(false);
    setWrongShake(null);
    
    // Determine difficulty and pool based on level
    let pool: Emotion[] = [];
    let count = 2;

    if (level <= 3) {
      // Basic: Happy, Sad, Fear, Anger
      pool = EMOTIONS.slice(0, 4);
      count = 2;
    } else if (level <= 6) {
      // Intermediate: Add Surprise, Disgust, Love
      pool = EMOTIONS.slice(0, 7);
      count = 3;
    } else if (level <= 9) {
      // Advanced: Add Relief, Hope
      pool = EMOTIONS.slice(0, 9);
      count = 4;
    } else {
      // Expert: All emotions including complex ones
      pool = EMOTIONS;
      count = 4;
    }
    
    setOptionsCount(count);

    // Pick a random target from the available pool
    const randomTargetIndex = Math.floor(Math.random() * pool.length);
    const newTarget = pool[randomTargetIndex];
    setTarget(newTarget);

    // Pick distractors
    const distractors = pool.filter(e => e.id !== newTarget.id);
    const shuffledDistractors = distractors.sort(() => 0.5 - Math.random()).slice(0, count - 1);
    
    // Combine and shuffle options
    const gameOptions = [newTarget, ...shuffledDistractors].sort(() => 0.5 - Math.random());
    setOptions(gameOptions);

  }, [level]);

  const handleOptionClick = (emotionId: string) => {
    if (isLevelComplete) return;

    if (emotionId === target?.id) {
      if (soundEnabled) playWinSound();
      setIsLevelComplete(true);
    } else {
      setWrongShake(emotionId);
      setTimeout(() => setWrongShake(null), 500);
    }
  };

  const nextLevel = () => {
    if (level >= 12) {
      onNext ? onNext() : onBack();
    } else {
      setLevel(l => l + 1);
    }
  };

  return (
    <LevelLayout
      title="Emotion Recognition"
      currentLevel={level}
      maxLevels={12}
      onNextLevel={nextLevel}
      onRestart={() => setLevel(level)} // Trigger re-render of current level logic
      onBack={onBack}
      isLevelComplete={isLevelComplete}
      isGameComplete={level === 12 && isLevelComplete}
      soundEnabled={soundEnabled}
      toggleSound={() => setSoundEnabled(!soundEnabled)}
      encouragement="You read the feelings perfectly!"
      gameId="emotion-recognition"
    >
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 gap-6">
        
        {/* Question Area */}
        <div className="text-center z-10">
            <p className="text-slate-400 text-lg font-medium mb-2 uppercase tracking-wide">Which image shows</p>
            <motion.h2 
                key={target?.id}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-4xl md:text-6xl font-black text-slate-800 drop-shadow-sm"
            >
                {target?.name}?
            </motion.h2>
        </div>

        {/* Options Grid */}
        <div className={`grid gap-4 w-full max-w-4xl ${optionsCount === 2 ? 'grid-cols-2' : optionsCount === 3 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-2 md:grid-cols-4'}`}>
          <AnimatePresence mode='popLayout'>
            {options.map((emotion) => {
               const isCorrect = isLevelComplete && emotion.id === target?.id;
               const isWrong = wrongShake === emotion.id;
               const isFaded = isLevelComplete && !isCorrect;
               
               return (
                <motion.button
                    key={emotion.id}
                    layout
                    whileHover={{ scale: 1.02, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    animate={isWrong ? { x: [-10, 10, -10, 10, 0], borderColor: '#fca5a5' } : { x: 0, opacity: isFaded ? 0.3 : 1, borderColor: isCorrect ? '#4ade80' : 'transparent' }}
                    onClick={() => handleOptionClick(emotion.id)}
                    className={`
                        relative aspect-[4/5] md:aspect-square rounded-3xl shadow-lg overflow-hidden group border-4 transition-all duration-300
                        ${isCorrect ? 'ring-4 ring-green-200 z-10' : 'hover:shadow-xl'}
                    `}
                >
                    <img 
                        src={emotion.image} 
                        alt={emotion.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                            // Fallback if image fails
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement!.innerText = emotion.name;
                        }}
                    />
                    
                    {/* Overlay gradient for text readability (optional, currently text is above) */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    
                    {/* Success Overlay */}
                    {isCorrect && (
                        <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                            <motion.div 
                                initial={{ scale: 0 }} 
                                animate={{ scale: 1 }}
                                className="bg-white text-green-600 rounded-full p-3 shadow-lg"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            </motion.div>
                        </div>
                    )}
                </motion.button>
               );
            })}
          </AnimatePresence>
        </div>

      </div>
    </LevelLayout>
  );
};
