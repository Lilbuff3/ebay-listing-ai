import { EbayListing } from '../types';

export const getEbayAuthUrl = async (): Promise<string> => {
    const response = await fetch('/api/ebay/authUrl');
    if (!response.ok) throw new Error('Failed to get eBay auth URL.');
    const data = await response.json();
    return data.authUrl;
};

export const exchangeCodeForToken = async (code: string): Promise<{ success: boolean }> => {
    const response = await fetch('/api/ebay/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
    });
    if (!response.ok) throw new Error('Failed to exchange code for token.');
    return response.json();
};

export const checkEbayConnection = async (): Promise<boolean> => {
    const response = await fetch('/api/ebay/user');
    if (!response.ok) return false;
    const data = await response.json();
    return data.isConnected;
};

export const disconnectFromEbay = async (): Promise<void> => {
    await fetch('/api/ebay/disconnect', { method: 'POST' });
};

export const postListingToEbay = async (listing: EbayListing, images: File[]): Promise<{ success: boolean, itemId: string, itemUrl: string }> => {
    // In a real app, you'd upload files and get back URLs first.
    // For this mock, we send placeholder data.
    const imageInfo = images.map(img => ({ name: img.name, type: img.type }));

    const response = await fetch('/api/ebay/postListing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing, images: imageInfo }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to post listing to eBay.');
    }

    return response.json();
}
