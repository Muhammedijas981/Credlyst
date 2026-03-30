-- Credlyst Database Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Links table
CREATE TABLE IF NOT EXISTS links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    keywords TEXT,
    category TEXT DEFAULT 'General',
    favorite BOOLEAN DEFAULT FALSE,
    access_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_accessed TIMESTAMPTZ
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_links_user_id ON links(user_id);
CREATE INDEX IF NOT EXISTS idx_links_category ON links(category);
CREATE INDEX IF NOT EXISTS idx_links_favorite ON links(favorite);
CREATE INDEX IF NOT EXISTS idx_links_created_at ON links(created_at DESC);

-- Enable Row Level Security
ALTER TABLE links ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can only see their own links
CREATE POLICY "Users can view own links" ON links
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own links
CREATE POLICY "Users can insert own links" ON links
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own links
CREATE POLICY "Users can update own links" ON links
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own links
CREATE POLICY "Users can delete own links" ON links
    FOR DELETE USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_links_updated_at
    BEFORE UPDATE ON links
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
