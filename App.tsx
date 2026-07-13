
import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { HomePage } from './components/HomePage';
import { AuthPage } from './components/auth/AuthPage';
import { GameMenu, ALL_MODULES } from './components/GameMenu';
import { ProgressTracker } from './components/ProgressTracker';
import { BrainHealthDashboard } from './components/BrainHealthDashboard';
import { AnimatePresence } from 'framer-motion'; // New Import
import { AssessmentPage } from './components/AssessmentPage'; // New Import
import { AssessmentData } from './types'; // New Import
import { TherapistChat } from './components/TherapistChat'; // New Import

// Games
import { ColorMatchGame } from './components/ColorMatchGame';
import { BreathingGame } from './components/BreathingGame';
import { CountingGame } from './components/CountingGame';
import { EmojiMatchGame } from './components/EmojiMatchGame';
import { MemoryGame } from './components/MemoryGame';
import { SequenceGame } from './components/SequenceGame';
import { OddOneOutGame } from './components/OddOneOutGame';
import { MazeGame } from './components/MazeGame';
import { HandStretchGame } from './components/HandStretchGame';
import { FollowDotGame } from './components/FollowDotGame';
import { ArtCreativityGame } from './components/ArtCreativityGame';
import { EmotionRecognitionGame } from './components/EmotionRecognitionGame';
import { 
  BubblePopGame, 
  StarShowerGame, 
  RainbowTrailGame, 
  FlowerBloomGame, 
  SmileTransformGame, 
  FireflyGlowGame 
} from './components/VisualAnimationGames';
import { 
  ZenV1,
  ZenV2
} from './components/ZenFocusGames';
import {
  EnvVR1,
  EnvVR2,
  EnvVR3,
  EnvVR4
} from './components/EnvironmentVideos';
import { 
  MusicBinaural,
  MusicAlpha,
  MusicGamma,
  MusicTheta,
  MusicOm,
  MusicFlute
} from './components/MusicPlayerGames';
import { GameId } from './types';
import { LogOut } from 'lucide-react';
import { authService } from './services/authService';

