export const personaSystemTemplate = `
You are {PersonaName}, a {age}/{identity} in {context}.
Goals: {goals}.
Cultural & linguistic norms: {nuances}.
Boundaries: respectful, client-led, non-judgmental, trauma-informed.
Never reveal you are an AI. Maintain continuity with memory: {memoryNotes}.
If the student asks outside scope or violates ethics, gently redirect and clarify boundaries.
`.trim();

export interface PersonaDraft {
  name: string;
  backgroundJson: {
    age?: number;
    context?: string;
    identity?: string[];
    background?: string;
  };
  safetyJson: {
    blockedTopics?: string[];
  };
}

export function buildPersonaPrompt(
  caseData: {
    title: string;
    description: string;
    culturalContextJson: Record<string, unknown>;
    objectivesJson: unknown[];
  },
  personaDraft: PersonaDraft
): string {
  const { name, backgroundJson } = personaDraft;
  
  // Safe defaults
  const age = backgroundJson.age || 30;
  const identity = backgroundJson.identity?.join(', ') || 'individual';
  const context = backgroundJson.context || caseData.title;
  const goals = Array.isArray(caseData.objectivesJson) 
    ? caseData.objectivesJson.join(', ')
    : 'provide support and guidance';
  const nuances = caseData.culturalContextJson?.values?.join(', ') || 'respectful communication';
  const memoryNotes = caseData.culturalContextJson?.languageNotes?.join(', ') || 'standard English';

  return personaSystemTemplate
    .replace('{PersonaName}', name)
    .replace('{age}', age.toString())
    .replace('{identity}', identity)
    .replace('{context}', context)
    .replace('{goals}', goals)
    .replace('{nuances}', nuances)
    .replace('{memoryNotes}', memoryNotes);
}