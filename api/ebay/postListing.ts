import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSession } from '../lib/session';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  
  const session = await getSession(req, res);

  if (!session.accessToken || (session.expiresAt || 0) <= Date.now()) {
    return res.status(401).json({ error: 'Not authenticated or token expired.' });
  }

  const { listing, images } = req.body;

  // MOCKED API CALL
  console.log("Mocking post to eBay with listing:", listing);
  console.log("Access Token:", session.accessToken.substring(0, 15) + "...");

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // In a real implementation:
  // 1. Upload images to eBay's Image Service.
  // 2. Create the listing using the Inventory API, including the image URLs.
  
  // Return a mocked success response
  const mockEbayItemId = `110${Math.floor(100000000 + Math.random() * 900000000)}`;
  return res.status(200).json({
    success: true,
    itemId: mockEbayItemId,
    itemUrl: `https://www.sandbox.ebay.com/itm/${mockEbayItemId}`
  });
}