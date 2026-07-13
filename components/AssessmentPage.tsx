
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, Activity, Moon, Sun, Brain, HeartPulse, ShieldCheck, AlertTriangle, User, Smile } from 'lucide-react';
import { AssessmentData } from '../types';

interface Props {
  onComplete: (data: AssessmentData) => void;
}

// Questions to map to max score of 80 (20 questions * 4 max score)
const PTSD_QUESTIONS = [
  // Intrusive (5)
  { id: 1, text: "Recurrent unwanted memories of the stressful experience?" },
  { id: 2, text: "Disturbing dreams or nightmares related to the event?" },
  { id: 3, text: "Feeling as if the event were happening again (flashbacks)?" },
  { id: 4, text: "Sudden emotional distress when reminded of the event?" },
  { id: 5, text: "Physical reactions (heart pounding, sweating) when reminded?" },
  
  // Avoidance (5)
  { id: 6, text: "Avoiding memories, thoughts, or feelings related to the event?" },
  { id: 7, text: "Avoiding people, places, or objects that remind you of it?" },
  { id: 8, text: "Trouble remembering key parts of the stressful experience?" },
  { id: 9, text: "Feeling emotionally numb or cut off from others?" },
  { id: 10, text: "Avoiding social situations or crowds?" },

  // Mood & Cognition (5)
  { id: 11, text: "Persistent negative emotional state (fear, horror, anger, guilt)?" },
  { id: 12, text: "Loss of interest in activities you used to enjoy?" },
  { id: 13, text: "Feeling distant or cut off from others?" },
  { id: 14, text: "Persistent negative beliefs about yourself or the world?" },
  { id: 15, text: "Blaming yourself or others for what happened?" },

  // Arousal & Reactivity (5)
  { id: 16, text: "Irritable behavior and angry outbursts?" },
  { id: 17, text: "Reckless or self-destructive behavior?" },
  { id: 18, text: "Hypervigilance (feeling constantly on guard)?" },
  { id: 19, text: "Exaggerated startle response?" },
  { id: 20, text: "Difficulty concentrating or sleeping?" }
];

const SCORING_OPTIONS = [
  { val: 0, label: "Not at all" },
  { val: 1, label: "A little bit" },
  { val: 2, label: "Moderately" },
  { val: 3, label: "Quite a bit" },
  { val: 4, label: "Extremely" }
];

