export function getEpasSnippets(competencyCode: string, limit: number = 6): string[] {
    // Detailed, behavior-level indicators aligned to CSWE EPAS (2022).
    // Keep these observable, concrete, and suitable as rubric bullets for LLM grading and UI.
    const snippets: Record<string, string[]> = {
      "1": [
        "Applies NASW Code of Ethics to resolve dilemmas with clear rationale",
        "Identifies relevant laws/policies and explains how they shape decisions",
        "Maintains professional boundaries (time, scope, self-disclosure) consistently",
        "Uses self-reflection to notice bias/affect and adjusts approach in-session",
        "Demonstrates professional demeanor in tone, language, and nonverbal cues",
        "Communicates clearly in oral and written forms; summarizes and checks understanding",
        "Uses digital tools (notes, telehealth, AI) ethically and with client consent",
        "Seeks supervision/consultation when uncertain; documents guidance received",
        "Explains limit of confidentiality and obtains informed consent appropriately",
        "Demonstrates commitment to lifelong learning and self-care practices"
      ],
      "2": [
        "Elicits client identities and intersectional context without assumptions",
        "Names and challenges personal bias; rephrases to reduce microaggressions",
        "Centers client as expert of their lived experience; uses validating language",
        "Adapts communication (pace, phrasing, metaphors) to client’s culture/language",
        "Explains how power/privilege may affect the relationship and decision making",
        "Affirms pronouns, names, and cultural practices; integrates them into planning",
        "Recognizes structural barriers (e.g., access, discrimination) and collaborates on responses",
        "Demonstrates cultural humility via curiosity, not cultural stereotyping",
        "Invites correction and feedback about cultural fit of interventions",
        "Documents diversity-informed considerations in the care plan"
      ],
      "3": [
        "Advocates for client rights in-the-moment (access, safety, dignity)",
        "Identifies oppressive policies/practices and proposes alternatives",
        "Links individual concerns to broader social, racial, economic, and environmental justice",
        "Supports client self-determination while mitigating systemic harms",
        "Uses anti-racist lens to analyze presenting problems and service pathways",
        "Escalates concerns to organizational channels when rights are at risk",
        "Connects clients with resources that reduce inequities (legal aid, benefits, transport)",
        "Partners with community orgs to address structural barriers",
        "Documents incidents impacting rights and follows reporting protocols",
        "Frames advocacy goals collaboratively with measurable steps"
      ],
      "4": [
        "Cites relevant empirical findings to justify assessment or intervention choices",
        "Distinguishes correlation vs. causation; states limitations in evidence",
        "Adapts evidence to client context (culture, preferences, constraints)",
        "Describes plan for outcome measurement (qualitative/quantitative)",
        "Identifies potential bias in measures, sampling, or interpretation",
        "Uses practice data to refine hypotheses or next steps",
        "Translates research into plain language for client understanding",
        "Chooses ethical, culturally informed study/evaluation methods",
        "Synthesizes multiple sources (guidelines, studies, gray literature) coherently",
        "Documents rationale and evidence links in the plan"
      ],
      "5": [
        "Explains how a specific policy affects service eligibility or access",
        "Identifies inequitable policy impact on marginalized groups",
        "Formulates policy change ask (who, what, why) grounded in evidence",
        "Coaches clients on navigating systems while advocating upstream",
        "Collaborates with stakeholders to draft or comment on policy",
        "Tracks policy implementation barriers and reports them",
        "Frames recommendations using rights-based, anti-oppressive language",
        "Assesses unintended consequences of policy proposals",
        "Connects micro observations to macro policy analysis",
        "Documents advocacy steps and outcomes for accountability"
      ],
      "6": [
        "Establishes rapport through warmth, authenticity, and respect",
        "Uses open-ended questions to invite narrative and meaning",
        "Reflects feelings and content; checks accuracy of reflections",
        "Summarizes themes and transitions collaboratively",
        "Demonstrates empathy verbally and nonverbally (pace, silence, posture)",
        "Clarifies goals together; negotiates agenda respectfully",
        "Acknowledges power dynamics and invites shared decision-making",
        "Manages ruptures (misunderstandings, tension) with repair attempts",
        "Integrates family/community context when relevant and desired",
        "Closes the session with a concise, client-validated summary"
      ],
      "7": [
        "Conducts biopsychosocial-spiritual assessment with client input",
        "Identifies strengths, resources, and protective factors explicitly",
        "Assesses risks (harm, safety, exploitation) with collaborative safety planning",
        "Uses validated screening tools appropriately and explains results",
        "Integrates person-in-environment factors into clinical formulation",
        "Co-creates SMART goals that reflect client priorities and values",
        "Differentiates symptoms from contextually normative responses",
        "Accounts for cultural meaning of symptoms and help-seeking",
        "Engages interprofessional input when assessment is complex",
        "Documents assessment logic transparently and succinctly"
      ],
      "8": [
        "Selects interventions matched to goals, culture, and readiness",
        "Explains intervention rationale and obtains informed consent",
        "Uses evidence-informed techniques (e.g., MI, CBT skills) appropriately",
        "Adapts methods responsively based on client feedback/data",
        "Coordinates with other providers; clarifies roles and boundaries",
        "Advocates, negotiates, or mediates to reduce system barriers",
        "Supports client skill-building and self-efficacy with homework or practice",
        "Monitors progress; updates plan when targets are unmet",
        "Prepares for transitions/endings thoughtfully and collaboratively",
        "Documents intervention steps, outcomes, and next actions"
      ],
      "9": [
        "Defines clear outcomes and indicators aligned to client goals",
        "Chooses culturally responsive, low-burden measurement methods",
        "Collects data at agreed intervals; checks data quality",
        "Interprets results with client; explores meaning and fit",
        "Triangulates qualitative and quantitative information prudently",
        "Identifies what worked/what didn’t and why",
        "Translates findings into concrete practice adjustments",
        "Shares outcomes appropriately with consent and privacy safeguards",
        "Reflects on bias and limitations in evaluation design",
        "Creates a continuous improvement loop for future work"
      ]
    };
  
    const list = snippets[competencyCode] || [];
    return list.slice(0, Math.max(0, limit));
}
  