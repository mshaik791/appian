import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redis } from '@/lib/redis';
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { z } from 'zod';

// Configure OpenAI with API key
const openaiClient = openai({
  apiKey: process.env.OPENAI_API_KEY,
});

const messageSchema = z.object({
  message: z.string().min(1, 'Message is required'),
});

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
    if (!['STUDENT', 'ADMIN'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const { id: simulationId } = await params;
    const body = await request.json();
    const validatedData = messageSchema.parse(body);

    // Get simulation details
    const simulation = await prisma.simulation.findFirst({
      where: {
        id: simulationId,
        studentId: session.user.id,
        status: 'active',
      },
      include: {
        case: {
          include: {
            rubric: true,
          },
        },
        persona: true,
        turns: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!simulation) {
      return NextResponse.json(
        { error: 'Simulation not found' },
        { status: 404 }
      );
    }

    // Save student's turn
    const studentTurn = await prisma.turn.create({
      data: {
        simulationId: simulationId,
        speaker: 'student',
        text: validatedData.message,
      },
    });

    // Get conversation history from Redis or build from DB
    const redisKey = `simulation:${simulationId}`;
    let conversationHistory = await redis.get(redisKey);

    if (!conversationHistory) {
      // Build initial conversation history
      conversationHistory = {
        turns: simulation.turns.map(turn => ({
          speaker: turn.speaker,
          content: turn.text,
          timestamp: turn.createdAt,
        })),
        personaPrompt: simulation.persona.promptTemplate,
        caseContext: {
          title: simulation.case.title,
          description: simulation.case.description,
          culturalContext: simulation.case.culturalContextJson,
          objectives: simulation.case.objectivesJson,
        },
      };
    } else {
      conversationHistory = JSON.parse(conversationHistory);
    }

    // Add student's new message to history
    conversationHistory.turns.push({
      speaker: 'student',
      content: validatedData.message,
      timestamp: studentTurn.createdAt,
    });

    // Build the prompt for the LLM
    const systemPrompt = simulation.persona.promptTemplate;
    const conversationContext = conversationHistory.turns
      .slice(-10) // Last 10 turns for context
      .map(turn => `${turn.speaker}: ${turn.content}`)
      .join('\n');

    const fullPrompt = `${systemPrompt}\n\nConversation so far:\n${conversationContext}\n\nRespond as the persona. Keep responses conversational and in character.`;

    // Stream the response
    const result = await streamText({
      model: openaiClient('gpt-4o-mini'), // Using a more cost-effective model
      prompt: fullPrompt,
      maxTokens: 500,
      temperature: 0.7,
    });

    // Create a readable stream for the response
    const encoder = new TextEncoder();
    let fullResponse = '';

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.textStream) {
            fullResponse += chunk;
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`)
            );
          }

          // Save persona's turn to database
          const personaTurn = await prisma.turn.create({
            data: {
              simulationId: simulationId,
              speaker: 'persona',
              text: fullResponse,
            },
          });

          // Update conversation history in Redis
          conversationHistory.turns.push({
            speaker: 'persona',
            content: fullResponse,
            timestamp: personaTurn.createdAt,
          });

          await redis.setex(
            redisKey,
            3600, // 1 hour TTL
            JSON.stringify(conversationHistory)
          );

          // Send completion signal
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`)
          );
          controller.close();
        } catch (error) {
          console.error('Error in streaming:', error);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: 'Streaming error' })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('Error processing message:', error);
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}