export const AssessmentPage: React.FC<Props> = ({ onComplete }) => {
  const [step, setStep] = useState<'intro' | 'basic' | 'quiz' | 'calculating' | 'result'>('intro');
  const [basicInfo, setBasicInfo] = useState({
    age: '',
    gender: '',
    sleep: 5,
    stress: 5
  });
  
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const handleBasicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('quiz');
  };

  const handleAnswer = (score: number) => {
    const questionId = PTSD_QUESTIONS[currentQuestionIndex].id;
    setAnswers(prev => ({ ...prev, [questionId]: score }));

    if (currentQuestionIndex < PTSD_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(curr => curr + 1);
    } else {
      setStep('calculating');
      setTimeout(() => setStep('result'), 2000); // Fake calculation delay
    }
  };

  const calculateResult = (): AssessmentData => {
    // Explicitly cast to number[] to fix TS error: Operator '<=' cannot be applied to types 'unknown' and 'number'
    const rawScore = (Object.values(answers) as number[]).reduce((a, b) => a + b, 0);
    
    // Normalization logic (Prompt Step 2)
    // We adjust interpretation slightly based on sleep/stress, but keep score standard for the table
    // Table: 0-20 Low, 21-40 Medium, 41-60 High, 61-80 Extreme
    
    let level: 'Low' | 'Medium' | 'High' | 'Extreme' = 'Low';
    if (rawScore <= 20) level = 'Low';
    else if (rawScore <= 40) level = 'Medium';
    else if (rawScore <= 60) level = 'High';
    else level = 'Extreme';

    return {
      ageGroup: basicInfo.age,
      gender: basicInfo.gender,
      sleepQuality: basicInfo.sleep,
      stressLevel: basicInfo.stress,
      ptsdScore: rawScore,
      ptsdLevel: level
    };
  };

  const resultData = step === 'result' ? calculateResult() : null;

  // --- RENDERING ---

  if (step === 'intro') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center"
        >
          <div className="bg-indigo-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-600">
             <ShieldCheck size={40} />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 mb-4">Personalize Your Care</h1>
          <p className="text-slate-500 mb-8 leading-relaxed">
            To provide the best neuro-therapy experience, we need to understand your current state. 
            This one-time assessment takes about 2 minutes.
          </p>
          <button 
            onClick={() => setStep('basic')}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 transition-all"
          >
            Start Assessment
          </button>
        </motion.div>
      </div>
    );
  }

  if (step === 'basic') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <motion.div 
          initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }}
          className="max-w-lg w-full bg-white rounded-3xl shadow-xl p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <User className="text-indigo-500" />
            <h2 className="text-2xl font-bold text-slate-800">Basic Information</h2>
          </div>
          
          <form onSubmit={handleBasicSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Age Group</label>
                    <select 
                        required 
                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-200 outline-none"
                        value={basicInfo.age}
                        onChange={e => setBasicInfo({...basicInfo, age: e.target.value})}
                    >
                        <option value="">Select</option>
                        <option value="18-24">18-24</option>
                        <option value="25-34">25-34</option>
                        <option value="35-44">35-44</option>
                        <option value="45-54">45-54</option>
                        <option value="55+">55+</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Gender</label>
                    <select 
                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-200 outline-none"
                        value={basicInfo.gender}
                        onChange={e => setBasicInfo({...basicInfo, gender: e.target.value})}
                    >
                        <option value="">Optional</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Non-binary">Non-binary</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex justify-between">
                    <span>Sleep Quality (Last 7 Days)</span>
                    <span className="text-indigo-600">{basicInfo.sleep}/10</span>
                </label>
                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <Moon size={20} className="text-slate-400" />
                    <input 
                        type="range" min="1" max="10" 
                        value={basicInfo.sleep} 
                        onChange={e => setBasicInfo({...basicInfo, sleep: parseInt(e.target.value)})}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <Sun size={20} className="text-yellow-500" />
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex justify-between">
                    <span>Daily Stress Level</span>
                    <span className="text-rose-600">{basicInfo.stress}/10</span>
                </label>
                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <Smile size={20} className="text-green-500" />
                    <input 
                        type="range" min="1" max="10" 
                        value={basicInfo.stress} 
                        onChange={e => setBasicInfo({...basicInfo, stress: parseInt(e.target.value)})}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
                    />
                    <Activity size={20} className="text-rose-500" />
                </div>
            </div>

            <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg mt-4">
                Continue
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  if (step === 'quiz') {
    const question = PTSD_QUESTIONS[currentQuestionIndex];
    const progress = ((currentQuestionIndex) / PTSD_QUESTIONS.length) * 100;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-2xl">
            {/* Progress Bar */}
            <div className="w-full h-2 bg-slate-200 rounded-full mb-8 overflow-hidden">
                <motion.div 
                    className="h-full bg-indigo-500" 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                />
            </div>

            <AnimatePresence mode='wait'>
                <motion.div
                    key={question.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white rounded-3xl shadow-xl p-8 md:p-12"
                >
                    <span className="text-indigo-500 font-bold tracking-widest text-xs uppercase mb-2 block">
                        Question {currentQuestionIndex + 1} of {PTSD_QUESTIONS.length}
                    </span>
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-8 leading-tight">
                        {question.text}
                    </h2>

                    <div className="grid gap-3">
                        {SCORING_OPTIONS.map((opt) => (
                            <button
                                key={opt.val}
                                onClick={() => handleAnswer(opt.val)}
                                className="w-full text-left p-4 rounded-xl border-2 border-slate-100 hover:border-indigo-500 hover:bg-indigo-50 transition-all font-semibold text-slate-600 hover:text-indigo-700 flex justify-between items-center group"
                            >
                                <span>{opt.label}</span>
                                <div className="w-6 h-6 rounded-full border-2 border-slate-300 group-hover:border-indigo-500 flex items-center justify-center">
                                    <div className="w-3 h-3 rounded-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </button>
                        ))}
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
      </div>
    );
  }

  if (step === 'calculating') {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
              <Brain size={64} className="text-indigo-500 animate-pulse mb-6" />
              <h2 className="text-2xl font-bold text-slate-700">Analyzing Responses...</h2>
              <p className="text-slate-400">Calibrating your therapy plan</p>
          </div>
      );
  }

  if (step === 'result' && resultData) {
      const { ptsdLevel, ptsdScore } = resultData;
      
      let colorClass = 'bg-green-100 text-green-700 border-green-200';
      let icon = <ShieldCheck size={48} />;
      let title = "Low Risk";
      let desc = "Your symptoms are mild. We will focus on preventive wellness and relaxation.";
      let intensity = "Standard";

      if (ptsdLevel === 'Medium') {
          colorClass = 'bg-yellow-100 text-yellow-700 border-yellow-200';
          icon = <Activity size={48} />;
          title = "Medium Risk";
          desc = "You are showing some signs of stress. We recommend daily cognitive exercises.";
          intensity = "Moderate";
      } else if (ptsdLevel === 'High') {
          colorClass = 'bg-orange-100 text-orange-700 border-orange-200';
          icon = <AlertTriangle size={48} />;
          title = "High Risk";
          desc = "Significant symptoms detected. Our AI suggests a consistent, calming routine.";
          intensity = "High";
      } else if (ptsdLevel === 'Extreme') {
          colorClass = 'bg-red-100 text-red-700 border-red-200';
          icon = <HeartPulse size={48} />;
          title = "Elevated Risk";
          desc = "High distress levels. Please prioritize self-care and professional consultation.";
          intensity = "Maximum Support";
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center"
            >
                <div className="flex justify-center mb-6">
                    <div className={`p-6 rounded-full border-4 ${colorClass}`}>
                        {icon}
                    </div>
                </div>

                <h2 className="text-3xl font-black text-slate-800 mb-2">{title}</h2>
                <div className="inline-block px-4 py-1 rounded-full bg-slate-100 text-slate-500 text-sm font-bold mb-6">
                    Score: {ptsdScore} / 80
                </div>

                <div className="bg-slate-50 rounded-2xl p-6 mb-8 text-left">
                    <p className="text-slate-600 mb-4">{desc}</p>
                    <div className="flex justify-between items-center border-t border-slate-200 pt-4">
                        <span className="text-xs font-bold text-slate-400 uppercase">Recommended Therapy</span>
                        <span className="text-indigo-600 font-bold">{intensity}</span>
                    </div>
                </div>

                <button 
                    onClick={() => onComplete(resultData)}
                    className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-black transition-all flex items-center justify-center gap-2"
                >
                    Start My Journey <ArrowRight size={20} />
                </button>
            </motion.div>
        </div>
      );
  }

  return null;
};
