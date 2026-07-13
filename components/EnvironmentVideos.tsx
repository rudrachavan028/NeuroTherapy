
import React, { useState, useRef, useEffect } from 'react';
import { LevelLayout } from './LevelLayout';
import { Play, Pause, AlertCircle, Maximize, Minimize, Glasses } from 'lucide-react';

// Add type declarations for A-Frame elements
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'a-scene': any;
      'a-assets': any;
      'a-videosphere': any;
      'a-entity': any;
    }
  }
}

interface Props { onBack: () => void; onNext?: () => void; }

interface EnvironmentVideoProps extends Props {
    title: string;
    videoFile: string;
    encouragement: string;
}

const EnvironmentPlayer: React.FC<EnvironmentVideoProps> = ({ onBack, onNext, title, videoFile, encouragement }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const sceneRef = useRef<any>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(false);
    const [error, setError] = useState(false);
    const [isVRMode, setIsVRMode] = useState(false);

    // Initial Autoplay Logic
    useEffect(() => {
        const videoEl = videoRef.current;
        if (!videoEl) return;

        setError(false);
        setIsPlaying(false);

        const startPlay = async () => {
            try {
                // Ensure muted is true before playing for autoplay policy
                videoEl.defaultMuted = true; 
                videoEl.muted = true;
                await videoEl.play();
                setIsPlaying(true);
            } catch (err) {
                console.warn("Autoplay prevented:", err);
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
    }, [videoFile]);

    const togglePlay = () => {
        if (!videoRef.current) return;
        if (isPlaying) {
            videoRef.current.pause();
            setIsPlaying(false);
        } else {
            // When playing, respect the current sound setting
            // If soundEnabled is true, muted should be false.
            videoRef.current.muted = !soundEnabled;
            videoRef.current.play().catch(console.error);
            setIsPlaying(true);
        }
    };

    const toggleMute = () => {
        if (!videoRef.current) return;
        const newSoundEnabled = !soundEnabled;
        setSoundEnabled(newSoundEnabled);
        videoRef.current.muted = !newSoundEnabled;
    };

    const handleRestart = () => {
        if (videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play().catch(console.error);
            setIsPlaying(true);
        }
    };

    const enterVR = () => {
        const scene = document.querySelector('a-scene');
        if (scene) {
            (scene as any).enterVR();
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
            toggleSound={toggleMute}
            encouragement={encouragement}
        >
            <div className="flex-1 flex flex-col items-center justify-center p-4 bg-emerald-900/5 rounded-3xl w-full h-full relative">
                
                {/* A-Frame Scene Container */}
                <div className="w-full h-[60vh] md:h-[70vh] rounded-3xl overflow-hidden shadow-2xl border border-emerald-200 relative z-0">
                    {!error ? (
                        <a-scene embedded vr-mode-ui="enabled: true">
                            <a-assets>
                                <video 
                                    id="vr-video"
                                    ref={videoRef}
                                    src={`/vr_videos/${videoFile}`}
                                    loop={true}
                                    crossOrigin="anonymous"
                                    playsInline={true}
                                    webkit-playsinline="true"
                                ></video>
                            </a-assets>

                            {/* 360 Video Sphere */}
                            <a-videosphere src="#vr-video" rotation="0 -90 0"></a-videosphere>

                            {/* Camera with Look Controls (Mouse/Touch + Gyro) */}
                            <a-entity camera look-controls="reverseMouseDrag: true"></a-entity>
                        </a-scene>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-800">
                            <AlertCircle size={48} className="mb-4 text-red-400" />
                            <p className="text-lg font-semibold">Video Unavailable</p>
                            <p className="text-sm font-mono mt-2 opacity-70">Check public/vr_videos/{videoFile}</p>
                        </div>
                    )}

                    {/* Custom Overlay Controls (Only visible when NOT in VR mode) */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 flex gap-4">
                        <button 
                            onClick={togglePlay}
                            className="p-3 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-md transition-all"
                            title={isPlaying ? "Pause" : "Play"}
                        >
                            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                        </button>

                        <button 
                            onClick={toggleMute}
                            className={`p-3 ${soundEnabled ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-black/50 hover:bg-black/70'} text-white rounded-full backdrop-blur-md transition-all`}
                            title={soundEnabled ? "Mute" : "Unmute"}
                        >
                            {soundEnabled ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
                            )}
                        </button>
                        
                        <button 
                            onClick={enterVR}
                            className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full backdrop-blur-md transition-all flex items-center gap-2 px-6"
                        >
                            <Glasses size={24} />
                            <span className="font-bold">Enter VR</span>
                        </button>
                    </div>
                </div>

                <div className="mt-6 flex flex-col items-center gap-2 text-emerald-700 text-sm font-medium">
                   <span>{isPlaying ? "Immersed..." : "Paused"} • {videoFile}</span>
                   <p className="text-xs text-slate-500">Drag screen or move phone to look around</p>
                </div>
            </div>
        </LevelLayout>
    );
};

// --- Exports ---

export const EnvVR1: React.FC<Props> = (props) => (
    <EnvironmentPlayer 
        {...props} 
        title="Environment 1" 
        videoFile="vr1.mp4" 
        encouragement="Breathe in the atmosphere." 
    />
);

export const EnvVR2: React.FC<Props> = (props) => (
    <EnvironmentPlayer 
        {...props} 
        title="Environment 2" 
        videoFile="vr2.mp4" 
        encouragement="Nature is all around you." 
    />
);

export const EnvVR3: React.FC<Props> = (props) => (
    <EnvironmentPlayer 
        {...props} 
        title="Environment 3" 
        videoFile="vr3.mp4" 
        encouragement="Enjoy the view." 
    />
);

export const EnvVR4: React.FC<Props> = (props) => (
    <EnvironmentPlayer 
        {...props} 
        title="Environment 4" 
        videoFile="vr4.mp4" 
        encouragement="Find your calm space." 
    />
);
 