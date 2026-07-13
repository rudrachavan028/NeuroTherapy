
import { GoogleGenAI, Type } from "@google/genai";
import { ColorTheme, AIAnalysisResult } from "../types";

let genAI: GoogleGenAI | null = null;

try {
  if (process.env.API_KEY) {
    genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
} catch (error) {
  console.error("Failed to initialize Gemini API client:", error);
}

// Generate a full game level based on a mood
export const generateColorPalette = async (mood: string): Promise<{ title: string, description: string, colors: ColorTheme[] }> => {
  if (!genAI) {
    return {
      title: "Classic Mode",
      description: "Gemini key missing. Enjoy standard colors.",
      colors: [] 
    };
  }

  try {
    const response = await genAI.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Mood: "${mood}"`,
      config: {
        systemInstruction: `Generate a distinct color palette for a color-matching game based on the provided mood.
1. Return 4 to 6 colors.
2. Colors must be visually distinct from each other (high contrast).
3. Include a short psychological description of why this palette fits the mood.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            paletteTitle: { type: Type.STRING },
            psychologyDescription: { type: Type.STRING },
            colors: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  hex: { type: Type.STRING, description: "Hex code e.g. #FF0000" },
                  meaning: { type: Type.STRING, description: "Very short meaning of this specific color" }
                },
                required: ["name", "hex", "meaning"]
              }
            }
          },
          required: ["paletteTitle", "psychologyDescription", "colors"]
        }
      }
    });

    const json = JSON.parse(response.text || '{}');
    
    const themes: ColorTheme[] = json.colors.map((c: any, index: number) => ({
      id: `ai-${index}-${Date.now()}`,
      name: c.name,
      hex: c.hex,
      psychology: c.meaning,
      bgClass: 'bg-gray-500', 
      textClass: 'text-gray-800',
      borderClass: 'border-gray-500'
    }));

    return {
      title: json.paletteTitle,
      description: json.psychologyDescription,
      colors: themes
    };

  } catch (error) {
    console.error("Gemini Palette Error:", error);
    return {
      title: "Connection Error",
      description: "Could not reach AI. Playing classic mode.",
      colors: []
    };
  }
};

export const getEncouragement = async (colorsUsed: string[]): Promise<string> => {
  if (!genAI) {
    return "You're doing amazing! Keep shining bright!";
  }

  const colorNames = colorsUsed.join(", ");
  
  try {
    const response = await genAI.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Colors used: ${colorNames}`,
      config: {
        systemInstruction: `Generate a very short, cheerful, and mood-boosting compliment for a player who just finished a color matching game level using the provided colors. Keep it under 20 words. Focus on the positive psychology of these colors if possible.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            message: {
              type: Type.STRING,
            }
          }
        }
      }
    });

    const json = JSON.parse(response.text || '{}');
    return json.message || "Your colors bring joy to the world!";
  } catch (error) {
    console.error("Gemini API error:", error);
    return "You matched them perfectly! What a great eye for color.";
  }
};

export const getAIProgressAnalysis = async (history: any[]): Promise<AIAnalysisResult> => {
  if (!genAI || history.length === 0) {
    // Fallback Mock Data
    return {
      summary: "Welcome to your Neuro Journey! Play more games to unlock personalized AI insights.",
      moodAnalysis: "Neutral - Awaiting Data",
      strengths: ["Curiosity"],
      weaknesses: ["Consistency"],
      recommendations: ["breathing", "color-match", "zen-v1"],
      cognitiveScores: { memory: 50, focus: 50, calm: 50, agility: 50, creativity: 50 },
      brainBattery: 80
    };
  }

  // Pre-process history to reduce token count and format for AI
  const recentHistory = history.slice(0, 40).map(h => ({
      game: h.game_id,
      lvl: h.level,
      score: h.score,
      rt: h.reaction_time, // reaction time
      acc: h.accuracy, // accuracy
      date: h.played_at
  }));

  try {
    const response = await genAI.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: JSON.stringify(recentHistory),
      config: {
        systemInstruction: `Act as an expert Neuro-Therapist and Data Scientist. Analyze this gameplay history for a patient using a Neuro-Therapy app.

Game Context:
- Memory/Sequence/Odd-One: Cognitive Memory & Pattern Recognition
- Breathing/Zen/Music: Relaxation, Anxiety Relief, Emotional Regulation
- Color/Emoji/Art/Bubble: Emotional Expression, Mood Boosting
- Maze/Dot/Counting: Focus, Attention, Spatial Reasoning

Generate a comprehensive analysis in JSON:
1. 'summary': A warm, encouraging paragraph (approx 30-40 words) summarizing their progress.
2. 'moodAnalysis': Infer their current mental state (e.g., "Highly Focused", "Signs of Fatigue", "Calm and Balanced") based on performance consistency and game choices.
3. 'strengths': Array of 3 specific cognitive/emotional strengths shown in the data.
4. 'weaknesses': Array of 2 areas to improve (be gentle).
5. 'recommendations': Array of 3 specific game IDs to play next based on their needs.
6. 'cognitiveScores': Object with integer scores (0-100) for 'memory', 'focus', 'calm', 'agility', 'creativity'. Infer these scores based on accuracy/reaction time in relevant games.
7. 'brainBattery': An integer (0-100) estimating their current mental energy level based on recent performance trends.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            moodAnalysis: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            cognitiveScores: {
              type: Type.OBJECT,
              properties: {
                memory: { type: Type.INTEGER },
                focus: { type: Type.INTEGER },
                calm: { type: Type.INTEGER },
                agility: { type: Type.INTEGER },
                creativity: { type: Type.INTEGER },
              },
              required: ["memory", "focus", "calm", "agility", "creativity"]
            },
            brainBattery: { type: Type.INTEGER }
          },
          required: ["summary", "moodAnalysis", "strengths", "weaknesses", "recommendations", "cognitiveScores", "brainBattery"]
        }
      }
    });

    const json = JSON.parse(response.text || '{}');
    return {
      summary: json.summary || "You are making excellent progress!",
      moodAnalysis: json.moodAnalysis || "Balanced",
      strengths: json.strengths || ["Resilience"],
      weaknesses: json.weaknesses || ["Practice"],
      recommendations: json.recommendations || ["breathing"],
      cognitiveScores: json.cognitiveScores || { memory: 60, focus: 60, calm: 60, agility: 60, creativity: 60 },
      brainBattery: json.brainBattery || 75
    };
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      summary: "Our AI is currently recalibrating. Continue your exercises to generate more data!",
      moodAnalysis: "Calibrating...", 
      strengths: ["Persistence"],
      weaknesses: [],
      recommendations: ["breathing", "zen-v1"],
      cognitiveScores: { memory: 50, focus: 50, calm: 50, agility: 50, creativity: 50 },
      brainBattery: 50
    };
  }
};
