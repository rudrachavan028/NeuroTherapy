import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LevelLayout } from './LevelLayout';
import { playMatchSound, playWinSound } from '../utils/sound';
import { Sparkles, Star, Flower, Sun, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, MousePointer2 } from 'lucide-react';

interface Props { onBack: () => void; onNext?: () => void; }

// --- 1. Bubble Pop Delight ---
export const BubblePopGame: React.FC<Props> = ({ onBack, onNext }) => {
  const [bubbles, setBubbles] = useState<{id: number, x: number, y: number, color: string, size: number}[]>([]);
  const [score, setScore] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      const id = Date.now();
      const colors = ['bg-blue-300', 'bg-pink-300', 'bg-purple-300', 'bg-teal-300', 'bg-yellow-300'];
      const newBubble = {
        id,
        x: Math.random() * 90, // %
        y: 110, // Start below
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 40 + Math.random() * 60
      };
      setBubbles(prev => [...prev, newBubble]);
    }, 800);

    return () => clearInterval(interval);
  }, []);

  // Remove bubbles that float away
  useEffect(() => {
    const interval = setInterval(() => {
      setBubbles(prev => prev.map(b => ({...b, y: b.y - 1})).filter(b => b.y > -20));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const popBubble = (id: number) => {
    if(soundEnabled) playMatchSound();
    setScore(s => s + 1);
    setBubbles(prev => prev.filter(b => b.id !== id));
  };

  return (
    <LevelLayout
      title="Bubble Pop Delight"
      currentLevel={1}
      maxLevels={1}
      onNextLevel={onNext || onBack}
      onRestart={() => setScore(0)}
      onBack={onBack}
      isLevelComplete={false}
      isGameComplete={false}
      soundEnabled={soundEnabled}
      toggleSound={() => setSoundEnabled(!soundEnabled)}
      encouragement={`You popped ${score} bubbles of joy!`}
    >
      <div className="flex-1 relative overflow-hidden bg-gradient-to-b from-blue-50 to-white rounded-3xl border border-blue-100 shadow-inner min-h-[400px]">
        <AnimatePresence>
          {bubbles.map(b => (
            <motion.button
              key={b.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 0.8, scale: 1, y: `${b.y}%`, x: `${b.x}%` }}
              exit={{ scale: 1.5, opacity: 0 }}
              onClick={() => popBubble(b.id)}
              className={`absolute rounded-full ${b.color} border-2 border-white shadow-lg backdrop-blur-sm flex items-center justify-center cursor-pointer`}
              style={{ width: b.size, height: b.size, left: 0, top: 0 }}
            >
               <div className="w-1/3 h-1/3 bg-white opacity-40 rounded-full absolute top-2 left-2" />
            </motion.button>
          ))}
        </AnimatePresence>
        <div className="absolute top-4 right-4 bg-white/80 px-4 py-2 rounded-full shadow-sm font-bold text-slate-600">
           Popped: {score}
        </div>
      </div>
    </LevelLayout>
  );
};

// --- 2. Star Shower ---
export const StarShowerGame: React.FC<Props> = ({ onBack, onNext }) => {
  const [stars, setStars] = useState<{id: number, x: number, y: number, color: string}[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      const id = Math.random();
      const colors = ['#FCD34D', '#F472B6', '#60A5FA', '#A78BFA'];
      setStars(prev => [...prev, {
        id,
        x: Math.random() * 95,
        y: -10,
        color: colors[Math.floor(Math.random() * colors.length)]
      }]);
    }, 400);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setStars(prev => prev.map(s => ({...s, y: s.y + 1})).filter(s => s.y < 110));
    }, 30);
    return () => clearInterval(interval);
  }, []);

  const catchStar = (id: number) => {
    if(soundEnabled) playWinSound();
    setStars(prev => prev.filter(s => s.id !== id));
    // Could add visual explosion here, using framer exit animation
  };

  return (
    <LevelLayout
      title="Star Shower"
      currentLevel={1}
      maxLevels={1}
      onNextLevel={onNext || onBack}
      onRestart={() => setStars([])}
      onBack={onBack}
      isLevelComplete={false}
      isGameComplete={false}
      soundEnabled={soundEnabled}
      toggleSound={() => setSoundEnabled(!soundEnabled)}
      encouragement="Catch the falling stars!"
    >
      <div className="flex-1 relative overflow-hidden bg-slate-900 rounded-3xl border border-slate-700 shadow-inner min-h-[400px]">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
        <AnimatePresence>
          {stars.map(s => (
            <motion.button
              key={s.id}
              initial={{ y: -50, x: `${s.x}%`, rotate: 0 }}
              animate={{ y: `${s.y}%`, x: `${s.x}%`, rotate: 360 }}
              exit={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.5, ease: "linear" }}
              onClick={() => catchStar(s.id)}
              className="absolute text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]"
              style={{ left: 0, top: 0, color: s.color }}
            >
              <Star fill="currentColor" size={40} />
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </LevelLayout>
  );
};

// --- 3. Rainbow Trail Painter ---
export const RainbowTrailGame: React.FC<Props> = ({ onBack, onNext }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pos, setPos] = useState({ x: 300, y: 200 });
  const [hue, setHue] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const step = 20;
      setPos(p => {
        const newPos = { ...p };
        if (e.key === 'ArrowUp') newPos.y -= step;
        if (e.key === 'ArrowDown') newPos.y += step;
        if (e.key === 'ArrowLeft') newPos.x -= step;
        if (e.key === 'ArrowRight') newPos.x += step;
        return newPos;
      });
      if(soundEnabled) playMatchSound();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [soundEnabled]);

  // Draw loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
    ctx.fill();
    
    // Add glow
    ctx.shadowBlur = 15;
    ctx.shadowColor = `hsl(${hue}, 100%, 50%)`;

    setHue(h => (h + 5) % 360);
  }, [pos]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  return (
    <LevelLayout
      title="Rainbow Trail Painter"
      currentLevel={1}
      maxLevels={1}
      onNextLevel={onNext || onBack}
      onRestart={clearCanvas}
      onBack={onBack}
      isLevelComplete={false}
      isGameComplete={false}
      soundEnabled={soundEnabled}
      toggleSound={() => setSoundEnabled(!soundEnabled)}
      encouragement="Paint the sky with light!"
    >
      <div className="flex-1 flex flex-col items-center gap-4">
        <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-black border-4 border-slate-700">
           <canvas ref={canvasRef} width={600} height={400} className="w-full max-w-2xl bg-black touch-none" />
           <motion.div 
             animate={{ x: pos.x - 10, y: pos.y - 10 }}
             transition={{ type: "spring", stiffness: 500, damping: 20 }}
             className="absolute top-0 left-0 w-5 h-5 bg-white rounded-full shadow-[0_0_20px_white] pointer-events-none"
           />
        </div>
        <div className="flex gap-4 text-slate-500 text-sm items-center">
            <span className="flex items-center gap-1"><ArrowUp size={16}/> Move with Arrows</span>
            <span>or</span>
            <span className="flex items-center gap-1"><MousePointer2 size={16}/> Tap anywhere</span>
        </div>
      </div>
    </LevelLayout>
  );
};

