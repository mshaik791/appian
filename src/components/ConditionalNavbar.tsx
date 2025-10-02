'use client'

import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import Navbar from './navbar'

export function ConditionalNavbar() {
  const { data: session, status } = useSession()
  const pathname = usePathname()

  // Don't show navbar on landing page (when user is not authenticated and on home page)
  if (!session && pathname === '/') {
    return null
  }

  // Don't show navbar on login page
  if (pathname === '/login') {
    return null
  }

  return <Navbar />
}
