import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client with service role key
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Database schema setup SQL
export const SCHEMA_SQL = `
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ph_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  category TEXT,
  votes INTEGER DEFAULT 0,
  url TEXT,
  launch_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ph_comment_id TEXT UNIQUE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  body TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0,
  posted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Problems table
CREATE TABLE IF NOT EXISTS problems (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  problem_text TEXT NOT NULL,
  confidence_score DECIMAL(3,2) NOT NULL,
  category TEXT NOT NULL,
  example_quote TEXT NOT NULL,
  embedding vector(768),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Problem clusters table
CREATE TABLE IF NOT EXISTS problem_clusters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cluster_title TEXT NOT NULL,
  cluster_summary TEXT NOT NULL,
  mention_count INTEGER NOT NULL DEFAULT 1,
  avg_confidence DECIMAL(3,2) NOT NULL,
  recency_score DECIMAL(3,2) NOT NULL,
  rank_score DECIMAL(5,2) NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Watchlist table for authenticated users
CREATE TABLE IF NOT EXISTS user_watchlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  cluster_id UUID REFERENCES problem_clusters(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, cluster_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_ph_id ON products(ph_id);
CREATE INDEX IF NOT EXISTS idx_products_launch_date ON products(launch_date);
CREATE INDEX IF NOT EXISTS idx_comments_product_id ON comments(product_id);
CREATE INDEX IF NOT EXISTS idx_problems_product_id ON problems(product_id);
CREATE INDEX IF NOT EXISTS idx_problem_clusters_rank_score ON problem_clusters(rank_score DESC);
CREATE INDEX IF NOT EXISTS idx_problem_clusters_category ON problem_clusters(category);

-- Row Level Security
ALTER TABLE user_watchlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own watchlist" ON user_watchlist
  FOR ALL USING (auth.uid() = user_id):