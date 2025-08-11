import { redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default async function DashboardPage() {
  // Check if user is authenticated (server-side)
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/auth')
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Manage your saved problems and search alerts.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Saved Problems</h3>
          <p className="text-gray-600 text-sm">
            You haven't saved any problems yet. Browse problems and click the 
            bookmark icon to save them here.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Saved Searches</h3>
          <p className="text-gray-600 text-sm">
            Save frequent searches to get notified when new problems match 
            your criteria.
          </p>
        </div>
      </div>
    </div>
  )
}