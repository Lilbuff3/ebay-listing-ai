import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>🔓 eBay OSH Token Decoder</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 900px; margin: 40px auto; padding: 20px; }
            .form-group { margin: 20px 0; }
            label { display: block; margin-bottom: 5px; font-weight: bold; }
            input, textarea { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
            button { background: #3b82f6; color: white; padding: 12px 24px; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; margin-right: 10px; }
            button:hover { background: #2563eb; }
            button.secondary { background: #6b7280; }
            button:disabled { background: #9ca3af; cursor: not-allowed; }
            .result { margin-top: 20px; padding: 15px; border-radius: 4px; }
            .success { background: #f0fdf4; border: 1px solid #16a34a; color: #166534; }
            .error { background: #fef2f2; border: 1px solid #ef4444; color: #dc2626; }
            .info { background: #f0f9ff; border: 1px solid #3b82f6; color: #1e40af; padding: 15px; border-radius: 4px; margin: 20px 0; }
            .warning { background: #fef3c7; border: 1px solid #d97706; color: #92400e; padding: 15px; border-radius: 4px; margin: 20px 0; }
            pre { background: #f8fafc; padding: 10px; border-radius: 4px; overflow-x: auto; white-space: pre-wrap; font-size: 12px; }
            .token-display { background: #1f2937; color: #f9fafb; padding: 15px; border-radius: 4px; font-family: monospace; word-break: break-all; }
            .copy-btn { background: #059669; padding: 6px 12px; font-size: 12px; }
        </style>
    </head>
    <body>
        <h1>🔓 eBay OSH Token Decoder & Tester</h1>
        
        <div class="info">
            <h3>📋 About OSH Tokens</h3>
            <p>OSH (OAuth Service Handler) tokens from eBay are compressed and encoded. This tool:</p>
            <ul>
                <li>✅ Decodes compressed OSH tokens</li>
                <li>✅ Extracts the actual access token</li>
                <li>✅ Tests the token with eBay's API</li>
                <li>✅ Shows token expiration and details</li>
            </ul>
        </div>

        <div class="warning">
            <h3>⚠️ Token Security</h3>
            <p><strong>Important:</strong> Your actual access token will be displayed below. Keep it secure and don't share it publicly!</p>
        </div>
        
        <div class="form-group">
            <label for="oshToken">Your OSH Token:</label>
            <textarea id="oshToken" rows="8" placeholder="Paste your v^1.1#i^1#f^0... token here">v^1.1#i^1#f^0#p^3#I^3#r^0#t^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</textarea>
        </div>
        
        <button onclick="decodeToken()" id="decodeBtn">🔓 Decode OSH Token</button>
        <button onclick="clearResults()" class="secondary">🗑️ Clear</button>
        
        <div id="result"></div>
        
        <script>
            function decodeToken() {
                const oshToken = document.getElementById('oshToken').value.trim();
                const resultDiv = document.getElementById('result');
                const decodeBtn = document.getElementById('decodeBtn');
                
                if (!oshToken) {
                    resultDiv.innerHTML = '<div class="result error">Please enter an OSH token</div>';
                    return;
                }
                
                decodeBtn.disabled = true;
                decodeBtn.textContent = '🔄 Decoding...';
                
                // Try to decode the token client-side first
                try {
                    const parts = oshToken.split('#');
                    if (parts.length >= 7) {
                        const version = parts[0];
                        const inventory = parts[1];
                        const format = parts[2];
                        const permissions = parts[3];
                        const tokenPart = parts[6];
                        
                        resultDiv.innerHTML = \`
                            <div class="result success">
                                <h3>✅ OSH Token Format Detected</h3>
                                <p><strong>Version:</strong> \${version}</p>
                                <p><strong>Inventory Support:</strong> \${inventory}</p>
                                <p><strong>Format:</strong> \${format}</p>
                                <p><strong>Permissions:</strong> \${permissions}</p>
                                <p><strong>Compressed Token:</strong> Found (attempting server-side decode...)</p>
                            </div>
                        \`;
                        
                        // Now try server-side decoding
                        serverSideDecode(oshToken);
                    } else {
                        resultDiv.innerHTML = \`
                            <div class="result error">
                                <h3>❌ Invalid OSH Token Format</h3>
                                <p>Expected format: v^1.1#i^1#f^0#p^3#I^3#r^0#t^[data]</p>
                                <p>Your token has \${parts.length} parts, expected 7+</p>
                            </div>
                        \`;
                        decodeBtn.disabled = false;
                        decodeBtn.textContent = '🔓 Decode OSH Token';
                    }
                } catch (error) {
                    resultDiv.innerHTML = \`
                        <div class="result error">
                            <h3>❌ Token Parsing Failed</h3>
                            <p><strong>Error:</strong> \${error.message}</p>
                        </div>
                    \`;
                    decodeBtn.disabled = false;
                    decodeBtn.textContent = '🔓 Decode OSH Token';
                }
            }
            
            async function serverSideDecode(oshToken) {
                const resultDiv = document.getElementById('result');
                const decodeBtn = document.getElementById('decodeBtn');
                
                try {
                    const response = await fetch('/api/ebay/decodeOshToken', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ oshToken })
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        const accessToken = data.tokenInfo.fullAccessToken;
                        resultDiv.innerHTML = \`
                            <div class="result success">
                                <h3>🎉 OSH Token Successfully Decoded!</h3>
                                <div style="margin: 15px 0;">
                                    <strong>Version:</strong> \${data.tokenInfo.version}<br>
                                    <strong>Format:</strong> \${data.tokenInfo.format}<br>
                                    <strong>Permissions:</strong> \${data.tokenInfo.permissions}
                                </div>
                                
                                <h4>🔑 Extracted Access Token:</h4>
                                <div class="token-display">
                                    <div style="margin-bottom: 10px;">
                                        <button class="copy-btn" onclick="copyToken('\${accessToken}')">📋 Copy Token</button>
                                    </div>
                                    <div id="accessToken" style="word-break: break-all;">\${accessToken}</div>
                                </div>
                                
                                <h4>🧪 API Test Result:</h4>
                                <div style="background: \${data.testResult.success ? '#f0fdf4' : '#fef2f2'}; padding: 10px; border-radius: 4px; margin: 10px 0;">
                                    <strong>Status:</strong> \${data.testResult.success ? '✅ Valid' : '❌ Invalid'}<br>
                                    <strong>HTTP Status:</strong> \${data.testResult.status}<br>
                                    \${data.testResult.success ? 
                                        '<p>🎊 <strong>Your token works with the eBay Inventory API!</strong></p>' : 
                                        \`<p><strong>Error:</strong> \${data.testResult.statusText}</p>\`
                                    }
                                </div>
                                
                                \${data.testResult.success ? 
                                    '<div class="info"><h4>🚀 Next Steps:</h4><p>Use this access token with eBay Inventory API endpoints. You can now create listings programmatically!</p></div>' :
                                    ''
                                }
                            </div>
                        \`;
                    } else {
                        resultDiv.innerHTML = \`
                            <div class="result error">
                                <h3>❌ Failed to Decode OSH Token</h3>
                                <p><strong>Error:</strong> \${data.error}</p>
                                <p><strong>Format Expected:</strong> \${data.format || 'Standard OSH format'}</p>
                            </div>
                        \`;
                    }
                } catch (error) {
                    resultDiv.innerHTML = \`
                        <div class="result error">
                            <h3>❌ Server Error</h3>
                            <p><strong>Error:</strong> \${error.message}</p>
                            <p>Please check the server logs for more details.</p>
                        </div>
                    \`;
                } finally {
                    decodeBtn.disabled = false;
                    decodeBtn.textContent = '🔓 Decode OSH Token';
                }
            }
            
            function copyToken(token) {
                navigator.clipboard.writeText(token).then(function() {
                    alert('Access token copied to clipboard!');
                });
            }
            
            function clearResults() {
                document.getElementById('result').innerHTML = '';
                document.getElementById('oshToken').value = '';
            }
        </script>
    </body>
    </html>
  `;
  
  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(html);
}