// Wrapper to handle auth logic separate from game logic
const AppContent: React.FC = () => {
  const { user, loading, logout } = useAuth();
  const [authView, setAuthView] = useState<{ show: boolean, mode: 'login' | 'signup' }>({ show: false, mode: 'login' });
  const [activeGame, setActiveGame] = useState<GameId | null>(null);
  const [showTracker, setShowTracker] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  
  // Navigation State (Lifted from GameMenu to persist selection)
  const [menuSectionId, setMenuSectionId] = useState<string | null>(null);
  const [menuCategoryId, setMenuCategoryId] = useState<string | null>(null);

  // Assessment State
  const [assessmentComplete, setAssessmentComplete] = useState(false);
  const [ptsdLevel, setPtsdLevel] = useState<string>('Low');
  
  // AI Therapist State
  const [showTherapist, setShowTherapist] = useState(false);

  // Check Local Storage and User Profile for assessment on user load
  useEffect(() => {
      if (user) {
          // 1. Prefer DB/User Object if available (it's the source of truth)
          if (user.assessmentCompleted !== undefined) {
              setAssessmentComplete(user.assessmentCompleted);
              if (user.ptsdLevel) setPtsdLevel(user.ptsdLevel);
              
              // Sync to local storage for consistency
              if (user.assessmentCompleted) {
                  localStorage.setItem(`assessment_complete_${user.id}`, 'true');
              } else {
                  localStorage.removeItem(`assessment_complete_${user.id}`);
              }
              
              if (user.ptsdLevel) {
                  localStorage.setItem(`ptsd_level_${user.id}`, user.ptsdLevel);
              }
          } 
          // 2. Fallback to Local Storage (if user object is stale or offline)
          else {
              const stored = localStorage.getItem(`assessment_complete_${user.id}`);
              if (stored === 'true') {
                  setAssessmentComplete(true);
              } else {
                  setAssessmentComplete(false);
              }
              
              const storedLevel = localStorage.getItem(`ptsd_level_${user.id}`);
              if (storedLevel) {
                  setPtsdLevel(storedLevel);
              }
          }
      } else {
          // Reset navigation when user logs out
          setMenuSectionId(null);
          setMenuCategoryId(null);
          setActiveGame(null);
          setShowTracker(false);
          setShowDashboard(false);
          setPtsdLevel('Low');
          setAssessmentComplete(false);
      }
  }, [user]);

  const handleAssessmentComplete = async (data: AssessmentData) => {
      if (user) {
          // Save to local storage (In real app, save to DB via API)
          localStorage.setItem(`assessment_complete_${user.id}`, 'true');
          // Also save the specific level for personalization later
          localStorage.setItem(`ptsd_level_${user.id}`, data.ptsdLevel);
          setPtsdLevel(data.ptsdLevel);
          setAssessmentComplete(true);

          // Save to Database
          try {
            await authService.updateAssessment(user.id, data.ptsdLevel);
          } catch (err) {
            console.error("Failed to sync assessment with DB", err);
          }
      }
  };
  
  const handleLogout = () => {
      logout();
      setMenuSectionId(null);
      setMenuCategoryId(null);
  }

  if (loading) {
     return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400">Loading...</div>;
  }

  // --- UNAUTHENTICATED ROUTES ---
  if (!user) {
    if (authView.show) {
      return <AuthPage onBack={() => setAuthView({ ...authView, show: false })} initialMode={authView.mode} />;
    }
    return (
      <HomePage 
        onLoginClick={() => setAuthView({ show: true, mode: 'login' })} 
        onSignupClick={() => setAuthView({ show: true, mode: 'signup' })} 
      />
    );
  }

  // --- ASSESSMENT ROUTE (Before Game Menu) ---
  if (!assessmentComplete) {
      return <AssessmentPage onComplete={handleAssessmentComplete} />;
  }

  // --- AUTHENTICATED ROUTES (The Game) ---

  const handleNextGame = (currentId: GameId) => {
    const currentIndex = ALL_MODULES.findIndex(m => m.id === currentId);
    if (currentIndex === -1) {
      setActiveGame(null);
      return;
    }
    const currentModule = ALL_MODULES[currentIndex];
    let nextIndex = currentIndex + 1;
    while (nextIndex < ALL_MODULES.length) {
      if (ALL_MODULES[nextIndex].category === currentModule.category) {
        setActiveGame(ALL_MODULES[nextIndex].id);
        return;
      }
      nextIndex++;
    }
    setActiveGame(null);
  };

  // Show Tracker
  if (showTracker) {
    return <ProgressTracker onBack={() => setShowTracker(false)} />;
  }

  // Show Dashboard
  if (showDashboard) {
    return <BrainHealthDashboard onBack={() => setShowDashboard(false)} />;
  }

  const renderGame = () => {
    const commonProps = (id: GameId) => ({
      onBack: () => setActiveGame(null),
      onNext: () => handleNextGame(id)
    });

    switch(activeGame) {
      // Exercises
      case 'breathing': return <BreathingGame {...commonProps('breathing')} />;
      case 'hand-stretch': return <HandStretchGame {...commonProps('hand-stretch')} />;
      case 'follow-dot': return <FollowDotGame {...commonProps('follow-dot')} />;
      
      // Games
      case 'color-match': return <ColorMatchGame {...commonProps('color-match')} />;
      case 'counting': return <CountingGame {...commonProps('counting')} />;
      case 'emoji': return <EmojiMatchGame {...commonProps('emoji')} />;
      case 'memory': return <MemoryGame {...commonProps('memory')} />;
      case 'sequence': return <SequenceGame {...commonProps('sequence')} />;
      case 'odd-one': return <OddOneOutGame {...commonProps('odd-one')} />;
      case 'maze': return <MazeGame {...commonProps('maze')} />;

      // Emotion Recognition
      case 'emotion-recognition': return <EmotionRecognitionGame {...commonProps('emotion-recognition')} />;

      // Creativity
      case 'art-coloring': return <ArtCreativityGame {...commonProps('art-coloring')} />;
      
      // Visual Animations (Interactive)
      case 'bubble-pop': return <BubblePopGame {...commonProps('bubble-pop')} />;
      case 'star-shower': return <StarShowerGame {...commonProps('star-shower')} />;
      case 'rainbow-trail': return <RainbowTrailGame {...commonProps('rainbow-trail')} />;
      case 'flower-bloom': return <FlowerBloomGame {...commonProps('flower-bloom')} />;
      case 'smile-transform': return <SmileTransformGame {...commonProps('smile-transform')} />;
      case 'firefly-glow': return <FireflyGlowGame {...commonProps('firefly-glow')} />;

      // Zen & Focus (Passive/Short)
      case 'zen-v1': return <ZenV1 {...commonProps('zen-v1')} />;
      case 'zen-v2': return <ZenV2 {...commonProps('zen-v2')} />;

      // Feel Environment (VR Videos)
      case 'env-vr1': return <EnvVR1 {...commonProps('env-vr1')} />;
      case 'env-vr2': return <EnvVR2 {...commonProps('env-vr2')} />;
      case 'env-vr3': return <EnvVR3 {...commonProps('env-vr3')} />;
      case 'env-vr4': return <EnvVR4 {...commonProps('env-vr4')} />;

      // Music Therapy
      case 'music-binaural': return <MusicBinaural {...commonProps('music-binaural')} />;
      case 'music-alpha': return <MusicAlpha {...commonProps('music-alpha')} />;
      case 'music-gamma': return <MusicGamma {...commonProps('music-gamma')} />;
      case 'music-theta': return <MusicTheta {...commonProps('music-theta')} />;
      case 'music-om': return <MusicOm {...commonProps('music-om')} />;
      case 'music-flute': return <MusicFlute {...commonProps('music-flute')} />;

      default: return (
        <GameMenu 
            onSelectGame={(id) => setActiveGame(id as GameId)} 
            onOpenTracker={() => setShowTracker(true)}
            onOpenTherapist={() => setShowTherapist(true)}
            onOpenDashboard={() => setShowDashboard(true)}
            sectionId={menuSectionId}
            setSectionId={setMenuSectionId}
            categoryId={menuCategoryId}
            setCategoryId={setMenuCategoryId}
            ptsdLevel={ptsdLevel}
        />
      );
    }
  };

  return (
    <div className="relative z-10 min-h-screen flex flex-col">
       {/* User Header */}
       {!activeGame && !showTracker && (
         <div className="absolute top-4 right-4 z-20 flex items-center gap-4">
            <span className="text-slate-500 font-semibold">Hi, {user.name}</span>
            <button 
              onClick={handleLogout} 
              className="p-2 bg-white/80 rounded-full hover:bg-slate-100 text-slate-500 shadow-sm border border-slate-200"
              title="Sign Out"
            >
              <LogOut size={18} />
            </button>
         </div>
       )}

      <main className="flex-1 flex items-center justify-center p-4">
        {renderGame()}
      </main>
      
      {/* AI Therapist Modal */}
      <AnimatePresence>
        {showTherapist && (
          <TherapistChat onClose={() => setShowTherapist(false)} />
        )}
      </AnimatePresence>
      
      {!activeGame && !showTracker && (
        <footer className="p-6 text-center text-slate-400 text-sm">
          <p>Relax, match, and breathe.</p>
        </footer>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-slate-50 overflow-x-hidden font-sans selection:bg-indigo-100">
        {/* Abstract Background Shapes */}
        <div className="fixed inset-0 z-0 pointer-events-none opacity-30">
          <div className="absolute top-[-10%] left-[-10%] w-[50vh] h-[50vh] bg-blue-200 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60vh] h-[60vh] bg-pink-200 rounded-full blur-[100px]" />
          <div className="absolute top-[40%] left-[60%] w-[40vh] h-[40vh] bg-yellow-200 rounded-full blur-[80px]" />
        </div>
        <AppContent />
      </div>
    </AuthProvider>
  );
};

export default App;
