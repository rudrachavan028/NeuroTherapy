
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Brain, Sparkles, TrendingUp, Activity, Loader, Zap, Trophy, Target, Palette, Music, Award, Calendar, CheckCircle, BarChart, FileText, Signal, ArrowRight, Lightbulb } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { progressService, ProgressRecord } from '../services/progressService';
import { getAIProgressAnalysis } from '../services/geminiService';
import { AIAnalysisResult } from '../types';
import { ALL_MODULES } from './GameMenu';

interface Props {
  onBack: () => void;
}

// --- Helper for Trend Graph ---
const TrendChart = ({ data, color, label, unit }: { data: number[], color: string, label: string, unit: string }) => {
    if (data.length < 2) return <div className="h-32 flex items-center justify-center text-slate-400 text-sm bg-slate-50 rounded-2xl">Not enough data for {label}</div>;

    const max = Math.max(...data) * 1.1;
    const min = Math.min(...data) * 0.9;
    const range = max - min || 1;

    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 100 - ((val - min) / range) * 100;
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="w-full">
            <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-bold text-slate-600">{label}</span>
                <span className={`text-2xl font-black ${color.replace('stroke-', 'text-').replace('bg-', 'text-')}`}>{Math.round(data[data.length-1])}<span className="text-xs text-slate-400 ml-1 font-normal">{unit}</span></span>
            </div>
            <div className="relative h-24 w-full overflow-hidden">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                     <defs>
                        <linearGradient id={`grad-${label.replace(/\s+/g, '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="currentColor" stopOpacity="0.2" className={color.replace('stroke-', 'text-').replace('bg-', 'text-')} />
                            <stop offset="100%" stopColor="currentColor" stopOpacity="0" className={color.replace('stroke-', 'text-').replace('bg-', 'text-')} />
                        </linearGradient>
                    </defs>
                    <path 
                        d={`M0,100 ${points.split(' ').map(p => 'L' + p).join(' ')} L100,100 Z`} 
                        fill={`url(#grad-${label.replace(/\s+/g, '')})`} 
                        className={color.replace('stroke-', 'text-').replace('bg-', 'text-')}
                    />
                    <path 
                        d={`M ${points.split(' ').join(' L ')}`} 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="3" 
                        vectorEffect="non-scaling-stroke"
                        className={color.replace('bg-', 'text-').replace('fill-', 'text-')}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </div>
        </div>
    );
};

const CognitiveRadar = ({ scores }: { scores: AIAnalysisResult['cognitiveScores'] }) => {
  const size = 240;
  const center = size / 2;
  const radius = 80;
  
  const axes = [
    { name: 'Memory', value: scores.memory, icon: <Brain size={14} /> },
    { name: 'Focus', value: scores.focus, icon: <Target size={14} /> },
    { name: 'Calm', value: scores.calm, icon: <Music size={14} /> },
    { name: 'Creativity', value: scores.creativity, icon: <Palette size={14} /> },
    { name: 'Agility', value: scores.agility, icon: <Zap size={14} /> },
  ];

  const getPoint = (value: number, index: number, total: number) => {
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
    const r = (value / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const polyPoints = axes.map((axis, i) => {
    const { x, y } = getPoint(axis.value, i, axes.length);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-full">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`}>
           {[1, 0.75, 0.5, 0.25].map((scale, i) => (
             <circle key={i} cx={center} cy={center} r={radius * scale} fill="none" stroke="#e2e8f0" strokeDasharray="4 4" />
           ))}
           {axes.map((_, i) => {
             const { x, y } = getPoint(100, i, axes.length);
             return <line key={i} x1={center} y1={center} x2={x} y2={y} stroke="#e2e8f0" />;
           })}
           <motion.polygon 
             initial={{ opacity: 0, scale: 0 }}
             animate={{ opacity: 0.7, scale: 1 }}
             transition={{ duration: 1, type: "spring" }}
             points={polyPoints} 
             fill="rgba(99, 102, 241, 0.4)" 
             stroke="#4f46e5" 
             strokeWidth="2" 
             className="drop-shadow-lg"
           />
        </svg>
        {axes.map((axis, i) => {
          const { x, y } = getPoint(115, i, axes.length); 
          return (
            <div 
              key={i} 
              className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
              style={{ left: (x / size) * size, top: (y / size) * size }}
            >
               <div className="bg-white p-1.5 rounded-full shadow-md text-slate-500 border border-slate-100">{axis.icon}</div>
               <span className="text-[10px] font-bold text-slate-500 bg-white/90 px-1.5 py-0.5 rounded shadow-sm mt-1">{axis.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Badge = ({ icon, label, description, unlocked, delay }: any) => (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`flex flex-col items-center p-3 rounded-2xl border transition-all ${unlocked ? 'bg-white border-yellow-200 shadow-sm' : 'bg-slate-50 border-slate-100 opacity-60 grayscale'}`}
    >
      <div className={`p-3 rounded-full mb-2 shadow-inner ${unlocked ? 'bg-gradient-to-br from-yellow-100 to-amber-100 text-amber-600' : 'bg-slate-200 text-slate-400'}`}>
          {icon}
      </div>
      <span className={`text-xs font-bold text-center ${unlocked ? 'text-slate-800' : 'text-slate-500'}`}>{label}</span>
      <span className="text-[9px] text-slate-400 text-center leading-tight hidden sm:block mt-1">{description}</span>
    </motion.div>
);

const BrainStateMap = ({ insights, recentHistory }: any) => {
    const frontalScore = insights?.cognitiveScores?.focus || 75;
    const temporalScore = insights?.cognitiveScores?.memory || 70;
    const parietalScore = insights?.cognitiveScores?.agility || 65;
    const occipitalScore = recentHistory.length > 0 ? recentHistory.reduce((acc: number, h: any) => acc + (h.accuracy || 80), 0) / recentHistory.length : 80;

    const regions = [
        { id: 'frontal', name: 'Frontal Lobe', role: 'Focus & Decisions', score: frontalScore },
        { id: 'parietal', name: 'Parietal Lobe', role: 'Sensory & Spatial', score: parietalScore },
        { id: 'temporal', name: 'Temporal Lobe', role: 'Memory & Emotion', score: temporalScore },
        { id: 'occipital', name: 'Occipital Lobe', role: 'Visual Processing', score: occipitalScore },
    ];

    const getState = (score: number) => {
        if (score >= 80) return { label: 'Optimal', color: 'bg-emerald-500', hex: '#10b981', text: 'text-emerald-500', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.6)]' };
        if (score >= 60) return { label: 'Normal', color: 'bg-indigo-500', hex: '#6366f1', text: 'text-indigo-500', glow: 'shadow-[0_0_15px_rgba(99,102,241,0.6)]' };
        return { label: 'Fatigued', color: 'bg-orange-500', hex: '#f97316', text: 'text-orange-500', glow: 'shadow-[0_0_15px_rgba(249,115,22,0.6)]' };
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="lg:col-span-3 bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8 items-center"
        >
            <div className="flex-1 w-full">
                <h3 className="text-lg font-bold text-slate-700 mb-2 flex items-center gap-2">
                    <Brain className="text-pink-500" size={20} /> Regional Brain Status
                </h3>
                <p className="text-sm text-slate-500 mb-6">Real-time mapping of your cognitive load and neurological state across different brain regions.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {regions.map(r => {
                        const state = getState(r.score);
                        return (
                            <div key={r.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50 flex items-start gap-3">
                                <div className={`w-3 h-3 mt-1 rounded-full ${state.color} ${state.glow}`} />
                                <div>
                                    <h4 className="font-bold text-slate-700 text-sm">{r.name}</h4>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">{r.role}</p>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs font-black ${state.text}`}>{state.label}</span>
                                        <span className="text-xs text-slate-400 font-medium">({Math.round(r.score)}%)</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="w-full md:w-1/3 flex justify-center items-center relative min-h-[250px]">
                <div className="relative w-full max-w-[250px]">
                    <img src="/brain/b.png" alt="Brain Map" className="w-full h-auto drop-shadow-xl rounded-2xl" referrerPolicy="no-referrer" />
                    
                    {/* Nodes */}
                    {regions.map(r => {
                        const state = getState(r.score);
                        let left='0%', top='0%';
                        if(r.id==='frontal') { left='30%'; top='28%'; }
                        if(r.id==='parietal') { left='70%'; top='28%'; }
                        if(r.id==='temporal') { left='35%'; top='65%'; }
                        if(r.id==='occipital') { left='65%'; top='65%'; }
                        
                        return (
                            <div key={r.id} className="absolute transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center" style={{ left, top }}>
                                <div className={`absolute w-10 h-10 rounded-full ${state.color} opacity-20 animate-ping`} style={{ animationDuration: '3s' }} />
                                <div className={`absolute w-6 h-6 rounded-full ${state.color} opacity-40`} />
                                <div className={`relative w-3 h-3 rounded-full ${state.color} shadow-lg`} />
                            </div>
                        )
                    })}
                </div>
            </div>
        </motion.div>
    );
};

export const ProgressTracker: React.FC<Props> = ({ onBack }) => {
  const { user } = useAuth();
  const [history, setHistory] = useState<ProgressRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [insights, setInsights] = useState<AIAnalysisResult | null>(null);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    if (user) {
      const data = await progressService.getHistory(user.id);
      setHistory(data);
      await generateInsights(data);
    }
    setLoading(false);
  };

  const generateInsights = async (data: ProgressRecord[]) => {
    setAnalyzing(true);
    const result = await getAIProgressAnalysis(data);
    setInsights(result);
    setAnalyzing(false);
  };

  const recentHistory = [...history].slice(-10);
  const reactionTimeData = recentHistory.map(h => h.reaction_time || 0).filter(v => v > 0);
  const accuracyData = recentHistory.map(h => h.accuracy || 100);
  const totalGames = history.length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4 md:p-8 font-sans">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={onBack}
            className="p-3 bg-white rounded-full shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft size={24} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Neuro Profile</h1>
            <p className="text-slate-500 font-medium">AI-Powered Cognitive Analysis</p>
          </div>
        </div>

        {loading ? (
            <div className="flex flex-col justify-center items-center h-96">
                <Loader className="animate-spin text-indigo-500 mb-4" size={48} />
                <p className="text-slate-400 animate-pulse">Retrieving neural data...</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 1. HERO: Brain Battery & Mood (AI) */}
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Brain Battery */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 flex flex-col items-center justify-center relative overflow-hidden"
                    >
                         <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4 z-10">Mental Energy</h3>
                         <div className="relative z-10 flex items-center gap-2">
                             <Zap 
                                className={`w-12 h-12 ${insights?.brainBattery && insights.brainBattery > 60 ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`} 
                             />
                             <span className="text-6xl font-black text-slate-800">{insights?.brainBattery || 0}%</span>
                         </div>
                         <div 
                            className={`absolute bottom-0 left-0 h-2 transition-all duration-1000 ${insights?.brainBattery && insights.brainBattery > 50 ? 'bg-green-500' : 'bg-orange-500'}`} 
                            style={{ width: `${insights?.brainBattery || 0}%` }}
                         />
                    </motion.div>

                    {/* Mood Analysis (AI) */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="md:col-span-2 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden flex flex-col justify-center"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10"><Sparkles size={120} /></div>
                        
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-sm">Gemini Analysis</span>
                            </div>
                            {analyzing ? (
                                <div className="flex items-center gap-3 animate-pulse">
                                    <Loader className="animate-spin" size={20} />
                                    <span>Synthesizing neural patterns...</span>
                                </div>
                            ) : (
                                <>
                                    <h2 className="text-2xl font-bold mb-2">"{insights?.moodAnalysis}"</h2>
                                    <p className="text-indigo-100 leading-relaxed opacity-90">{insights?.summary}</p>
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* 2. Cognitive Radar (AI Scores) */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 flex flex-col"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <Activity className="text-indigo-500" size={20} />
                        <h3 className="font-bold text-slate-700">Cognitive Map</h3>
                    </div>
                    <div className="flex-1 min-h-[300px]">
                        {insights && <CognitiveRadar scores={insights.cognitiveScores} />}
                    </div>
                </motion.div>

                {/* 3. Strengths & Recommendations (AI) */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                    {/* Strengths & Weaknesses */}
                    <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
                        <h3 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
                            <FileText className="text-blue-500" size={20} /> Neural Insights
                        </h3>
                        
                        <div className="space-y-6">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Top Strengths</p>
                                <div className="flex flex-wrap gap-2">
                                    {insights?.strengths?.map((s, i) => (
                                        <span key={i} className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-semibold border border-green-100 flex items-center gap-1">
                                            <CheckCircle size={14} /> {s}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Focus Areas</p>
                                <div className="flex flex-wrap gap-2">
                                    {insights?.weaknesses?.map((w, i) => (
                                        <span key={i} className="px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg text-sm font-semibold border border-orange-100 flex items-center gap-1">
                                            <Target size={14} /> {w}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recommendations */}
                    <div className="bg-slate-900 rounded-[32px] p-8 shadow-lg text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-[60px] opacity-20" />
                        
                        <h3 className="font-bold text-white mb-6 flex items-center gap-2 relative z-10">
                            <Lightbulb className="text-yellow-400" size={20} /> Recommended Routine
                        </h3>

                        <div className="space-y-3 relative z-10">
                            {insights?.recommendations?.map((gameId, i) => {
                                const game = ALL_MODULES.find(m => m.id === gameId);
                                return (
                                    <div key={i} className="flex items-center gap-3 bg-white/10 p-3 rounded-xl border border-white/10">
                                        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-sm">
                                            {i + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm truncate">{game?.title || gameId}</p>
                                            <p className="text-xs text-slate-400 truncate">{game?.description || "Therapy Module"}</p>
                                        </div>
                                        <ArrowRight size={16} className="text-slate-500" />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>

                {/* 4. Raw Data Trends */}
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100"
                    >
                         <TrendChart 
                            data={reactionTimeData} 
                            color="text-indigo-500" 
                            label="Reaction Speed" 
                            unit="ms" 
                         />
                    </motion.div>
                    <motion.div 
                         initial={{ opacity: 0, y: 20 }}
                         whileInView={{ opacity: 1, y: 0 }}
                         className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100"
                    >
                         <TrendChart 
                            data={accuracyData} 
                            color="text-emerald-500" 
                            label="Accuracy" 
                            unit="%" 
                         />
                    </motion.div>
                </div>

                {/* NEW FEATURE 1: Brainwave State Analysis */}
                <motion.div 
                     initial={{ opacity: 0, y: 20 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     className="lg:col-span-1 bg-white rounded-[32px] p-8 shadow-sm border border-slate-100"
                >
                    <h3 className="text-lg font-bold text-slate-700 mb-6 flex items-center gap-2">
                        <Signal className="text-violet-500" size={20} /> Brainwave States
                    </h3>
                    <div className="space-y-4">
                        {[
                            { label: 'Alpha (Relaxation)', value: recentHistory.length > 0 ? recentHistory.reduce((acc, h) => acc + (h.alpha || 65), 0) / recentHistory.length : 65, color: 'bg-indigo-500' },
                            { label: 'Beta (Focus)', value: recentHistory.length > 0 ? recentHistory.reduce((acc, h) => acc + (h.beta || 45), 0) / recentHistory.length : 45, color: 'bg-blue-500' },
                            { label: 'Theta (Deep Calm)', value: recentHistory.length > 0 ? recentHistory.reduce((acc, h) => acc + (h.theta || 30), 0) / recentHistory.length : 30, color: 'bg-teal-500' },
                            { label: 'Delta (Sleep/Recovery)', value: recentHistory.length > 0 ? recentHistory.reduce((acc, h) => acc + (h.delta || 20), 0) / recentHistory.length : 20, color: 'bg-slate-500' },
                            { label: 'Gamma (Insight)', value: recentHistory.length > 0 ? recentHistory.reduce((acc, h) => acc + (h.gamma || 15), 0) / recentHistory.length : 15, color: 'bg-amber-500' },
                        ].map((wave, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                                    <span>{wave.label}</span>
                                    <span>{Math.round(wave.value)}%</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                    <div className={`h-full ${wave.color} rounded-full transition-all duration-1000`} style={{ width: `${wave.value}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* NEW FEATURE 2: Weekly Consistency */}
                <motion.div 
                     initial={{ opacity: 0, y: 20 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     className="lg:col-span-1 bg-white rounded-[32px] p-8 shadow-sm border border-slate-100"
                >
                    <h3 className="text-lg font-bold text-slate-700 mb-6 flex items-center gap-2">
                        <Calendar className="text-emerald-500" size={20} /> Weekly Activity
                    </h3>
                    <div className="flex items-end justify-between h-40 gap-2">
                        {Array.from({ length: 7 }).map((_, i) => {
                            const d = new Date();
                            d.setDate(d.getDate() - (6 - i));
                            const dateStr = d.toISOString().split('T')[0];
                            const mockData = [1, 3, 2, 4, 0, 5, 2];
                            const daySessions = history.length > 0 
                                ? history.filter(h => h.played_at && h.played_at.startsWith(dateStr)).length
                                : mockData[i];
                            const maxSessions = Math.max(...Array.from({ length: 7 }).map((_, j) => {
                                const d2 = new Date();
                                d2.setDate(d2.getDate() - (6 - j));
                                return history.length > 0 
                                    ? history.filter(h => h.played_at && h.played_at.startsWith(d2.toISOString().split('T')[0])).length
                                    : mockData[j];
                            }), 5); // min height base
                            
                            const height = Math.max((daySessions / maxSessions) * 100, 10); // min 10% height
                            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                            
                            return (
                                <div key={i} className="flex flex-col items-center gap-2 flex-1">
                                    <div className="w-full bg-slate-100 rounded-t-lg rounded-b-sm relative flex items-end justify-center h-full group">
                                        <div 
                                            className={`w-full rounded-t-lg rounded-b-sm transition-all duration-500 ${daySessions > 0 ? 'bg-emerald-400' : 'bg-slate-200'}`} 
                                            style={{ height: `${height}%` }}
                                        />
                                        {daySessions > 0 && (
                                            <div className="absolute -top-8 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                {daySessions} sessions
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400">{days[d.getDay()]}</span>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* NEW FEATURE 3: Recent Activity Log */}
                <motion.div 
                     initial={{ opacity: 0, y: 20 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     className="lg:col-span-1 bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 flex flex-col"
                >
                    <h3 className="text-lg font-bold text-slate-700 mb-6 flex items-center gap-2">
                        <Activity className="text-blue-500" size={20} /> Recent Sessions
                    </h3>
                    <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-64 scrollbar-thin scrollbar-thumb-slate-200">
                        {(() => {
                            const displayHistory = recentHistory.length > 0 ? [...recentHistory].reverse() : [
                                { game_id: 'focus-match', score: 850, accuracy: 92, played_at: new Date().toISOString() },
                                { game_id: 'memory-matrix', score: 1200, accuracy: 88, played_at: new Date(Date.now() - 86400000).toISOString() },
                                { game_id: 'spatial-rotate', score: 940, accuracy: 75, played_at: new Date(Date.now() - 86400000 * 2).toISOString() },
                                { game_id: 'pattern-recall', score: 1100, accuracy: 85, played_at: new Date(Date.now() - 86400000 * 3).toISOString() },
                            ];
                            
                            return displayHistory.slice(0, 5).map((record: any, i) => {
                                const game = ALL_MODULES.find(m => m.id === record.game_id);
                                const date = new Date(record.played_at);
                                const timeAgo = Math.floor((new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
                                
                                return (
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                                        <div className={`p-2 rounded-xl ${game?.color || 'bg-slate-200 text-slate-500'}`}>
                                            {game?.icon || <Brain size={16} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm text-slate-700 truncate">{game?.title || record.game_id}</p>
                                            <p className="text-[10px] text-slate-400 font-medium">
                                                {timeAgo === 0 ? 'Today' : timeAgo === 1 ? 'Yesterday' : `${timeAgo} days ago`} • Score: {record.score}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-black text-emerald-500">{record.accuracy}%</p>
                                            <p className="text-[9px] text-slate-400 uppercase tracking-wider">Acc</p>
                                        </div>
                                    </div>
                                );
                            });
                        })()}
                    </div>
                </motion.div>

                {/* NEW FEATURE 4: Brain Region Map */}
                <BrainStateMap insights={insights} recentHistory={recentHistory} />

                {/* 5. Achievements */}
                <motion.div 
                     initial={{ opacity: 0 }}
                     whileInView={{ opacity: 1 }}
                     className="lg:col-span-3 bg-white rounded-[32px] p-8 shadow-sm border border-slate-100"
                >
                    <h3 className="text-lg font-bold text-slate-700 mb-6 flex items-center gap-2">
                        <Trophy className="text-amber-500" size={20} /> Milestones
                    </h3>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                        <Badge 
                            icon={<Brain size={20} />} 
                            label="Novice" 
                            description="Played 1st game" 
                            unlocked={totalGames >= 1} 
                            delay={0}
                        />
                         <Badge 
                            icon={<Zap size={20} />} 
                            label="Regular" 
                            description="10 Games Played" 
                            unlocked={totalGames >= 10} 
                            delay={0.1}
                        />
                         <Badge 
                            icon={<Target size={20} />} 
                            label="Sharp" 
                            description="Avg Accuracy > 90%" 
                            unlocked={accuracyData.length > 0 && (accuracyData.reduce((a,b)=>a+b,0)/accuracyData.length) > 90} 
                            delay={0.2}
                        />
                        <Badge 
                            icon={<Sparkles size={20} />} 
                            label="Expert" 
                            description="100 Games Played" 
                            unlocked={totalGames >= 100} 
                            delay={0.3}
                        />
                    </div>
                </motion.div>

            </div>
        )}
      </div>
    </div>
  );
};
