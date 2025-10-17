import { callLLM } from './provider';
import { buildPrompt } from './promptBuilder';
import { gradingResultSchema, evaluationRequestSchema, GradingResult, GradingWeights } from './schema';

// Case contexts - move to a separate file if this grows
const CASE_CONTEXTS: Record<string, string> = {
  'bsw-maria-aguilar-s1': `Maria Aguilar is a 33-year-old Latinx mother of Mateo (9). She is bilingual (Spanish/English, prefers Spanish), undocumented, and recently experienced the detention of her spouse (José) by ICE. She works variable hours as a residential cleaner and lives with Mateo in a rent-burdened one-bedroom LA apartment. Maria is seeking counseling to navigate discrimination, family separation, and loss of community. The student's task is to engage, assess strengths and needs, and co-create immediate, feasible next steps while honoring cultural and legal sensitivities.`,
  'msw-parwin': `Parwin is a 28-year-old Afghan refugee who arrived in the US 6 months ago. She is seeking mental health services due to trauma from her journey and current adjustment challenges. She speaks limited English and relies on community interpreters. The student must provide culturally sensitive, trauma-informed care while navigating language barriers and cultural differences.`,
};

// CSWE competencies - move to a separate file if this grows
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

// EPA snippets - move to a separate file if this grows
const EPA_SNIPPETS: Record<string, string[]> = {
  'bsw-maria-aguilar-s1': [
    'Empathy & Engagement: Demonstrate active listening, validate emotions, and build rapport through culturally sensitive communication.',
    'Cultural Responsiveness: Acknowledge cultural differences, use appropriate language, and avoid assumptions about client experiences.',
    'Ethics & Professionalism: Maintain confidentiality, explain limits clearly, and provide information without giving legal advice.',
    'Assessment & Planning: Identify strengths and needs, collaborate on feasible next steps, and document appropriately.',
  ],
  'msw-parwin': [
    'Trauma-Informed Care: Recognize trauma responses, create safety, and avoid re-traumatization.',
    'Cultural Competence: Understand cultural context, use interpreters appropriately, and respect cultural values.',
    'Clinical Assessment: Gather comprehensive information while being sensitive to cultural and linguistic barriers.',
    'Intervention Planning: Develop culturally appropriate interventions that address both immediate and long-term needs.',
  ],
};

export interface EvaluationResult {
  grading: GradingResult;
  usedPromptTokens?: number;
  usedOutputTokens?: number;
}

export async function evaluateSession({
  caseId,
  simSessionId,
  transcript,
  competencyCodes,
  track,
  level,
  questionBreakdown,
  weights,
}: {
  caseId: string;
  simSessionId: string;
  transcript: string;
  competencyCodes: string[];
  track: 'BSW' | 'MSW';
  level: 'BSW' | 'MSW';
  questionBreakdown: Array<{ order: number; prompt: string; answer: string }>;
  weights?: GradingWeights;
}): Promise<EvaluationResult> {
  // Validate input
  const validatedInput = evaluationRequestSchema.parse({
    caseId,
    simSessionId,
    transcript,
    competencyCodes,
    track,
    level,
    questionBreakdown,
    weights,
  });

  // Get case context
  const caseContext = CASE_CONTEXTS[caseId];
  if (!caseContext) {
    throw new Error(`Unknown case ID: ${caseId}`);
  }

  // Get competency titles
  const competencyTitles = competencyCodes.reduce((acc, code) => {
    acc[code] = CSWE_COMPETENCIES[code] || `Competency ${code}`;
    return acc;
  }, {} as Record<string, string>);

  // Get snippets
  const snippets = EPA_SNIPPETS[caseId] || [];

  // Build prompt
  const { system, user } = buildPrompt({
    caseId,
    caseContext,
    transcript,
    questionBreakdown,
    competencyCodes,
    competencyTitles,
    snippets,
    weights,
    track,
    level,
  });

  // Call LLM
  const response = await callLLM({ system, user });

  // Parse and validate response
  let grading: GradingResult;
  try {
    const parsed = JSON.parse(response.content);
    grading = gradingResultSchema.parse(parsed);
  } catch (error) {
    console.error('Failed to parse LLM response:', response.content);
    throw new Error('Invalid grading response format');
  }

  // Apply weighted overall if weights provided and overall is missing/invalid
  if (weights && grading.scores.overall) {
    const weightedOverall = 
      grading.scores.empathyEngagement * weights.empathyEngagement +
      grading.scores.culturalResponsiveness * weights.culturalResponsiveness +
      grading.scores.ethicsProfessionalism * weights.ethicsProfessionalism +
      grading.scores.assessmentPlanning * weights.assessmentPlanning;
    
    grading.scores.overall = Math.round(weightedOverall * 2) / 2; // Round to nearest 0.5
  }

  return {
    grading,
    usedPromptTokens: response.usage?.promptTokens,
    usedOutputTokens: response.usage?.completionTokens,
  };
}
