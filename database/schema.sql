-- eBay Listing AI Database Schema
-- Run this in your Supabase SQL Editor

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  session_id VARCHAR(255) UNIQUE,
  ebay_user_id VARCHAR(255),
  ebay_username VARCHAR(255),
  ebay_registration_address JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- eBay tokens table
CREATE TABLE IF NOT EXISTS ebay_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  token_type VARCHAR(50) DEFAULT 'Bearer',
  scopes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- eBay listings table (for tracking user's listings)
CREATE TABLE IF NOT EXISTS ebay_listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  ebay_item_id VARCHAR(255),
  title VARCHAR(255),
  description TEXT,
  price DECIMAL(10,2),
  category VARCHAR(255),
  condition VARCHAR(100),
  listing_url VARCHAR(500),
  status VARCHAR(50) DEFAULT 'active',
  images JSONB,
  ai_analysis JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_session_id ON users(session_id);
CREATE INDEX IF NOT EXISTS idx_users_ebay_user_id ON users(ebay_user_id);
CREATE INDEX IF NOT EXISTS idx_ebay_tokens_user_id ON ebay_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_ebay_tokens_expires_at ON ebay_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_ebay_listings_user_id ON ebay_listings(user_id);
CREATE INDEX IF NOT EXISTS idx_ebay_listings_ebay_item_id ON ebay_listings(ebay_item_id);

-- Row Level Security (RLS) - Disabled for session-based auth
-- We're using session-based authentication instead of Supabase Auth
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE ebay_tokens ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE ebay_listings ENABLE ROW LEVEL SECURITY;

-- Functions to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update timestamps
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ebay_tokens_updated_at BEFORE UPDATE ON ebay_tokens 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ebay_listings_updated_at BEFORE UPDATE ON ebay_listings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();