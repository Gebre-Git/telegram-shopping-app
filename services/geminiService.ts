
import { GoogleGenAI } from "@google/genai";

// Initialize lazily to prevent errors if process.env is missing at startup
const getAiClient = () => {
  try {
    // Safely check for process.env.API_KEY
    // Ensure checking strictly for existence and string type to prevent "Invalid URL" errors in SDK
    const apiKey = (typeof process !== 'undefined' && process && process.env && process.env.API_KEY) ? process.env.API_KEY : null;
    
    // Explicitly check for empty string or invalid type which causes constructor failure
    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') {
      return null;
    }
    
    return new GoogleGenAI({ apiKey });
  } catch (error) {
    console.error("Failed to initialize Gemini Client:", error);
    return null;
  }
};

export const generateProductPitch = async (productName: string, category: string): Promise<string> => {
  try {
    const ai = getAiClient();
    
    if (!ai) {
      return "AI features require an API Key. Please configure your environment.";
    }

    const model = 'gemini-2.5-flash';
    const prompt = `You are a high-end fashion sales assistant. Write a short, punchy, and modern 2-sentence sales pitch for a "${productName}" in the category "${category}". Focus on lifestyle and vibe.`;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "Experience luxury and style with this exclusive item.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Discover the perfect addition to your collection.";
  }
};

export const generateStylingAdvice = async (productName: string): Promise<string> => {
  try {
    const ai = getAiClient();
    if (!ai) return "AI Assistant unavailable.";
    
    const model = 'gemini-2.5-flash';
    const prompt = `Suggest 3 matching items or colors to wear with a "${productName}". Keep it bulleted and concise.`;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "Matches well with neutrals and denim.";
  } catch (error) {
    return "Consult our lookbook for styling tips.";
  }
};
