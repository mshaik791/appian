import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const startSimulationSchema = z.object({
  caseId: z.string().min(1, 'Case ID is required'),
  personaId: z.string().min(1, 'Persona ID is required'),
  mode: z.enum(['chat', 'voice']).default('chat'),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userRole = (session.user as any)?.role;
    if (!['STUDENT', 'ADMIN'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = startSimulationSchema.parse(body);

    // Verify the case and persona exist and are linked
    const caseWithPersona = await prisma.case.findFirst({
      where: {
        id: validatedData.caseId,
        personas: {
          some: {
            id: validatedData.personaId,
          },
        },
      },
      include: {
        personas: {
          where: { id: validatedData.personaId },
        },
        rubric: true,
      },
    });

    if (!caseWithPersona) {
      return NextResponse.json(
        { error: 'Case or persona not found' },
        { status: 404 }
      );
    }

    // Create a new simulation
    const simulation = await prisma.simulation.create({
      data: {
        caseId: validatedData.caseId,
        personaId: validatedData.personaId,
        studentId: session.user.id,
        mode: validatedData.mode,
        status: 'active',
      },
      include: {
        case: {
          select: { title: true, description: true },
        },
        persona: {
          select: { name: true, promptTemplate: true },
        },
      },
    });

    return NextResponse.json({
      simulationId: simulation.id,
      case: simulation.case,
      persona: simulation.persona,
    });
  } catch (error: any) {
    console.error('Error starting simulation:', error);
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to start simulation' },
      { status: 500 }
    );
  }
}
