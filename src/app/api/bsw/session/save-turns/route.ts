import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { caseId, simSessionId, answers } = body as {
      caseId?: string;
      simSessionId?: string;
      answers?: Array<{ order: number; text: string; questionText?: string }>;
    };

    if (!simSessionId || !Array.isArray(answers)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    for (const a of answers) {
      if (!a || typeof a.order !== 'number') continue;
      const text = (a.text ?? '').trim();
      const questionText = (a.questionText ?? '').trim();
      if (!text) continue;

      // Use raw SQL to avoid client mismatch issues
      await prisma.$executeRawUnsafe(
        `insert into "TurnLog" ("id", "simSessionId", "caseId", "order", "role", "questionText", "text")
         values ($1, $2, $3, $4, $5, $6, $7)
         on conflict ("simSessionId", "order", "role") do update
         set "text" = excluded."text",
             "questionText" = excluded."questionText",
             "caseId" = excluded."caseId"`,
        randomUUID(),
        simSessionId,
        caseId || null,
        a.order,
        'student',
        questionText || null,
        text,
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[save-turns] error', error);
    return NextResponse.json({ error: 'Failed to save turns' }, { status: 500 });
  }
}


