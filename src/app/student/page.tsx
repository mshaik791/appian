import { getCurrentUser } from '@/lib/auth-helpers'
import { requireRole } from '@/lib/rbac'
import { redirect } from 'next/navigation'

export default async function StudentDashboardPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }

  requireRole({ user }, ['STUDENT', 'ADMIN'])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Student Dashboard
          </h1>
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-300">
              Welcome, {user.email}! You are logged in as {user.role}.
            </p>
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">
                Available Simulations
              </h2>
              <p className="text-purple-700 dark:text-purple-300">
                Start new simulations or continue existing ones. Practice your social work skills
                with interactive scenarios.
              </p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                My Progress
              </h2>
              <p className="text-yellow-700 dark:text-yellow-300">
                View your simulation history, feedback from faculty, and competency scores.
              </p>
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100 mb-2">
                Learning Resources
              </h2>
              <p className="text-indigo-700 dark:text-indigo-300">
                Access rubrics, guidelines, and additional learning materials.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
