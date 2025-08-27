import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSession } from '../../lib/session';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getSession(req, res);
    
    // Clear eBay tokens from session
    session.ebayTokens = undefined;
    session.ebayUser = undefined;
    
    await session.save();

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error disconnecting from eBay:', error);
    return res.status(500).json({ error: 'Failed to disconnect from eBay' });
  }
}