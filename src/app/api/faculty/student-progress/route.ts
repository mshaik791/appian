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
    if (!['FACULTY', 'ADMIN'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Fetch all simulations with related data
    const simulations = await prisma.simulation.findMany({
      include: {
        student: {
          select: { email: true }
        },
        case: {
          select: {
            title: true,
            competency: {
              select: { name: true }
            }
          }
        },
        persona: {
          select: { name: true }
        },
        _count: {
          select: { turns: true }
        }
      },
      orderBy: { startedAt: 'desc' }
    });

    // Calculate student progress
    const studentProgressMap = new Map<string, {
      studentEmail: string;
      totalSimulations: number;
      completedSimulations: number;
      activeSimulations: number;
      competencies: Set<string>;
      lastActivity: string;
    }>();

    simulations.forEach(sim => {
      const email = sim.student.email;
      if (!studentProgressMap.has(email)) {
        studentProgressMap.set(email, {
          studentEmail: email,
          totalSimulations: 0,
          completedSimulations: 0,
          activeSimulations: 0,
          competencies: new Set(),
          lastActivity: sim.startedAt
        });
      }

      const progress = studentProgressMap.get(email)!;
      progress.totalSimulations++;
      
      if (sim.status === 'ended') {
        progress.completedSimulations++;
      } else if (sim.status === 'active') {
        progress.activeSimulations++;
      }

      progress.competencies.add(sim.case.competency.name);
      
      // Update last activity to the most recent
      if (new Date(sim.startedAt) > new Date(progress.lastActivity)) {
        progress.lastActivity = sim.startedAt;
      }
    });

    // Convert Map to array and transform competencies Set to array
    const studentProgress = Array.from(studentProgressMap.values()).map(progress => ({
      ...progress,
      competencies: Array.from(progress.competencies)
    }));

    return NextResponse.json({
      simulations,
      studentProgress
    });
  } catch (error) {
    console.error('Error fetching student progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student progress' },
      { status: 500 }
    );
  }
}
