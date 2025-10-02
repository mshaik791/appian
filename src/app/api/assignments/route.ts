import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const createAssignmentSchema = z.object({
  caseId: z.string().min(1, 'Case ID is required'),
  studentId: z.string().min(1, 'Student ID is required'),
});

const getAssignmentsSchema = z.object({
  studentId: z.string().optional(),
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

    const userRole = token.role as string;
    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Only administrators can create assignments' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = createAssignmentSchema.parse(body);

    // Verify the case exists
    const caseItem = await prisma.case.findUnique({
      where: { id: validatedData.caseId },
      select: { id: true, title: true },
    });

    if (!caseItem) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }

    // Verify the student exists and has STUDENT role
    const student = await prisma.user.findUnique({
      where: { id: validatedData.studentId },
      select: { id: true, email: true, role: true },
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    if (student.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'User is not a student' },
        { status: 400 }
      );
    }

    // Check if assignment already exists
    const existingAssignment = await prisma.assignment.findFirst({
      where: {
        caseId: validatedData.caseId,
        studentId: validatedData.studentId,
      },
    });

    if (existingAssignment) {
      return NextResponse.json(
        { error: 'Assignment already exists for this student and case' },
        { status: 409 }
      );
    }

    // Create the assignment
    const assignment = await prisma.assignment.create({
      data: {
        caseId: validatedData.caseId,
        studentId: validatedData.studentId,
        assignedBy: token.id || token.sub!,
      },
      include: {
        case: {
          select: {
            id: true,
            title: true,
            description: true,
            competency: {
              select: { name: true },
            },
          },
        },
        student: {
          select: {
            id: true,
            email: true,
          },
        },
        admin: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(assignment, { status: 201 });
  } catch (error: any) {
    console.error('Error creating assignment:', error);
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create assignment' },
      { status: 500 }
    );
  }
}

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
    const studentId = searchParams.get('studentId');

    // Build where clause based on user role
    let whereClause: any = {};

    if (userRole === 'STUDENT') {
      // Students can only see their own assignments
      whereClause.studentId = token.id || token.sub!;
    } else if (userRole === 'FACULTY') {
      // Faculty can see assignments for specific students (if studentId provided)
      // or all assignments if no studentId filter
      if (studentId) {
        whereClause.studentId = studentId;
      }
      // If no studentId, faculty can see all assignments
    } else if (userRole === 'ADMIN') {
      // Admins can see all assignments or filter by studentId
      if (studentId) {
        whereClause.studentId = studentId;
      }
    }

    const assignments = await prisma.assignment.findMany({
      where: whereClause,
      include: {
        case: {
          select: {
            id: true,
            title: true,
            description: true,
            competency: {
              select: { name: true },
            },
            personas: {
              select: {
                id: true,
                name: true,
                avatarId: true,
                voiceId: true,
              },
            },
          },
        },
        student: {
          select: {
            id: true,
            email: true,
          },
        },
        admin: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assignments' },
      { status: 500 }
    );
  }
}
