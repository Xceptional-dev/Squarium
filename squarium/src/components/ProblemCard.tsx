'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { ExternalLink, Bookmark, TrendingUp } from 'lucide-react'
import { ProblemCluster } from '@/lib/types'
import Card from './ui/Card'
import Button from './ui/Button'
import Modal from './ui/Modal'
import { useAuth } from '@/hooks/useAuth'

interface ProblemCardProps {
  problem: ProblemCluster
}

export default function ProblemCard({ problem }: ProblemCardProps) {
  const [showSources, setShowSources] = useState(false)
  const { user } = useAuth()

  const handleSave = async () => {
    if (!user) return
    
    // TODO: Implement save to watchlist
    console.log('Save to watchlist:', problem.id)
  }

  return (
    <>
      <Card hover className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-2">
              {problem.cluster_title}
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              {problem.cluster_summary}
            </p>
          </div>
          {user && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSave}
              className="ml-2"
            >
              <Bookmark className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex items-center space-x-4 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <TrendingUp className="h-3 w-3" />
            <span>{problem.mention_count} mentions</span>
          </div>
          <span>•</span>
          <span>{Math.round(problem.avg_confidence * 100)}% confidence</span>
          <span>•</span>
          <span>{problem.category}</span>
        </div>

        <div className="pt-3 border-t border-gray-100">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowSources(true)}
            className="w-full"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View Sources
          </Button>
        </div>
      </Card>

      <Modal
        isOpen={showSources}
        onClose={() => setShowSources(false)}
        title={problem.cluster_title}
      >
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Problem Summary</h4>
            <p className="text-sm text-gray-600">{problem.cluster_summary}</p>
          </div>
          
          <div>
            <h4 className="font-medium mb-3">
              Sources ({problem.mention_count} mentions)
            </h4>
            <div className="space-y-3">
              {/* TODO: Fetch and display actual source comments */}
              <div className="border border-gray-200 rounded p-3">
                <div className="text-xs text-gray-500 mb-1">
                  Product Hunt • 2 days ago
                </div>
                <p className="text-sm">
                  Loading source data... This would show the actual comments 
                  from Product Hunt that mentioned this problem.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  )
}