import type { VercelRequest, VercelResponse } from '@vercel/node';
import { gunzipSync } from 'zlib';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { oshToken } = req.body;
    
    if (!oshToken) {
      return res.status(400).json({ error: 'OSH token is required' });
    }

    // Parse the OSH token format: v^1.1#i^1#f^0#p^3#I^3#r^0#t^[base64_compressed_data]
    const decoded = decodeOshToken(oshToken);
    
    if (!decoded.success) {
      return res.status(400).json({
        success: false,
        error: decoded.error,
        format: 'Expected format: v^1.1#i^1#f^0#p^3#I^3#r^0#t^[compressed_data]'
      });
    }

    // Test the extracted access token
    const testResult = await testAccessToken(decoded.accessToken);

    return res.status(200).json({
      success: true,
      tokenInfo: {
        version: decoded.version,
        format: decoded.format,
        permissions: decoded.permissions,
        accessToken: decoded.accessToken.substring(0, 20) + '...',
        fullAccessToken: decoded.accessToken
      },
      testResult: testResult
    });

  } catch (error) {
    console.error('OSH token decode error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to decode OSH token',
      details: error.message 
    });
  }
}

function decodeOshToken(oshToken: string) {
  try {
    // Parse the OSH token components
    const parts = oshToken.split('#');
    
    if (parts.length < 7) {
      return { success: false, error: 'Invalid OSH token format - not enough parts' };
    }

    const version = parts[0]; // v^1.1
    const inventory = parts[1]; // i^1  
    const format = parts[2]; // f^0
    const permissions = parts[3]; // p^3
    const additional = parts[4]; // I^3
    const refresh = parts[5]; // r^0
    const tokenPart = parts[6]; // t^[compressed_data]

    if (!tokenPart.startsWith('t^')) {
      return { success: false, error: 'Token part missing or malformed' };
    }

    // Extract the compressed data after 't^'
    const compressedData = tokenPart.substring(2);
    
    // Convert base64 to buffer
    const compressedBuffer = Buffer.from(compressedData, 'base64');
    
    // Decompress using gzip
    const decompressed = gunzipSync(compressedBuffer);
    const decompressedText = decompressed.toString('utf8');
    
    // Parse the JSON inside
    const tokenData = JSON.parse(decompressedText);
    
    return {
      success: true,
      version: version,
      format: format,
      permissions: permissions,
      accessToken: tokenData.access_token || tokenData.token || tokenData,
      tokenData: tokenData
    };

  } catch (error) {
    return { 
      success: false, 
      error: `Failed to decode OSH token: ${error.message}` 
    };
  }
}

async function testAccessToken(accessToken: string) {
  try {
    const response = await fetch('https://api.ebay.com/sell/inventory/v1/inventory_item?limit=1', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Content-Language': 'en-US'
      }
    });

    const responseData = await response.text();
    
    return {
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      response: response.ok ? JSON.parse(responseData || '{}') : responseData
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}