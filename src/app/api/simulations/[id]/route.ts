import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken({ req: request });
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userRole = token.role as string;
    if (!['STUDENT', 'ADMIN'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const { id: simulationId } = await params;

    const simulation = await prisma.simulation.findFirst({
      where: {
        id: simulationId,
        studentId: token.id || token.sub!,
      },
      include: {
        case: {
          select: {
            title: true,
            description: true,
            culturalContextJson: true,
            objectivesJson: true,
          },
        },
        persona: {
          select: {
            name: true,
            promptTemplate: true,
            avatarId: true,
            voiceId: true,
          },
        },
        turns: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            speaker: true,
            text: true,
            createdAt: true,
          },
        },
      },
    });

    if (!simulation) {
      return NextResponse.json(
        { error: 'Simulation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(simulation);
  } catch (error) {
    console.error('Error fetching simulation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch simulation' },
      { status: 500 }
    );
  }
}
