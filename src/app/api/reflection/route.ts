import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const reflectionSchema = z.object({
  caseId: z.string(),
  simSessionId: z.string().optional(),
  response: z.string().min(1, 'Reflection cannot be empty'),
});

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = reflectionSchema.parse(body);

    const { caseId, simSessionId, response } = validatedData;
    const studentId = token.id || token.sub || 'demo-student';

    // Check if reflection already exists for this case/session
    const existingReflection = await prisma.reflectionResponse.findFirst({
      where: {
        caseId,
        simSessionId: simSessionId || null,
        studentId,
      },
    });

    if (existingReflection) {
      // Update existing reflection
      const updatedReflection = await prisma.reflectionResponse.update({
        where: { id: existingReflection.id },
        data: {
          response,
          updatedAt: new Date(),
        },
      });

      return NextResponse.json(updatedReflection, { status: 200 });
    } else {
      // Create new reflection
      const newReflection = await prisma.reflectionResponse.create({
        data: {
          caseId,
          simSessionId: simSessionId || null,
          studentId,
          response,
        },
      });

      return NextResponse.json(newReflection, { status: 201 });
    }

  } catch (error: any) {
    console.error('Error saving reflection:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to save reflection' },
      { status: 500 }
    );
  }
}
