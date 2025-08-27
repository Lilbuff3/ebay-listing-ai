import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSession } from '../../lib/session';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getSession(req, res);
    
    if (!session.ebayTokens?.access_token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Check if we already have user info cached
    if (session.ebayUser) {
      return res.status(200).json(session.ebayUser);
    }

    // Fetch user info from eBay API
    const userResponse = await fetch('https://api.ebay.com/commerce/identity/v1/user/', {
      headers: {
        'Authorization': `Bearer ${session.ebayTokens.access_token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!userResponse.ok) {
      throw new Error('Failed to fetch user info');
    }

    const userData = await userResponse.json();
    
    // Cache user info in session
    session.ebayUser = {
      username: userData.username,
      email: userData.email,
      registrationAddress: userData.registrationAddress
    };

    await session.save();

    return res.status(200).json(session.ebayUser);
  } catch (error) {
    console.error('Error fetching eBay user info:', error);
    return res.status(500).json({ error: 'Failed to fetch user info' });
  }
}