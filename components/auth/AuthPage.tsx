
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { LogIn, UserPlus, AlertCircle, ArrowLeft, Loader, Mail, Lock, User, Headphones, Globe, BarChart2, Bot, Sparkles, Brain, Music } from 'lucide-react';

interface Props {
  onBack: () => void;
  initialMode?: 'login' | 'signup';
}

export const AuthPage: React.FC<Props> = ({ onBack, initialMode = 'login' }) => {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!isLogin && password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
    }

    setIsLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(name, email, password);
      }
      // App.tsx handles redirect upon user state change
    } catch (err) {
      setError(isLogin 
        ? 'Invalid email or password.' 
        : 'Failed to create account. Email may be in use.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
  };

  const features = [
    { icon: <Music size={24} />, title: "Music Therapy", desc: "Binaural beats & sonic healing frequencies.", color: "bg-rose-100 text-rose-600" },
    { icon: <Globe size={24} />, title: "VR Therapy", desc: "Immersive environments for deep relaxation.", color: "bg-emerald-100 text-emerald-600" },
    { icon: <BarChart2 size={24} />, title: "AI Progress", desc: "Data-driven insights into your recovery.", color: "bg-indigo-100 text-indigo-600" },
    { icon: <Bot size={24} />, title: "AI Chatbot", desc: "24/7 empathetic support companion.", color: "bg-amber-100 text-amber-600" }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-gradient-to-br from-slate-50 to-indigo-50/30">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 md:gap-16 items-center">
        
        {/* Left Side: Hero & Features (Visible on Desktop) */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="hidden md:block space-y-10"
        >
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm text-slate-600 text-sm font-bold uppercase tracking-wider"
            >
              <Sparkles size={16} className="text-indigo-500" />
              <span>Next-Gen Mental Wellness</span>
            </motion.div>
            <h1 className="text-5xl lg:text-6xl font-black text-slate-800 leading-tight">
              Heal your mind with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-500">Neuro Therapy</span>
            </h1>
            <p className="text-lg text-slate-500 max-w-lg leading-relaxed">
              A personalized, AI-driven journey to recovery. Combine cognitive games, immersive environments, and sonic therapy to rebuild your mental resilience.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + (idx * 0.1) }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feature.color}`}>
                  {feature.icon}
                </div>
                <h3 className="font-bold text-slate-800 mb-1">{feature.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right Side: Auth Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md mx-auto bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 p-8 md:p-10 border border-slate-100 relative overflow-hidden"
        >
          <button 
            onClick={onBack} 
            className="absolute top-6 left-6 p-2 rounded-full hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors"
          >
             <ArrowLeft size={24} />
          </button>

          {/* Header Section */}
          <div className="text-center mb-8 mt-4">
          <motion.div 
            layout
            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-500 ${isLogin ? 'bg-indigo-100 text-indigo-600' : 'bg-pink-100 text-pink-600'}`}
          >
            {isLogin ? <LogIn size={36} /> : <UserPlus size={36} />}
          </motion.div>
          
          <motion.h2 layout className="text-3xl font-extrabold text-slate-800 mb-1">
            {isLogin ? 'Welcome Back' : 'Join Neuro Therapy'}
          </motion.h2>
          <motion.p layout className="text-slate-500">
            {isLogin ? 'Enter your details to sign in' : 'Start your wellness journey today'}
          </motion.p>
        </div>

        {/* Toggle Switch */}
        <div className="flex bg-slate-100 p-1 rounded-xl mb-8 relative">
          <motion.div 
            layout
            className="absolute top-1 bottom-1 bg-white rounded-lg shadow-sm w-[calc(50%-4px)]"
            animate={{ left: isLogin ? '4px' : 'calc(50%)' }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
          <button 
            onClick={() => !isLogin && toggleMode()}
            className={`flex-1 py-2 text-sm font-bold z-10 text-center transition-colors ${isLogin ? 'text-slate-800' : 'text-slate-500'}`}
          >
            Log In
          </button>
          <button 
            onClick={() => isLogin && toggleMode()}
            className={`flex-1 py-2 text-sm font-bold z-10 text-center transition-colors ${!isLogin ? 'text-slate-800' : 'text-slate-500'}`}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 flex items-start gap-3 text-sm"
          >
            <AlertCircle size={18} className="mt-0.5 shrink-0" /> 
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence initial={false}>
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="overflow-hidden"
              >
                <div className="relative">
                  <User className="absolute top-3.5 left-4 text-slate-400" size={20} />
                  <input 
                    type="text" 
                    required={!isLogin}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all bg-slate-50 focus:bg-white"
                    placeholder="Full Name"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative">
            <Mail className="absolute top-3.5 left-4 text-slate-400" size={20} />
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 outline-none transition-all bg-slate-50 focus:bg-white ${isLogin ? 'focus:border-indigo-500 focus:ring-indigo-200' : 'focus:border-pink-500 focus:ring-pink-200'} focus:ring-2`}
              placeholder="Email Address"
            />
          </div>

          <div className="relative">
            <Lock className="absolute top-3.5 left-4 text-slate-400" size={20} />
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 outline-none transition-all bg-slate-50 focus:bg-white ${isLogin ? 'focus:border-indigo-500 focus:ring-indigo-200' : 'focus:border-pink-500 focus:ring-pink-200'} focus:ring-2`}
              placeholder="Password"
            />
          </div>

          <motion.button 
            layout
            type="submit" 
            disabled={isLoading}
            className={`w-full py-4 text-white rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-6
              ${isLogin 
                ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200' 
                : 'bg-pink-500 hover:bg-pink-600 shadow-pink-200'
              }`}
          >
            {isLoading ? <Loader className="animate-spin" /> : (isLogin ? "Log In" : "Create Account")}
          </motion.button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-500 text-sm">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <button 
              onClick={toggleMode} 
              className={`font-bold hover:underline ${isLogin ? 'text-indigo-600' : 'text-pink-600'}`}
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </div>
        </motion.div>
      </div>
    </div>
  );
};
