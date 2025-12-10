import { GoogleGenAI, Modality, HarmCategory, HarmBlockThreshold } from "@google/genai";

// Helper to strip the data URL prefix if present, generic for all image types
const cleanBase64 = (b64: string) => {
  if (b64.includes(';base64,')) {
    return b64.split(';base64,')[1];
  }
  return b64;
};

export const generateImageEdit = async (
  modelName: string,
  prompt: string,
  baseImageBase64: string | null,
  baseImageMimeType: string | null,
  referenceImages: { base64: string; mimeType: string }[] = [],
  apiKey?: string
): Promise<string> => {
  const finalKey = apiKey || process.env.API_KEY;

  if (!finalKey) {
    throw new Error("API Key is missing. Please connect your account or provide a key.");
  }

  const ai = new GoogleGenAI({ apiKey: finalKey });

  const parts: any[] = [];

  // 1. Add the Base Image (Optional)
  if (baseImageBase64 && baseImageMimeType) {
    parts.push({
      inlineData: {
        data: cleanBase64(baseImageBase64),
        mimeType: baseImageMimeType,
      },
    });
  }

  // 2. Add Reference Images (Products, Styles, etc.)
  referenceImages.forEach((ref) => {
    parts.push({
      inlineData: {
        data: cleanBase64(ref.base64),
        mimeType: ref.mimeType,
      },
    });
  });

  // 3. Add the Text Prompt
  parts.push({ text: prompt });

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: parts,
      },
      config: {
        responseModalities: [Modality.IMAGE],
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
          },
        ],
      },
    });

    const candidates = response.candidates;
    
    // Check for success
    if (candidates && candidates.length > 0) {
      const candidate = candidates[0];
      
      // Check for finish reason
      if (candidate.finishReason !== 'STOP' && candidate.finishReason) {
        // If it wasn't a successful stop, it might be a safety block or other issue
        if (candidate.finishReason === 'SAFETY') {
          throw new Error("Generation blocked by Safety Filters. Try a different image (avoid people/faces) or prompt.");
        }
        if (candidate.finishReason === 'RECITATION') {
          throw new Error("Generation blocked due to copyright/recitation concerns.");
        }
      }

      const parts = candidate.content.parts;
      const imagePart = parts.find((p: any) => p.inlineData);

      if (imagePart && imagePart.inlineData) {
        return `data:image/png;base64,${imagePart.inlineData.data}`;
      }
    }

    // Fallback error checking if no candidates
    if (response.promptFeedback && response.promptFeedback.blockReason) {
      throw new Error(`Request blocked: ${response.promptFeedback.blockReason}`);
    }

    throw new Error("No image data returned. The model may have refused the request.");
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    // Pass through the specific error message
    throw new Error(error.message || "Failed to generate image.");
  }
};