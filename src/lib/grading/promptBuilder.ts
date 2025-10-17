import { EvaluationRequest, GradingWeights } from './schema';

export interface PromptContext {
  caseId: string;
  caseContext: string;
  transcript: string;
  questionBreakdown: Array<{ order: number; prompt: string; answer: string }>;
  competencyCodes: string[];
  competencyTitles: Record<string, string>;
  snippets: string[];
  weights?: GradingWeights;
  track: 'BSW' | 'MSW';
  level: 'BSW' | 'MSW';
}

export function buildPrompt({
  caseContext,
  transcript,
  questionBreakdown,
  competencyCodes,
  competencyTitles,
  snippets,
  weights,
  track,
  level,
}: PromptContext): { system: string; user: string } {
  const systemPrompt = `You are a licensed field instructor assessing a ${level} student's clinical performance. You evaluate responses using anti-oppressive, trauma-informed, and culturally responsive frameworks. Your assessment focuses on evidence-based practice, ethical decision-making, and client-centered interventions.

You must return ONLY valid JSON matching exactly this TypeScript type:
{
  scores: {
    empathyEngagement: number,        // 1.0-5.0
    culturalResponsiveness: number,  // 1.0-5.0  
    ethicsProfessionalism: number,    // 1.0-5.0
    assessmentPlanning: number,      // 1.0-5.0
    overall: number                  // 1.0-5.0
  },
  competencyScores: Record<string, number>, // competency codes -> 1.0-5.0
  evidenceQuotes: string[],          // 1-8 verbatim quotes from transcript
  summary: string,                   // 300-800 words
  suggestions: string[]              // 3-6 actionable bullets
}

CRITICAL REQUIREMENTS:
- Do not include markdown fences or extra keys
- Do not explain your reasoning
- Scores must be numeric 1.0-5.0; use 0.5 increments allowed
- Evidence quotes must be copied verbatim from the transcript; do not invent
- If a competency isn't evidenced, score conservatively and explain in suggestions
- Overall score should reflect weighted average if weights provided`;

  const competencyDescriptions = competencyCodes
    .map(code => `${code}: ${competencyTitles[code] || 'Unknown competency'}`)
    .join('\n');

  const snippetText = snippets.length > 0 
    ? `\n\nRelevant competency guidance:\n${snippets.join('\n\n')}`
    : '';

  const weightsText = weights 
    ? `\n\nScoring weights:\n- Empathy & Engagement: ${(weights.empathyEngagement * 100).toFixed(0)}%\n- Cultural Responsiveness: ${(weights.culturalResponsiveness * 100).toFixed(0)}%\n- Ethics & Professionalism: ${(weights.ethicsProfessionalism * 100).toFixed(0)}%\n- Assessment & Planning: ${(weights.assessmentPlanning * 100).toFixed(0)}%`
    : '';

  const transcriptFormatted = transcript.length > 20000 
    ? transcript.substring(0, 20000) + '\n[...truncated for evaluation]'
    : transcript;

  const userPrompt = `CASE CONTEXT:
${caseContext}

COMPETENCIES TO EVALUATE:
${competencyDescriptions}${snippetText}${weightsText}

STUDENT RESPONSE TRANSCRIPT:
${transcriptFormatted}

EVALUATION INSTRUCTIONS:
Rate each competency 1.0-5.0 based on evidence in the transcript. Provide 1-8 specific quotes that demonstrate strengths or areas for improvement. Write a comprehensive summary (100-800 characters) focusing on clinical reasoning, cultural sensitivity, ethical practice, and client-centered care.

Return ONLY the JSON object as specified above.`;

  return { system: systemPrompt, user: userPrompt };
}
