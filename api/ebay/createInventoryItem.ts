import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSession } from '../../lib/session';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getSession(req, res);
    
    if (!session.ebayTokens?.access_token) {
      return res.status(401).json({ error: 'Not authenticated with eBay' });
    }

    const { listingData } = req.body;

    if (!listingData) {
      return res.status(400).json({ error: 'Listing data is required' });
    }

    // Generate a unique SKU for the inventory item
    const sku = `AI-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    // Create inventory item using eBay Inventory API
    const inventoryItemPayload = {
      product: {
        title: listingData.title,
        description: listingData.description,
        aspects: {
          Brand: listingData.brand ? [listingData.brand] : ["Unbranded"],
          Condition: [listingData.condition || "New"],
          MPN: listingData.mpn ? [listingData.mpn] : ["Does Not Apply"]
        },
        imageUrls: listingData.images || []
      },
      condition: mapConditionToEbayInventory(listingData.condition),
      availability: {
        shipToLocationAvailability: {
          quantity: 1
        }
      },
      packageWeightAndSize: {
        dimensions: {
          height: 5,
          length: 10,
          width: 8,
          unit: "INCH"
        },
        packageType: "MAILING_BOX",
        weight: {
          value: 1,
          unit: "POUND"
        }
      }
    };

    // Create inventory item
    const inventoryResponse = await fetch(`https://api.ebay.com/sell/inventory/v1/inventory_item/${sku}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${session.ebayTokens.access_token}`,
        'Content-Type': 'application/json',
        'Content-Language': 'en-US'
      },
      body: JSON.stringify(inventoryItemPayload)
    });

    if (!inventoryResponse.ok) {
      const errorData = await inventoryResponse.text();
      console.error('eBay Inventory API error:', errorData);
      throw new Error(`Failed to create inventory item: ${inventoryResponse.status}`);
    }

    // Create offer for the inventory item
    const offerPayload = {
      sku: sku,
      marketplaceId: "EBAY_US",
      format: "FIXED_PRICE",
      pricingSummary: {
        price: {
          value: parseFloat(listingData.price.replace(/[$,]/g, '')) || 19.99,
          currency: "USD"
        }
      },
      listingDescription: listingData.description,
      categoryId: "175672", // Default category - you might want to map from listingData.category
      merchantLocationKey: "default_location",
      listingPolicies: {
        paymentPolicyId: await getDefaultPaymentPolicy(session.ebayTokens.access_token),
        returnPolicyId: await getDefaultReturnPolicy(session.ebayTokens.access_token),
        fulfillmentPolicyId: await getDefaultFulfillmentPolicy(session.ebayTokens.access_token)
      }
    };

    const offerResponse = await fetch('https://api.ebay.com/sell/inventory/v1/offer', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.ebayTokens.access_token}`,
        'Content-Type': 'application/json',
        'Content-Language': 'en-US'
      },
      body: JSON.stringify(offerPayload)
    });

    if (!offerResponse.ok) {
      const errorData = await offerResponse.text();
      console.error('eBay Offer API error:', errorData);
      throw new Error(`Failed to create offer: ${offerResponse.status}`);
    }

    const offerData = await offerResponse.json();

    // Publish the offer to create active listing
    const publishResponse = await fetch(`https://api.ebay.com/sell/inventory/v1/offer/${offerData.offerId}/publish`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.ebayTokens.access_token}`,
        'Content-Type': 'application/json',
        'Content-Language': 'en-US'
      }
    });

    if (!publishResponse.ok) {
      const errorData = await publishResponse.text();
      console.error('eBay Publish API error:', errorData);
      throw new Error(`Failed to publish listing: ${publishResponse.status}`);
    }

    const publishData = await publishResponse.json();

    return res.status(200).json({
      success: true,
      sku: sku,
      offerId: offerData.offerId,
      listingId: publishData.listingId,
      listingUrl: `https://www.ebay.com/itm/${publishData.listingId}`
    });

  } catch (error) {
    console.error('Error creating eBay inventory item:', error);
    return res.status(500).json({ 
      error: 'Failed to create eBay listing',
      details: error.message 
    });
  }
}

function mapConditionToEbayInventory(condition: string): string {
  const conditionMap: { [key: string]: string } = {
    'New': 'NEW',
    'Used - Excellent': 'LIKE_NEW',
    'Used - Good': 'USED_EXCELLENT',
    'Used - Fair': 'USED_GOOD',
    'For Parts/Not Working': 'FOR_PARTS_OR_NOT_WORKING'
  };
  
  return conditionMap[condition] || 'NEW';
}

async function getDefaultPaymentPolicy(accessToken: string): Promise<string> {
  try {
    const response = await fetch('https://api.ebay.com/sell/account/v1/payment_policy', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Language': 'en-US'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.paymentPolicies?.[0]?.paymentPolicyId || null;
    }
  } catch (error) {
    console.error('Error fetching payment policy:', error);
  }
  return null;
}

async function getDefaultReturnPolicy(accessToken: string): Promise<string> {
  try {
    const response = await fetch('https://api.ebay.com/sell/account/v1/return_policy', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Language': 'en-US'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.returnPolicies?.[0]?.returnPolicyId || null;
    }
  } catch (error) {
    console.error('Error fetching return policy:', error);
  }
  return null;
}

async function getDefaultFulfillmentPolicy(accessToken: string): Promise<string> {
  try {
    const response = await fetch('https://api.ebay.com/sell/account/v1/fulfillment_policy', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Language': 'en-US'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.fulfillmentPolicies?.[0]?.fulfillmentPolicyId || null;
    }
  } catch (error) {
    console.error('Error fetching fulfillment policy:', error);
  }
  return null;
}