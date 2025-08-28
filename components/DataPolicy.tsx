import React, { useState } from 'react';

export function DataPolicy() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-blue-600 hover:text-blue-700 text-sm underline"
      >
        📋 Data Handling & Privacy Policy
      </button>
      
      {isOpen && (
        <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-6 text-sm">
          <h3 className="font-medium mb-4 text-gray-900">How We Handle Your eBay Data</h3>
          
          <div className="space-y-4 text-gray-700">
            <div>
              <h4 className="font-medium text-gray-900">Data We Store:</h4>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>eBay authentication tokens (for API access)</li>
                <li>eBay user profile information (username, email)</li>
                <li>Listing data and AI analysis results</li>
                <li>Session information for app functionality</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900">Why We Store This Data:</h4>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>Maintain your eBay connection across sessions</li>
                <li>Provide personalized listing experiences</li>
                <li>Track your listing history for reference</li>
                <li>Comply with eBay API requirements</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900">Data Security:</h4>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>All data is encrypted and stored securely</li>
                <li>Tokens are only used for authorized eBay API calls</li>
                <li>No data is shared with third parties</li>
                <li>You can delete your account and all data anytime</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900">Your Rights:</h4>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>Disconnect from eBay anytime</li>
                <li>Delete your account and all stored data</li>
                <li>Request data export (contact support)</li>
                <li>Revoke eBay permissions in your eBay account</li>
              </ul>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <p className="text-blue-800">
                <strong>Compliance:</strong> This application complies with eBay's data handling requirements 
                and provides full account deletion functionality as required by eBay's marketplace policies.
              </p>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-300">
            <p className="text-xs text-gray-600">
              Last updated: {new Date().toLocaleDateString()} | 
              For questions about data handling, contact support through your eBay developer account.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}