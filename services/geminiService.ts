import { GoogleGenerativeAI } from '@google/genai';
import type { ListingData } from '../types';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

export async function analyzeImagesForListing(imageFiles: File[]): Promise<ListingData> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // Convert files to parts for Gemini
  const imageParts = await Promise.all(
    imageFiles.map(async (file) => {
      const arrayBuffer = await file.arrayBuffer();
      return {
        inlineData: {
          data: btoa(String.fromCharCode(...new Uint8Array(arrayBuffer))),
          mimeType: file.type,
        },
      };
    })
  );

  const prompt = `
    Analyze the provided product image(s) and generate a comprehensive eBay listing with the following information:

    1. TITLE: Create an SEO-optimized title (80 characters max) including brand, model, key features, and condition
    2. DESCRIPTION: Write a detailed product description (500-800 words) including:
       - Product overview and key features
       - Condition details (note any wear, damage, or defects)
       - Dimensions/specifications if visible
       - What's included in the sale
       - Shipping and return information
    3. CATEGORY: Suggest the most appropriate eBay category
    4. CONDITION: Determine condition (New, Used - Excellent, Used - Good, Used - Fair, For Parts/Not Working)
    5. PRICE: Suggest a competitive price range in USD
    6. SHIPPING: Estimate shipping cost
    7. LOCATION: Suggest item location (city, state)
    8. KEYWORDS: List 10-15 relevant search keywords

    Please respond in valid JSON format with this exact structure:
    {
      "title": "string",
      "description": "string",
      "category": "string",
      "condition": "string",
      "price": "string",
      "shippingCost": "string", 
      "itemLocation": "string",
      "keywords": ["string array"]
    }

    Be specific and accurate based on what you can see in the image(s).
  `;

  try {
    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }
    
    const listingData = JSON.parse(jsonMatch[0]);
    return listingData;
  } catch (error) {
    console.error('Error analyzing images:', error);
    throw new Error('Failed to analyze images and generate listing');
  }
}