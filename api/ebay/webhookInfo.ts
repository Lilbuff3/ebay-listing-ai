import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const webhookUrl = `https://${req.headers.host}/api/ebay/webhook`;
  const verificationToken = process.env.EBAY_VERIFICATION_TOKEN || 'NOT_SET';
  
  // Return webhook configuration info
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>eBay Webhook Configuration</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
            .info-box { background: #f0f9ff; border: 1px solid #0284c7; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .warning { background: #fef3c7; border: 1px solid #d97706; }
            .success { background: #f0fdf4; border: 1px solid #16a34a; }
            code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; }
            .copy-btn { background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-left: 10px; }
        </style>
    </head>
    <body>
        <h1>🔗 eBay Webhook Configuration</h1>
        
        <div class="info-box">
            <h3>Your Webhook URL:</h3>
            <code id="webhookUrl">${webhookUrl}</code>
            <button class="copy-btn" onclick="copyToClipboard('webhookUrl')">Copy</button>
        </div>
        
        <div class="info-box ${verificationToken === 'NOT_SET' ? 'warning' : 'success'}">
            <h3>Verification Token Status:</h3>
            <p>${verificationToken === 'NOT_SET' ? '❌ Not configured' : '✅ Configured'}</p>
            ${verificationToken === 'NOT_SET' ? 
              '<p><strong>Action needed:</strong> Add EBAY_VERIFICATION_TOKEN to your Vercel environment variables</p>' :
              '<p>Verification token is properly configured in your environment variables.</p>'
            }
        </div>
        
        <div class="info-box">
            <h3>📋 eBay Developer Console Setup:</h3>
            <ol>
                <li>Go to <a href="https://developer.ebay.com/my/keys" target="_blank">eBay Developer Console</a></li>
                <li>Select your application</li>
                <li>Find <strong>"Notification Settings"</strong> or <strong>"Webhooks"</strong></li>
                <li>Add this webhook URL: <code>${webhookUrl}</code></li>
                <li>Copy your verification token and add it to Vercel as <code>EBAY_VERIFICATION_TOKEN</code></li>
            </ol>
        </div>
        
        <div class="info-box">
            <h3>🔔 Supported Notifications:</h3>
            <ul>
                <li><strong>MARKETPLACE_ACCOUNT_DELETION</strong> - Automatically delete user data when eBay account is deleted</li>
                <li><strong>AUTHORIZATION_REVOKED</strong> - Clean up tokens when user revokes app access</li>
            </ul>
        </div>
        
        <script>
            function copyToClipboard(elementId) {
                const element = document.getElementById(elementId);
                navigator.clipboard.writeText(element.textContent).then(function() {
                    alert('Copied to clipboard!');
                });
            }
        </script>
    </body>
    </html>
  `;
  
  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(html);
}