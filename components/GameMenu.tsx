
import React, { useEffect, useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { GameConfig } from '../types';
import { 
  Wind, Palette, Star, Smile, Brain, Zap, Grid, Map, Hand, Eye, 
  ArrowLeft, Activity, Puzzle, Brush, Sparkles, CloudRain, Move, Flower, Sun, Lightbulb,
  PlayCircle, Globe, Headphones, Music, Waves, Zap as ZapIcon, Moon, Circle, BarChart2, CheckCircle, Heart, ChevronRight, Layers, Lock, Bot, BookOpen
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { progressService } from '../services/progressService';

// --- GAME MODULES DATA ---
export const ALL_MODULES: GameConfig[] = [
  // Exercises (Physical Grounding)
  { id: 'breathing', title: 'Breathing Circle', description: 'Relax & Focus', levelIndex: 1, color: 'bg-blue-100 text-blue-600', icon: <Wind size={32} />, category: 'exercise' },
  { id: 'hand-stretch', title: 'Hand Mirror', description: 'Motor Skills', levelIndex: 2, color: 'bg-orange-100 text-orange-600', icon: <Hand size={32} />, category: 'exercise' },
  { id: 'follow-dot', title: 'Follow the Dot', description: 'Visual Tracking', levelIndex: 3, color: 'bg-indigo-100 text-indigo-600', icon: <Eye size={32} />, category: 'exercise' },
  
  // Games (Cognitive Awakening)
  { id: 'color-match', title: 'Color Match', description: 'Mood Boosting', levelIndex: 1, color: 'bg-pink-100 text-pink-600', icon: <Palette size={32} />, category: 'game' },
  { id: 'counting', title: 'Counting Stars', description: 'Concentration', levelIndex: 2, color: 'bg-yellow-100 text-yellow-600', icon: <Star size={32} />, category: 'game' },
  { id: 'emoji', title: 'Mood Match', description: 'Emotional IQ', levelIndex: 3, color: 'bg-orange-100 text-orange-600', icon: <Smile size={32} />, category: 'game' },
  { id: 'memory', title: 'Memory Flip', description: 'Recall Ability', levelIndex: 4, color: 'bg-purple-100 text-purple-600', icon: <Brain size={32} />, category: 'game' },
  { id: 'sequence', title: 'Shape Seq', description: 'Working Memory', levelIndex: 5, color: 'bg-red-100 text-red-600', icon: <Zap size={32} />, category: 'game' },
  { id: 'odd-one', title: 'Odd One Out', description: 'Visual Focus', levelIndex: 6, color: 'bg-teal-100 text-teal-600', icon: <Grid size={32} />, category: 'game' },
  { id: 'maze', title: 'Path Finder', description: 'Spatial Planning', levelIndex: 7, color: 'bg-green-100 text-green-600', icon: <Map size={32} />, category: 'game' },

  // Emotion Recognition
  { id: 'emotion-recognition', title: 'Emotion ID', description: 'Identify Feelings', levelIndex: 1, color: 'bg-rose-100 text-rose-600', icon: <Heart size={32} />, category: 'emotion' },

  // Creativity (Emotional Expression)
  { id: 'art-coloring', title: 'Digital Art', description: 'Express Yourself', levelIndex: 1, color: 'bg-teal-100 text-teal-600', icon: <Brush size={32} />, category: 'creativity' },

  // Visual Animation (Interactive Play)
  { id: 'bubble-pop', title: 'Bubble Pop', description: 'Pop for Joy', levelIndex: 1, color: 'bg-cyan-100 text-cyan-600', icon: <Sparkles size={32} />, category: 'visual-animation' },
  { id: 'star-shower', title: 'Star Shower', description: 'Catch the Stars', levelIndex: 2, color: 'bg-indigo-100 text-indigo-600', icon: <CloudRain size={32} />, category: 'visual-animation' },
  { id: 'rainbow-trail', title: 'Rainbow Trail', description: 'Paint with Motion', levelIndex: 3, color: 'bg-fuchsia-100 text-fuchsia-600', icon: <Move size={32} />, category: 'visual-animation' },
  { id: 'flower-bloom', title: 'Flower Garden', description: 'Watch them Grow', levelIndex: 4, color: 'bg-emerald-100 text-emerald-600', icon: <Flower size={32} />, category: 'visual-animation' },
  { id: 'smile-transform', title: 'Smile Maker', description: 'Find the Joy', levelIndex: 5, color: 'bg-yellow-100 text-yellow-600', icon: <Sun size={32} />, category: 'visual-animation' },
  { id: 'firefly-glow', title: 'Firefly Dance', description: 'Calm Glowing', levelIndex: 6, color: 'bg-lime-100 text-lime-600', icon: <Lightbulb size={32} />, category: 'visual-animation' },

  // Zen & Focus (Deep Focus)
  { id: 'zen-v1', title: 'Calm Video 1', description: 'Relax & Watch', levelIndex: 1, color: 'bg-orange-100 text-orange-600', icon: <PlayCircle size={32} />, category: 'focus' },
  { id: 'zen-v2', title: 'Calm Video 2', description: 'Deep Focus', levelIndex: 2, color: 'bg-purple-100 text-purple-600', icon: <PlayCircle size={32} />, category: 'focus' },

  // Environment (Immersion)
  { id: 'env-vr1', title: 'Environment 1', description: 'Immersive Experience', levelIndex: 1, color: 'bg-emerald-100 text-emerald-600', icon: <Globe size={32} />, category: 'environment' },
  { id: 'env-vr2', title: 'Environment 2', description: 'Nature Walk', levelIndex: 2, color: 'bg-emerald-100 text-emerald-600', icon: <Globe size={32} />, category: 'environment' },
  { id: 'env-vr3', title: 'Environment 3', description: 'Scenic View', levelIndex: 3, color: 'bg-emerald-100 text-emerald-600', icon: <Globe size={32} />, category: 'environment' },
  { id: 'env-vr4', title: 'Environment 4', description: 'Calm Surroundings', levelIndex: 4, color: 'bg-emerald-100 text-emerald-600', icon: <Globe size={32} />, category: 'environment' },

  // Music (Sonic Healing)
  { id: 'music-binaural', title: 'Binaural Beats', description: 'Focus & Balance', levelIndex: 1, color: 'bg-slate-100 text-slate-600', icon: <Headphones size={32} />, category: 'music' },
  { id: 'music-alpha', title: 'Alpha Waves', description: 'Relaxed Alertness', levelIndex: 2, color: 'bg-indigo-100 text-indigo-600', icon: <Waves size={32} />, category: 'music' },
  { id: 'music-gamma', title: 'Gamma Waves', description: 'Cognitive Boost', levelIndex: 3, color: 'bg-amber-100 text-amber-600', icon: <ZapIcon size={32} />, category: 'music' },
  { id: 'music-theta', title: 'Theta Waves', description: 'Deep Calm', levelIndex: 4, color: 'bg-violet-100 text-violet-600', icon: <Moon size={32} />, category: 'music' },
  { id: 'music-om', title: 'Om Chanting', description: 'Spiritual Grounding', levelIndex: 5, color: 'bg-rose-100 text-rose-600', icon: <Circle size={32} />, category: 'music' },
  { id: 'music-flute', title: 'Flute Meditation', description: 'Peaceful Melody', levelIndex: 6, color: 'bg-emerald-100 text-emerald-600', icon: <Music size={32} />, category: 'music' },
];

// --- SECTIONS CONFIGURATION ---

interface Section {
  id: string;
  title: string;
  subtitle: string;
  desc: string;
  categories: string[];
  icon: React.ReactNode;
  color: string;
  lightColor: string;
  textColor: string;
  borderColor: string;
  shadowColor: string;
}

const getSections = (ptsdLevel: string = 'Low'): Section[] => {
  // Base Phases (Standard Low/Medium Sequence)
  const phases = {
    foundations: {
      id: 's1',
      title: 'Phase 1',
      subtitle: 'Foundations',
      desc: 'Physical Grounding + Cognitive Awakening',
      categories: ['exercise', 'game'],
      icon: <Zap size={28} />,
      color: 'bg-indigo-500',
      lightColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
      borderColor: 'border-indigo-100',
      shadowColor: 'shadow-indigo-200'
    },
    expression: {
      id: 's2',
      title: 'Phase 2',
      subtitle: 'Expression',
      desc: 'Emotional Expression + Interactive Play',
      categories: ['exercise', 'creativity', 'visual-animation'],
      icon: <Palette size={28} />,
      color: 'bg-pink-500',
      lightColor: 'bg-pink-50',
      textColor: 'text-pink-600',
      borderColor: 'border-pink-100',
      shadowColor: 'shadow-pink-200'
    },
    focus: {
      id: 's3',
      title: 'Phase 3',
      subtitle: 'Focus',
      desc: 'Deep Focus + Cognitive Strengthening',
      categories: ['exercise', 'game', 'focus'],
      icon: <Brain size={28} />,
      color: 'bg-violet-500',
      lightColor: 'bg-violet-50',
      textColor: 'text-violet-600',
      borderColor: 'border-violet-100',
      shadowColor: 'shadow-violet-200'
    },
    healing: {
      id: 's4',
      title: 'Phase 4',
      subtitle: 'Healing',
      desc: 'Emotion Recognition + Sonic Healing',
      categories: ['exercise', 'emotion', 'music'],
      icon: <Heart size={28} />,
      color: 'bg-rose-500',
      lightColor: 'bg-rose-50',
      textColor: 'text-rose-600',
      borderColor: 'border-rose-100',
      shadowColor: 'shadow-rose-200'
    },
    immersion: {
      id: 's5',
      title: 'Phase 5',
      subtitle: 'Immersion',
      desc: 'Full Immersion + Environmental Calm',
      categories: ['exercise', 'environment'],
      icon: <Globe size={28} />,
      color: 'bg-emerald-500',
      lightColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      borderColor: 'border-emerald-100',
      shadowColor: 'shadow-emerald-200'
    }
  };

  // Reorder based on PTSD Level
  switch (ptsdLevel) {
    case 'Extreme':
      // Priority: Safety (Immersion/Healing) -> Grounding (Foundations) -> Expression -> Focus
      return [
        { ...phases.immersion, id: 's1', title: 'Phase 1', subtitle: 'Safety & Calm' },
        { ...phases.healing, id: 's2', title: 'Phase 2', subtitle: 'Stabilization' },
        { ...phases.foundations, id: 's3', title: 'Phase 3', subtitle: 'Grounding' },
        { ...phases.expression, id: 's4', title: 'Phase 4', subtitle: 'Gentle Expression' },
        { ...phases.focus, id: 's5', title: 'Phase 5', subtitle: 'Cognitive Rebuilding' }
      ];
    case 'High':
      // Priority: Healing -> Immersion -> Foundations -> Expression -> Focus
      return [
        { ...phases.healing, id: 's1', title: 'Phase 1', subtitle: 'Emotional Safety' },
        { ...phases.immersion, id: 's2', title: 'Phase 2', subtitle: 'Sensory Soothing' },
        { ...phases.foundations, id: 's3', title: 'Phase 3', subtitle: 'Physical Grounding' },
        { ...phases.expression, id: 's4', title: 'Phase 4', subtitle: 'Expression' },
        { ...phases.focus, id: 's5', title: 'Phase 5', subtitle: 'Focus' }
      ];
    case 'Medium':
      // Priority: Foundations -> Expression -> Healing -> Immersion -> Focus
      return [
        { ...phases.foundations, id: 's1', title: 'Phase 1', subtitle: 'Balance' },
        { ...phases.expression, id: 's2', title: 'Phase 2', subtitle: 'Release' },
        { ...phases.healing, id: 's3', title: 'Phase 3', subtitle: 'Processing' },
        { ...phases.immersion, id: 's4', title: 'Phase 4', subtitle: 'Calm' },
        { ...phases.focus, id: 's5', title: 'Phase 5', subtitle: 'Strengthening' }
      ];
    case 'Low':
    default:
      // Standard Progression: Foundations -> Expression -> Focus -> Healing -> Immersion
      return [
        phases.foundations,
        phases.expression,
        phases.focus,
        phases.healing,
        phases.immersion
      ];
  }
};

// --- CATEGORY METADATA ---
const CATEGORY_DETAILS: Record<string, { title: string, desc: string, icon: any, color: string, bg: string, border: string }> = {
    'exercise': { title: 'Physical Grounding', desc: 'Reconnect with your body.', icon: <Activity size={24} />, color: 'text-indigo-600', bg: 'bg-indigo-100', border: 'border-indigo-200' },
    'game': { title: 'Cognitive Awakening', desc: 'Stimulate your mind.', icon: <Puzzle size={24} />, color: 'text-purple-600', bg: 'bg-purple-100', border: 'border-purple-200' },
    'emotion': { title: 'Emotion Recognition', desc: 'Understand feelings.', icon: <Heart size={24} />, color: 'text-rose-600', bg: 'bg-rose-100', border: 'border-rose-200' },
    'creativity': { title: 'Emotional Expression', desc: 'Express your inner self.', icon: <Brush size={24} />, color: 'text-teal-600', bg: 'bg-teal-100', border: 'border-teal-200' },
    'visual-animation': { title: 'Interactive Play', desc: 'Experience joy.', icon: <Sparkles size={24} />, color: 'text-amber-600', bg: 'bg-amber-100', border: 'border-amber-200' },
    'focus': { title: 'Deep Focus', desc: 'Center your thoughts.', icon: <Sun size={24} />, color: 'text-sky-600', bg: 'bg-sky-100', border: 'border-sky-200' },
    'environment': { title: 'Immersion', desc: 'Calming natural worlds.', icon: <Globe size={24} />, color: 'text-emerald-600', bg: 'bg-emerald-100', border: 'border-emerald-200' },
    'music': { title: 'Sonic Healing', desc: 'Healing frequencies.', icon: <Headphones size={24} />, color: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-200' },
};

interface Props {
  onSelectGame: (id: string) => void;
  onOpenTracker: () => void;
  onOpenTherapist: () => void;
  onOpenDashboard: () => void;
  sectionId: string | null;
  setSectionId: (id: string | null) => void;
  categoryId: string | null;
  setCategoryId: (id: string | null) => void;
  ptsdLevel?: string;
}

// Animation Variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

const cardVariants: Variants = {
  hidden: { opacity: 0, x: -30, y: 20 },
  show: { 
    opacity: 1, 
    x: 0, 
    y: 0, 
    transition: { 
      type: "spring", 
      stiffness: 50, 
      damping: 15 
    } 
  }
};

export const GameMenu: React.FC<Props> = ({ 
  onSelectGame, 
  onOpenTracker,
  onOpenTherapist,
  onOpenDashboard,
  sectionId,
  setSectionId,
  categoryId,
  setCategoryId,
  ptsdLevel = 'Low'
}) => {
  const { user } = useAuth();
  const [completedGames, setCompletedGames] = useState<Set<string>>(new Set());
  const [showTherapyModules, setShowTherapyModules] = useState(false);
  const [selectedTherapyModuleId, setSelectedTherapyModuleId] = useState<string | null>(null);
  
  const SECTIONS = getSections(ptsdLevel);

  useEffect(() => {
    const fetchProgress = async () => {
      if (user) {
        const history = await progressService.getHistory(user.id);
        const playedGameIds = new Set(history.map(h => h.game_id));
        setCompletedGames(playedGameIds);
      }
    };
    fetchProgress();
  }, [user]);

  const handleBack = () => {
    if (selectedTherapyModuleId) {
        setSelectedTherapyModuleId(null);
    } else if (showTherapyModules) {
        setShowTherapyModules(false);
    } else if (categoryId) {
      setCategoryId(null);
    } else if (sectionId) {
      setSectionId(null);
    }
  };

  // View 5: Therapy Module Detail (Games List)
  if (selectedTherapyModuleId) {
      const module = THERAPY_MODULES.find(m => m.id === selectedTherapyModuleId);
      if (!module) return null;

      return (
        <div className="w-full max-w-3xl mx-auto p-4 md:p-6 min-h-screen">
            <StickyHeader 
                title="Therapy" 
                subtitle={module.title}
                colorClass="text-rose-600"
                bgClass="bg-rose-50"
                onBack={handleBack} 
            />

            <div className="flex flex-col gap-8 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {module.categories.map(catKey => {
                    const catDetails = CATEGORY_DETAILS[catKey];
                    const catGames = ALL_MODULES.filter(g => g.category === catKey);
                    
                    if (catGames.length === 0) return null;

                    return (
                        <div key={catKey} className="flex flex-col gap-3">
                            <div className="flex items-center gap-2 mb-2 px-2">
                                <div className={`p-2 rounded-lg ${catDetails.bg} ${catDetails.color}`}>
                                    {catDetails.icon}
                                </div>
                                <h3 className="text-lg font-bold text-slate-700">{catDetails.title}</h3>
                            </div>
                            
                            {catGames.map((game) => (
                                <GameCard 
                                    key={game.id}
                                    game={game}
                                    isPlayed={completedGames.has(game.id)}
                                    onClick={() => onSelectGame(game.id)}
                                />
                            ))}
                        </div>
                    );
                })}
                
                {module.categories.every(cat => ALL_MODULES.filter(g => g.category === cat).length === 0) && (
                    <div className="text-center text-slate-400 py-10">
                        No modules available for this therapy yet.
                    </div>
                )}
            </div>
        </div>
      );
  }

  // View 4: Therapy Modules (New Section)
  if (showTherapyModules) {
      return <TherapyModulesView onBack={handleBack} onSelect={(id) => setSelectedTherapyModuleId(id)} />;
  }

  // View 1: Main Sections (Roadmap View)
  if (!sectionId) {
    return (
      <div className="w-full mx-auto p-4 flex flex-col items-center min-h-screen bg-slate-50/50">
         <div className="text-center mb-10 mt-8 max-w-4xl mx-auto z-10">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-3 tracking-tight">Neuro Journey</h1>
            <p className="text-slate-500 text-lg max-w-lg mx-auto">
                Your personalized path to recovery. 
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    ptsdLevel === 'Extreme' ? 'bg-rose-100 text-rose-600' :
                    ptsdLevel === 'High' ? 'bg-orange-100 text-orange-600' :
                    ptsdLevel === 'Medium' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-emerald-100 text-emerald-600'
                }`}>
                    {ptsdLevel} Intensity
                </span>
            </p>
         </div>
         
         <div className="mb-12 z-10 flex flex-wrap justify-center gap-4">
            <button 
                onClick={onOpenTracker}
                className="flex items-center gap-2 px-6 py-2 bg-white border border-slate-200 text-slate-700 rounded-full shadow-sm hover:shadow-md transition-all font-bold text-xs uppercase tracking-wide transform hover:scale-105 active:scale-95"
            >
                <BarChart2 size={16} className="text-indigo-500" /> View Profile
            </button>
            <button 
                onClick={onOpenDashboard}
                className="flex items-center gap-2 px-6 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-full shadow-sm hover:shadow-md transition-all font-bold text-xs uppercase tracking-wide transform hover:scale-105 active:scale-95"
            >
                <Activity size={16} className="text-blue-500" /> Clinical Dashboard
            </button>
            <button 
                onClick={onOpenTherapist}
                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 border border-indigo-600 text-white rounded-full shadow-md hover:shadow-lg hover:bg-indigo-700 transition-all font-bold text-xs uppercase tracking-wide transform hover:scale-105 active:scale-95"
            >
                <Bot size={16} className="text-white" /> AI Therapist
            </button>
            <button 
                onClick={() => setShowTherapyModules(true)}
                className="flex items-center gap-2 px-6 py-2 bg-rose-500 border border-rose-500 text-white rounded-full shadow-md hover:shadow-lg hover:bg-rose-600 transition-all font-bold text-xs uppercase tracking-wide transform hover:scale-105 active:scale-95"
            >
                <BookOpen size={16} className="text-white" /> Therapy Modules
            </button>
         </div>

         <div className="w-full max-w-2xl mx-auto relative z-10 pb-20 px-4">
             {/* Main Animated List Container */}
             <motion.div 
               variants={containerVariants}
               initial="hidden"
               animate="show"
               className="relative"
             >
                 {SECTIONS.map((section, index) => (
                     <SectionRoadmapCard 
                        key={section.id} 
                        section={section} 
                        onClick={() => setSectionId(section.id)} 
                        index={index}
                        isLast={index === SECTIONS.length - 1}
                     />
                 ))}
             </motion.div>
         </div>
      </div>
    );
  }

  const currentSection = SECTIONS.find(s => s.id === sectionId);
  if (!currentSection) return null;

  // View 2: Sub-Main Sections (Categories) - GRID LAYOUT
  if (!categoryId) {
      return (
        <div className="w-full max-w-5xl mx-auto p-4 md:p-6 min-h-screen">
            <StickyHeader 
                title={currentSection.title} 
                subtitle={currentSection.subtitle}
                colorClass={currentSection.textColor}
                bgClass={currentSection.lightColor}
                onBack={handleBack} 
            />

            {/* Sub-Section Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {currentSection.categories.map((catKey) => {
                    const details = CATEGORY_DETAILS[catKey];
                    const gamesInCat = ALL_MODULES.filter(m => m.category === catKey);
                    const completedCount = gamesInCat.filter(g => completedGames.has(g.id)).length;
                    const isComplete = completedCount === gamesInCat.length && gamesInCat.length > 0;
                    const isStarted = completedCount > 0;

                    return (
                        <CategoryCard 
                            key={catKey}
                            details={details}
                            isComplete={isComplete}
                            isStarted={isStarted}
                            gameCount={gamesInCat.length}
                            onClick={() => setCategoryId(catKey)}
                        />
                    );
                })}
            </div>
        </div>
      );
  }

  // View 3: Games List - VERTICAL LIST LAYOUT
  const currentCategoryDetails = CATEGORY_DETAILS[categoryId];
  const games = ALL_MODULES
        .filter(m => m.category === categoryId)
        .sort((a, b) => a.levelIndex - b.levelIndex);

  return (
    <div className="w-full max-w-3xl mx-auto p-4 md:p-6 min-h-screen">
        <StickyHeader 
            title={currentSection.subtitle} 
            subtitle={currentCategoryDetails?.title}
            colorClass={currentCategoryDetails?.color}
            bgClass={currentCategoryDetails?.bg}
            onBack={handleBack} 
        />

        <div className="flex flex-col gap-3 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {games.map((game) => (
                <GameCard 
                    key={game.id}
                    game={game}
                    isPlayed={completedGames.has(game.id)}
                    onClick={() => onSelectGame(game.id)}
                />
            ))}
        </div>
    </div>
  );
};

// --- THERAPY MODULES COMPONENT ---

const THERAPY_MODULES = [
    { 
        id: 'cbt', 
        title: 'CBT', 
        subtitle: 'Cognitive Behavioral Therapy', 
        desc: 'Reframe negative thought patterns into positive ones.', 
        icon: <Brain size={40} className="text-white" />, 
        gradient: 'from-blue-500 to-cyan-400',
        shadow: 'shadow-blue-200',
        delay: 0.1,
        categories: ['exercise', 'game', 'creativity']
    },
    { 
        id: 'emdr', 
        title: 'EMDR', 
        subtitle: 'Eye Movement Desensitization', 
        desc: 'Process traumatic memories through bilateral stimulation.', 
        icon: <Eye size={40} className="text-white" />, 
        gradient: 'from-purple-500 to-fuchsia-400',
        shadow: 'shadow-purple-200',
        delay: 0.2,
        categories: ['game', 'music', 'focus']
    },
    { 
        id: 'dbt', 
        title: 'DBT', 
        subtitle: 'Dialectical Behavior Therapy', 
        desc: 'Master emotional regulation and distress tolerance.', 
        icon: <Activity size={40} className="text-white" />, 
        gradient: 'from-rose-500 to-orange-400',
        shadow: 'shadow-rose-200',
        delay: 0.3,
        categories: ['emotion', 'music', 'environment']
    },
    { 
        id: 'mbsr', 
        title: 'MBSR', 
        subtitle: 'Mindfulness-Based Stress Reduction', 
        desc: 'Reduce stress through present-moment awareness.', 
        icon: <Wind size={40} className="text-white" />, 
        gradient: 'from-emerald-500 to-teal-400',
        shadow: 'shadow-emerald-200',
        delay: 0.4,
        categories: ['visual-animation', 'game', 'environment']
    }
];

const TherapyModulesView = ({ onBack, onSelect }: { onBack: () => void, onSelect: (id: string) => void }) => {
    return (
        <div className="w-full max-w-5xl mx-auto p-4 md:p-6 min-h-screen">
            <StickyHeader 
                title="Modules" 
                subtitle="Therapy Modules"
                colorClass="text-rose-600"
                bgClass="bg-rose-50"
                onBack={onBack} 
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
                {THERAPY_MODULES.map((module) => (
                    <motion.div
                        key={module.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: module.delay, duration: 0.5 }}
                        whileHover={{ scale: 1.02, rotate: 1 }}
                        onClick={() => onSelect(module.id)}
                        className={`relative overflow-hidden rounded-3xl bg-white border border-slate-100 shadow-xl ${module.shadow} group cursor-pointer`}
                    >
                        {/* Premium Badge */}
                        <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-200 to-yellow-400 text-amber-900 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full shadow-sm flex items-center gap-1 z-20">
                            <Star size={10} className="fill-amber-900" /> Premium
                        </div>

                        {/* Background Gradient Blob */}
                        <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${module.gradient} opacity-10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3 group-hover:opacity-20 transition-opacity duration-500`} />
                        
                        <div className="p-8 relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <div className={`p-4 rounded-2xl bg-gradient-to-br ${module.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                    {module.icon}
                                </div>
                                <div className="bg-slate-50 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-slate-400 border border-slate-100">
                                    Module
                                </div>
                            </div>
                            
                            <h2 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">{module.title}</h2>
                            <h3 className="text-lg font-bold text-slate-600 mb-4">{module.subtitle}</h3>
                            <p className="text-slate-500 leading-relaxed mb-8">{module.desc}</p>
                            
                            <button className={`w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r ${module.gradient} shadow-md hover:shadow-lg transform active:scale-95 transition-all flex items-center justify-center gap-2`}>
                                <PlayCircle size={20} />
                                Start Session
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

// --- SUB-COMPONENTS ---

interface SectionRoadmapCardProps {
    section: Section;
    onClick: () => void;
    index: number;
    isLast: boolean;
}

const SectionRoadmapCard: React.FC<SectionRoadmapCardProps> = ({ section, onClick, index, isLast }) => {
    return (
        <motion.div 
            variants={cardVariants}
            className="relative pl-24 md:pl-32 py-2 group cursor-pointer"
            onClick={onClick}
        >
            {/* Connecting Line - Behind everything */}
            {!isLast && (
                <div className="absolute left-[2.5rem] md:left-[3.5rem] top-16 bottom-[-2.5rem] w-1 bg-slate-100 group-hover:bg-indigo-100 transition-colors duration-500 -z-10" />
            )}
            
            {/* Number/Icon Node */}
            <div
                className={`absolute left-4 md:left-8 top-0 w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-white shadow-lg z-20 flex items-center justify-center text-white ${section.color} transition-transform group-hover:scale-110 group-hover:rotate-6 duration-300`}
            >
                {section.icon}
                {/* Level Badge */}
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-white border-2 border-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 shadow-sm">
                    {index + 1}
                </div>
            </div>

            {/* Card Content */}
            <div
                className={`bg-white p-6 rounded-3xl border-2 shadow-sm hover:shadow-xl transition-all duration-300 relative ${section.borderColor} mb-8 z-10 group-hover:translate-x-2`}
            >
                 {/* Arrow Pointer */}
                 <div className={`absolute top-6 -left-2.5 w-5 h-5 bg-white border-l-2 border-b-2 transform rotate-45 ${section.borderColor}`} />
                 
                 <div className="flex justify-between items-center">
                    <div>
                        <span className={`text-xs font-bold uppercase tracking-wider ${section.textColor} mb-1 block`}>
                            {section.title}
                        </span>
                        <h3 className="text-xl font-black text-slate-800 mb-1">{section.subtitle}</h3>
                        <p className="text-sm text-slate-500 font-medium line-clamp-1 md:line-clamp-none">{section.desc}</p>
                    </div>
                    <div className={`hidden md:flex p-3 rounded-full ${section.lightColor} ${section.textColor} group-hover:bg-indigo-500 group-hover:text-white transition-colors`}>
                        <ChevronRight size={20} />
                    </div>
                 </div>
            </div>
        </motion.div>
    );
};

const StickyHeader = ({ title, subtitle, colorClass, bgClass, onBack }: { title: string, subtitle?: string, colorClass?: string, bgClass?: string, onBack: () => void }) => (
    <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-lg py-4 border-b border-slate-100 mb-8 flex items-center gap-4 rounded-b-3xl shadow-sm">
        <button 
          onClick={onBack}
          className="p-3 ml-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-all hover:scale-105 text-slate-600 group"
        >
          <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${bgClass || 'bg-slate-100'} ${colorClass || 'text-slate-600'}`}>
                {title}
            </span>
          </div>
          {subtitle && <h2 className="text-xl md:text-2xl font-bold text-slate-800">{subtitle}</h2>}
        </div>
    </div>
);

// Category Card (Grid Style)
const CategoryCard = ({ details, isComplete, isStarted, gameCount, onClick }: any) => {
    return (
        <motion.button
            onClick={onClick}
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.98 }}
            className={`
                flex flex-col items-start p-4 rounded-2xl border-2 text-left shadow-sm hover:shadow-xl transition-all h-full bg-white relative overflow-hidden group w-full
                ${details.border}
                ${isComplete ? 'bg-emerald-50/20 border-emerald-100' : ''}
            `}
        >
            <div className="flex w-full justify-between items-start mb-3">
                <div className={`p-3 rounded-xl ${details.bg} ${details.color} group-hover:scale-110 transition-transform`}>
                    {details.icon}
                </div>
                {isComplete ? (
                    <div className="bg-emerald-100 text-emerald-600 p-1.5 rounded-full"><CheckCircle size={16} /></div>
                ) : isStarted ? (
                    <div className="bg-indigo-50 text-indigo-500 px-2 py-0.5 rounded-full text-[10px] font-bold">Progress</div>
                ) : null}
            </div>
            
            <h3 className="text-base font-bold text-slate-800 mb-1 leading-tight">{details.title}</h3>
            <p className="text-xs text-slate-500 mb-4 flex-1 leading-relaxed line-clamp-2">{details.desc}</p>
            
            <div className="w-full flex items-center justify-between mt-auto pt-3 border-t border-slate-50">
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Layers size={12} /> {gameCount}
                 </span>
            </div>
        </motion.button>
    )
}

// Game List Item (Vertical List Style)
const GameCard = ({ game, isPlayed, onClick }: any) => {
    return (
        <motion.button
            onClick={onClick}
            whileHover={{ x: 5 }}
            whileTap={{ scale: 0.99 }}
            className={`
                relative flex items-center gap-4 p-4 rounded-2xl border-2 text-left shadow-sm hover:shadow-md transition-all bg-white w-full group
                ${isPlayed ? 'border-emerald-100 bg-emerald-50/20' : 'border-slate-100'}
            `}
        >
            <div className={`p-3 rounded-xl ${game.color} shrink-0 group-hover:rotate-6 transition-transform`}>
                {isPlayed ? <CheckCircle size={24} className="text-emerald-600" /> : game.icon}
            </div>
            
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Level {game.levelIndex}</span>
                    {isPlayed && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">Completed</span>}
                </div>
                <h4 className="font-bold text-slate-800 truncate text-lg">{game.title}</h4>
                <p className="text-xs text-slate-500 truncate">{game.description}</p>
            </div>

            <div className="text-slate-300 group-hover:text-indigo-500 transition-colors bg-slate-50 p-2 rounded-full group-hover:bg-indigo-50">
                <PlayCircle size={24} />
            </div>
        </motion.button>
    )
}
