
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RefreshCw, Volume2, VolumeX, Trophy, Sparkles, ArrowRight, SkipForward } from 'lucide-react';
import { Confetti } from './Confetti';
import { useAuth } from '../contexts/AuthContext';
import { progressService, GameStats } from '../services/progressService';

interface LevelLayoutProps {
  title: string;
  currentLevel: number;
  maxLevels: number;
  onNextLevel: () => void;
  onRestart: () => void;
  onBack: () => void;
  isLevelComplete: boolean;
  isGameComplete: boolean;
  soundEnabled: boolean;
  toggleSound: () => void;
  children: React.ReactNode;
  encouragement?: string;
  gameId?: string; 
  customStats?: GameStats; // Optional prop to override auto-calculation
}

export const LevelLayout: React.FC<LevelLayoutProps> = ({
  title,
  currentLevel,
  maxLevels,
  onNextLevel,
  onRestart,
  onBack,
  isLevelComplete,
  isGameComplete,
  soundEnabled,
  toggleSound,
  children,
  encouragement,
  gameId,
  customStats
}) => {
  const { user } = useAuth();
  const savedRef = useRef(false);
  const startTimeRef = useRef(Date.now());

  // Reset start time on level change or restart
  useEffect(() => {
    startTimeRef.current = Date.now();
    savedRef.current = false;
  }, [currentLevel, title]); // title change implies game change roughly

  // Auto-save progress when level is complete
  useEffect(() => {
    if (isLevelComplete && user && gameId && !savedRef.current) {
      savedRef.current = true;
      
      const endTime = Date.now();
      const totalTimeMs = endTime - startTimeRef.current;
      
      // Heuristic for Reaction Time: Total Time / (Level + 2 items approx)
      const estimatedItems = Math.max(1, currentLevel + 2);
      const avgReactionTime = Math.floor(totalTimeMs / estimatedItems);
      
      // --- Simulate Brain Wave Data based on Game Type ---
      // This logic provides "Neuro-Feedback" simulation
      
      let alpha = 50; // Relaxation
      let beta = 50;  // Focus
      let theta = 50; // Creativity/Emotion
      let delta = 40; // Healing
      let gamma = 40; // Cognitive Peak

      if (gameId) {
          if (['breathing', 'zen-v1', 'zen-v2', 'music-binaural', 'music-alpha', 'env-vr1'].some(k => gameId.includes(k))) {
              // Relaxation Games
              alpha = 85 + Math.random() * 15; // High
              beta = 30 + Math.random() * 20;  // Low
              theta = 60 + Math.random() * 20; // Moderate
              delta = 60 + Math.random() * 20;
          } else if (['color-match', 'counting', 'odd-one', 'maze', 'sequence', 'follow-dot'].some(k => gameId.includes(k))) {
              // Focus Games
              alpha = 40 + Math.random() * 20;
              beta = 80 + Math.random() * 20; // High Focus
              gamma = 75 + Math.random() * 25; // High Cognitive
          } else if (['art-coloring', 'flower-bloom', 'rainbow-trail', 'firefly-glow'].some(k => gameId.includes(k))) {
              // Creative Games
              alpha = 70 + Math.random() * 20; // Relaxed
              theta = 85 + Math.random() * 15; // High Creativity (Flow state)
              beta = 50 + Math.random() * 20;
          } else if (gameId === 'emotion-recognition' || gameId.includes('emoji')) {
              // Emotional Processing
              theta = 90 + Math.random() * 10; // Very High Emotional
              beta = 60 + Math.random() * 15;  // Moderate Focus
              alpha = 50 + Math.random() * 20;
          }
      }

      // Ensure stats are within 0-100
      const clamp = (n: number) => Math.min(100, Math.max(0, Math.floor(n)));

      const calculatedStats: GameStats = customStats || {
        reactionTime: avgReactionTime,
        accuracy: 100,
        stability: Math.floor(80 + Math.random() * 20),
        alpha: clamp(alpha),
        beta: clamp(beta),
        theta: clamp(theta),
        delta: clamp(delta),
        gamma: clamp(gamma)
      };

      progressService.saveProgress(user.id, gameId, currentLevel, 100, calculatedStats);
    }
  }, [isLevelComplete, user, gameId, currentLevel, customStats]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 flex flex-col min-h-[600px]">
      {/* Header */}
      <div className="w-full flex justify-between items-center mb-6 bg-white/60 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-white/20">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            title="Back to Menu"
          >
            <ArrowLeft size={24} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800">{title}</h1>
            <div className="flex items-center gap-2">
              <div className="h-2 w-24 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 transition-all duration-500" 
                  style={{ width: `${(currentLevel / maxLevels) * 100}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 font-bold">Lvl {currentLevel}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={toggleSound}
            className="p-3 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
            title={soundEnabled ? "Mute" : "Unmute"}
          >
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
          <button 
            onClick={onRestart}
            className="p-3 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
            title="Restart Level"
          >
            <RefreshCw size={20} />
          </button>
          {/* Skip / Next Level Button */}
          <button 
            onClick={onNextLevel}
            className="p-3 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition-colors flex items-center gap-1"
            title="Next Level / Skip"
          >
            <SkipForward size={20} />
          </button>
        </div>
      </div>

      {/* Game Content */}
      <div className="flex-1 relative flex flex-col">
        {children}
      </div>

      {/* Victory Modal */}
      <AnimatePresence>
        {isLevelComplete && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <Confetti />
            <motion.div 
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[40px] p-8 max-w-md w-full shadow-2xl text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-500 via-yellow-500 to-blue-500" />
              
              <div className="flex justify-center mb-6">
                <motion.div 
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                  className={`p-5 rounded-full ${isGameComplete ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'}`}
                >
                  {isGameComplete ? <Trophy size={48} /> : <Sparkles size={48} />}
                </motion.div>
              </div>
              
              <h2 className="text-3xl font-bold text-slate-800 mb-2">
                {isGameComplete ? "Module Complete!" : "Wonderful!"}
              </h2>
              <p className="text-slate-500 mb-6">
                 {encouragement || "You're doing great! Keep going."}
              </p>

              <button 
                onClick={onNextLevel}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
              >
                {isGameComplete ? <>Next Module <ArrowRight size={20}/></> : <>Next Level <ArrowRight size={20}/></>}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
