import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>🧪 Test eBay Inventory OSH Token</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
            .form-group { margin: 20px 0; }
            label { display: block; margin-bottom: 5px; font-weight: bold; }
            input, textarea { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
            button { background: #3b82f6; color: white; padding: 12px 24px; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; }
            button:hover { background: #2563eb; }
            button:disabled { background: #9ca3af; cursor: not-allowed; }
            .result { margin-top: 20px; padding: 15px; border-radius: 4px; }
            .success { background: #f0fdf4; border: 1px solid #16a34a; color: #166534; }
            .error { background: #fef2f2; border: 1px solid #ef4444; color: #dc2626; }
            .info { background: #f0f9ff; border: 1px solid #3b82f6; color: #1e40af; padding: 15px; border-radius: 4px; margin: 20px 0; }
            pre { background: #f8fafc; padding: 10px; border-radius: 4px; overflow-x: auto; white-space: pre-wrap; }
            .loading { display: none; }
        </style>
    </head>
    <body>
        <h1>🧪 Test eBay Inventory OSH Token</h1>
        
        <div class="info">
            <h3>📋 About Inventory OSH Tokens</h3>
            <p>Your token: <code>v^1.1#i^1#f^0#p^3#I^3#r^0#t^H4sIAAAA...</code></p>
            <p><strong>This is an eBay Inventory API OAuth token that allows:</strong></p>
            <ul>
                <li>✅ Create and manage inventory items</li>
                <li>✅ Create fixed-price listings</li>
                <li>✅ Manage offers and pricing</li>
                <li>✅ Update listing details</li>
                <li>✅ Handle bulk operations</li>
            </ul>
        </div>
        
        <div class="form-group">
            <label for="token">Your Inventory OSH Token:</label>
            <textarea id="token" rows="6" placeholder="Paste your v^1.1#i^1#f^0... token here">v^1.1#i^1#f^0#p^3#I^3#r^0#t^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</textarea>
        </div>
        
        <button onclick="testToken()" id="testBtn">Test Token</button>
        <div class="loading" id="loading">Testing token...</div>
        
        <div id="result"></div>
        
        <div class="info" style="margin-top: 40px;">
            <h3>🔧 Sample Request Body for Inventory API</h3>
            <p>Once your token is validated, you can use it to create listings like this:</p>
            <pre>{
  "product": {
    "title": "Test listing - Apple Watch Series 2",
    "aspects": {
      "Feature": ["Water resistance", "GPS"],
      "CPU": ["Dual-Core Processor"]
    },
    "description": "Built-in GPS. Water resistance to 50 meters. A new lightning-fast dual-core processor...",
    "imageUrls": [
      "https://example.com/image1.jpg",
      "https://example.com/image2.jpg"
    ]
  },
  "condition": "NEW",
  "availability": {
    "shipToLocationAvailability": {
      "quantity": 10
    }
  }
}</pre>
        </div>
        
        <script>
            async function testToken() {
                const token = document.getElementById('token').value.trim();
                const resultDiv = document.getElementById('result');
                const testBtn = document.getElementById('testBtn');
                const loading = document.getElementById('loading');
                
                if (!token) {
                    resultDiv.innerHTML = '<div class="result error">Please enter a token</div>';
                    return;
                }
                
                testBtn.disabled = true;
                loading.style.display = 'block';
                
                try {
                    const response = await fetch('/api/ebay/testInventoryToken', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ token })
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        resultDiv.innerHTML = \`
                            <div class="result success">
                                <h3>✅ Inventory OSH Token Valid!</h3>
                                <p><strong>Status:</strong> \${data.tokenStatus}</p>
                                <p><strong>Message:</strong> \${data.message}</p>
                                <p>🎉 You can now create eBay listings using the Inventory API!</p>
                                <details>
                                    <summary>API Response Details</summary>
                                    <pre>\${JSON.stringify(data.apiResponse, null, 2)}</pre>
                                </details>
                            </div>
                        \`;
                    } else {
                        resultDiv.innerHTML = \`
                            <div class="result error">
                                <h3>❌ Token Invalid</h3>
                                <p><strong>Error:</strong> \${data.error}</p>
                                <p><strong>Status:</strong> \${data.status || 'Unknown'}</p>
                                <p><strong>Status Text:</strong> \${data.statusText || 'Unknown'}</p>
                                <details>
                                    <summary>Error Details</summary>
                                    <pre>\${data.details || 'No additional details'}</pre>
                                </details>
                            </div>
                        \`;
                    }
                } catch (error) {
                    resultDiv.innerHTML = \`
                        <div class="result error">
                            <h3>❌ Test Failed</h3>
                            <p><strong>Network Error:</strong> \${error.message}</p>
                            <p>Please check your connection and try again.</p>
                        </div>
                    \`;
                } finally {
                    testBtn.disabled = false;
                    loading.style.display = 'none';
                }
            }
            
            // Auto-fill the token if it's already in the textarea
            window.onload = function() {
                const tokenField = document.getElementById('token');
                if (tokenField.value.trim()) {
                    document.getElementById('testBtn').style.background = '#16a34a';
                    document.getElementById('testBtn').textContent = 'Test Pre-filled Token';
                }
            };
        </script>
    </body>
    </html>
  `;
  
  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(html);
}