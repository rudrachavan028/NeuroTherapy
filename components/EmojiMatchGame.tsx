import React, { useState, useEffect } from 'react';
import { motion, Reorder } from 'framer-motion';
import { LevelLayout } from './LevelLayout';
import { playMatchSound, playWinSound } from '../utils/sound';

interface Props { onBack: () => void; onNext?: () => void; }

const PAIRS = [
  { e: '😊', w: 'Happy' }, { e: '🌞', w: 'Sun' }, { e: '🌸', w: 'Flower' },
  { e: '🐶', w: 'Dog' }, { e: '🍎', w: 'Apple' }, { e: '🚗', w: 'Car' },
  { e: '🌙', w: 'Moon' }, { e: '⭐', w: 'Star' }, { e: '🍦', w: 'Ice Cream' },
  { e: '🎈', w: 'Balloon' }, { e: '🐱', w: 'Cat' }, { e: '🍕', w: 'Pizza' }
];

export const EmojiMatchGame: React.FC<Props> = ({ onBack, onNext }) => {
  const [level, setLevel] = useState(1);
  const [items, setItems] = useState<{id: string, content: string, type: 'emoji'|'word', matchId: string}[]>([]);
  const [matches, setMatches] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLevelComplete, setIsLevelComplete] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    setIsLevelComplete(false);
    setMatches(new Set());
    const count = Math.min(PAIRS.length, 2 + Math.floor(level/2));
    const usedPairs = PAIRS.slice(0, count);
    
    let gameItems: any[] = [];
    usedPairs.forEach((p, i) => {
        gameItems.push({ id: `e-${i}`, content: p.e, type: 'emoji', matchId: `pair-${i}` });
        gameItems.push({ id: `w-${i}`, content: p.w, type: 'word', matchId: `pair-${i}` });
    });
    
    setItems(gameItems.sort(() => 0.5 - Math.random()));
  }, [level]);

  const handleCardClick = (id: string, matchId: string) => {
    if (matches.has(matchId)) return;
    
    if (!selectedId) {
      setSelectedId(id);
    } else {
      const selectedItem = items.find(i => i.id === selectedId);
      if (selectedItem && selectedItem.id !== id && selectedItem.matchId === matchId) {
        // Match
        setMatches(prev => new Set(prev).add(matchId));
        if (soundEnabled) playMatchSound();
        setSelectedId(null);
        if (matches.size + 1 === items.length / 2) {
             setIsLevelComplete(true);
             if (soundEnabled) playWinSound();
        }
      } else {
        // No match
        setSelectedId(null);
      }
    }
  };

  return (
    <LevelLayout
      title="Mood Emoji Match"
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
      encouragement="Perfect matching skills!"
    >
       <div className="flex-1 p-4 flex items-center justify-center">
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl">
           {items.map((item) => {
             const isMatched = matches.has(item.matchId);
             const isSelected = selectedId === item.id;
             return (
               <motion.button
                 key={item.id}
                 layout
                 onClick={() => handleCardClick(item.id, item.matchId)}
                 animate={{ 
                    scale: isMatched ? 0 : 1, 
                    opacity: isMatched ? 0 : 1,
                    backgroundColor: isSelected ? '#E0E7FF' : '#ffffff' 
                 }}
                 className={`h-24 rounded-2xl shadow-md border-4 flex items-center justify-center text-3xl font-bold transition-colors ${isSelected ? 'border-indigo-500' : 'border-slate-100'}`}
                 disabled={isMatched}
               >
                 {item.content}
               </motion.button>
             );
           })}
         </div>
       </div>
    </LevelLayout>
  );
};
