import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

    // Faculty routes - only FACULTY and ADMIN
    if (pathname.startsWith('/faculty')) {
      if (!token || !['FACULTY', 'ADMIN'].includes(token.role as string)) {
        return NextResponse.redirect(new URL('/login', req.url))
      }
    }

    // Student routes - only STUDENT and ADMIN
    if (pathname.startsWith('/student')) {
      if (!token || !['STUDENT', 'ADMIN'].includes(token.role as string)) {
        return NextResponse.redirect(new URL('/login', req.url))
      }
    }

    // Admin routes - only ADMIN
    if (pathname.startsWith('/admin')) {
      if (!token || token.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/login', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Allow access to login page without authentication
        if (pathname === '/login') {
          return true
        }

        // Require authentication for all other protected routes
        if (pathname.startsWith('/faculty') || 
            pathname.startsWith('/student') || 
            pathname.startsWith('/admin')) {
          return !!token
        }

        // Allow access to public routes
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    '/faculty/:path*',
    '/student/:path*', 
    '/admin/:path*',
    '/login'
  ]
}
