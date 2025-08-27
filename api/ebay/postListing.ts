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

    const listingData = req.body;

    // Create eBay listing using Trading API
    const listingPayload = {
      Item: {
        Title: listingData.title,
        Description: listingData.description,
        PrimaryCategory: {
          CategoryID: "175672" // Default category - should be mapped from listingData.category
        },
        StartPrice: parseFloat(listingData.price.replace('$', '')),
        CategoryMappingAllowed: true,
        ConditionID: mapConditionToEbayID(listingData.condition),
        Country: "US",
        Currency: "USD",
        DispatchTimeMax: 3,
        ListingDuration: "Days_7",
        ListingType: "FixedPriceItem",
        PaymentMethods: ["PayPal"],
        PayPalEmailAddress: "seller@example.com", // Should come from user profile
        Quantity: 1,
        ReturnPolicy: {
          ReturnsAcceptedOption: "ReturnsAccepted",
          RefundOption: "MoneyBack",
          ReturnsWithinOption: "Days_30",
          ShippingCostPaidByOption: "Buyer"
        },
        ShippingDetails: {
          ShippingType: "Flat",
          ShippingServiceOptions: {
            ShippingServicePriority: 1,
            ShippingService: "UPSGround",
            ShippingServiceCost: parseFloat(listingData.shippingCost.replace('$', ''))
          }
        },
        Site: "US"
      }
    };

    // This is a simplified example - you'll need to implement the actual eBay API call
    // For now, we'll return a mock response
    const mockItemId = `${Date.now()}${Math.random().toString(36).substr(2, 9)}`;

    res.status(200).json({
      success: true,
      itemId: mockItemId,
      listingUrl: `https://www.ebay.com/itm/${mockItemId}`
    });

  } catch (error) {
    console.error('Error posting to eBay:', error);
    res.status(500).json({ error: 'Failed to post listing to eBay' });
  }
}

function mapConditionToEbayID(condition: string): number {
  const conditionMap: { [key: string]: number } = {
    'New': 1000,
    'Used - Excellent': 4000,
    'Used - Good': 3000,
    'Used - Fair': 2500,
    'For Parts/Not Working': 7000
  };
  
  return conditionMap[condition] || 3000; // Default to Used - Good
}