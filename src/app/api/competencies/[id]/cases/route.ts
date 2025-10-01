import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userRole = (session.user as any)?.role;
    if (!['STUDENT', 'FACULTY', 'ADMIN'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const { id: competencyId } = await params;
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    const whereClause: any = { competencyId };
    
    if (query) {
      whereClause.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ];
    }

    const cases = await prisma.case.findMany({
      where: whereClause,
      include: {
        personas: {
          select: {
            id: true,
            name: true,
            avatarId: true,
            voiceId: true,
            backgroundJson: true,
          },
        },
        rubric: {
          select: { name: true },
        },
        competency: {
          select: { name: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(cases);
  } catch (error) {
    console.error('Error fetching cases for competency:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cases' },
      { status: 500 }
    );
  }
}
