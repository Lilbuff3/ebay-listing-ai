import React, { useState } from 'react';

interface AccountDeletionProps {
  onAccountDeleted?: () => void;
}

export function AccountDeletion({ onAccountDeleted }: AccountDeletionProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const handleDeleteAccount = async () => {
    if (confirmText !== 'DELETE') {
      alert('Please type "DELETE" to confirm account deletion');
      return;
    }

    setIsDeleting(true);
    
    try {
      const response = await fetch('/api/ebay/deleteAccount', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok) {
        alert('Account deleted successfully. All your eBay data has been removed.');
        setShowConfirmation(false);
        setConfirmText('');
        if (onAccountDeleted) {
          onAccountDeleted();
        }
        // Refresh the page to reset the app state
        window.location.reload();
      } else {
        alert(`Failed to delete account: ${result.error}`);
      }
    } catch (error) {
      console.error('Account deletion error:', error);
      alert('An error occurred while deleting your account. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!showConfirmation) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <h3 className="text-red-800 font-medium mb-2">Delete Account</h3>
        <p className="text-red-700 text-sm mb-4">
          Permanently delete your account and all associated eBay data. This action cannot be undone.
        </p>
        <button
          onClick={() => setShowConfirmation(true)}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
        >
          Delete Account
        </button>
      </div>
    );
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
      <h3 className="text-red-800 font-medium mb-2">⚠️ Confirm Account Deletion</h3>
      <div className="text-red-700 text-sm mb-4 space-y-2">
        <p><strong>This will permanently delete:</strong></p>
        <ul className="list-disc list-inside ml-4 space-y-1">
          <li>Your eBay authentication tokens</li>
          <li>Your eBay profile information</li>
          <li>All your listing history</li>
          <li>All associated account data</li>
        </ul>
        <p className="mt-4 font-medium">This action cannot be undone.</p>
      </div>
      
      <div className="mb-4">
        <label className="block text-red-700 text-sm font-medium mb-2">
          Type "DELETE" to confirm:
        </label>
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          className="w-full px-3 py-2 border border-red-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
          placeholder="Type DELETE here"
        />
      </div>
      
      <div className="flex gap-3">
        <button
          onClick={handleDeleteAccount}
          disabled={isDeleting || confirmText !== 'DELETE'}
          className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
            isDeleting || confirmText !== 'DELETE'
              ? 'bg-gray-400 cursor-not-allowed text-white'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          {isDeleting ? 'Deleting...' : 'Permanently Delete Account'}
        </button>
        
        <button
          onClick={() => {
            setShowConfirmation(false);
            setConfirmText('');
          }}
          disabled={isDeleting}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded text-sm font-medium transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}