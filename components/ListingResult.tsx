import React, { useState } from 'react';
import { CopyIcon } from '../icons/CopyIcon';
import { CheckIcon } from '../icons/CheckIcon';
import { EbayIcon } from '../icons/EbayIcon';
import Spinner from './Spinner';
import type { ListingData } from '../types';

interface ListingResultProps {
  listingData: ListingData;
  isConnected: boolean;
}

export default function ListingResult({ listingData, isConnected }: ListingResultProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const postToEbay = async () => {
    if (!isConnected) {
      alert('Please connect to eBay first');
      return;
    }

    setIsPosting(true);
    try {
      const response = await fetch('/api/ebay/postListing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(listingData),
      });

      if (!response.ok) {
        throw new Error('Failed to post listing');
      }

      const result = await response.json();
      alert(`Listing posted successfully! Item ID: ${result.itemId}`);
    } catch (error) {
      console.error('Error posting to eBay:', error);
      alert('Failed to post listing to eBay. Please try again.');
    } finally {
      setIsPosting(false);
    }
  };

  const CopyButton = ({ text, field }: { text: string; field: string }) => (
    <button
      onClick={() => copyToClipboard(text, field)}
      className="ml-2 p-1 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
      title="Copy to clipboard"
    >
      {copiedField === field ? (
        <CheckIcon className="w-4 h-4 text-green-500" />
      ) : (
        <CopyIcon className="w-4 h-4" />
      )}
    </button>
  );

  return (
    <div className="animate-fade-in">
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Generated eBay Listing
          </h2>
          <button
            onClick={postToEbay}
            disabled={!isConnected || isPosting}
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isPosting ? (
              <>
                <Spinner className="w-4 h-4 mr-2" />
                Posting...
              </>
            ) : (
              <>
                <EbayIcon className="w-4 h-4 mr-2" />
                Post to eBay
              </>
            )}
          </button>
        </div>

        <div className="grid gap-6">
          <div>
            <div className="flex items-center mb-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Title
              </label>
              <CopyButton text={listingData.title} field="title" />
            </div>
            <input
              type="text"
              value={listingData.title}
              readOnly
              className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <div className="flex items-center mb-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Description
              </label>
              <CopyButton text={listingData.description} field="description" />
            </div>
            <textarea
              value={listingData.description}
              readOnly
              rows={6}
              className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center mb-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Category
                </label>
                <CopyButton text={listingData.category} field="category" />
              </div>
              <input
                type="text"
                value={listingData.category}
                readOnly
                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <div className="flex items-center mb-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Condition
                </label>
                <CopyButton text={listingData.condition} field="condition" />
              </div>
              <input
                type="text"
                value={listingData.condition}
                readOnly
                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <div className="flex items-center mb-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Price
                </label>
                <CopyButton text={listingData.price} field="price" />
              </div>
              <input
                type="text"
                value={listingData.price}
                readOnly
                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <div className="flex items-center mb-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Shipping Cost
                </label>
                <CopyButton text={listingData.shippingCost} field="shippingCost" />
              </div>
              <input
                type="text"
                value={listingData.shippingCost}
                readOnly
                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <div className="flex items-center mb-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Item Location
                </label>
                <CopyButton text={listingData.itemLocation} field="itemLocation" />
              </div>
              <input
                type="text"
                value={listingData.itemLocation}
                readOnly
                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center mb-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Keywords
              </label>
              <CopyButton text={listingData.keywords.join(', ')} field="keywords" />
            </div>
            <div className="flex flex-wrap gap-2">
              {listingData.keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 text-sm rounded-full"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}