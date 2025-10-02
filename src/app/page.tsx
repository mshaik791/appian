import { getCurrentUser } from '@/lib/auth-helpers'
import { redirect } from 'next/navigation'
import LandingPage from '@/components/LandingPage'

export default async function Home() {
  const user = await getCurrentUser()
  
  if (!user) {
    return <LandingPage />
  }

  // Redirect based on role
  switch (user.role) {
    case 'FACULTY':
      redirect('/faculty/cases')
    case 'STUDENT':
      redirect('/student')
    case 'ADMIN':
      redirect('/admin')
    default:
      redirect('/login')
  }
}
