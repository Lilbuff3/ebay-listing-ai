import type { SessionOptions } from 'iron-session';
import type { EbayTokens, EbayUser } from './ebay';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getIronSession } from 'iron-session';
import { supabaseAdmin, getUserBySession, getEbayTokensForUser, saveEbayTokens } from './supabase';

export interface SessionData {
  userId?: string;
  sessionId?: string;
  ebayTokens?: EbayTokens;
  ebayUser?: EbayUser;
  isLoggedIn?: boolean;
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
  const session = await getIronSession<SessionData>(req, res, sessionOptions);
  
  // Initialize user in database if not exists
  if (!session.userId) {
    const sessionId = generateSessionId();
    
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .insert({
        session_id: sessionId,
      })
      .select()
      .single();
      
    if (!error && user) {
      session.userId = user.id;
      session.sessionId = sessionId;
      session.isLoggedIn = true;
      await session.save();
    }
  }
  
  // Load eBay tokens from database if user exists
  if (session.userId) {
    const ebayTokens = await getEbayTokensForUser(session.userId);
    if (ebayTokens && new Date(ebayTokens.expires_at) > new Date()) {
      session.ebayTokens = {
        access_token: ebayTokens.access_token,
        refresh_token: ebayTokens.refresh_token,
        expires_in: Math.floor((new Date(ebayTokens.expires_at).getTime() - Date.now()) / 1000),
        token_type: ebayTokens.token_type
      };
    }
  }
  
  return session;
}

export async function saveTokensToDatabase(userId: string, tokenData: EbayTokens): Promise<boolean> {
  return await saveEbayTokens(userId, tokenData);
}

export async function updateUserEbayProfile(userId: string, ebayUserData: EbayUser): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('users')
    .update({
      ebay_username: ebayUserData.username,
      ebay_registration_address: ebayUserData.registrationAddress,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);
    
  return !error;
}

function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

declare module 'iron-session' {
  interface IronSessionData extends SessionData {}
}