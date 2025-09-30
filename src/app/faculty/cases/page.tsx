import { getCurrentUser } from '@/lib/auth-helpers'
import { requireRole } from '@/lib/rbac'
import { redirect } from 'next/navigation'

export default async function FacultyCasesPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }

  requireRole({ user }, ['FACULTY', 'ADMIN'])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Faculty Cases Dashboard
          </h1>
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-300">
              Welcome, {user.email}! You are logged in as {user.role}.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Available Cases
              </h2>
              <p className="text-blue-700 dark:text-blue-300">
                This is where faculty can view and manage simulation cases.
                Cases will be displayed here once the case management system is implemented.
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
                Student Progress
              </h2>
              <p className="text-green-700 dark:text-green-300">
                Monitor student simulation progress and provide feedback.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
