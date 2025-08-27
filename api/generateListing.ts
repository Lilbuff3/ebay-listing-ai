import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';
import formidable from 'formidable';
import fs from 'fs';

const genAI = new GoogleGenerativeAI(process.env.API_KEY || '');

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({ multiples: true });
    
    const [fields, files] = await form.parse(req);
    
    const imageFiles = Object.values(files).flat().filter(Boolean);
    
    if (!imageFiles.length) {
      return res.status(400).json({ error: 'No images provided' });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Convert files to parts for Gemini
    const imageParts = await Promise.all(
      imageFiles.map(async (file: any) => {
        const imageBuffer = fs.readFileSync(file.filepath);
        return {
          inlineData: {
            data: imageBuffer.toString('base64'),
            mimeType: file.mimetype,
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

    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }
    
    const listingData = JSON.parse(jsonMatch[0]);

    // Clean up temporary files
    imageFiles.forEach((file: any) => {
      try {
        fs.unlinkSync(file.filepath);
      } catch (err) {
        console.error('Error cleaning up file:', err);
      }
    });

    res.status(200).json(listingData);
  } catch (error) {
    console.error('Error generating listing:', error);
    res.status(500).json({ error: 'Failed to generate listing' });
  }
}