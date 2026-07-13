
// Check authService for MOCK_MODE, we will assume false for backend connection usually
// But we replicate the logic to be safe or just use the same constant mechanism.
// For simplicity, we'll auto-detect API_URL.

const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    return `http://${hostname}:5000/api`;
  }
  return 'http://localhost:5000/api';
};

const API_URL = getApiUrl();

export interface ProgressRecord {
  id: number;
  user_id: number;
  game_id: string;
  level: number;
  score: number;
  reaction_time: number; // ms
  accuracy: number;      // %
  stability: number;     // 0-100 score
  alpha: number;         // 0-100
  beta: number;          // 0-100
  theta: number;         // 0-100
  delta: number;         // 0-100
  gamma: number;         // 0-100
  played_at: string;
}

export interface GameStats {
  reactionTime: number;
  accuracy: number;
  stability: number;
  // Optional simulated brain stats
  alpha?: number;
  beta?: number;
  theta?: number;
  delta?: number;
  gamma?: number;
}

export const progressService = {
  saveProgress: async (userId: string, gameId: string, level: number, score: number = 0, stats?: GameStats) => {
    try {
      // Default stats if not provided
      const payload = {
        userId, 
        gameId, 
        level, 
        score,
        reactionTime: stats?.reactionTime || 0,
        accuracy: stats?.accuracy || 100,
        stability: stats?.stability || 0,
        alpha: stats?.alpha || 50,
        beta: stats?.beta || 50,
        theta: stats?.theta || 50,
        delta: stats?.delta || 50,
        gamma: stats?.gamma || 50
      };

      const response = await fetch(`${API_URL}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        console.warn('Failed to save progress to backend');
      }
    } catch (error) {
      console.error('Error saving progress:', error);
      // Fail silently to not disrupt game flow
    }
  },

  getHistory: async (userId: string): Promise<ProgressRecord[]> => {
    try {
      const response = await fetch(`${API_URL}/progress/${userId}`);
      if (!response.ok) return [];
      return await response.json();
    } catch (error) {
      console.error('Error fetching history:', error);
      return [];
    }
  }
};
