import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { evaluateSession } from '@/lib/grading';

const prisma = new PrismaClient();

const gradeRequestSchema = z.object({
  caseId: z.string(),
  simSessionId: z.string(),
  transcriptText: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { caseId, simSessionId, transcriptText } = gradeRequestSchema.parse(body);

    console.info(`[MSW Grade] Starting evaluation for caseId=${caseId}, simSessionId=${simSessionId}`);

    // Map database case ID to grading case identifier
    // For MSW cases, we need to determine which case this is based on the database ID
    let gradingCaseId = 'msw-parwin'; // Default to Parwin case
    
    // Check if this is a known MSW case by looking up the case in the database
    try {
      const caseData = await prisma.case.findUnique({
        where: { id: caseId },
        include: { personas: true }
      });
      
      if (caseData?.personas?.some(p => p.name.includes('Parwin'))) {
        gradingCaseId = 'msw-parwin';
      } else {
        // Default to Parwin for now, but could be extended for other MSW cases
        gradingCaseId = 'msw-parwin';
      }
    } catch (error) {
      console.warn('[MSW Grade] Could not determine case type, using default:', error);
    }

    // Check if evaluation already exists
    const existingEvaluation = await prisma.simulationEvaluation.findFirst({
      where: {
        simSessionId,
        caseId,
      },
    });

    if (existingEvaluation) {
      console.info(`[MSW Grade] Evaluation already exists for session ${simSessionId}`);
      return NextResponse.json({ ok: true, already: true });
    }

    // Get transcript - either from parameter or from database
    let transcript = transcriptText || '';
    
    if (!transcript && simSessionId) {
      // Fetch transcript from TurnLog for MSW sessions
      const turns = await prisma.turnLog.findMany({
        where: {
          simSessionId,
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      if (turns.length === 0) {
        return NextResponse.json(
          { error: 'No conversation found to grade' },
          { status: 404 }
        );
      }

      // Format as conversation transcript
      transcript = turns.map(turn => 
        `${turn.role === 'student' ? 'Student' : 'Client'}: ${turn.text}`
      ).join('\n');
    }

    if (!transcript.trim()) {
      return NextResponse.json(
        { error: 'No transcript available to grade' },
        { status: 400 }
      );
    }

    // Truncate transcript if too long
    const truncatedTranscript = transcript.length > 20000 
      ? transcript.substring(0, 20000) + '\n[...truncated for evaluation]'
      : transcript;

    // Define competency codes for Parwin case (MSW)
    const competencyCodes = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

    // Define weights for MSW
    const weights = {
      empathyEngagement: 0.25,
      culturalResponsiveness: 0.20,
      ethicsProfessionalism: 0.20,
      assessmentPlanning: 0.35,
    };

    // Create question breakdown from transcript (for MSW, we'll use the full conversation)
    const questionBreakdown = [{
      order: 1,
      prompt: 'Full conversation transcript',
      answer: truncatedTranscript
    }];

    // Call shared evaluation engine
    const result = await evaluateSession({
      caseId: gradingCaseId,
      simSessionId,
      transcript: truncatedTranscript,
      competencyCodes,
      track: 'MSW',
      level: 'MSW',
      questionBreakdown,
      weights,
    });

    // Persist evaluation
    await prisma.simulationEvaluation.create({
      data: {
        simSessionId,
        caseId,
        rubricJson: JSON.stringify(result.grading),
        createdAt: new Date(),
      },
    });

    console.info(`[MSW Grade] Evaluation completed for session ${simSessionId}`, {
      tokenUsage: {
        prompt: result.usedPromptTokens,
        output: result.usedOutputTokens,
      },
    });

    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error('[MSW Grade] Error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message.includes('No conversation found')) {
      return NextResponse.json(
        { error: 'Session not found or no responses to grade' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Grading failed. Please try again.' },
      { status: 502 }
    );
  }
}
