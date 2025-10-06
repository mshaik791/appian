import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/db';
import { redisClient } from '@/lib/redis';
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { z } from 'zod';
import { SimulationStatus, Speaker } from '@prisma/client';

const messageSchema = z.object({
  message: z.string().min(1, 'Message is required'),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken({ req: request });
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userRole = token.role as string;
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
        studentId: token.id || token.sub!,
        status: SimulationStatus.active,
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
        speaker: Speaker.student,
        text: validatedData.message,
      },
    });

    // Get conversation history from Redis or build from DB
    const redisKey = `simulation:${simulationId}`;
    let conversationHistory = await redisClient.get(redisKey);

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

           // Create a conversational prompt for natural dialogue
           const conversationalPrompt = `You are ${simulation.persona.name} having a casual, friendly conversation.
Keep responses SHORT (1-2 sentences max) and natural - like chatting with a friend.
For greetings like "hi" or "hello", respond warmly but briefly.
NO therapeutic/counseling language. NO motivational speeches.
Be conversational, not formal or robotic.

Person: ${validatedData.message}

Respond naturally as ${simulation.persona.name}:`;

    // Stream the response
    const result = await streamText({
      model: openai('gpt-4o-mini'), // Fixed: use openai directly, not openaiClient
      prompt: conversationalPrompt,
      maxTokens: 200, // Shorter responses for natural conversation
      temperature: 0.8, // Slightly more creative for natural responses
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
                speaker: Speaker.persona,
              text: fullResponse,
            },
          });

          // Update conversation history in Redis
          conversationHistory.turns.push({
                speaker: Speaker.persona,
            content: fullResponse,
            timestamp: personaTurn.createdAt,
          });

          await redisClient.set(
            redisKey,
            JSON.stringify(conversationHistory),
            3600 // 1 hour TTL
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
