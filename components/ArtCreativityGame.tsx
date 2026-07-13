import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { LevelLayout } from './LevelLayout';
import { playMatchSound, playWinSound } from '../utils/sound';
import { RefreshCw, ArrowRight } from 'lucide-react';

interface Props { onBack: () => void; onNext?: () => void; }

const COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#78350f', '#000000', '#64748b'
];

const MAX_LEVELS = 10;

export const ArtCreativityGame: React.FC<Props> = ({ onBack, onNext }) => {
  const [level, setLevel] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLevelComplete, setIsLevelComplete] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Initialize Level Canvas
  useEffect(() => {
    setIsLevelComplete(false);
    initCanvas();
  }, [level]);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Reset Canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw Level Template (Black Outlines)
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();

    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    switch(level) {
      case 1: // Circle
        ctx.arc(cx, cy, 120, 0, Math.PI * 2);
        break;
      case 2: // Square
        ctx.rect(cx - 120, cy - 120, 240, 240);
        break;
      case 3: // Triangle
        ctx.moveTo(cx, cy - 150);
        ctx.lineTo(cx + 150, cy + 100);
        ctx.lineTo(cx - 150, cy + 100);
        ctx.closePath();
        break;
      case 4: // Heart
        ctx.moveTo(cx, cy - 60);
        ctx.bezierCurveTo(cx + 70, cy - 150, cx + 180, cy, cx, cy + 150);
        ctx.bezierCurveTo(cx - 180, cy, cx - 70, cy - 150, cx, cy - 60);
        break;
      case 5: // Star
        for (let i = 0; i < 5; i++) {
            ctx.lineTo(Math.cos((18 + i * 72) * 0.01745) * 150 + cx, 
                      -Math.sin((18 + i * 72) * 0.01745) * 150 + cy);
            ctx.lineTo(Math.cos((54 + i * 72) * 0.01745) * 60 + cx, 
                      -Math.sin((54 + i * 72) * 0.01745) * 60 + cy);
        }
        ctx.closePath();
        break;
      case 6: // Cloud
        ctx.moveTo(cx - 100, cy);
        ctx.bezierCurveTo(cx - 130, cy - 40, cx - 130, cy - 100, cx - 70, cy - 100);
        ctx.bezierCurveTo(cx - 40, cy - 150, cx + 40, cy - 150, cx + 70, cy - 100);
        ctx.bezierCurveTo(cx + 130, cy - 100, cx + 130, cy - 40, cx + 100, cy);
        ctx.bezierCurveTo(cx + 130, cy + 40, cx + 130, cy + 100, cx + 70, cy + 100);
        ctx.bezierCurveTo(cx + 40, cy + 100, cx - 40, cy + 100, cx - 70, cy + 100);
        ctx.bezierCurveTo(cx - 130, cy + 100, cx - 130, cy + 40, cx - 100, cy);
        break;
      case 7: // Flower
        ctx.arc(cx, cy, 40, 0, Math.PI*2); // Center
        for(let i=0; i<6; i++) {
           const angle = (i * 60) * Math.PI / 180;
           // Petals needs to be separate paths for easier filling if we want them distinct, 
           // but keeping it simple as one complex path or just overlaid shapes
           ctx.moveTo(cx + Math.cos(angle)*40, cy + Math.sin(angle)*40);
           ctx.arc(cx + Math.cos(angle)*100, cy + Math.sin(angle)*100, 60, 0, Math.PI*2);
        }
        break;
      case 8: // House
        ctx.rect(cx - 100, cy, 200, 140); // Base
        ctx.moveTo(cx - 120, cy); ctx.lineTo(cx, cy - 100); ctx.lineTo(cx + 120, cy); ctx.closePath(); // Roof
        ctx.rect(cx - 30, cy + 60, 60, 80); // Door
        ctx.rect(cx + 40, cy + 20, 40, 40); // Window
        break;
      case 9: // Fish
        ctx.ellipse(cx, cy, 120, 70, 0, 0, Math.PI*2);
        ctx.moveTo(cx+110, cy); ctx.lineTo(cx+180, cy-40); ctx.lineTo(cx+180, cy+40); ctx.closePath(); // Tail
        ctx.moveTo(cx-70, cy-20); ctx.arc(cx-70, cy-20, 8, 0, Math.PI*2); // Eye
        ctx.moveTo(cx, cy-70); ctx.lineTo(cx+30, cy-100); ctx.lineTo(cx+60, cy-65); // Fin
        break;
      case 10: // Butterfly
        // Left Wing Top
        ctx.moveTo(cx - 10, cy);
        ctx.bezierCurveTo(cx - 60, cy - 100, cx - 150, cy - 80, cx - 150, cy - 20);
        ctx.bezierCurveTo(cx - 150, cy + 20, cx - 60, cy + 40, cx - 10, cy + 10);
        // Left Wing Bottom
        ctx.moveTo(cx - 10, cy + 10);
        ctx.bezierCurveTo(cx - 50, cy + 80, cx - 100, cy + 100, cx - 80, cy + 120);
        ctx.bezierCurveTo(cx - 60, cy + 140, cx - 20, cy + 80, cx - 5, cy + 30);
        
        // Right Wing Top (Mirror)
        ctx.moveTo(cx + 10, cy);
        ctx.bezierCurveTo(cx + 60, cy - 100, cx + 150, cy - 80, cx + 150, cy - 20);
        ctx.bezierCurveTo(cx + 150, cy + 20, cx + 60, cy + 40, cx + 10, cy + 10);
        // Right Wing Bottom
        ctx.moveTo(cx + 10, cy + 10);
        ctx.bezierCurveTo(cx + 50, cy + 80, cx + 100, cy + 100, cx + 80, cy + 120);
        ctx.bezierCurveTo(cx + 60, cy + 140, cx + 20, cy + 80, cx + 5, cy + 30);

        // Body
        ctx.ellipse(cx, cy, 10, 60, 0, 0, Math.PI*2);
        break;
    }
    ctx.stroke();
  };

  // Flood Fill Algorithm
  const floodFill = (startX: number, startY: number, fillColor: string) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { willReadFrequently: true });
    if (!canvas || !ctx) return;

    // Convert HEX to RGB
    const r = parseInt(fillColor.slice(1, 3), 16);
    const g = parseInt(fillColor.slice(3, 5), 16);
    const b = parseInt(fillColor.slice(5, 7), 16);
    
    const pixelData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = pixelData.data;
    const width = canvas.width;
    const height = canvas.height;
    
    const x = Math.floor(startX);
    const y = Math.floor(startY);
    const startPos = (y * width + x) * 4;
    
    const startR = data[startPos];
    const startG = data[startPos + 1];
    const startB = data[startPos + 2];
    const startA = data[startPos + 3];

    // Don't fill if color is same or outline (black-ish)
    if ((startR === r && startG === g && startB === b) || (startR < 50 && startG < 50 && startB < 50)) return;

    const stack = [[x, y]];
    const seen = new Set<number>(); // To prevent infinite loops in some edge cases
    
    while (stack.length) {
        const [cx, cy] = stack.pop()!;
        const pos = (cy * width + cx) * 4;

        if (cx < 0 || cx >= width || cy < 0 || cy >= height) continue;
        if (seen.has(pos)) continue;
        
        // Check match logic (approximate for antialiasing tolerance)
        // Simple equality for now as we started with white
        const isMatch = Math.abs(data[pos] - startR) < 10 && 
                        Math.abs(data[pos+1] - startG) < 10 && 
                        Math.abs(data[pos+2] - startB) < 10;

        if (isMatch) {
            data[pos] = r;
            data[pos + 1] = g;
            data[pos + 2] = b;
            data[pos + 3] = 255;
            seen.add(pos);

            stack.push([cx + 1, cy]);
            stack.push([cx - 1, cy]);
            stack.push([cx, cy + 1]);
            stack.push([cx, cy - 1]);
        }
    }
    
    ctx.putImageData(pixelData, 0, 0);
  };

  const handleDragEnd = (color: string, info: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const point = info.point; // { x, y } relative to viewport

    if (
        point.x >= rect.left && 
        point.x <= rect.right && 
        point.y >= rect.top && 
        point.y <= rect.bottom
    ) {
        // Calculate canvas coordinates
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (point.x - rect.left) * scaleX;
        const y = (point.y - rect.top) * scaleY;
        
        floodFill(x, y, color);
        if (soundEnabled) playMatchSound();
    }
  };

  return (
    <LevelLayout
      title="Color Fill"
      currentLevel={level}
      maxLevels={MAX_LEVELS}
      onNextLevel={() => {
        if (level >= MAX_LEVELS) {
          onNext ? onNext() : onBack();
        } else {
          setLevel(l => l + 1);
        }
      }}
      onRestart={initCanvas}
      onBack={onBack}
      isLevelComplete={isLevelComplete}
      isGameComplete={false} 
      soundEnabled={soundEnabled}
      toggleSound={() => setSoundEnabled(!soundEnabled)}
      encouragement="Beautiful colors!"
    >
      <div className="flex-1 flex flex-col items-center gap-6">
        
        {/* Color Palette */}
        <div className="w-full max-w-3xl bg-white p-4 rounded-3xl shadow-sm border border-slate-200">
           <p className="text-center text-slate-500 mb-3 text-sm font-bold uppercase tracking-wider">Drag colors to fill the shape</p>
           <div className="flex flex-wrap justify-center gap-3 md:gap-4">
            {COLORS.map(c => (
              <motion.div
                key={c}
                drag
                dragSnapToOrigin
                dragMomentum={false}
                whileHover={{ scale: 1.2, cursor: 'grab', zIndex: 10 }}
                whileDrag={{ scale: 1.4, cursor: 'grabbing', zIndex: 20 }}
                onDragEnd={(_, info) => handleDragEnd(c, info)}
                className="w-10 h-10 md:w-12 md:h-12 rounded-full shadow-md border-4 border-white ring-1 ring-slate-200"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {/* Canvas Area */}
        <div className="relative rounded-2xl overflow-hidden shadow-xl border-8 border-white bg-slate-50">
          <canvas
            ref={canvasRef}
            width={600}
            height={400} 
            className="w-full max-w-2xl h-auto touch-none"
          />
        </div>
        
        <div className="flex gap-4">
             <button 
               onClick={initCanvas} 
               className="flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-colors"
             >
               <RefreshCw size={20} /> Reset
             </button>
             <button 
                onClick={() => { setIsLevelComplete(true); if(soundEnabled) playWinSound(); }}
                className="flex items-center gap-2 px-8 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-bold shadow-lg shadow-teal-200 transition-all transform hover:scale-105"
             >
                Done <ArrowRight size={20} />
             </button>
        </div>
      </div>
    </LevelLayout>
  );
};
