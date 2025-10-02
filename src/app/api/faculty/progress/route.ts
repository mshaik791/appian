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
        { error: 'Forbidden - Only faculty and administrators can view progress' },
        { status: 403 }
      );
    }

    // Get all students with their assignments
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      include: {
        assignedCases: {
          include: {
            case: {
              select: {
                id: true,
                title: true,
                competency: {
                  select: { name: true },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { email: 'asc' },
    });

    // Get all simulations for these students
    const simulations = await prisma.simulation.findMany({
      where: {
        studentId: {
          in: students.map(student => student.id),
        },
      },
      include: {
        turns: {
          select: {
            id: true,
            speaker: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { startedAt: 'desc' },
    });

    // Group simulations by student and case
    const simulationsByStudentAndCase = simulations.reduce((acc, simulation) => {
      const key = `${simulation.studentId}-${simulation.caseId}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(simulation);
      return acc;
    }, {} as Record<string, any[]>);

    // Transform the data to match the expected structure
    const studentProgress = students.map(student => ({
      student: {
        id: student.id,
        email: student.email,
      },
      assignments: student.assignedCases.map(assignment => {
        const key = `${student.id}-${assignment.caseId}`;
        const assignmentSimulations = simulationsByStudentAndCase[key] || [];
        
        return {
          id: assignment.id,
          case: assignment.case,
          createdAt: assignment.createdAt.toISOString(),
          simulations: assignmentSimulations.map(simulation => ({
            id: simulation.id,
            mode: simulation.mode,
            status: simulation.status,
            startedAt: simulation.startedAt.toISOString(),
            endedAt: simulation.endedAt?.toISOString(),
            turns: simulation.turns,
          })),
        };
      }),
    }));

    return NextResponse.json(studentProgress);
  } catch (error) {
    console.error('Error fetching faculty progress data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress data' },
      { status: 500 }
    );
  }
}
