import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    // Test the inventory OSH token with a simple API call
    const testResponse = await fetch('https://api.ebay.com/sell/inventory/v1/inventory_item?limit=1', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Language': 'en-US'
      }
    });

    const responseData = await testResponse.text();
    
    if (testResponse.ok) {
      return res.status(200).json({
        success: true,
        message: 'Inventory OSH token is valid and working!',
        tokenStatus: 'Active',
        apiResponse: JSON.parse(responseData || '{}')
      });
    } else {
      return res.status(testResponse.status).json({
        success: false,
        error: 'Token validation failed',
        status: testResponse.status,
        statusText: testResponse.statusText,
        details: responseData
      });
    }

  } catch (error) {
    console.error('Token test error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to test token',
      details: error.message 
    });
  }
}

// Example usage in HTML form:
export const tokenTestHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>Test eBay Inventory OSH Token</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
        .form-group { margin: 20px 0; }
        label { display: block; margin-bottom: 5px; font-weight: bold; }
        input, textarea { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
        button { background: #3b82f6; color: white; padding: 12px 24px; border: none; border-radius: 4px; cursor: pointer; }
        .result { margin-top: 20px; padding: 15px; border-radius: 4px; }
        .success { background: #f0fdf4; border: 1px solid #16a34a; }
        .error { background: #fef2f2; border: 1px solid #ef4444; }
    </style>
</head>
<body>
    <h1>🧪 Test eBay Inventory OSH Token</h1>
    
    <div class="form-group">
        <label for="token">Your Inventory OSH Token:</label>
        <textarea id="token" rows="4" placeholder="Paste your v^1.1#i^1#f^0... token here"></textarea>
    </div>
    
    <button onclick="testToken()">Test Token</button>
    
    <div id="result"></div>
    
    <script>
        async function testToken() {
            const token = document.getElementById('token').value.trim();
            const resultDiv = document.getElementById('result');
            
            if (!token) {
                resultDiv.innerHTML = '<div class="result error">Please enter a token</div>';
                return;
            }
            
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
                            <h3>✅ Token Valid!</h3>
                            <p><strong>Status:</strong> \${data.tokenStatus}</p>
                            <p><strong>Message:</strong> \${data.message}</p>
                            <details>
                                <summary>API Response</summary>
                                <pre>\${JSON.stringify(data.apiResponse, null, 2)}</pre>
                            </details>
                        </div>
                    \`;
                } else {
                    resultDiv.innerHTML = \`
                        <div class="result error">
                            <h3>❌ Token Invalid</h3>
                            <p><strong>Error:</strong> \${data.error}</p>
                            <p><strong>Status:</strong> \${data.status}</p>
                            <details>
                                <summary>Details</summary>
                                <pre>\${data.details}</pre>
                            </details>
                        </div>
                    \`;
                }
            } catch (error) {
                resultDiv.innerHTML = \`
                    <div class="result error">
                        <h3>❌ Test Failed</h3>
                        <p><strong>Error:</strong> \${error.message}</p>
                    </div>
                \`;
            }
        }
    </script>
</body>
</html>
`;