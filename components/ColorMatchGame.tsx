
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { COLORS } from '../constants';
import { GameItem, ColorTheme } from '../types';
import { DraggableItem } from './DraggableItem';
import { DropZone } from './DropZone';
import { playMatchSound, playWinSound } from '../utils/sound';
import { LevelLayout } from './LevelLayout';

const MAX_LEVELS = 12;

interface Props {
  onBack: () => void;
  onNext?: () => void;
}

export const ColorMatchGame: React.FC<Props> = ({ onBack, onNext }) => {
  const [level, setLevel] = useState(1);
  const [items, setItems] = useState<GameItem[]>([]);
  const [targetColors, setTargetColors] = useState<ColorTheme[]>([]);
  const [matchedIds, setMatchedIds] = useState<Set<string>>(new Set());
  const [isLevelComplete, setIsLevelComplete] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const dropZoneRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const initLevel = useCallback(() => {
    setIsLevelComplete(false);
    setMatchedIds(new Set());
    
    // Difficulty: Level 1 (2 colors) -> Level 12 (8 colors)
    const maxColors = COLORS.length; 
    const calculatedCount = Math.round(2 + ((maxColors - 2) * (level - 1)) / (MAX_LEVELS - 1));
    const count = Math.min(maxColors, Math.max(2, calculatedCount));
    
    const shuffledColors = [...COLORS].sort(() => 0.5 - Math.random());
    const selectedThemes = shuffledColors.slice(0, count);
    
    setTargetColors(selectedThemes);

    const newItems: GameItem[] = selectedThemes.map(theme => ({
      id: `${theme.id}-${Math.random()}`,
      colorId: theme.id,
      isMatched: false,
    }));
    
    setItems(newItems.sort(() => 0.5 - Math.random()));
  }, [level]);

  useEffect(() => {
    initLevel();
  }, [initLevel]);

  useEffect(() => {
    if (items.length > 0 && matchedIds.size === items.length && !isLevelComplete) {
      setIsLevelComplete(true);
      if (soundEnabled) playWinSound();
    }
  }, [matchedIds, items.length, soundEnabled, isLevelComplete]);

  const handleDragEnd = (itemId: string, point: { x: number; y: number }) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const dropZoneEl = dropZoneRefs.current.get(item.colorId);
    if (dropZoneEl) {
      const rect = dropZoneEl.getBoundingClientRect();
      if (point.x >= rect.left && point.x <= rect.right && point.y >= rect.top && point.y <= rect.bottom) {
        setMatchedIds(prev => new Set(prev).add(itemId));
        if (soundEnabled) playMatchSound();
      }
    }
  };

  const nextLevel = () => {
    if (level >= MAX_LEVELS) {
      onNext ? onNext() : onBack();
    } else {
      setLevel(l => l + 1);
    }
  };

  return (
    <LevelLayout
      title="Mood Color Match"
      currentLevel={level}
      maxLevels={MAX_LEVELS}
      onNextLevel={nextLevel}
      onRestart={initLevel}
      onBack={onBack}
      isLevelComplete={isLevelComplete}
      isGameComplete={level === MAX_LEVELS && isLevelComplete}
      soundEnabled={soundEnabled}
      toggleSound={() => setSoundEnabled(!soundEnabled)}
      encouragement="Your colors are beautiful!"
      gameId="color-match"
    >
      <div className="flex-1 flex flex-col justify-center gap-12">
        <div className="flex flex-wrap justify-center gap-4 md:gap-8">
          {targetColors.map(theme => (
            <DropZone 
              key={theme.id} 
              theme={theme}
              matchedCount={items.filter(i => i.colorId === theme.id && matchedIds.has(i.id)).length}
              ref={(el) => {
                if (el) dropZoneRefs.current.set(theme.id, el);
                else dropZoneRefs.current.delete(theme.id);
              }}
            />
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-6 min-h-[120px] p-4 bg-slate-50/50 rounded-3xl border border-slate-100 shadow-inner">
          <AnimatePresence>
            {items.map(item => (
              !matchedIds.has(item.id) && (
                <DraggableItem 
                  key={item.id}
                  item={item}
                  theme={targetColors.find(t => t.id === item.colorId)!}
                  onDragEnd={handleDragEnd}
                  isMatched={matchedIds.has(item.id)}
                />
              )
            ))}
          </AnimatePresence>
        </div>
      </div>
    </LevelLayout>
  );
};
