import { Session } from 'next-auth'

export function requireRole(session: Session | null, roles: string[]) {
  if (!session || !roles.includes(session.user.role)) {
    throw new Error('Unauthorized')
  }
}

export function hasRole(session: Session | null, roles: string[]): boolean {
  return session ? roles.includes(session.user.role) : false
}

export function isFaculty(session: Session | null): boolean {
  return hasRole(session, ['FACULTY', 'ADMIN'])
}

export function isStudent(session: Session | null): boolean {
  return hasRole(session, ['STUDENT', 'ADMIN'])
}

export function isAdmin(session: Session | null): boolean {
  return hasRole(session, ['ADMIN'])
}
