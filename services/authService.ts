import { User } from '../types';

// SET THIS TO FALSE TO ENABLE REAL BACKEND CONNECTION
const MOCK_MODE = false; 

// Dynamic API URL detection
// This allows the app to work on localhost OR via LAN IP (e.g., on mobile)
// using the Vite proxy configured in vite.config.ts
const getApiUrl = () => {
  return '/api';
};

const API_URL = getApiUrl();

export const authService = {
  login: async (email: string, password: string): Promise<User> => {
    if (MOCK_MODE) {
      // Simulation for immediate testing without backend
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (email && password.length >= 3) {
            const mockUser: User = { 
                id: '1', 
                name: email.split('@')[0], 
                email: email 
            };
            localStorage.setItem('user', JSON.stringify(mockUser));
            resolve(mockUser);
          } else {
            reject(new Error('Invalid credentials (mock)'));
          }
        }, 800);
      });
    } else {
      // REAL BACKEND CONNECTION (Node/MySQL)
      try {
        const response = await fetch(`${API_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Login failed');
        }
        
        const data = await response.json();
        localStorage.setItem('user', JSON.stringify(data.user));
        return data.user;
      } catch (error) {
        console.error("Auth Error:", error);
        throw error;
      }
    }
  },

  signup: async (name: string, email: string, password: string): Promise<User> => {
    if (MOCK_MODE) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const mockUser: User = { id: Date.now().toString(), name, email };
          localStorage.setItem('user', JSON.stringify(mockUser));
          resolve(mockUser);
        }, 800);
      });
    } else {
       // REAL BACKEND CONNECTION
       try {
        const response = await fetch(`${API_URL}/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Signup failed');
        }

        const data = await response.json();
        localStorage.setItem('user', JSON.stringify(data.user));
        return data.user;
       } catch (error) {
         console.error("Auth Error:", error);
         throw error;
       }
    }
  },

  logout: () => {
    localStorage.removeItem('user');
  },

  getCurrentUser: (): User | null => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  },

  updateAssessment: async (userId: string, ptsdLevel: string): Promise<void> => {
    if (MOCK_MODE) {
       // Mock update
       const stored = localStorage.getItem('user');
       if (stored) {
           const user = JSON.parse(stored);
           user.ptsdLevel = ptsdLevel;
           user.assessmentCompleted = true;
           localStorage.setItem('user', JSON.stringify(user));
       }
       return Promise.resolve();
    } else {
        try {
            const response = await fetch(`${API_URL}/assessment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, ptsdLevel }),
            });
            
            if (!response.ok) {
                throw new Error('Failed to save assessment');
            }

            // Update local user object
            const stored = localStorage.getItem('user');
            if (stored) {
                const user = JSON.parse(stored);
                user.ptsdLevel = ptsdLevel;
                user.assessmentCompleted = true;
                localStorage.setItem('user', JSON.stringify(user));
            }
        } catch (error) {
            console.error("Assessment Save Error:", error);
            throw error;
        }
    }
  }
};