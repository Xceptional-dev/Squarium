'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Button from './ui/Button'
import { Filter } from 'lucide-react'

const DATE_RANGES = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: 'all', label: 'All time' }
]

const CATEGORIES = [
  'SaaS',
  'AI',
  'HealthTech',
  'FinTech',
  'E-commerce',
  'Developer Tools',
  'Productivity',
  'Social',
  'Education'
]

export default function FilterPanel() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)

  const currentDateRange = searchParams.get('dateRange') || '7d'
  const currentCategory = searchParams.get('category')
  const currentMinConfidence = searchParams.get('minConfidence') || '0.5'

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    
    router.push(`/?${params.toString()}`)
  }

  return (
    <div className="space-y-4">
      <Button 
        variant="outline" 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2"
      >
        <Filter className="h-4 w-4" />
        <span>Filters</span>
      </Button>

      {isOpen && (
        <div className="grid gap-4 md:grid-cols-3 p-4 bg-gray-50 rounded-lg">
          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Range
            </label>
            <select
              value={currentDateRange}
              onChange={(e) => updateFilter('dateRange', e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            >
              {DATE_RANGES.map(range => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={currentCategory || ''}
              onChange={(e) => updateFilter('category', e.target.value || null)}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Confidence */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Min Confidence: {currentMinConfidence}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={currentMinConfidence}
              onChange={(e) => updateFilter('minConfidence', e.target.value)}
              className="w-full"
            />
          </div>
        </div>
      )}
    </div>
  )
}