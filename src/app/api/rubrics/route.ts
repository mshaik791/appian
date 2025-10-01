import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userRole = (session.user as any)?.role;
    if (!['FACULTY', 'ADMIN'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const rubrics = await prisma.rubric.findMany({
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(rubrics);
  } catch (error) {
    console.error('Error fetching rubrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rubrics' },
      { status: 500 }
    );
  }
}