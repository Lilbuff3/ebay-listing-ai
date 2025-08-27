import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSession } from '../lib/session';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
  try {
    const session = await getSession(req, res);
    session.destroy();
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('eBay disconnect error:', error);
    return res.status(500).json({ error: 'Failed to disconnect.' });
  }
}