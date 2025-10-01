import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { updateCaseSchema } from '@/lib/validations';

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
    if (!['FACULTY', 'ADMIN'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const caseItem = await prisma.case.findUnique({
      where: { id },
      include: {
        personas: {
          orderBy: { createdAt: 'asc' },
        },
        creator: {
          select: { email: true },
        },
        rubric: {
          select: { id: true, name: true },
        },
      },
    });

    if (!caseItem) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    return NextResponse.json(caseItem);
  } catch (error) {
    console.error('Error fetching case:', error);
    return NextResponse.json(
      { error: 'Failed to fetch case' },
      { status: 500 }
    );
  }
}

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
    const validatedData = updateCaseSchema.parse(body);

    const updatedCase = await prisma.case.update({
      where: { id },
      data: {
        ...validatedData,
        culturalContextJson: validatedData.culturalContextJson,
        objectivesJson: validatedData.objectivesJson,
      },
      include: {
        personas: {
          orderBy: { createdAt: 'asc' },
        },
        creator: {
          select: { email: true },
        },
        rubric: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(updatedCase);
  } catch (error: any) {
    console.error('Error updating case:', error);
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }
    return NextResponse.json(
      { error: 'Failed to update case' },
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
    await prisma.case.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Case deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting case:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }
    return NextResponse.json(
      { error: 'Failed to delete case' },
      { status: 500 }
    );
  }
}
