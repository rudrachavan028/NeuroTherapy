import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LevelLayout } from './LevelLayout';
import { Play, Pause, AlertCircle } from 'lucide-react';

interface Props { onBack: () => void; onNext?: () => void; }

type MusicType = 'binaural' | 'alpha' | 'gamma' | 'theta' | 'om' | 'flute';

const MusicPlayer: React.FC<Props & { 
    title: string, 
    type: MusicType,
    description: string,
    color: string,
    filename: string // Name of the file in public/audio/
}> = ({ onBack, onNext, title, type, description, color, filename }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    // Toggle Play/Pause
    const togglePlay = () => {
        if (!audioRef.current) return;
        
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch(err => {
                console.error("Audio playback failed:", err);
                setError(true);
            });
        }
        setIsPlaying(!isPlaying);
    };

    // Update progress bar
    const handleTimeUpdate = () => {
        if (audioRef.current) {
            const current = audioRef.current.currentTime;
            const duration = audioRef.current.duration;
            if (duration) {
                setProgress((current / duration) * 100);
            }
        }
    };

    // Handle Reset
    const handleRestart = () => {
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            if (isPlaying) {
                audioRef.current.play();
            } else {
                setProgress(0);
            }
        }
    };

    // Auto-pause when leaving or changing tracks
    useEffect(() => {
        // We capture the ref here to ensure we clean up the correct element on unmount
        // mostly relevant if ref could change, but good practice.
        const audioEl = audioRef.current;

        return () => {
            if (audioEl) {
                audioEl.pause();
                audioEl.currentTime = 0;
            }
        };
    }, [filename]);

    return (
        <LevelLayout
            title={title}
            currentLevel={1}
            maxLevels={1}
            onNextLevel={onNext || onBack}
            onRestart={handleRestart}
            onBack={onBack}
            isLevelComplete={false}
            isGameComplete={false}
            soundEnabled={true}
            toggleSound={() => {}} 
            encouragement={description}
        >
            <div className={`flex-1 flex flex-col items-center justify-center p-6 ${color} bg-opacity-5 rounded-3xl relative overflow-hidden`}>
                
                {/* Invisible Audio Element */}
                <audio 
                    ref={audioRef}
                    src={`/audio/${filename}`}
                    loop
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={() => setIsPlaying(false)}
                    onError={() => setError(true)}
                />

                {/* Visualizer Area */}
                <div className="relative w-full max-w-lg aspect-square flex items-center justify-center mb-8">
                     <Visualizer type={type} isPlaying={isPlaying} color={color} />
                </div>

                {/* Controls */}
                <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-xl z-10">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
                            <p className="text-slate-500 text-sm">Healing Frequency</p>
                        </div>
                        <button 
                            onClick={togglePlay}
                            disabled={error}
                            className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105 active:scale-95 disabled:bg-slate-300 disabled:cursor-not-allowed ${isPlaying ? 'bg-amber-500' : 'bg-indigo-600'}`}
                        >
                            {isPlaying ? <Pause fill="currentColor" /> : <Play fill="currentColor" className="ml-1" />}
                        </button>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden cursor-pointer" onClick={(e) => {
                        if (audioRef.current) {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const x = e.clientX - rect.left;
                            const percent = x / rect.width;
                            audioRef.current.currentTime = percent * audioRef.current.duration;
                        }
                    }}>
                        <motion.div 
                            className="h-full bg-slate-400"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    
                    <div className="mt-4 text-xs text-slate-400 text-center font-mono">
                        {error ? (
                             <span className="text-red-400 flex items-center justify-center gap-1">
                                <AlertCircle size={12} /> Audio file not found in /public/audio/
                             </span>
                        ) : (
                             isPlaying ? "Playing..." : "Paused"
                        )}
                        <br/>
                        {!error && <span className="opacity-50">File: {filename}</span>}
                    </div>
                </div>
            </div>
        </LevelLayout>
    );
};

const Visualizer = ({ type, isPlaying, color }: { type: MusicType, isPlaying: boolean, color: string }) => {
    // Helper to get tailwind text color from bg/text class string
    const getColorClass = () => {
        if (color.includes('red')) return 'bg-red-400';
        if (color.includes('blue')) return 'bg-blue-400';
        if (color.includes('green')) return 'bg-green-400';
        if (color.includes('indigo')) return 'bg-indigo-400';
        if (color.includes('violet')) return 'bg-violet-400';
        if (color.includes('amber')) return 'bg-amber-400';
        if (color.includes('rose')) return 'bg-rose-400';
        return 'bg-slate-400';
    };

    const bg = getColorClass();

    if (type === 'binaural') {
        return (
            <div className="relative">
                <motion.div 
                    animate={isPlaying ? { scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] } : {}}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className={`absolute inset-0 rounded-full blur-3xl ${bg} w-64 h-64 -translate-x-10`}
                />
                <motion.div 
                    animate={isPlaying ? { scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] } : {}}
                    transition={{ duration: 4.1, repeat: Infinity, ease: "easeInOut" }}
                    className={`absolute inset-0 rounded-full blur-3xl ${bg} w-64 h-64 translate-x-10 opacity-50`}
                />
            </div>
        );
    }

    if (type === 'alpha') {
        return (
            <div className="flex gap-2 items-center justify-center h-40">
                {[1,2,3,4,5,6,7].map(i => (
                    <motion.div 
                        key={i}
                        animate={isPlaying ? { height: [40, 120, 40] } : { height: 40 }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.1, ease: "easeInOut" }}
                        className={`w-4 rounded-full ${bg} opacity-60`}
                    />
                ))}
            </div>
        );
    }

    if (type === 'gamma') {
         return (
            <div className="relative w-64 h-64 flex items-center justify-center">
                 {[1,2,3].map(i => (
                    <motion.div
                        key={i}
                        animate={isPlaying ? { scale: [0.8, 1.5], opacity: [0.8, 0] } : {}}
                        transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.15 }}
                        className={`absolute inset-0 rounded-full border-2 ${bg.replace('bg-', 'border-')}`}
                    />
                 ))}
                 <div className={`w-20 h-20 rounded-full ${bg} shadow-lg z-10`} />
            </div>
         );
    }

    if (type === 'theta') {
        return (
            <div className="relative w-full h-full flex items-center justify-center">
                <motion.div 
                    animate={isPlaying ? { rotate: 360 } : {}}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="w-64 h-64 rounded-full border-4 border-slate-200 border-t-violet-400 opacity-50"
                />
                <motion.div 
                    animate={isPlaying ? { rotate: -360 } : {}}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute w-48 h-48 rounded-full border-4 border-slate-200 border-b-violet-400 opacity-50"
                />
                <motion.div 
                    animate={isPlaying ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className={`absolute w-32 h-32 rounded-full ${bg} blur-2xl opacity-40`}
                />
            </div>
        );
    }

    if (type === 'om') {
        return (
            <div className="relative flex items-center justify-center">
                {[1,2,3,4].map(i => (
                     <motion.div
                        key={i}
                        animate={isPlaying ? { scale: [1, 2], opacity: [0.5, 0] } : {}}
                        transition={{ duration: 4, repeat: Infinity, delay: i * 1, ease: "easeOut" }}
                        className={`absolute w-32 h-32 rounded-full border ${bg.replace('bg-', 'border-')}`}
                     />
                ))}
                 <div className="text-6xl font-serif text-rose-800 opacity-50 z-10">
                    🕉️
                 </div>
            </div>
        );
    }

    if (type === 'flute') {
        return (
             <div className="relative w-full h-40 flex items-center justify-center overflow-hidden">
                <svg width="300" height="100" viewBox="0 0 300 100">
                    <motion.path 
                        d="M 0 50 Q 75 100 150 50 T 300 50"
                        fill="none"
                        stroke={color.includes('emerald') ? '#10b981' : '#cbd5e1'}
                        strokeWidth="4"
                        initial={{ pathLength: 0, opacity: 0.5 }}
                        animate={isPlaying ? { pathLength: [0, 1], pathOffset: [0, 1] } : {}}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                     <motion.path 
                        d="M 0 50 Q 75 0 150 50 T 300 50"
                        fill="none"
                        stroke={color.includes('emerald') ? '#34d399' : '#94a3b8'}
                        strokeWidth="4"
                        initial={{ pathLength: 0, opacity: 0.3 }}
                        animate={isPlaying ? { pathLength: [0, 1], pathOffset: [0, 1] } : {}}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "linear", delay: 0.5 }}
                    />
                </svg>
             </div>
        );
    }

    return <div />;
}


// --- Exports for specific modules ---

export const MusicBinaural: React.FC<Props> = (props) => (
    <MusicPlayer {...props} title="Binaural Beats" type="binaural" description="For Focus & Balance" color="text-slate-600" filename="binaural.mp3" />
);

export const MusicAlpha: React.FC<Props> = (props) => (
    <MusicPlayer {...props} title="Alpha Waves" type="alpha" description="Relaxed Alertness (8-12 Hz)" color="text-indigo-600" filename="alpha.mp3" />
);

export const MusicGamma: React.FC<Props> = (props) => (
    <MusicPlayer {...props} title="Gamma Waves" type="gamma" description="Cognitive Boost (>30 Hz)" color="text-amber-600" filename="gamma.mp3" />
);

export const MusicTheta: React.FC<Props> = (props) => (
    <MusicPlayer {...props} title="Theta Waves" type="theta" description="Deep Meditation (4-8 Hz)" color="text-violet-600" filename="theta.mp3" />
);

export const MusicOm: React.FC<Props> = (props) => (
    <MusicPlayer {...props} title="Om Chanting" type="om" description="Universal Sound of Peace" color="text-rose-600" filename="om.mp3" />
);

export const MusicFlute: React.FC<Props> = (props) => (
    <MusicPlayer {...props} title="Flute Meditation" type="flute" description="Flowing like water" color="text-emerald-600" filename="flute.mp3" />
);
