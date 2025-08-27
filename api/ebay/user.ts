import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSession } from '../lib/session';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const session = await getSession(req, res);
  
  const isConnected = !!session.accessToken && (session.expiresAt || 0) > Date.now();

  return res.status(200).json({ isConnected });
}