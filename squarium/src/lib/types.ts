export interface Product {
  id: string
  ph_id: string
  name: string
  tagline: string
  description: string
  category: string
  votes: number
  url: string
  launch_date: string
  created_at: string
}

export interface Comment {
  id: string
  ph_comment_id: string
  product_id: string
  author: string
  body: string
  upvotes: number
  posted_at: string
}

export interface Problem {
  id: string
  product_id: string
  comment_id?: string
  problem_text: string
  confidence_score: number
  category: string
  example_quote: string
  embedding?: number[]
  created_at: string
}

export interface ProblemCluster {
  id: string
  cluster_title: string
  cluster_summary: string
  mention_count: number
  avg_confidence: number
  recency_score: number
  rank_score: number
  category: string
  created_at: string
  updated_at: string
}

export interface AIExtractionResult {
  problem: string
  confidence_score: number
  category: string
  example_quote: string
}

export interface SearchFilters {
  dateRange: '7d' | '30d' | 'all'
  category?: string
  minConfidence: number
  query?: string
}