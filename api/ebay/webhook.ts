import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../../lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    // eBay webhook verification challenge
    const { challenge_code } = req.query;
    const verificationToken = process.env.EBAY_VERIFICATION_TOKEN || '';
    
    if (!verificationToken) {
      return res.status(500).json({ error: 'Verification token not configured' });
    }
    
    // eBay sends a challenge_code that we need to hash and return
    const crypto = require('crypto');
    const hash = crypto
      .createHash('sha256')
      .update(challenge_code + verificationToken + req.url)
      .digest('hex');
      
    return res.status(200).json({
      challengeResponse: hash
    });
  }
  
  if (req.method === 'POST') {
    // Handle eBay notifications (marketplace account deletion, etc.)
    try {
      const notification = req.body;
      
      // Log the notification for debugging
      console.log('eBay Notification received:', JSON.stringify(notification, null, 2));
      
      // Handle different notification types
      switch (notification.notificationEventType) {
        case 'MARKETPLACE_ACCOUNT_DELETION':
          await handleAccountDeletion(notification);
          break;
          
        case 'AUTHORIZATION_REVOKED':
          await handleAuthRevocation(notification);
          break;
          
        default:
          console.log('Unknown notification type:', notification.notificationEventType);
      }
      
      return res.status(200).json({ success: true });
      
    } catch (error) {
      console.error('Webhook processing error:', error);
      return res.status(500).json({ error: 'Failed to process notification' });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}

async function handleAccountDeletion(notification: any) {
  try {
    const userId = notification.userId;
    
    if (!userId) {
      console.error('No userId in account deletion notification');
      return;
    }
    
    // Find user by eBay user ID
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('ebay_user_id', userId)
      .single();
      
    if (!user) {
      console.log('User not found for eBay account deletion:', userId);
      return;
    }
    
    // Delete all user data (cascading)
    await supabaseAdmin.from('users').delete().eq('id', user.id);
    
    console.log(`Account deleted for eBay user ${userId} due to marketplace account deletion`);
    
  } catch (error) {
    console.error('Error handling account deletion notification:', error);
  }
}

async function handleAuthRevocation(notification: any) {
  try {
    const userId = notification.userId;
    
    if (!userId) {
      console.error('No userId in auth revocation notification');
      return;
    }
    
    // Find and delete eBay tokens for this user
    const { error } = await supabaseAdmin
      .from('ebay_tokens')
      .delete()
      .eq('user_id', userId);
      
    if (error) {
      console.error('Error deleting tokens after auth revocation:', error);
    } else {
      console.log(`eBay tokens deleted for user ${userId} due to authorization revocation`);
    }
    
  } catch (error) {
    console.error('Error handling auth revocation notification:', error);
  }
}