import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LevelLayout } from './LevelLayout';
import { playMatchSound, playWinSound } from '../utils/sound';

interface Props { onBack: () => void; onNext?: () => void; }

const ICONS = ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🐔'];

export const MemoryGame: React.FC<Props> = ({ onBack, onNext }) => {
  const [level, setLevel] = useState(1);
  const [cards, setCards] = useState<{id: number, icon: string, isFlipped: boolean, isMatched: boolean}[]>([]);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLevelComplete, setIsLevelComplete] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    setIsLevelComplete(false);
    setFlippedIds([]);
    
    // Level 1: 2x2 (4 cards), Level 12: 6x4 (24 cards) or similar progression
    const pairsCount = 2 + Math.floor(level * 0.8); 
    const gameIcons = ICONS.slice(0, pairsCount);
    const deck = [...gameIcons, ...gameIcons]
      .sort(() => 0.5 - Math.random())
      .map((icon, i) => ({ id: i, icon, isFlipped: false, isMatched: false }));
    
    setCards(deck);
  }, [level]);

  const handleCardClick = (id: number) => {
    if (isProcessing || cards.find(c => c.id === id)?.isMatched || flippedIds.includes(id)) return;

    const newFlipped = [...flippedIds, id];
    setFlippedIds(newFlipped);
    
    setCards(prev => prev.map(c => c.id === id ? { ...c, isFlipped: true } : c));

    if (newFlipped.length === 2) {
      setIsProcessing(true);
      const [firstId, secondId] = newFlipped;
      
      // We need to look up in the current 'cards' state but we just queued a state update. 
      // Safe way: use the values we know.
      // Wait for animation
      setTimeout(() => {
        const c1 = cards.find(c => c.id === firstId); // Still stale technically but icon is constant
        const c2 = cards.find(c => c.id === secondId);
        
        if (c1?.icon === c2?.icon) {
          // Match
          setCards(prev => prev.map(c => (c.id === firstId || c.id === secondId) ? { ...c, isMatched: true, isFlipped: true } : c));
          if (soundEnabled) playMatchSound();
          // Check win
          if (cards.filter(c => !c.isMatched).length === 2) {
             setIsLevelComplete(true);
             if (soundEnabled) playWinSound();
          }
        } else {
          // No match
          setCards(prev => prev.map(c => (c.id === firstId || c.id === secondId) ? { ...c, isFlipped: false } : c));
        }
        setFlippedIds([]);
        setIsProcessing(false);
      }, 1000);
    }
  };

  return (
    <LevelLayout
      title="Memory Flip"
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
      encouragement="Your memory is sharp!"
    >
      <div className="flex-1 p-4 flex items-center justify-center">
        <div className="grid grid-cols-4 gap-3 md:gap-4 max-w-lg w-full">
          {cards.map(card => (
            <motion.div
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              animate={{ rotateY: card.isFlipped ? 180 : 0 }}
              transition={{ duration: 0.4 }}
              className={`aspect-square rounded-xl cursor-pointer shadow-md flex items-center justify-center text-4xl select-none perspective-1000 ${card.isMatched ? 'opacity-0' : 'opacity-100'}`}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="absolute inset-0 bg-indigo-500 rounded-xl backface-hidden flex items-center justify-center" style={{ backfaceVisibility: 'hidden' }}>
                 <span className="text-white text-2xl">?</span>
              </div>
              <div 
                className="absolute inset-0 bg-white border-2 border-indigo-200 rounded-xl backface-hidden flex items-center justify-center" 
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              >
                {card.icon}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </LevelLayout>
  );
};
