import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { updatePersonaSchema } from '@/lib/validations';

export async function PATCH(
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
    if (!['FACULTY', 'ADMIN'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = updatePersonaSchema.parse(body);

    const updatedPersona = await prisma.persona.update({
      where: { id },
      data: {
        ...validatedData,
        backgroundJson: validatedData.backgroundJson,
        safetyJson: validatedData.safetyJson,
      },
    });

    return NextResponse.json(updatedPersona);
  } catch (error: any) {
    console.error('Error updating persona:', error);
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Persona not found' }, { status: 404 });
    }
    return NextResponse.json(
      { error: 'Failed to update persona' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    if (!['FACULTY', 'ADMIN'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const { id } = await params;
    await prisma.persona.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Persona deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting persona:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Persona not found' }, { status: 404 });
    }
    return NextResponse.json(
      { error: 'Failed to delete persona' },
      { status: 500 }
    );
  }
}
