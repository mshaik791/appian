import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getTemporaryEvalStore } from '@/lib/tmp/evalStore';
import { getCompetencyText } from '@/lib/competencies/cswe';
import { getEpasSnippets } from '@/lib/epas/rag';
import { z } from 'zod';

const feedbackSchema = z.object({
  caseId: z.string(),
  simSessionId: z.string().optional(),
  studentId: z.string().optional(),
  transcriptText: z.string().optional(),
});

// Helper function to get transcript from simulation
async function getTranscript(simSessionId: string): Promise<string> {
  const simulation = await prisma.simulation.findUnique({
    where: { id: simSessionId },
    include: {
      turns: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!simulation) {
    throw new Error('Simulation not found');
  }

  return simulation.turns
    .map(turn => `${turn.speaker}: ${turn.text}`)
    .join('\n');
}

// Helper function to validate and parse GPT response
function parseGptResponse(responseText: string) {
  try {
    const parsed = JSON.parse(responseText);
    
    // Validate and clamp scores to 1-5
    const scores = {
      // Default to 2 if missing so we don't mask weak outputs as "average"
      empathy: Math.max(1, Math.min(5, Math.round(parsed.scores?.empathy ?? 2))),
      culturalResponse: Math.max(1, Math.min(5, Math.round(parsed.scores?.culturalResponse ?? 2))),
      ethicsAwareness: Math.max(1, Math.min(5, Math.round(parsed.scores?.ethicsAwareness ?? 2))),
      activeListening: Math.max(1, Math.min(5, Math.round(parsed.scores?.activeListening ?? 2))),
    };

    // Ensure evidence arrays are arrays of strings
    const evidence = {
      empathy: Array.isArray(parsed.evidence?.empathy) ? parsed.evidence.empathy.filter(Boolean).slice(0, 3) : [],
      culturalResponse: Array.isArray(parsed.evidence?.culturalResponse) ? parsed.evidence.culturalResponse.filter(Boolean).slice(0, 3) : [],
      ethicsAwareness: Array.isArray(parsed.evidence?.ethicsAwareness) ? parsed.evidence.ethicsAwareness.filter(Boolean).slice(0, 3) : [],
      activeListening: Array.isArray(parsed.evidence?.activeListening) ? parsed.evidence.activeListening.filter(Boolean).slice(0, 3) : [],
    };

    // Enforce strict cap: fewer than 2 quotes -> max score 2
    const quoteCounts = {
      empathy: evidence.empathy.length,
      culturalResponse: evidence.culturalResponse.length,
      ethicsAwareness: evidence.ethicsAwareness.length,
      activeListening: evidence.activeListening.length,
    } as const;

    if (quoteCounts.empathy < 2) scores.empathy = Math.min(scores.empathy, 2);
    if (quoteCounts.culturalResponse < 2) scores.culturalResponse = Math.min(scores.culturalResponse, 2);
    if (quoteCounts.ethicsAwareness < 2) scores.ethicsAwareness = Math.min(scores.ethicsAwareness, 2);
    if (quoteCounts.activeListening < 2) scores.activeListening = Math.min(scores.activeListening, 2);

    return {
      scores,
      evidence,
      summary: parsed.summary || 'No summary provided',
      competencyAlignment: parsed.competencyAlignment || [],
      confidence: Math.max(0, Math.min(1, parsed.confidence || 0.5)),
    };
  } catch (error) {
    console.error('Error parsing GPT response:', error);
    throw new Error('Invalid response format from AI');
  }
}

export async function POST(request: NextRequest) {
  try {
    // TEMP: bypass auth during testing (remove when enabling DB)
    const token: any = { id: 'demo-student' };

    const body = await request.json();
    const validatedData = feedbackSchema.parse(body);

    const { caseId, simSessionId, studentId, transcriptText } = validatedData;

    // Load case with competency information
    const caseData = await prisma.case.findUnique({
      where: { id: caseId },
      include: {
        competency: true,
      },
    });

    if (!caseData) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }

    // Temporary in-memory idempotency (bypass DB while testing)
    const tmpStore = getTemporaryEvalStore();
    const storeKey = `${caseId}::${simSessionId || 'demo'}`;
    const existingEvaluation = tmpStore.get(storeKey);
    if (existingEvaluation) {
      return NextResponse.json(existingEvaluation, { status: 200 });
    }

    // Build transcript string
    let finalTranscriptText = '';
    if (transcriptText) {
      finalTranscriptText = transcriptText.trim();
    } else if (simSessionId) {
      finalTranscriptText = await getTranscript(simSessionId);
    }

    if (!finalTranscriptText) {
      return NextResponse.json(
        { error: 'Cannot grade empty session' },
        { status: 400 }
      );
    }

    // Get competency information
    const competencyCode = caseData.competency.name.match(/\d+/)?.[0] || '1';
    const competencyText = getCompetencyText(competencyCode);
    const epasSnippets = getEpasSnippets(competencyCode, 6);

    // Compose GPT messages
    const systemMessage = `You are a graduate social work evaluator. Grade the student's performance strictly against the CSWE EPAS competency provided. Be trauma-informed and culturally humble. Cite exact transcript quotes as evidence. Write like a rigorous practicum instructor (precise, specific, non-generic). Avoid grade inflation. Output ONLY valid JSON.`;

    const interactionLines = finalTranscriptText.split('\n').filter(l => l.trim().length > 0);
    const isVeryShort = interactionLines.length < 6;

    const userMessage = `
Case Title: ${caseData.title}
Learning Objectives: ${JSON.stringify(caseData.learningObjectivesJson)}

TARGET COMPETENCY:
${competencyText}

CSWE EXCERPTS:
${epasSnippets.map(snippet => `- ${snippet}`).join('\n')}

TRANSCRIPT:
${finalTranscriptText}

SCORING RULES + REQUIRED OUTPUT SCHEMA:
Rate each dimension 1-5 (1=needs improvement, 5=excellent). Provide 2-3 exact quotes as evidence for each dimension.
Important (strict policy):
- Ground your assessment explicitly in the TARGET COMPETENCY language and EXCERPTS. Make the rationale competency-specific, not generic.
- Do NOT default to 3. If the transcript shows minimal or no evidence, score conservatively (1-2) and explain why.
- ${isVeryShort ? 'The interaction is very short. Be especially conservative: use 1-2 unless there is clear, quoted evidence for higher scores.' : 'Use the provided quotes to justify any score ≥3.'}
- Evidence quotes must be verbatim lines from TRANSCRIPT. If you cannot find 2 quotes for a dimension, cap that dimension at 2.
 - Prefer quotes that align with EPAS subpoints; briefly reference which subpoint each quote reflects.

{
  "scores": {
    "empathy": 1-5,
    "culturalResponse": 1-5,
    "ethicsAwareness": 1-5,
    "activeListening": 1-5
  },
  "evidence": {
    "empathy": ["<quote>", "..."],
    "culturalResponse": ["..."],
    "ethicsAwareness": ["..."],
    "activeListening": ["..."]
  },
  "summary": "<=400 words, supportive, one actionable suggestion. Reference the competency explicitly.",
  "competencyAlignment": [
    {"code":"C${competencyCode}","statement":"map observed behavior to a specific EPAS subpoint or explain the gap"}
  ],
  "confidence": 0.0-1.0
}
`;

    // Call OpenAI
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.1,
        max_tokens: 1100,
      }),
    });

    if (!openaiResponse.ok) {
      throw new Error('OpenAI API call failed');
    }

    const openaiData = await openaiResponse.json();
    const gptResponse = openaiData.choices[0]?.message?.content;

    if (!gptResponse) {
      throw new Error('No response from OpenAI');
    }

    // Parse and validate GPT response
    const evaluation = parseGptResponse(gptResponse);

    // Determine student ID
    const finalStudentId = studentId || token.id || token.sub || 'demo-student';

    // Build response shape (mirrors DB model shape used by /api/results)
    const savedEvaluation = {
      id: `tmp_${Date.now()}`,
      simSessionId: simSessionId || null,
      caseId,
      studentId: finalStudentId,
      empathy: evaluation.scores.empathy,
      culturalResponse: evaluation.scores.culturalResponse,
      ethicsAwareness: evaluation.scores.ethicsAwareness,
      activeListening: evaluation.scores.activeListening,
      summary: evaluation.summary,
      evidenceJson: evaluation.evidence,
      competencyAlignmentJson: evaluation.competencyAlignment,
      modelConfidence: evaluation.confidence,
      createdAt: new Date().toISOString(),
      case: { title: caseData.title, competency: { name: caseData.competency.name } },
    } as any;

    // Save to temporary in-memory store
    tmpStore.set(storeKey, savedEvaluation);

    return NextResponse.json({
      ...savedEvaluation,
      // Echo the key so the loader can match even if the original sid was missing/mismatched
      storeKey,
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error in feedback API:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to process feedback' },
      { status: 500 }
    );
  }
}
