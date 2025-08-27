import type { EbayListing } from '../types';

export const generateEbayListing = async (
  imageParts: { mimeType: string; data: string }[],
  personalNote: string
): Promise<EbayListing> => {
  try {
    const response = await fetch('/api/generateListing', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageParts, personalNote }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate listing from backend.');
    }

    const listingData = await response.json();

    // Basic validation
    if (!listingData.title || !listingData.category || !Array.isArray(listingData.category) || listingData.category.length === 0 || !listingData.itemSpecifics || !listingData.description) {
      throw new Error("Received malformed data from the backend.");
    }

    return listingData as EbayListing;

  } catch (error) {
    console.error("Backend API call failed:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate listing. Please check the console. Details: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating the listing.");
  }
};
