import { GoogleGenAI } from "@google/genai";

// In a real production app, never expose API keys on the client.
// For this demo, we use the environment variable.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateProductPitch = async (productName: string, category: string): Promise<string> => {
  try {
    if (!process.env.API_KEY) {
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
    if (!process.env.API_KEY) return "AI Assistant unavailable.";
    
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