import type { VercelRequest, VercelResponse } from '@vercel/node';
import { inflate } from 'pako';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
          <title>🔓 Real eBay OSH Token Decoder</title>
          <style>
              body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
              .big-button { background: #16a34a; color: white; padding: 20px 40px; border: none; border-radius: 8px; cursor: pointer; font-size: 18px; margin: 10px; }
              .big-button:hover { background: #15803d; }
              .result { margin: 20px 0; padding: 15px; border-radius: 4px; }
              .success { background: #f0fdf4; border: 1px solid #16a34a; color: #166534; }
              .error { background: #fef2f2; border: 1px solid #ef4444; color: #dc2626; }
              .token { background: #1f2937; color: #f9fafb; padding: 15px; border-radius: 4px; font-family: monospace; word-break: break-all; margin: 10px 0; }
              .copy { background: #059669; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; margin: 10px 0; }
              pre { background: #f8fafc; padding: 10px; border-radius: 4px; overflow-x: auto; font-size: 12px; }
          </style>
      </head>
      <body>
          <h1>🔓 Real eBay OSH Token Decoder</h1>
          
          <div style="background: #fef3c7; border: 1px solid #d97706; color: #92400e; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <h3>⚠️ About Your Token</h3>
              <p>Your OSH token: <code>v^1.1#i^1#f^0#p^3#I^3#r^0#t^H4sIAAAA...</code></p>
              <p>This is a <strong>compressed token</strong> that contains your real access token inside. Let's extract it!</p>
          </div>
          
          <button class="big-button" onclick="decodeRealToken()">🔓 Decode My Real Token</button>
          
          <div id="result"></div>
          
          <script>
              async function decodeRealToken() {
                  const resultDiv = document.getElementById('result');
                  resultDiv.innerHTML = '<div class="result">🔄 Decompressing your OSH token...</div>';
                  
                  const oshToken = 'v^1.1#i^1#f^0#p^3#I^3#r^0#t^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';
                  
                  try {
                      const response = await fetch('/api/ebay/realTokenDecoder', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ oshToken })
                      });
                      
                      const data = await response.json();
                      
                      if (data.success) {
                          resultDiv.innerHTML = \`
                              <div class="result success">
                                  <h3>🎉 Token Successfully Decoded!</h3>
                                  
                                  <h4>📊 Token Details:</h4>
                                  <pre>\${JSON.stringify(data.tokenInfo, null, 2)}</pre>
                                  
                                  <h4>🔑 Your Real Access Token:</h4>
                                  <div class="token" id="realToken">\${data.accessToken}</div>
                                  <button class="copy" onclick="copyToken('\${data.accessToken}')">📋 Copy Access Token</button>
                                  
                                  <h4>🧪 API Test Result:</h4>
                                  <div style="background: \${data.apiTest.success ? '#f0fdf4' : '#fef2f2'}; padding: 10px; border-radius: 4px; margin: 10px 0;">
                                      <strong>Status:</strong> \${data.apiTest.success ? '✅ Valid' : '❌ Invalid'}<br>
                                      <strong>HTTP Code:</strong> \${data.apiTest.status}<br>
                                      \${data.apiTest.success ? 
                                          '<p>🎊 <strong>Your decoded token works with eBay API!</strong></p>' : 
                                          \`<p><strong>Error:</strong> \${data.apiTest.error}</p>\`
                                      }
                                  </div>
                              </div>
                          \`;
                      } else {
                          resultDiv.innerHTML = \`
                              <div class="result error">
                                  <h3>❌ Decoding Failed</h3>
                                  <p><strong>Error:</strong> \${data.error}</p>
                                  <p><strong>Details:</strong> \${data.details || 'No additional details'}</p>
                              </div>
                          \`;
                      }
                  } catch (error) {
                      resultDiv.innerHTML = \`
                          <div class="result error">
                              <h3>❌ Network Error</h3>
                              <p><strong>Error:</strong> \${error.message}</p>
                          </div>
                      \`;
                  }
              }
              
              function copyToken(token) {
                  navigator.clipboard.writeText(token).then(() => {
                      alert('✅ Access token copied to clipboard!');
                  });
              }
          </script>
      </body>
      </html>
    `;
    
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(html);
  }

  if (req.method === 'POST') {
    try {
      const { oshToken } = req.body;
      
      // Parse OSH token format: v^1.1#i^1#f^0#p^3#I^3#r^0#t^[compressed_data]
      const parts = oshToken.split('#');
      
      if (parts.length < 7 || !parts[6].startsWith('t^')) {
        return res.status(400).json({
          success: false,
          error: 'Invalid OSH token format',
          details: `Expected 7+ parts, got ${parts.length}. Token part missing.`
        });
      }

      // Extract compressed data after 't^'
      const compressedData = parts[6].substring(2);
      
      try {
        // Convert base64 to buffer
        const compressedBuffer = Buffer.from(compressedData, 'base64');
        
        // Try different decompression methods
        let decompressed;
        try {
          // Try pako inflate (zlib/deflate)
          const uint8Array = new Uint8Array(compressedBuffer);
          decompressed = inflate(uint8Array, { to: 'string' });
        } catch (inflateError) {
          // Try Node.js zlib
          const zlib = require('zlib');
          try {
            decompressed = zlib.inflateSync(compressedBuffer).toString('utf8');
          } catch (zlibError) {
            // Try gunzip
            decompressed = zlib.gunzipSync(compressedBuffer).toString('utf8');
          }
        }
        
        // Parse the decompressed JSON
        const tokenData = JSON.parse(decompressed);
        
        // Extract access token
        const accessToken = tokenData.access_token || tokenData.token || tokenData.accessToken;
        
        if (!accessToken) {
          return res.status(400).json({
            success: false,
            error: 'No access token found in decompressed data',
            details: 'Token structure: ' + JSON.stringify(Object.keys(tokenData))
          });
        }

        // Test the extracted token
        const apiTest = await fetch('https://api.ebay.com/sell/inventory/v1/inventory_item?limit=1', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Content-Language': 'en-US'
          }
        });

        const apiResult = {
          success: apiTest.ok,
          status: apiTest.status,
          error: apiTest.ok ? null : await apiTest.text()
        };

        return res.status(200).json({
          success: true,
          accessToken: accessToken,
          tokenInfo: {
            version: parts[0],
            inventory: parts[1],
            format: parts[2],
            permissions: parts[3],
            decompressedSize: decompressed.length,
            tokenType: typeof tokenData,
            hasAccessToken: !!accessToken
          },
          apiTest: apiResult
        });

      } catch (decompressError) {
        return res.status(400).json({
          success: false,
          error: 'Failed to decompress token data',
          details: decompressError.message
        });
      }

    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Server error processing OSH token',
        details: error.message
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}