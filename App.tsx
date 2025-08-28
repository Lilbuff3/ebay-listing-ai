import React, { useState, useCallback, useEffect } from 'react';
import ImageUploader from './components/ImageUploader';
import ListingResult from './components/ListingResult';
import Spinner from './components/Spinner';
import { AccountDeletion } from './components/AccountDeletion';
import { DataPolicy } from './components/DataPolicy';
import { EbayIcon } from './icons/EbayIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import type { ImageData, ListingData, EbayUser } from './types';

function App() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [listingData, setListingData] = useState<ListingData | null>(null);
  const [ebayUser, setEbayUser] = useState<EbayUser | null>(null);
  const [isConnectingEbay, setIsConnectingEbay] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    checkEbayConnection();
  }, []);

  const checkEbayConnection = async () => {
    try {
      const response = await fetch('/api/ebay/user');
      if (response.ok) {
        const userData = await response.json();
        setEbayUser(userData);
      }
    } catch (error) {
      console.error('Error checking eBay connection:', error);
    }
  };

  const handleImageUpload = useCallback((newImages: File[]) => {
    const imageData: ImageData[] = newImages.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      status: 'pending'
    }));
    setImages(prev => [...prev, ...imageData]);
  }, []);

  const removeImage = useCallback((index: number) => {
    setImages(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  }, []);

  const generateListing = async () => {
    if (images.length === 0) return;

    setIsGenerating(true);
    setListingData(null);

    try {
      const formData = new FormData();
      images.forEach((imageData, index) => {
        formData.append(`image-${index}`, imageData.file);
      });

      const response = await fetch('/api/generateListing', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to generate listing');
      }

      const data = await response.json();
      setListingData(data);
    } catch (error) {
      console.error('Error generating listing:', error);
      alert('Failed to generate listing. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const connectToEbay = async () => {
    setIsConnectingEbay(true);
    try {
      const response = await fetch('/api/ebay/authUrl');
      const data = await response.json();
      window.location.href = data.authUrl;
    } catch (error) {
      console.error('Error connecting to eBay:', error);
      alert('Failed to connect to eBay. Please try again.');
    } finally {
      setIsConnectingEbay(false);
    }
  };

  const disconnectFromEbay = async () => {
    try {
      await fetch('/api/ebay/disconnect', { method: 'POST' });
      setEbayUser(null);
    } catch (error) {
      console.error('Error disconnecting from eBay:', error);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
      <div className="bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-slate-800 min-h-screen">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <header className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <EbayIcon className="w-8 h-8 mr-3" />
              <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                eBay Listing Generator AI
              </h1>
              <SparklesIcon className="w-8 h-8 ml-3 text-blue-500" />
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Upload product images and let AI create perfect eBay listings
            </p>
            
            <button
              onClick={toggleDarkMode}
              className="mt-4 px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            >
              {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>
          </header>

          <div className="mb-8 p-6 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">
              eBay Connection
            </h2>
            {ebayUser ? (
              <div className="flex items-center justify-between">
                <div className="text-green-600 dark:text-green-400">
                  ✅ Connected as {ebayUser.username}
                </div>
                <button
                  onClick={disconnectFromEbay}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="text-amber-600 dark:text-amber-400">
                  ⚠️ Not connected to eBay
                </div>
                <button
                  onClick={connectToEbay}
                  disabled={isConnectingEbay}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center"
                >
                  {isConnectingEbay ? <Spinner className="w-4 h-4 mr-2" /> : null}
                  Connect to eBay
                </button>
              </div>
            )}
          </div>

          <ImageUploader
            onImagesUploaded={handleImageUpload}
            images={images}
            onRemoveImage={removeImage}
          />

          <div className="text-center mb-8">
            <button
              onClick={generateListing}
              disabled={images.length === 0 || isGenerating}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center mx-auto"
            >
              {isGenerating ? (
                <>
                  <Spinner className="w-5 h-5 mr-3" />
                  Generating Listing...
                </>
              ) : (
                <>
                  <SparklesIcon className="w-5 h-5 mr-3" />
                  Generate eBay Listing
                </>
              )}
            </button>
          </div>

          {listingData && (
            <ListingResult 
              listingData={listingData} 
              isConnected={!!ebayUser}
            />
          )}

          {/* Data Policy and Account Deletion */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <DataPolicy />
            
            {ebayUser && (
              <AccountDeletion 
                onAccountDeleted={() => {
                  setEbayUser(null);
                  setListingData(null);
                  setImages([]);
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;