// --- 4. Flower Bloom Garden ---
export const FlowerBloomGame: React.FC<Props> = ({ onBack, onNext }) => {
  const [flowers, setFlowers] = useState<{id: number, x: number, y: number, color: string, scale: number}[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const plantFlower = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const colors = ['text-red-500', 'text-pink-500', 'text-purple-500', 'text-blue-500', 'text-orange-500'];
    
    setFlowers(prev => [...prev, {
      id: Date.now(),
      x,
      y,
      color: colors[Math.floor(Math.random() * colors.length)],
      scale: 0
    }]);

    if(soundEnabled) playMatchSound();
  };

  return (
    <LevelLayout
      title="Flower Bloom Garden"
      currentLevel={1}
      maxLevels={1}
      onNextLevel={onNext || onBack}
      onRestart={() => setFlowers([])}
      onBack={onBack}
      isLevelComplete={false}
      isGameComplete={false}
      soundEnabled={soundEnabled}
      toggleSound={() => setSoundEnabled(!soundEnabled)}
      encouragement="Your garden is growing beautifully."
    >
      <div 
        onClick={plantFlower}
        className="flex-1 relative overflow-hidden bg-emerald-50 rounded-3xl border border-emerald-100 shadow-inner min-h-[400px] cursor-pointer"
      >
        <div className="absolute bottom-0 w-full h-20 bg-emerald-100" />
        <p className="absolute top-4 left-0 w-full text-center text-emerald-400 opacity-60 pointer-events-none font-bold">Tap to plant seeds</p>
        
        {flowers.map(f => (
          <motion.div
            key={f.id}
            initial={{ scale: 0, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: "spring", bounce: 0.5, duration: 1 }}
            className={`absolute origin-bottom ${f.color}`}
            style={{ left: f.x - 24, top: f.y - 48 }}
          >
             <Flower size={48} fill="currentColor" />
             <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1, y: -20, x: [0, 10, -10, 0] }} 
               transition={{ delay: 0.5, duration: 2, repeat: Infinity }}
               className="absolute -top-4 -right-4 text-yellow-400"
             >
                <Sparkles size={16} />
             </motion.div>
          </motion.div>
        ))}
      </div>
    </LevelLayout>
  );
};

