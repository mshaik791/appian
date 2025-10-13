export function getEpasSnippets(competencyCode: string, limit: number = 4): string[] {
  const snippets: Record<string, string[]> = {
    "1": [
      "Demonstrates ethical decision-making using NASW Code of Ethics",
      "Maintains professional boundaries and demeanor in interactions",
      "Uses technology appropriately and ethically",
      "Seeks supervision and consultation when needed",
      "Shows commitment to ongoing professional development"
    ],
    "2": [
      "Recognizes and addresses personal biases and assumptions",
      "Engages clients as experts of their own experiences",
      "Demonstrates cultural humility and sensitivity",
      "Adapts communication style to client's cultural context",
      "Acknowledges power dynamics and privilege in relationships"
    ],
    "3": [
      "Advocates for client rights and social justice",
      "Challenges oppressive systems and structures",
      "Promotes equitable access to resources and services",
      "Addresses environmental and economic barriers",
      "Supports client self-determination and empowerment"
    ],
    "4": [
      "Uses research evidence to inform practice decisions",
      "Applies critical thinking to evaluate information",
      "Translates research findings into practical interventions",
      "Engages in evidence-based practice approaches",
      "Contributes to knowledge building through practice"
    ],
    "5": [
      "Understands how policies impact client well-being",
      "Advocates for policy changes that benefit clients",
      "Analyzes social welfare and economic policies",
      "Engages in policy development and implementation",
      "Connects micro practice to macro policy issues"
    ],
    "6": [
      "Establishes rapport and builds therapeutic relationships",
      "Uses empathy and active listening effectively",
      "Demonstrates warmth and genuineness in interactions",
      "Shows respect for client autonomy and dignity",
      "Engages clients in collaborative goal-setting"
    ],
    "7": [
      "Conducts comprehensive biopsychosocial assessments",
      "Identifies client strengths and resources",
      "Uses multiple assessment methods and sources",
      "Develops culturally sensitive assessment approaches",
      "Creates mutually agreed-upon intervention plans"
    ],
    "8": [
      "Implements evidence-based intervention strategies",
      "Adapts interventions to client needs and preferences",
      "Uses appropriate therapeutic techniques and modalities",
      "Monitors progress and adjusts interventions as needed",
      "Facilitates client empowerment and self-efficacy"
    ],
    "9": [
      "Evaluates intervention effectiveness and outcomes",
      "Uses both qualitative and quantitative evaluation methods",
      "Monitors client progress throughout intervention",
      "Applies evaluation findings to improve practice",
      "Documents outcomes and shares results appropriately"
    ]
  };

  const competencySnippets = snippets[competencyCode] || [];
  return competencySnippets.slice(0, limit);
}
