import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

// Server-side client with service role key (for API routes)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Client-side client with anon key (for frontend)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface User {
  id: string;
  email: string;
  ebay_user_id?: string;
  ebay_username?: string;
  created_at: string;
  updated_at: string;
}

export interface EbayToken {
  id: string;
  user_id: string;
  access_token: string;
  refresh_token: string;
  expires_at: string;
  token_type: string;
  scopes: string;
  created_at: string;
  updated_at: string;
}

// Helper functions
export async function getUserBySession(sessionId: string): Promise<User | null> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('session_id', sessionId)
    .single();
    
  if (error) return null;
  return data;
}

export async function getEbayTokensForUser(userId: string): Promise<EbayToken | null> {
  const { data, error } = await supabaseAdmin
    .from('ebay_tokens')
    .select('*')
    .eq('user_id', userId)
    .single();
    
  if (error) return null;
  return data;
}

export async function saveEbayTokens(userId: string, tokenData: any): Promise<boolean> {
  const expiresAt = new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString();
  
  const { error } = await supabaseAdmin
    .from('ebay_tokens')
    .upsert({
      user_id: userId,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: expiresAt,
      token_type: tokenData.token_type,
      scopes: tokenData.scope || 'default_scopes',
      updated_at: new Date().toISOString()
    });
    
  return !error;
}