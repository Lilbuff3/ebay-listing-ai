import React, { useState } from 'react';
import { EbayListing } from '../types';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';
import { EbayIcon } from './icons/EbayIcon';
import { Spinner } from './Spinner';

interface ListingResultProps {
  listing: EbayListing;
  isEbayConnected: boolean;
  onPostToEbay: () => void;
  postStatus: { loading: boolean; error: string | null; success: string | null };
}

const CopyButton: React.FC<{ onCopy: () => void; copied: boolean; title: string }> = ({ onCopy, copied, title }) => (
  <button onClick={onCopy} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 dark:text-slate-300 dark:bg-slate-900/50 dark:hover:bg-slate-700 dark:border-slate-600" aria-label={`Copy ${title}`}>
    {copied ? (<><CheckIcon />Copied</>) : (<><CopyIcon />Copy</>)}
  </button>
);

export const ListingResult: React.FC<ListingResultProps> = ({ listing, isEbayConnected, onPostToEbay, postStatus }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopy = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const formatSpecificsForCopy = () => listing.itemSpecifics.map(spec => `${spec.name}: ${spec.value}`).join('\n');

  const Section: React.FC<{ title: string; onCopy: () => void; copied: boolean; children: React.ReactNode }> = ({ title, onCopy, copied, children }) => (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
        <CopyButton onCopy={onCopy} copied={copied} title={title} />
      </div>
      <div className="text-slate-700 dark:text-slate-300 space-y-2">{children}</div>
    </div>
  );

  return (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 md:p-8 border border-slate-200 dark:border-slate-700 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Your AI-Generated Listing</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Review the content below and post directly to eBay.</p>
      </div>

      <div className="space-y-8">
        <Section title="Listing Title" onCopy={() => handleCopy(listing.title, 'title')} copied={copiedSection === 'title'}>
          <p className="text-lg font-semibold bg-slate-100 dark:bg-slate-900/50 p-3 rounded-md text-slate-900 dark:text-white">{listing.title}</p>
        </Section>
        <hr className="border-slate-200 dark:border-slate-700" />
        <Section title="Category Suggestions" onCopy={() => handleCopy(listing.category.join('\n'), 'category')} copied={copiedSection === 'category'}>
          <ol className="list-decimal list-inside space-y-2">
            {listing.category.map((cat, index) => <li key={index}><code className="text-sm bg-slate-200 dark:bg-slate-700/80 rounded px-2 py-1">{cat}</code></li>)}
          </ol>
          <p className="text-xs text-slate-500 dark:text-slate-400 pt-1">The first option is usually the best. Select the most accurate category on eBay.</p>
        </Section>
        <hr className="border-slate-200 dark:border-slate-700" />
        <Section title="Item Specifics" onCopy={() => handleCopy(formatSpecificsForCopy(), 'specifics')} copied={copiedSection === 'specifics'}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm p-4 bg-slate-100 dark:bg-slate-900/50 rounded-md">
            {listing.itemSpecifics.map((spec, index) => <div key={index} className="flex"><strong className="w-2/5 font-medium text-slate-600 dark:text-slate-400 shrink-0">{spec.name}:</strong><span>{spec.value}</span></div>)}
          </div>
        </Section>
        <hr className="border-slate-200 dark:border-slate-700" />
        <Section title="Description" onCopy={() => handleCopy(listing.description, 'description')} copied={copiedSection === 'description'}>
          <div className="prose prose-sm dark:prose-invert max-w-none p-4 rounded-md border bg-slate-50 border-slate-200 dark:border-slate-700 dark:bg-slate-900/50" dangerouslySetInnerHTML={{ __html: listing.description }} />
        </Section>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 text-center">
        <button onClick={onPostToEbay} disabled={!isEbayConnected || postStatus.loading} className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all transform hover:scale-105">
          {postStatus.loading ? (<><Spinner /><span>Posting to eBay...</span></>) : (<><EbayIcon isButton={true} /><span>Post to eBay</span></>)}
        </button>
        {!isEbayConnected && <p className="text-xs text-slate-500 mt-2">You must connect your eBay account to post.</p>}
        {postStatus.error && <p className="text-sm text-red-600 mt-3">{postStatus.error}</p>}
        {postStatus.success && <p className="text-sm text-green-600 mt-3">{postStatus.success}</p>}
      </div>
    </div>
  );
};
