import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/db';
import { createCaseSchema } from '@/lib/validations';

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
    if (!['STUDENT', 'FACULTY', 'ADMIN'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const competencyId = searchParams.get('competencyId');

    const whereClause: any = {};
    
    if (query) {
      whereClause.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ];
    }
    
    if (competencyId) {
      whereClause.competencyId = competencyId;
    }

    const cases = await prisma.case.findMany({
      where: whereClause,
      include: {
        _count: {
          select: { personas: true },
        },
        personas: {
          select: {
            id: true,
            name: true,
            avatarId: true,
            voiceId: true,
          },
        },
        creator: {
          select: { email: true },
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
    console.error('Error fetching cases:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cases' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
        { error: 'Forbidden - Only administrators can create cases' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = createCaseSchema.parse(body);

    const newCase = await prisma.case.create({
      data: {
        ...validatedData,
        culturalContextJson: validatedData.culturalContextJson,
        objectivesJson: validatedData.objectivesJson,
        learningObjectivesJson: validatedData.learningObjectivesJson,
        createdBy: token.id || token.sub!,
      },
      include: {
        _count: {
          select: { personas: true },
        },
        creator: {
          select: { email: true },
        },
        rubric: {
          select: { name: true },
        },
      },
    });

    return NextResponse.json(newCase, { status: 201 });
  } catch (error: any) {
    console.error('Error creating case:', error);
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create case' },
      { status: 500 }
    );
  }
}
