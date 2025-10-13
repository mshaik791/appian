import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getTemporaryEvalStore } from '@/lib/tmp/evalStore';

export async function GET(request: NextRequest) {
  try {
    // TEMP: bypass auth during testing

    const { searchParams } = new URL(request.url);
    const caseId = searchParams.get('caseId');
    const simSessionId = searchParams.get('simSessionId');

    if (!caseId) {
      return NextResponse.json(
        { error: 'caseId is required' },
        { status: 400 }
      );
    }

    // Try temporary in-memory store first (testing mode)
    const tmpStore = getTemporaryEvalStore();
    const storeKey = `${caseId}::${simSessionId || 'demo'}`;
    let evaluation = tmpStore.get(storeKey) as any;

    // If not found with exact key, try any entry that matches caseId (helps when sid missing/mismatch)
    if (!evaluation) {
      for (const [key, value] of tmpStore.entries()) {
        if (key.startsWith(`${caseId}::`)) {
          evaluation = value as any;
          break;
        }
      }
    }

    // If not in memory, try DB (when migrations are applied). Guard for undefined client.
    if (!evaluation) {
      try {
        const anyPrisma = prisma as any;
        if (anyPrisma?.simulationEvaluation?.findFirst) {
          evaluation = await anyPrisma.simulationEvaluation.findFirst({
            where: {
              caseId,
              simSessionId: simSessionId || null,
            },
            orderBy: { createdAt: 'desc' },
            include: {
              case: { select: { title: true, competency: { select: { name: true } } } },
            },
          });
        }
      } catch (e) {
        // Ignore DB errors in testing mode; we'll return pending if nothing in memory
      }
    }

    if (!evaluation) {
      return NextResponse.json(
        { status: 'pending' },
        { status: 202 }
      );
    }

    // Parse evidence JSON
    const evidence = evaluation.evidenceJson as any;

    // Optionally aggregate engagement data if available
    let engagement = undefined;
    if (simSessionId) {
      const analytics = await prisma.analyticsSummary.findUnique({
        where: {
          simulationId: simSessionId,
        },
      });

      if (analytics) {
        const metrics = analytics.metricsJson as any;
        engagement = {
          attentionPctAvg: metrics.attentionPctAvg || 0,
          smilesPerMinAvg: metrics.smilesPerMinAvg || 0,
          nodsPerMinAvg: metrics.nodsPerMinAvg || 0,
          laughterCount: metrics.laughterCount || 0,
          valenceAvg: metrics.valenceAvg || 0,
          arousalAvg: metrics.arousalAvg || 0,
        };
      }
    }

    return NextResponse.json({
      evaluation: {
        empathy: evaluation.empathy,
        culturalResponse: evaluation.culturalResponse,
        ethicsAwareness: evaluation.ethicsAwareness,
        activeListening: evaluation.activeListening,
        summary: evaluation.summary,
        createdAt: evaluation.createdAt,
        caseTitle: evaluation.case.title,
        competencyName: evaluation.case.competency.name,
      },
      evidence: {
        empathy: evidence.empathy || [],
        culturalResponse: evidence.culturalResponse || [],
        ethicsAwareness: evidence.ethicsAwareness || [],
        activeListening: evidence.activeListening || [],
      },
      engagement,
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching results:', error);
    return NextResponse.json(
      { error: 'Failed to fetch results' },
      { status: 500 }
    );
  }
}
