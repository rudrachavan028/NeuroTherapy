import React from 'react';
import { motion, useAnimation, PanInfo } from 'framer-motion';
import { ColorTheme, GameItem } from '../types';

interface DraggableItemProps {
  item: GameItem;
  theme: ColorTheme;
  onDragEnd: (id: string, point: { x: number; y: number }) => void;
  isMatched: boolean;
}

export const DraggableItem: React.FC<DraggableItemProps> = ({ item, theme, onDragEnd, isMatched }) => {
  const controls = useAnimation();

  if (isMatched) {
    return null; // Don't render if already matched (it "entered" the box)
  }

  return (
    <motion.div
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.1}
      dragMomentum={false}
      whileHover={{ scale: 1.1, cursor: 'grab' }}
      whileDrag={{ 
        scale: 1.25, 
        cursor: 'grabbing', 
        zIndex: 50,
        rotate: 5,
        boxShadow: "0px 20px 40px rgba(0,0,0,0.25)"
      }}
      animate={controls}
      onDragEnd={(_event, info: PanInfo) => {
        onDragEnd(item.id, info.point);
        // Reset position visually if not matched (logic handled in parent, this just snaps back)
        controls.start({ x: 0, y: 0, transition: { type: "spring", stiffness: 300, damping: 20 } });
      }}
      className={`relative w-20 h-20 md:w-24 md:h-24 rounded-full ${theme.bgClass} flex items-center justify-center border-4 border-white ring-2 ring-gray-100/50 shadow-lg`}
      style={{ touchAction: 'none' }}
    >
      {/* Glossy shine effect */}
      <div className="absolute top-1 left-2 w-8 h-5 rounded-[100%] bg-gradient-to-b from-white/60 to-transparent transform -rotate-12 blur-[1px]" />
      
      {/* Center detail */}
      <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm shadow-inner border border-white/10" />

      {/* Subtle bottom highlight */}
      <div className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-white/10 blur-sm" />
    </motion.div>
  );
};
