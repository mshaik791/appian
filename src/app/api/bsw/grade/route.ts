import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { evaluateSession } from '@/lib/grading';
import { getBswTranscript } from '@/lib/grading/bswTranscript';

const prisma = new PrismaClient();

const gradeRequestSchema = z.object({
  caseId: z.string(),
  simSessionId: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { caseId, simSessionId } = gradeRequestSchema.parse(body);

    console.info(`[BSW Grade] Starting evaluation for caseId=${caseId}, simSessionId=${simSessionId}`);

    // Check if evaluation already exists
    const existingEvaluation = await prisma.simulationEvaluation.findFirst({
      where: {
        simSessionId,
        caseId,
      },
    });

    if (existingEvaluation) {
      console.info(`[BSW Grade] Evaluation already exists for session ${simSessionId}`);
      return NextResponse.json({ ok: true, already: true });
    }

    // Fetch student's answers
    const { transcript, questionBreakdown } = await getBswTranscript({
      simSessionId,
      prisma,
    });

    // Validate we have enough content
    if (questionBreakdown.length < 2) {
      return NextResponse.json(
        { error: 'Not enough content to grade. Please complete at least 2 questions.' },
        { status: 400 }
      );
    }

    // Truncate transcript if too long
    const truncatedTranscript = transcript.length > 20000 
      ? transcript.substring(0, 20000) + '\n[...truncated for evaluation]'
      : transcript;

    // Define competency codes for Maria case
    const competencyCodes = ['1', '3', '5', '6', '7'];

    // Define weights for BSW
    const weights = {
      empathyEngagement: 0.30,
      culturalResponsiveness: 0.25,
      ethicsProfessionalism: 0.15,
      assessmentPlanning: 0.30,
    };

    // Call shared evaluation engine
    const result = await evaluateSession({
      caseId,
      simSessionId,
      transcript: truncatedTranscript,
      competencyCodes,
      track: 'BSW',
      level: 'BSW',
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

    console.info(`[BSW Grade] Evaluation completed for session ${simSessionId}`, {
      tokenUsage: {
        prompt: result.usedPromptTokens,
        output: result.usedOutputTokens,
      },
    });

    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error('[BSW Grade] Error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message.includes('No student turns found')) {
      return NextResponse.json(
        { error: 'Session not found or no responses to grade' },
        { status: 404 }
      );
    }

    if (error instanceof Error && error.message.includes('Not enough content')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Grading failed. Please try again.' },
      { status: 502 }
    );
  }
}
