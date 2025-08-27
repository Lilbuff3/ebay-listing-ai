// eBay API utility functions

export interface EbayTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export interface EbayUser {
  username: string;
  email: string;
  registrationAddress: {
    country: string;
  };
}

export class EbayApiClient {
  private accessToken: string;
  private environment: 'sandbox' | 'production';

  constructor(accessToken: string, environment: 'sandbox' | 'production' = 'sandbox') {
    this.accessToken = accessToken;
    this.environment = environment;
  }

  private getBaseUrl(): string {
    return this.environment === 'sandbox' 
      ? 'https://api.sandbox.ebay.com' 
      : 'https://api.ebay.com';
  }

  async makeApiCall(endpoint: string, options: RequestInit = {}) {
    const url = `${this.getBaseUrl()}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`eBay API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getUserProfile() {
    return this.makeApiCall('/commerce/identity/v1/user/');
  }

  async createListing(listingData: any) {
    // Implementation would depend on which eBay API you're using
    // This is a placeholder for the actual listing creation logic
    return this.makeApiCall('/sell/inventory/v1/inventory_item', {
      method: 'POST',
      body: JSON.stringify(listingData),
    });
  }
}

export function refreshAccessToken(refreshToken: string, clientId: string, clientSecret: string) {
  return fetch('https://api.ebay.com/identity/v1/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    })
  });
}