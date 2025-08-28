import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSession } from '../../lib/session';
import { supabaseAdmin } from '../../lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getSession(req, res);
    
    if (!session.userId) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Start transaction to delete all user data
    const userId = session.userId;
    
    // 1. Delete all eBay listings for this user
    const { error: listingsError } = await supabaseAdmin
      .from('ebay_listings')
      .delete()
      .eq('user_id', userId);
    
    if (listingsError) {
      console.error('Error deleting user listings:', listingsError);
      return res.status(500).json({ error: 'Failed to delete user listings' });
    }

    // 2. Delete eBay tokens for this user
    const { error: tokensError } = await supabaseAdmin
      .from('ebay_tokens')
      .delete()
      .eq('user_id', userId);
    
    if (tokensError) {
      console.error('Error deleting user tokens:', tokensError);
      return res.status(500).json({ error: 'Failed to delete user tokens' });
    }

    // 3. Delete the user record (this will cascade to related data)
    const { error: userError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userId);
    
    if (userError) {
      console.error('Error deleting user:', userError);
      return res.status(500).json({ error: 'Failed to delete user account' });
    }

    // 4. Clear the session
    session.userId = undefined;
    session.sessionId = undefined;
    session.ebayTokens = undefined;
    session.ebayUser = undefined;
    session.isLoggedIn = false;
    
    await session.destroy();

    // 5. Log the deletion for compliance (optional - remove if you don't want logs)
    console.log(`Account deletion completed for user: ${userId} at ${new Date().toISOString()}`);

    return res.status(200).json({ 
      success: true, 
      message: 'Account and all associated data deleted successfully',
      deletedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Account deletion error:', error);
    return res.status(500).json({ error: 'Failed to delete account' });
  }
}