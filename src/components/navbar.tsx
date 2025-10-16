'use client'

import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await signOut({ 
        callbackUrl: '/login',
        redirect: true 
      })
    } catch (error) {
      console.error('Logout error:', error)
      // Fallback: redirect manually
      router.push('/login')
    }
  }

  const handleRoleRedirect = () => {
    if (!session?.user) return
    
    const role = (session.user as any).role
    switch (role) {
      case 'FACULTY':
        router.push('/faculty/cases')
        break
      case 'STUDENT':
        router.push('/student')
        break
      case 'ADMIN':
        router.push('/admin')
        break
      default:
        router.push('/')
    }
  }

  if (status === 'loading') {
    return (
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                OxbridgEducation
              </h1>
            </div>
            <div className="flex items-center">
              <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-8 w-32 rounded"></div>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  if (!session) {
    return (
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                OxbridgEducation
              </h1>
            </div>
            <div className="flex items-center">
              <Button onClick={() => router.push('/login')}>
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button 
              onClick={handleRoleRedirect}
              className="text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              OxbridgEducation
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-medium">{session.user?.email}</span>
              <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                {(session.user as any).role}
              </span>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
