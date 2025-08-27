export interface ImageData {
  file: File;
  preview: string;
  status: 'pending' | 'analyzing' | 'complete' | 'error';
}

export interface ListingData {
  title: string;
  description: string;
  category: string;
  condition: string;
  price: string;
  shippingCost: string;
  itemLocation: string;
  keywords: string[];
}

export interface EbayUser {
  username: string;
  email: string;
  registrationAddress: {
    country: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}