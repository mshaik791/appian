import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { HEYGEN_AVATAR_OPTIONS, VOICE_OPTIONS } from '@/data/avatarOptions';
import { buildPersonaPrompt } from '@/prompts/persona';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userRole = (session.user as any)?.role;
    if (!['FACULTY', 'ADMIN'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const { id: caseId } = await params;

    const caseItem = await prisma.case.findUnique({
      where: { id: caseId },
    });

    if (!caseItem) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    // Mock LLM generation for persona details
    const randomAvatar =
      HEYGEN_AVATAR_OPTIONS[
        Math.floor(Math.random() * HEYGEN_AVATAR_OPTIONS.length)
      ];
    const randomVoice =
      VOICE_OPTIONS[Math.floor(Math.random() * VOICE_OPTIONS.length)];

    // Simple placeholder name generation
    const personaCount = await prisma.persona.count({ where: { caseId } });
    const personaName = `Persona ${String.fromCharCode(65 + personaCount)}`; // Persona A, Persona B, etc.

    // Derive background from case description (simplified)
    const backgroundJson = {
      age: Math.floor(Math.random() * 30) + 20, // Random age between 20-49
      context: caseItem.title,
      identity: (caseItem.culturalContextJson as any)?.identity || [],
      background: caseItem.description,
    };

    const safetyJson = {
      blockedTopics: ['diagnosis', 'legal advice', 'self-harm instructions'],
    };

    const promptTemplate = buildPersonaPrompt(caseItem, {
      name: personaName,
      backgroundJson,
      safetyJson,
    });

    const newPersona = await prisma.persona.create({
      data: {
        caseId,
        name: personaName,
        avatarId: randomAvatar.id,
        voiceId: randomVoice.id,
        promptTemplate: promptTemplate,
        backgroundJson: backgroundJson,
        safetyJson: safetyJson,
      },
    });

    return NextResponse.json(newPersona, { status: 201 });
  } catch (error: any) {
    console.error('Error generating persona:', error);
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to generate persona' },
      { status: 500 }
    );
  }
}
