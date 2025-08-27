import { getIronSession, IronSession, SessionOptions } from 'iron-session';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export interface EbaySessionData {
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
}

const sessionOptions: SessionOptions = {
  cookieName: 'ebay-listing-ai-session',
  password: process.env.SESSION_SECRET as string,
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
  },
};

export function getSession(req: VercelRequest, res: VercelResponse): Promise<IronSession<EbaySessionData>> {
  return getIronSession<EbaySessionData>(req, res, sessionOptions);
}