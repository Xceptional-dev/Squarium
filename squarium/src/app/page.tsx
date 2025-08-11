import SearchBar from '@/components/SearchBar'
import FilterPanel from '@/components/FilterPanel'
import ProblemCard from '@/components/ProblemCard'
import LoadingSkeleton from '@/components/ui/LoadingSkeleton'
import { supabase } from '@/lib/supabase'
import { ProblemCluster } from '@/lib/types'

export default async function HomePage({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Server-side data fetching
  const { data: problems, error } = await supabase
    .from('problem_clusters')
    .select('*')
    .gte('avg_confidence', 0.5)
    .order('rank_score', { ascending: false })
    .limit(20)

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">
          Discover Validated Startup Problems
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          AI-powered insights from Product Hunt discussions. 
          Find real problems that founders are talking about.
        </p>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
        <SearchBar />
        <FilterPanel />
      </div>

      {/* Results */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          Top Problems This Week
        </h2>
        
        {error ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Unable to load problems. Please try again.</p>
          </div>
        ) : !problems ? (
          <LoadingSkeleton />
        ) : problems.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No problems found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {problems.map((problem: ProblemCluster) => (
              <ProblemCard key={problem.id} problem={problem} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}