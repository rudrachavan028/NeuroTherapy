import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#f97316'];

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  rotation: number;
  scale: number;
}

export const Confetti: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < 50; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100 - 50, // -50% to 50% relative start
        y: Math.random() * -50, // Start above
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotation: Math.random() * 360,
        scale: 0.5 + Math.random() * 1
      });
    }
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-50 flex items-center justify-center">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
          animate={{
            x: (Math.random() - 0.5) * 800, // Spread out
            y: 500 + Math.random() * 300, // Fall down
            opacity: 0,
            rotate: p.rotation + 720,
            scale: p.scale
          }}
          transition={{ duration: 2 + Math.random() * 2, ease: "easeOut" }}
          className="absolute w-4 h-4 rounded-sm"
          style={{ backgroundColor: p.color }}
        />
      ))}
    </div>
  );
};
