import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Brain, Activity, Target, Wind, TrendingUp, Cpu, HeartPulse, Glasses, Loader, Zap, Shield, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { progressService, ProgressRecord } from '../services/progressService';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, Legend, Cell
} from 'recharts';

interface Props {
  onBack: () => void;
}

export const BrainHealthDashboard: React.FC<Props> = ({ onBack }) => {
  const { user } = useAuth();
  const [history, setHistory] = useState<ProgressRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (user) {
        const data = await progressService.getHistory(user.id);
        setHistory(data);
      }
      setLoading(false);
    };
    loadData();
  }, [user]);

  const hasEnoughData = Array.isArray(history) && history.length >= 2;

  // --- Calculate Indicators (0-100 scale for better granularity) ---
  const calculateMetric = (metric: string) => {
    if (!hasEnoughData) return 50; // Default mock
    const recent = history.slice(-5).filter(h => h != null);
    if (recent.length === 0) return 50;
    
    if (metric === 'stress') {
      // Stress resilience: higher stability and lower beta means better resilience
      const avgStability = recent.reduce((sum, h) => sum + (h?.stability || 50), 0) / recent.length;
      const avgBeta = recent.reduce((sum, h) => sum + (h?.beta || 50), 0) / recent.length;
      return Math.round((avgStability + (100 - avgBeta)) / 2);
    }
    if (metric === 'anxiety') {
      // Anxiety control: higher alpha and theta means better control
      const avgAlpha = recent.reduce((sum, h) => sum + (h?.alpha || 50), 0) / recent.length;
      const avgTheta = recent.reduce((sum, h) => sum + (h?.theta || 50), 0) / recent.length;
      return Math.round((avgAlpha + avgTheta) / 2);
    }
    if (metric === 'focus') {
      // Focus: higher accuracy, lower reaction time (capped at 2000ms for 0 score)
      const avgAcc = recent.reduce((sum, h) => sum + (h?.accuracy || 50), 0) / recent.length;
      const avgRt = recent.reduce((sum, h) => sum + (h?.reaction_time || 1000), 0) / recent.length;
      const rtScore = Math.max(0, 100 - (avgRt / 20)); // 1000ms -> 50, 500ms -> 75
      return Math.round((avgAcc + rtScore) / 2);
    }
    if (metric === 'relaxation') {
      // Relaxation: higher theta and alpha
      const avgTheta = recent.reduce((sum, h) => sum + (h?.theta || 50), 0) / recent.length;
      const avgAlpha = recent.reduce((sum, h) => sum + (h?.alpha || 50), 0) / recent.length;
      return Math.round((avgTheta * 0.6) + (avgAlpha * 0.4));
    }
    return 50;
  };

  const stressScore = calculateMetric('stress');
  const anxietyScore = calculateMetric('anxiety');
  const focusScore = calculateMetric('focus');
  const relaxationScore = calculateMetric('relaxation');

  // Overall Brain Health Score (0-100)
  const currentScore = Math.round((stressScore + anxietyScore + focusScore + relaxationScore) / 4);
  
  let status = "Improving";
  let statusColor = "text-blue-500";
  if (currentScore >= 80) { status = "Optimal"; statusColor = "text-emerald-500"; }
  else if (currentScore >= 60) { status = "Improving"; statusColor = "text-blue-500"; }
  else if (currentScore >= 40) { status = "Stabilizing"; statusColor = "text-amber-500"; }
  else { status = "Needs Attention"; statusColor = "text-rose-500"; }

  const indicators = [
    { label: "Stress Resilience", value: stressScore, color: "bg-blue-500", icon: <Shield size={18} /> },
    { label: "Anxiety Control", value: anxietyScore, color: "bg-indigo-500", icon: <HeartPulse size={18} /> },
    { label: "Cognitive Focus", value: focusScore, color: "bg-emerald-500", icon: <Target size={18} /> },
    { label: "Relaxation Depth", value: relaxationScore, color: "bg-teal-500", icon: <Wind size={18} /> },
  ];

  // --- Prepare Chart Data ---
  
  // 1. Trend Data (Area Chart)
  let trendData: any[] = [];
  if (hasEnoughData) {
    // Group into up to 15 points
    const numPoints = Math.min(15, history.length);
    const step = Math.max(1, Math.floor(history.length / numPoints));
    
    for (let i = 0; i < numPoints; i++) {
      const h = history[i * step];
      const sessionScore = Math.round(((h?.accuracy || 50) + (h?.stability || 50) + (h?.alpha || 50) + (h?.theta || 50)) / 4);
      trendData.push({
        session: `S${i + 1}`,
        score: sessionScore,
        accuracy: h?.accuracy || 50
      });
    }
    // Ensure last point reflects current state
    if (trendData.length > 0) {
      trendData[trendData.length - 1].score = currentScore;
    }
  } else {
    // Mock data for new users
    trendData = [
      { session: 'S1', score: 45, accuracy: 50 },
      { session: 'S2', score: 48, accuracy: 55 },
      { session: 'S3', score: 52, accuracy: 58 },
      { session: 'S4', score: 55, accuracy: 62 },
      { session: 'S5', score: 60, accuracy: 65 },
      { session: 'S6', score: 62, accuracy: 70 },
      { session: 'S7', score: 68, accuracy: 72 },
      { session: 'S8', score: 70, accuracy: 75 },
      { session: 'S9', score: 72, accuracy: 78 },
      { session: 'S10', score: 75, accuracy: 80 },
    ];
  }

  // 2. Radar Data (Cognitive Profile)
  const radarData = [
    { subject: 'Focus', A: focusScore, fullMark: 100 },
    { subject: 'Calm', A: relaxationScore, fullMark: 100 },
    { subject: 'Resilience', A: stressScore, fullMark: 100 },
    { subject: 'Control', A: anxietyScore, fullMark: 100 },
    { subject: 'Stability', A: hasEnoughData ? Math.round(history[history.length-1]?.stability || 50) : 70, fullMark: 100 },
  ];

  // 3. Brainwave Data (Bar Chart)
  const latestSession = hasEnoughData ? history[history.length - 1] : null;
  const brainwaveData = [
    { name: 'Delta (Deep Sleep)', value: latestSession?.theta ? Math.max(10, latestSession.theta - 20) : 30, fill: '#8b5cf6' },
    { name: 'Theta (Relaxed)', value: latestSession?.theta || 60, fill: '#3b82f6' },
    { name: 'Alpha (Calm)', value: latestSession?.alpha || 75, fill: '#10b981' },
    { name: 'Beta (Alert)', value: latestSession?.beta || 45, fill: '#f59e0b' },
    { name: 'Gamma (Insight)', value: latestSession?.gamma || 25, fill: '#ef4444' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

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
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
              <Brain size={28} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">Neuro Therapy – Digital Brain Health Dashboard</h1>
              <p className="text-slate-500 font-medium">AI-Powered Clinical Monitoring System</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Score Gauge (Col Span 4) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-4 bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 flex flex-col items-center justify-center relative overflow-hidden"
          >
            <div className="absolute top-4 right-4 text-blue-500 opacity-10">
              <Cpu size={120} />
            </div>
            <h3 className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-6 z-10">Overall Brain Health</h3>
            
            <div className="relative w-56 h-56 flex items-center justify-center z-10">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                <motion.circle 
                  cx="50" cy="50" r="45" 
                  fill="none" 
                  stroke={currentScore >= 80 ? '#10b981' : currentScore >= 60 ? '#3b82f6' : currentScore >= 40 ? '#f59e0b' : '#ef4444'} 
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(currentScore / 100) * 283} 283`}
                  initial={{ strokeDasharray: "0 283" }}
                  animate={{ strokeDasharray: `${(currentScore / 100) * 283} 283` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-6xl font-black text-slate-800 tracking-tighter">{currentScore}</span>
                <span className={`text-sm font-bold mt-1 ${statusColor}`}>{status}</span>
              </div>
            </div>

            <div className="mt-8 w-full bg-blue-50 rounded-xl p-4 border border-blue-100 flex items-start gap-3">
              <Sparkles className="text-blue-500 shrink-0 mt-0.5" size={20} />
              <p className="text-sm text-blue-800 font-medium">
                {currentScore >= 80 ? "Excellent cognitive resilience. Maintain your current therapy routine." : 
                 currentScore >= 60 ? "Steady improvement detected in alpha wave stability. Keep up the good work." :
                 "Focus on grounding exercises to improve baseline stability."}
              </p>
            </div>
          </motion.div>

          {/* Indicators & Radar (Col Span 8) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Indicators List */}
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 flex flex-col justify-center">
              <h3 className="text-lg font-bold text-slate-700 mb-6 flex items-center gap-2">
                <Activity className="text-emerald-500" size={20} /> Clinical Metrics
              </h3>
              <div className="flex flex-col gap-5">
                {indicators.map((ind, i) => (
                  <div key={i} className="w-full">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2 text-slate-600 font-semibold text-sm">
                        <div className={`p-1.5 rounded-lg text-white ${ind.color}`}>
                          {ind.icon}
                        </div>
                        {ind.label}
                      </div>
                      <span className="text-sm font-bold text-slate-800">{ind.value} <span className="text-slate-400 font-normal">/ 100</span></span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${ind.value}%` }}
                        transition={{ duration: 1, delay: 0.2 + (i * 0.1) }}
                        className={`h-full rounded-full ${ind.color}`} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Radar Chart */}
            <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 flex flex-col items-center justify-center">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 w-full text-center">Cognitive Profile</h3>
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="User" dataKey="A" stroke="#3b82f6" strokeWidth={2} fill="#3b82f6" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>

          {/* Trend Graph (Col Span 8) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-8 bg-white rounded-[32px] p-8 shadow-sm border border-slate-100"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                <TrendingUp className="text-blue-500" size={20} /> Recovery Trajectory
              </h3>
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                <Glasses size={16} className="text-indigo-500" /> VR & Game Sessions
              </div>
            </div>
            
            <div className="h-72 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="session" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontWeight: 600 }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}/>
                  <Area type="monotone" name="Health Score" dataKey="score" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                  <Area type="monotone" name="Accuracy" dataKey="accuracy" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorAcc)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Brainwave Distribution (Col Span 4) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-4 bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 flex flex-col"
          >
            <h3 className="text-lg font-bold text-slate-700 mb-2 flex items-center gap-2">
              <Zap className="text-amber-500" size={20} /> Brainwave Activity
            </h3>
            <p className="text-xs text-slate-400 font-medium mb-6">Latest Session Analysis</p>
            
            <div className="flex-1 w-full min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={brainwaveData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} width={110} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                    {brainwaveData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};