// --- 5. Smile Transform ---
export const SmileTransformGame: React.FC<Props> = ({ onBack, onNext }) => {
  const [grid, setGrid] = useState(Array(12).fill(false)); // false = neutral, true = happy
  const [soundEnabled, setSoundEnabled] = useState(true);

  const toggleSmile = (index: number) => {
    const newGrid = [...grid];
    newGrid[index] = !newGrid[index];
    setGrid(newGrid);
    if(newGrid[index] && soundEnabled) playWinSound();
  };

  return (
    <LevelLayout
      title="Smile Maker"
      currentLevel={1}
      maxLevels={1}
      onNextLevel={onNext || onBack}
      onRestart={() => setGrid(Array(12).fill(false))}
      onBack={onBack}
      isLevelComplete={grid.every(Boolean)}
      isGameComplete={false}
      soundEnabled={soundEnabled}
      toggleSound={() => setSoundEnabled(!soundEnabled)}
      encouragement="Look at all those smiles!"
    >
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="grid grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
          {grid.map((isHappy, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => toggleSmile(i)}
              className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center text-4xl shadow-md transition-colors ${isHappy ? 'bg-yellow-200 text-yellow-600' : 'bg-slate-100 text-slate-400'}`}
            >
              <AnimatePresence mode='wait'>
                {isHappy ? (
                  <motion.div 
                    key="happy"
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0 }}
                  >
                    <Sun size={48} fill="currentColor" />
                  </motion.div>
                ) : (
                  <motion.div 
                    key="neutral"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="grayscale opacity-50"
                  >
                    <Sun size={48} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          ))}
        </div>
      </div>
    </LevelLayout>
  );
};

// --- 6. Firefly Glow Dance ---
export const FireflyGlowGame: React.FC<Props> = ({ onBack, onNext }) => {
  const [fireflies, setFireflies] = useState<{id: number, x: number, y: number, phase: number}[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    const count = 30;
    const newFlies = Array.from({length: count}, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      phase: Math.random() * Math.PI * 2
    }));
    setFireflies(newFlies);

    const interval = setInterval(() => {
      setFireflies(prev => prev.map(f => ({
        ...f,
        x: (f.x + Math.sin(Date.now() / 1000 + f.phase) * 0.2 + 100) % 100,
        y: (f.y + Math.cos(Date.now() / 1500 + f.phase) * 0.2 + 100) % 100
      })));
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const handleClick = () => {
    // Gather logic
    if(soundEnabled) playMatchSound();
    setFireflies(prev => prev.map(f => ({
       ...f,
       x: 50 + (Math.random() - 0.5) * 20,
       y: 50 + (Math.random() - 0.5) * 20
    })));
  };

  return (
    <LevelLayout
      title="Firefly Glow Dance"
      currentLevel={1}
      maxLevels={1}
      onNextLevel={onNext || onBack}
      onRestart={() => {}}
      onBack={onBack}
      isLevelComplete={false}
      isGameComplete={false}
      soundEnabled={soundEnabled}
      toggleSound={() => setSoundEnabled(!soundEnabled)}
      encouragement="A gentle light in the darkness."
    >
      <div 
        onClick={handleClick}
        className="flex-1 relative overflow-hidden bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl min-h-[400px] cursor-pointer"
      >
         <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-indigo-950" />
         {fireflies.map(f => (
           <motion.div
             key={f.id}
             animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
             transition={{ duration: 2 + Math.random() * 2, repeat: Infinity }}
             className="absolute w-3 h-3 bg-lime-400 rounded-full blur-[2px] shadow-[0_0_10px_#a3e635]"
             style={{ left: `${f.x}%`, top: `${f.y}%` }}
           />
         ))}
         <p className="absolute bottom-6 w-full text-center text-lime-100/50 text-sm">Tap to gather the light</p>
      </div>
    </LevelLayout>
  );
};
