import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { gradingResultSchema } from '@/lib/grading/schema';

const prisma = new PrismaClient();

// CSWE competencies mapping
const CSWE_COMPETENCIES: Record<string, string> = {
  '1': 'Demonstrate Ethical and Professional Behavior',
  '2': 'Engage Diversity and Difference in Practice', 
  '3': 'Advance Human Rights and Social, Economic, and Environmental Justice',
  '4': 'Engage in Practice-informed Research and Research-informed Practice',
  '5': 'Engage in Policy Practice',
  '6': 'Engage with Individuals, Families, Groups, Organizations, and Communities',
  '7': 'Assess Individuals, Families, Groups, Organizations, and Communities',
  '8': 'Intervene with Individuals, Families, Groups, Organizations, and Communities',
  '9': 'Evaluate Practice with Individuals, Families, Groups, Organizations, and Communities',
};

// Case titles mapping
const CASE_TITLES: Record<string, string> = {
  'bsw-maria-aguilar-s1': 'Maria Aguilar - Session 1',
  'msw-parwin': 'Parwin - Clinical Assessment',
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const caseId = searchParams.get('caseId');
    const simSessionId = searchParams.get('simSessionId');

    if (!caseId || !simSessionId) {
      return NextResponse.json(
        { error: 'Missing caseId or simSessionId' },
        { status: 400 }
      );
    }

    // Load evaluation
    const evaluation = await prisma.simulationEvaluation.findFirst({
      where: {
        simSessionId,
        caseId,
      },
    });

    if (!evaluation) {
      return NextResponse.json(
        { error: 'Evaluation not found' },
        { status: 404 }
      );
    }

    // Parse and validate rubric JSON
    let gradingResult;
    try {
      const parsed = JSON.parse(evaluation.rubricJson);
      gradingResult = gradingResultSchema.parse(parsed);
    } catch (error) {
      console.error('Failed to parse evaluation rubric:', error);
      return NextResponse.json(
        { error: 'Invalid evaluation data' },
        { status: 500 }
      );
    }

    // Map competency codes to titles
    const competencyTitles = Object.keys(gradingResult.competencyScores).reduce((acc, code) => {
      acc[code] = CSWE_COMPETENCIES[code] || `Competency ${code}`;
      return acc;
    }, {} as Record<string, string>);

    const response = {
      case: {
        id: caseId,
        title: CASE_TITLES[caseId] || caseId,
        competencyCodes: Object.keys(gradingResult.competencyScores),
        competencyTitles,
      },
      evaluation: {
        scores: gradingResult.scores,
        competencyScores: gradingResult.competencyScores,
        evidenceQuotes: gradingResult.evidenceQuotes,
        summary: gradingResult.summary,
        suggestions: gradingResult.suggestions,
        createdAt: evaluation.createdAt,
      },
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('[Results API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch results' },
      { status: 500 }
    );
  }
}