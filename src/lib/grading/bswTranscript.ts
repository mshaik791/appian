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
  const turns = await prisma.turnLog.findMany({
    where: {
      simSessionId,
      role: 'student',
    },
    orderBy: {
      order: 'asc',
    },
  });

  if (turns.length === 0) {
    throw new Error(`No student turns found for session ${simSessionId}`);
  }

  // Get the case ID from the first turn to fetch questions
  const firstTurn = turns[0];
  if (!firstTurn.caseId) {
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
  const questionBreakdown: QuestionBreakdown[] = turns.map(turn => ({
    order: turn.order,
    prompt: questionMap.get(turn.order) || turn.questionText || `Question ${turn.order}`,
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
