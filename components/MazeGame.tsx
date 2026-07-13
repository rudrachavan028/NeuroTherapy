import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LevelLayout } from './LevelLayout';
import { playWinSound } from '../utils/sound';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

interface Props { onBack: () => void; onNext?: () => void; }

// Simple maze maps for demo (0: path, 1: wall, 2: start, 3: end)
const MAZES = [
  // Lvl 1
  [
    [2,0,0,1],
    [1,1,0,0],
    [0,0,0,1],
    [3,1,0,0]
  ],
  // Lvl 2
  [
    [2,0,1,0,0],
    [1,0,1,0,1],
    [0,0,0,0,0],
    [0,1,1,1,0],
    [0,0,0,3,1]
  ],
  // ... Simplified for prompt limit, usually algorithmic generation
];

export const MazeGame: React.FC<Props> = ({ onBack, onNext }) => {
  const [level, setLevel] = useState(1);
  const [grid, setGrid] = useState<number[][]>([]);
  const [pos, setPos] = useState({x:0, y:0});
  const [isLevelComplete, setIsLevelComplete] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    // Generate random simple maze for level size N
    const size = Math.min(8, 4 + Math.floor(level/2));
    const newGrid = Array(size).fill(0).map(() => Array(size).fill(0));
    // Simple mock maze generation: clear path + random walls
    for(let y=0; y<size; y++) {
      for(let x=0; x<size; x++) {
        if(Math.random() > 0.7) newGrid[y][x] = 1; // Wall
      }
    }
    // Ensure clear start and end
    newGrid[0][0] = 2; // Start
    newGrid[size-1][size-1] = 3; // End
    // Ensure at least one path (mock: clear diagonal roughly)
    let cx=0, cy=0;
    while(cx < size-1 || cy < size-1) {
        newGrid[cy][cx] = 0;
        if(cx < size-1 && (Math.random() > 0.5 || cy === size-1)) cx++;
        else cy++;
    }
    newGrid[0][0] = 2;
    newGrid[size-1][size-1] = 3;

    setGrid(newGrid);
    setPos({x:0, y:0});
    setIsLevelComplete(false);
  }, [level]);

  const move = (dx: number, dy: number) => {
    if(isLevelComplete) return;
    const nx = pos.x + dx;
    const ny = pos.y + dy;
    
    if(ny >= 0 && ny < grid.length && nx >= 0 && nx < grid[0].length && grid[ny][nx] !== 1) {
      setPos({x: nx, y: ny});
      if(grid[ny][nx] === 3) {
        setIsLevelComplete(true);
        if(soundEnabled) playWinSound();
      }
    }
  };

  return (
    <LevelLayout
      title="Path Finder"
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
      encouragement="Way to go, pathfinder!"
    >
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div 
           className="bg-slate-800 p-2 rounded-lg grid gap-1 shadow-2xl"
           style={{ gridTemplateColumns: `repeat(${grid.length}, minmax(0, 1fr))` }}
        >
          {grid.map((row, y) => row.map((cell, x) => {
            const isPlayer = pos.x === x && pos.y === y;
            let bg = 'bg-slate-700';
            if(cell === 1) bg = 'bg-slate-500'; // Wall
            if(cell === 3) bg = 'bg-green-500'; // End
            
            return (
              <div key={`${x}-${y}`} className={`w-8 h-8 md:w-10 md:h-10 rounded-sm ${bg} flex items-center justify-center`}>
                {isPlayer && <motion.div layoutId="player" className="w-6 h-6 bg-yellow-400 rounded-full shadow-lg" />}
              </div>
            );
          }))}
        </div>

        {/* Controls */}
        <div className="mt-8 grid grid-cols-3 gap-2">
           <div />
           <button onClick={() => move(0, -1)} className="p-4 bg-slate-200 rounded-xl active:bg-slate-300"><ArrowUp /></button>
           <div />
           <button onClick={() => move(-1, 0)} className="p-4 bg-slate-200 rounded-xl active:bg-slate-300"><ArrowLeft /></button>
           <button onClick={() => move(0, 1)} className="p-4 bg-slate-200 rounded-xl active:bg-slate-300"><ArrowDown /></button>
           <button onClick={() => move(1, 0)} className="p-4 bg-slate-200 rounded-xl active:bg-slate-300"><ArrowRight /></button>
        </div>
      </div>
    </LevelLayout>
  );
};
