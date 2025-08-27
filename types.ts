
export interface ItemSpecific {
  name: string;
  value: string;
}

export interface EbayListing {
  title: string;
  category: string[];
  itemSpecifics: ItemSpecific[];
  description: string;
}