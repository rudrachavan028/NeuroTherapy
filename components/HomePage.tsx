
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Heart, Zap, Smile, ArrowRight, Brain, Music, Globe, BarChart2, Bot } from 'lucide-react';

interface Props {
  onLoginClick: () => void;
  onSignupClick: () => void;
}

const NeuronBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    // Configuration
    const particleCount = Math.floor((width * height) / 15000); // Responsive count
    const connectionDistance = 140;
    const particles: {x: number, y: number, vx: number, vy: number, size: number}[] = [];

    // Initialize particles (Neurons)
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1
      });
    }

    let animationFrameId: number;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Update and Draw Particles
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off edges
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Draw Neuron Body
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = '#6366f1'; // Indigo-500
        ctx.fill();

        // Connect Synapses
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx*dx + dy*dy);

          if (dist < connectionDistance) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(99, 102, 241, ${1 - dist/connectionDistance})`; // Fade out with distance
            ctx.lineWidth = 0.5;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none opacity-40" />;
};

export const HomePage: React.FC<Props> = ({ onLoginClick, onSignupClick }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {/* Dynamic Neuron Network Background */}
      <NeuronBackground />

      <div className="max-w-4xl mx-auto px-6 text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md rounded-full text-indigo-600 font-semibold text-sm mb-6 shadow-sm border border-indigo-100">
            <Brain size={16} />
            <span>AI & VR Rehabilitation</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-extrabold text-slate-800 mb-6 tracking-tight leading-tight">
            Neuro <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">Therapy</span>
          </h1>
          
          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
            Smart Therapy Using VR and AI for Neuro Recovery and PTSD Care
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onSignupClick}
              className="px-8 py-4 bg-indigo-600 text-white rounded-full font-bold text-lg shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all w-full sm:w-auto flex items-center justify-center gap-2"
            >
              Get Started <ArrowRight size={20} />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onLoginClick}
              className="px-8 py-4 bg-white/80 backdrop-blur-sm text-slate-700 rounded-full font-bold text-lg shadow-md border border-slate-200 hover:bg-white transition-all w-full sm:w-auto"
            >
              Member Login
            </motion.button>
          </div>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20 pb-20">
           <FeatureCard 
             icon={<Music className="text-rose-500" size={32} />}
             title="Music Therapy"
             text="Binaural beats & sonic healing frequencies."
             delay={0.2}
           />
           <FeatureCard 
             icon={<Globe className="text-emerald-500" size={32} />}
             title="VR Therapy"
             text="Immersive environments for deep relaxation."
             delay={0.4}
           />
           <FeatureCard 
             icon={<BarChart2 className="text-indigo-500" size={32} />}
             title="AI Progress"
             text="Data-driven insights into your recovery."
             delay={0.6}
           />
           <FeatureCard 
             icon={<Bot className="text-amber-500" size={32} />}
             title="AI Chatbot"
             text="24/7 empathetic support companion."
             delay={0.8}
           />
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, text, delay }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay: delay || 0, type: "spring", bounce: 0.4 }}
    whileHover={{ y: -10, scale: 1.02 }}
    className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-white/60 shadow-lg hover:shadow-2xl transition-all duration-300 group"
  >
    <div className="mb-4 bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-inner group-hover:scale-110 transition-transform duration-300">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
    <p className="text-slate-500 leading-relaxed text-sm">{text}</p>
  </motion.div>
);
