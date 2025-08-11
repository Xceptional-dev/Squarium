'use client'

import { useEffect, useState } from 'react'
import { ProblemCluster, SearchFilters } from '@/lib/types'

export function useProblems(filters: SearchFilters) {
  const [problems, setProblems] = useState<ProblemCluster[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProblems = async () => {
      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams({
          dateRange: filters.dateRange,
          minConfidence: filters.minConfidence.toString()
        })

        if (filters.category) params.append('category', filters.category)
        if (filters.query) params.append('query', filters.query)

        const response = await fetch(`/api/problems?${params}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch problems')
        }

        const data = await response.json()
        setProblems(data.problems)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchProblems()
  }, [filters])

  return { problems, loading, error }
}