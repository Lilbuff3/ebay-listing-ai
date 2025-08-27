import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const clientId = process.env.EBAY_CLIENT_ID;
  const redirectUri = process.env.EBAY_REDIRECT_URI;
  const scope = 'https://api.ebay.com/oauth/api_scope https://api.ebay.com/oauth/api_scope/sell.inventory';

  if (!clientId || !redirectUri) {
    return res.status(500).json({ error: 'eBay environment variables not configured.' });
  }

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    scope: scope,
    prompt: 'login',
  });

  // Use sandbox for development, otherwise use the production URL
  const authUrl = `https://auth.sandbox.ebay.com/oauth2/authorize?${params.toString()}`;

  return res.status(200).json({ authUrl });
}