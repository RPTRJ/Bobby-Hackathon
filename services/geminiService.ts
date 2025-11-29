import { GoogleGenAI, Type } from "@google/genai";
import { RepairGuide } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Analyze an image frame to detect machine issues
export const analyzeMachineFrame = async (base64Image: string): Promise<{
  hasIssue: boolean;
  description: string;
  partsRequired: string[];
  costSelf: number;
  costOutsourced: number;
}> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image,
            },
          },
          {
            text: `Analyze this image as if it were an industrial machine component. 
            Identify any potential maintenance issues (wear, rust, leak, overheating, loose wiring, or vibration/blur).
            If the image looks normal but I asked for a simulation, invent a plausible minor maintenance issue for demonstration purposes (e.g., "Minor hydraulic seal leak detected" or "Belt tension low").
            
            Return a JSON object with:
            - hasIssue: boolean
            - description: short description of the problem
            - partsRequired: array of strings (e.g. "O-ring", "Bearing")
            - costSelf: estimated material cost in THB (Number only)
            - costOutsourced: estimated total cost if hiring a pro in THB (Number only)
            `,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hasIssue: { type: Type.BOOLEAN },
            description: { type: Type.STRING },
            partsRequired: { type: Type.ARRAY, items: { type: Type.STRING } },
            costSelf: { type: Type.NUMBER },
            costOutsourced: { type: Type.NUMBER },
          },
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error("No response from AI");
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Fallback mock data if API fails or quota exceeded
    return {
      hasIssue: true,
      description: "Visual anomaly detected: Surface corrosion on main housing (Simulated)",
      partsRequired: ["Anti-rust coating", "Sandpaper"],
      costSelf: 450,
      costOutsourced: 1500,
    };
  }
};

// Generate a repair guide based on the issue description
export const generateRepairGuide = async (issueDescription: string, machineModel: string): Promise<RepairGuide> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Provide a step-by-step repair guide for a "${machineModel}" having the following issue: "${issueDescription}".
      Return JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            steps: { type: Type.ARRAY, items: { type: Type.STRING } },
            tools: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error("No guide generated");
  } catch (error) {
    return {
      steps: ["Isolate power source.", "Remove protective cover.", "Inspect damaged area.", "Replace component.", "Test machine."],
      tools: ["Wrench Set", "Screwdriver", "Multimeter"]
    };
  }
};