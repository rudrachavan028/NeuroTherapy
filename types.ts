
export interface ColorTheme {
  id: string;
  name: string;
  hex: string;
  bgClass?: string; // Optional now, as AI uses hex
  textClass?: string;
  borderClass?: string;
  psychology?: string; // New: AI explanation
}

export interface GameItem {
  id: string;
  colorId: string;
  isMatched: boolean;
}

export type GameId = 
  | 'breathing' | 'hand-stretch' | 'follow-dot'
  | 'color-match' | 'counting' | 'emoji' | 'memory' | 'sequence' | 'odd-one' | 'maze' 
  | 'art-coloring'
  | 'bubble-pop' | 'star-shower' | 'rainbow-trail' | 'flower-bloom' | 'smile-transform' | 'firefly-glow'
  | 'zen-v1' | 'zen-v2'
  | 'env-vr1' | 'env-vr2' | 'env-vr3' | 'env-vr4'
  | 'music-binaural' | 'music-alpha' | 'music-gamma' | 'music-theta' | 'music-om' | 'music-flute'
  | 'emotion-recognition';

export type GameCategory = 'exercise' | 'game' | 'creativity' | 'visual-animation' | 'focus' | 'music' | 'environment' | 'emotion';

export interface GameConfig {
  id: GameId;
  title: string;
  description: string;
  levelIndex: number; // 1-8 mapping
  color: string;
  icon: any;
  category: GameCategory;
}

export interface User {
  id: string;
  name: string;
  email: string;
  ptsdLevel?: 'Low' | 'Medium' | 'High' | 'Extreme'; // New
  assessmentCompleted?: boolean; // New
}

export interface AssessmentData {
  ageGroup: string;
  gender: string;
  sleepQuality: number; // 1-10
  stressLevel: number; // 1-10
  ptsdScore: number;
  ptsdLevel: 'Low' | 'Medium' | 'High' | 'Extreme';
}

// NEW: Detailed AI Analysis Structure
export interface AIAnalysisResult {
  summary: string;
  moodAnalysis: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[]; // List of Game IDs
  cognitiveScores: {
    memory: number;
    focus: number;
    calm: number;
    agility: number;
    creativity: number;
  };
  brainBattery: number; // 0-100
}
