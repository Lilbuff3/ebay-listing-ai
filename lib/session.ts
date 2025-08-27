import type { SessionOptions } from 'iron-session';
import type { EbayTokens, EbayUser } from './ebay';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getIronSession } from 'iron-session';

export interface SessionData {
  ebayTokens?: EbayTokens;
  ebayUser?: EbayUser;
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long',
  cookieName: 'ebay-listing-ai-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: 'lax',
  },
};

export async function getSession(req: VercelRequest, res: VercelResponse) {
  return await getIronSession<SessionData>(req, res, sessionOptions);
}

declare module 'iron-session' {
  interface IronSessionData extends SessionData {}
}