import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { SimulationMode, SimulationStatus } from '@prisma/client';

const startSimulationSchema = z.object({
  caseId: z.string().min(1, 'Case ID is required'),
  personaId: z.string().min(1, 'Persona ID is required'),
  mode: z.nativeEnum(SimulationMode).default(SimulationMode.learning),
});

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 POST /api/simulations - Starting simulation creation');
    
    const token = await getToken({ req: request });
    console.log('🔑 Token:', token ? 'Found' : 'Not found');
    
    if (!token) {
      console.log('❌ No token found, returning 401');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userRole = token.role as string;
    console.log('👤 User role:', userRole);
    
    if (!['STUDENT', 'ADMIN'].includes(userRole)) {
      console.log('❌ Invalid role, returning 403');
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Check if user exists in database
    const dbUser = await prisma.user.findUnique({
      where: { id: (token.id || token.sub)! },
      select: { id: true, email: true, role: true },
    });
    
    console.log('👤 Database user:', dbUser ? 'Found' : 'Not found');
    
    if (!dbUser) {
      console.log('❌ User not found in database');
      return NextResponse.json(
        { error: 'User not found in database. Please log out and log back in.' },
        { status: 404 }
      );
    }

    const body = await request.json();
    console.log('📋 Request body:', body);
    
    const validatedData = startSimulationSchema.parse(body);
    console.log('✅ Validated data:', validatedData);

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
        studentId: (token.id || token.sub)!,
        mode: validatedData.mode,
        status: SimulationStatus.active,
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

    console.log('✅ Simulation created successfully:', simulation.id);

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
