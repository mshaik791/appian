import { getCurrentUser } from '@/lib/auth-helpers'
import { requireRole } from '@/lib/rbac'
import { redirect } from 'next/navigation'

export default async function AdminDashboardPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }

  requireRole({ user }, ['ADMIN'])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Admin Dashboard
          </h1>
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-300">
              Welcome, {user.email}! You are logged in as {user.role}.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <h2 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
                  User Management
                </h2>
                <p className="text-red-700 dark:text-red-300">
                  Manage faculty and student accounts, roles, and permissions.
                </p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                <h2 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-2">
                  System Settings
                </h2>
                <p className="text-orange-700 dark:text-orange-300">
                  Configure system-wide settings, rubrics, and application parameters.
                </p>
              </div>
              <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-4">
                <h2 className="text-lg font-semibold text-teal-900 dark:text-teal-100 mb-2">
                  Analytics & Reports
                </h2>
                <p className="text-teal-700 dark:text-teal-300">
                  View system usage, performance metrics, and generate reports.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
