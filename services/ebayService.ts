// This is a client-side service placeholder
// The actual eBay API calls are handled by the backend API routes

export async function getEbayAuthUrl(): Promise<string> {
  const response = await fetch('/api/ebay/authUrl');
  if (!response.ok) {
    throw new Error('Failed to get eBay auth URL');
  }
  const data = await response.json();
  return data.authUrl;
}

export async function getEbayUser() {
  const response = await fetch('/api/ebay/user');
  if (!response.ok) {
    throw new Error('Failed to get eBay user info');
  }
  return await response.json();
}

export async function disconnectEbay(): Promise<void> {
  const response = await fetch('/api/ebay/disconnect', {
    method: 'POST'
  });
  if (!response.ok) {
    throw new Error('Failed to disconnect from eBay');
  }
}

export async function postListingToEbay(listingData: any): Promise<any> {
  const response = await fetch('/api/ebay/postListing', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(listingData),
  });
  
  if (!response.ok) {
    throw new Error('Failed to post listing to eBay');
  }
  
  return await response.json();
}