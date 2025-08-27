import { EbaySessionData } from './session';

// Use the sandbox URL for development/testing
// For production, change to: https://api.ebay.com
const EBAY_API_URL = 'https://api.sandbox.ebay.com';

export async function getAccessToken(code: string): Promise<EbaySessionData> {
  const clientId = process.env.EBAY_CLIENT_ID;
  const clientSecret = process.env.EBAY_CLIENT_SECRET;
  const redirectUri = process.env.EBAY_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('eBay environment variables not configured.');
  }

  const credentials = btoa(`${clientId}:${clientSecret}`);

  const body = new URLSearchParams();
  body.append('grant_type', 'authorization_code');
  body.append('code', code);
  body.append('redirect_uri', redirectUri);

  const response = await fetch(`${EBAY_API_URL}/identity/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${credentials}`,
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('eBay token exchange failed:', errorBody);
    throw new Error(`Failed to exchange authorization code. Status: ${response.status}`);
  }

  const data = await response.json();

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    // expires_in is in seconds, convert to timestamp
    expiresAt: Date.now() + data.expires_in * 1000,
  };
}
