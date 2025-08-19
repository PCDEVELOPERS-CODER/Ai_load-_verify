import { GoogleGenAI, Type } from "@google/genai";
import type { VerificationResult } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
        if (typeof reader.result === 'string') {
            resolve(reader.result.split(',')[1]);
        } else {
            resolve('');
        }
    };
    reader.readAsDataURL(file);
  });
  
  const base64EncodedData = await base64EncodedDataPromise;
  
  return {
    inlineData: {
      data: base64EncodedData,
      mimeType: file.type,
    },
  };
};

const verificationSchema = {
  type: Type.OBJECT,
  properties: {
    vehiclePlateVisible: {
      type: Type.BOOLEAN,
      description: "Is there a clear photo of the vehicle with its registration plate visible?",
    },
    goodsBeingUnloaded: {
      type: Type.BOOLEAN,
      description: "Is there a photo showing the goods actively being unloaded (e.g., truck bed tilted and material pouring out)?",
    },
    vehicleFullyLoaded: {
      type: Type.BOOLEAN,
      description: "Is there a photo showing the vehicle's tub/bed full of goods before unloading?",
    },
    vehicleEmpty: {
      type: Type.BOOLEAN,
      description: "Is there a photo confirming the vehicle is empty after unloading (e.g., an empty tub or the tub in a fully upright/tilted position)?",
    },
    receiptMemoPresent: {
      type: Type.BOOLEAN,
      description: "Is a 'RECEIPT MEMO' document present in the images?",
    },
    invoicePresent: {
      type: Type.BOOLEAN,
      description: "Is a 'Tax Invoice' or a similar dealer's sale document present in the images?",
    },
    summary: {
      type: Type.STRING,
      description: "A brief, one-sentence summary of the overall verification status.",
    },
  },
  required: [
    "vehiclePlateVisible",
    "goodsBeingUnloaded",
    "vehicleFullyLoaded",
    "vehicleEmpty",
    "receiptMemoPresent",
    "invoicePresent",
    "summary",
  ],
};


export const analyzeDeliveryImages = async (images: File[]): Promise<VerificationResult> => {
  if (images.length === 0) {
    throw new Error("No images provided for analysis.");
  }

  const imageParts = await Promise.all(images.map(fileToGenerativePart));

  const prompt = `
    You are an AI assistant for a logistics company. Your task is to analyze the provided set of images for a single goods delivery and verify if they meet all the required criteria.
    Based on the images, evaluate each of the following conditions and provide a boolean response according to the provided schema.

    A critical rule for the 'vehicleEmpty' property: A photo of the truck's tub/dumper in a fully upright or tilted position is SUFFICIENT PROOF that the vehicle has been completely unloaded and is now empty. You do not need to see the inside of the tub if it's raised.

    Also provide a brief summary of your findings.
  `;

  const contents = {
      parts: [
          ...imageParts,
          { text: prompt },
      ]
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: verificationSchema,
      },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as VerificationResult;

  } catch (error) {
    console.error("Error analyzing images with Gemini:", error);
    throw new Error("Failed to analyze images. The AI model could not process the request.");
  }
};