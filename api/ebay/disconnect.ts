import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '../../lib/session';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getIronSession(req, res, sessionOptions);
    
    // Clear eBay tokens from session
    session.ebayTokens = undefined;
    session.ebayUser = undefined;
    
    await session.save();

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error disconnecting from eBay:', error);
    res.status(500).json({ error: 'Failed to disconnect from eBay' });
  }
}