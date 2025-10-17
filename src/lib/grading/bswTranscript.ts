import { PrismaClient } from '@prisma/client';

export interface QuestionBreakdown {
  order: number;
  prompt: string;
  answer: string;
}

export interface BswTranscriptResult {
  transcript: string;
  questionBreakdown: QuestionBreakdown[];
}

export async function getBswTranscript({
  simSessionId,
  prisma,
}: {
  simSessionId: string;
  prisma: PrismaClient;
}): Promise<BswTranscriptResult> {
  // Load TurnLog rows for the session with role:"student", order ASC
  // Use raw query to avoid potential client delegate issues
  const turns = await prisma.$queryRawUnsafe<any[]>
    (
      `select "order", "text", "questionText", "caseId"
       from "TurnLog"
       where "simSessionId" = $1 and "role" = 'student'
       order by "order" asc`,
      simSessionId
    );

  if (turns.length === 0) {
    throw new Error(`No student turns found for session ${simSessionId}`);
  }

  // Get the case ID from the first turn to fetch questions
  const firstTurn = turns[0];
  if (!firstTurn?.caseId) {
    throw new Error(`No case ID found for session ${simSessionId}`);
  }

  // Fetch case questions for context
  const caseQuestions = await prisma.caseQuestion.findMany({
    where: {
      caseId: firstTurn.caseId,
    },
    orderBy: {
      order: 'asc',
    },
  });

  // Create a map of order to question text
  const questionMap = new Map(
    caseQuestions.map(q => [q.order, q.text])
  );

  // Build question breakdown
  const questionBreakdown: QuestionBreakdown[] = turns.map((turn: any) => ({
    order: Number(turn.order),
    prompt: questionMap.get(Number(turn.order)) || turn.questionText || `Question ${turn.order}`,
    answer: turn.text || '(no answer)',
  }));

  // Build transcript string
  const transcriptParts = questionBreakdown.map(q => 
    `Q${q.order} (Prompt): ${q.prompt}\nStudent: ${q.answer}`
  );

  const transcript = transcriptParts.join('\n\n');

  return {
    transcript,
    questionBreakdown,
  };
}
