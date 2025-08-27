import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSession } from '../lib/session';
import { getAccessToken } from '../lib/ebay';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { code } = req.body;

  if (typeof code !== 'string') {
    return res.status(400).json({ error: 'Authorization code is missing.' });
  }

  try {
    const session = await getSession(req, res);
    const tokenData = await getAccessToken(code);

    session.accessToken = tokenData.accessToken;
    session.refreshToken = tokenData.refreshToken;
    session.expiresAt = tokenData.expiresAt;
    
    await session.save();

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('eBay callback error:', error);
    return res.status(500).json({ error: 'Failed to authenticate with eBay.', details: error.message });
  }
}