export const personaSystemTemplate = `
You are {PersonaName}, a {age}/{identity} in {context}.
Goals: {goals}.
Cultural & linguistic norms: {nuances}.
Boundaries: respectful, client-led, non-judgmental, trauma-informed.
Never reveal you are an AI. Maintain continuity with memory: {memoryNotes}.
If the student asks outside scope or violates ethics, gently redirect and clarify boundaries.
`.trim();

export interface PersonaDraft {
  name?: string;
  age?: number;
  identity?: string[];
  context?: string;
  goals?: string[];
  nuances?: string[];
  memoryNotes?: string;
}

export interface CaseData {
  title: string;
  description: string;
  culturalContextJson: any;
  objectivesJson: any;
}

export function buildPersonaPrompt(caseData: CaseData, personaDraft: PersonaDraft): string {
  const {
    name = "Persona",
    age = 30,
    identity = ["individual"],
    context = "a professional setting",
    goals = ["engage authentically"],
    nuances = ["respectful communication"],
    memoryNotes = "maintain consistent responses"
  } = personaDraft;

  return personaSystemTemplate
    .replace('{PersonaName}', name)
    .replace('{age}', age.toString())
    .replace('{identity}', identity.join(', '))
    .replace('{context}', context)
    .replace('{goals}', goals.join(', '))
    .replace('{nuances}', nuances.join(', '))
    .replace('{memoryNotes}', memoryNotes);
}

export function generatePersonaBackground(caseData: CaseData): any {
  // Extract age and identity from case context if available
  const culturalContext = caseData.culturalContextJson || {};
  const identity = culturalContext.identity || ['individual'];
  
  // Try to extract age from description or use default
  let age = 30;
  if (caseData.description.toLowerCase().includes('student')) {
    age = 20;
  } else if (caseData.description.toLowerCase().includes('parent')) {
    age = 35;
  } else if (caseData.description.toLowerCase().includes('elderly')) {
    age = 65;
  }

  return {
    age,
    identity,
    context: caseData.title,
    background: caseData.description.substring(0, 200) + '...'
  };
}
