import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { SearchFilters } from '@/lib/types'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  
  const filters: SearchFilters = {
    dateRange: (searchParams.get('dateRange') as any) || '7d',
    category: searchParams.get('category') || undefined,
    minConfidence: parseFloat(searchParams.get('minConfidence') || '0.5'),
    query: searchParams.get('query') || undefined
  }

  try {
    let query = supabase
      .from('problem_clusters')
      .select('*')
      .gte('avg_confidence', filters.minConfidence)
      .order('rank_score', { ascending: false })

    // Apply date filter
    if (filters.dateRange !== 'all') {
      const days = filters.dateRange === '7d' ? 7 : 30
      const dateLimit = new Date()
      dateLimit.setDate(dateLimit.getDate() - days)
      
      query = query.gte('created_at', dateLimit.toISOString())
    }

    // Apply category filter
    if (filters.category) {
      query = query.eq('category', filters.category)
    }

    // Apply text search
    if (filters.query) {
      query = query.or(`cluster_title.ilike.%${filters.query}%,cluster_summary.ilike.%${filters.query}%`)
    }

    const { data: problems, error } = await query.limit(50)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch problems' },
        { status: 500 }
      )
    }

    return NextResponse.json({ problems })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}