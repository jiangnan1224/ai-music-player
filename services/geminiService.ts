import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY || ''; // Ensure this is set in your environment

let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

export const getMusicRecommendation = async (mood: string): Promise<{ song: string, artist: string, reason: string }> => {
  if (!ai) {
    console.warn("Gemini API Key missing");
    return { song: "Happy", artist: "Pharrell Williams", reason: "API Key missing, defaulting to a happy song." };
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Recommend a popular song for a user who is feeling: "${mood}". Return JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            song: { type: Type.STRING },
            artist: { type: Type.STRING },
            reason: { type: Type.STRING }
          },
          required: ["song", "artist", "reason"]
        }
      }
    });
    
    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return { song: "Bohemian Rhapsody", artist: "Queen", reason: "AI currently unavailable, enjoy a classic." };
  }
};