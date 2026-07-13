import React, { forwardRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ColorTheme } from '../types';

interface DropZoneProps {
  theme: ColorTheme;
  matchedCount: number;
}

export const DropZone = forwardRef<HTMLDivElement, DropZoneProps>(({ theme, matchedCount }, ref) => {
  const [showBurst, setShowBurst] = useState(false);
  const [prevCount, setPrevCount] = useState(matchedCount);

  // Trigger burst when matched count increases
  useEffect(() => {
    if (matchedCount > prevCount) {
      setShowBurst(true);
      const timer = setTimeout(() => setShowBurst(false), 1000); // Cleanup after animation
      return () => clearTimeout(timer);
    }
    setPrevCount(matchedCount);
  }, [matchedCount, prevCount]);

  return (
    <div 
      ref={ref}
      className={`relative w-28 h-28 md:w-36 md:h-36 rounded-3xl border-4 border-dashed transition-all duration-300 flex items-center justify-center overflow-visible
        ${theme.borderClass} ${matchedCount > 0 ? theme.bgClass + ' bg-opacity-20' : 'bg-transparent'}
      `}
    >
        {/* Inner Label */}
        <span className={`text-sm font-bold uppercase tracking-widest ${theme.textClass} opacity-60 pointer-events-none select-none`}>
            {theme.name}
        </span>

        {/* Visual feedback for matches inside */}
        <AnimatePresence>
            {matchedCount > 0 && (
                <motion.div
                    initial={{ scale: 0, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", bounce: 0.6 }}
                    key="check" 
                    className={`absolute inset-0 rounded-[20px] ${theme.bgClass} flex items-center justify-center z-10`}
                >
                    <motion.span 
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1, duration: 0.3 }}
                        className="text-white text-4xl font-bold"
                    >
                        ✓
                    </motion.span>
                </motion.div>
            )}
        </AnimatePresence>

        {/* Burst Animation Effect */}
        <AnimatePresence>
            {showBurst && <BurstEffect theme={theme} />}
        </AnimatePresence>
    </div>
  );
});

const BurstEffect = ({ theme }: { theme: ColorTheme }) => {
    const particles = Array.from({ length: 12 });
    
    return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            {/* Ripple Ring */}
            <motion.div
                initial={{ width: "100%", height: "100%", opacity: 0.8, borderWidth: 8 }}
                animate={{ width: "180%", height: "180%", opacity: 0, borderWidth: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={`absolute rounded-3xl border-solid ${theme.borderClass}`}
            />
            
            {/* Confetti Particles */}
            {particles.map((_, i) => {
                const angle = (i / particles.length) * 2 * Math.PI;
                const distance = 80 + Math.random() * 40;
                
                return (
                    <motion.div
                        key={i}
                        initial={{ x: 0, y: 0, scale: 0.8, opacity: 1 }}
                        animate={{ 
                            x: Math.cos(angle) * distance, 
                            y: Math.sin(angle) * distance, 
                            scale: 0,
                            opacity: 0 
                        }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className={`absolute w-3 h-3 rounded-full ${theme.bgClass}`}
                    />
                );
            })}
        </div>
    );
};

DropZone.displayName = "DropZone";
