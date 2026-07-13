
import React, { useState, useRef, useEffect } from 'react';
import { LevelLayout } from './LevelLayout';
import { Play, Pause, AlertCircle, Maximize, Minimize } from 'lucide-react';

interface Props { onBack: () => void; onNext?: () => void; }

interface ZenVideoProps extends Props {
    title: string;
    videoFile: string;
    encouragement: string;
}

const ZenVideoPlayer: React.FC<ZenVideoProps> = ({ onBack, onNext, title, videoFile, encouragement }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(false); // Default false for autoplay
    const [error, setError] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const videoEl = videoRef.current;
        if(!videoEl) return;

        const startPlay = async () => {
            try {
                // CRITICAL FOR MOBILE: defaultMuted must be set before play
                videoEl.defaultMuted = true;
                videoEl.muted = true;
                
                // Attempt play
                await videoEl.play();
                setIsPlaying(true);
            } catch (e) {
                console.log("Autoplay blocked - awaiting user interaction", e);
                setIsPlaying(false);
            }
        };
        startPlay();

        return () => {
            if (videoEl) {
                videoEl.pause();
                videoEl.currentTime = 0;
            }
        };
    }, []);

    // Listen for fullscreen changes
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const togglePlay = () => {
        if (!videoRef.current) return;
        if (isPlaying) {
            videoRef.current.pause();
            setIsPlaying(false);
        } else {
            // When user manually plays, we can respect the soundEnabled state
            videoRef.current.muted = !soundEnabled;
            videoRef.current.play().catch(console.error);
            setIsPlaying(true);
        }
    };

    const handleRestart = () => {
        if (videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play().catch(console.error);
            setIsPlaying(true);
        }
    };

    const toggleFullScreen = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent clicking play overlay
        if (!containerRef.current) return;

        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

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
            soundEnabled={soundEnabled}
            toggleSound={() => {
                setSoundEnabled(!soundEnabled);
                if (videoRef.current) videoRef.current.muted = soundEnabled; // Logic inverted because we are toggling
            }}
            encouragement={encouragement}
        >
            <div className="flex-1 flex flex-col items-center justify-center p-4 bg-slate-900/5 rounded-3xl">
                <div 
                    ref={containerRef}
                    className="relative w-full max-w-4xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-slate-200 group"
                >
                    
                    {!error ? (
                        <video
                            ref={videoRef}
                            src={`/videos/${videoFile}`}
                            className="w-full h-full object-cover"
                            loop
                            playsInline
                            autoPlay
                            muted={!soundEnabled}
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                            onError={(e) => {
                                console.error("Video Error:", e);
                                setError(true);
                            }}
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-800">
                            <AlertCircle size={48} className="mb-4 text-red-400" />
                            <p className="text-lg font-semibold">Video not found</p>
                            <p className="text-sm font-mono mt-2 opacity-70">public/videos/{videoFile}</p>
                        </div>
                    )}

                    {/* Overlay Controls */}
                    <div 
                        className={`absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity cursor-pointer ${isPlaying ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}
                        onClick={togglePlay}
                    >
                         {!isPlaying && (
                            <div className="bg-white/20 backdrop-blur-md p-6 rounded-full transform transition-transform hover:scale-110">
                                <Play fill="white" size={64} className="text-white ml-2" />
                            </div>
                        )}
                        {isPlaying && (
                            <div className="bg-white/20 backdrop-blur-md p-6 rounded-full transform transition-transform hover:scale-110">
                                <Pause fill="white" size={64} className="text-white" />
                            </div>
                        )}
                    </div>

                    {/* Full Screen Button */}
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button 
                            onClick={toggleFullScreen}
                            className="p-3 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-sm transition-all transform hover:scale-105"
                            title={isFullscreen ? "Exit Full Screen" : "Full Screen"}
                        >
                            {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
                        </button>
                    </div>
                </div>

                <div className="mt-6 flex flex-col items-center gap-2 text-slate-500 text-sm">
                    <span>{isPlaying ? "Playing..." : "Paused"} • {videoFile}</span>
                    {!soundEnabled && isPlaying && (
                       <span className="text-xs text-indigo-500/70 bg-indigo-50 px-2 py-1 rounded-full animate-pulse">
                           Tap speaker icon ↗ to unmute
                       </span>
                   )}
                </div>
            </div>
        </LevelLayout>
    );
};

// --- Exports ---

export const ZenV1: React.FC<Props> = (props) => (
    <ZenVideoPlayer 
        {...props} 
        title="Calm Video 1" 
        videoFile="v1.mp4" 
        encouragement="Peaceful vibes." 
    />
);

export const ZenV2: React.FC<Props> = (props) => (
    <ZenVideoPlayer 
        {...props} 
        title="Calm Video 2" 
        videoFile="v2.mp4" 
        encouragement="Deep focus and clarity." 
    />
);
