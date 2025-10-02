import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userRole = token.role as string;
    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Fetch all stats in parallel
    const [
      totalUsers,
      totalCases,
      totalSimulations,
      activeSimulations,
      completedSimulations,
      totalPersonas
    ] = await Promise.all([
      prisma.user.count(),
      prisma.case.count(),
      prisma.simulation.count(),
      prisma.simulation.count({ where: { status: 'active' } }),
      prisma.simulation.count({ where: { status: 'ended' } }),
      prisma.persona.count()
    ]);

    return NextResponse.json({
      totalUsers,
      totalCases,
      totalSimulations,
      activeSimulations,
      completedSimulations,
      totalPersonas
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin stats' },
      { status: 500 }
    );
  }
}
