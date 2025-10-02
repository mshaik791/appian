'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { ChatWindow } from '@/components/ChatWindow';
import { MessageInput } from '@/components/MessageInput';

interface Message {
  id: string;
  content: string;
  speaker: 'student' | 'persona';
  timestamp: Date;
}

interface SimulationData {
  id: string;
  mode: 'learning' | 'assessment';
  case: {
    title: string;
    description: string;
  };
  persona: {
    name: string;
    promptTemplate: string;
  };
  turns: Array<{
    id: string;
    speaker: 'student' | 'persona';
    text: string;
    createdAt: string;
  }>;
}

export default function SimulationPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [simulation, setSimulation] = useState<SimulationData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [personaTyping, setPersonaTyping] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchSimulation = async () => {
      try {
        const response = await fetch(`/api/simulations/${resolvedParams.id}`, {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setSimulation(data);
          
          // Convert turns to messages
          const messageList = data.turns.map((turn: any) => ({
            id: turn.id,
            content: turn.text,
            speaker: turn.speaker,
            timestamp: new Date(turn.createdAt),
          }));
          setMessages(messageList);
        } else if (response.status === 404) {
          router.push('/student');
        }
      } catch (error) {
        console.error('Error fetching simulation:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSimulation();
  }, [resolvedParams.id, router]);

  const handleSendMessage = async (message: string) => {
    if (!simulation) return;

    setSending(true);
    setStreamingMessage('');
    setPersonaTyping(true);

    try {
      // Add student message immediately
      const studentMessage: Message = {
        id: `temp-${Date.now()}`,
        content: message,
        speaker: 'student',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, studentMessage]);

          // Send to API and handle streaming response
          const response = await fetch(`/api/simulations/${simulation.id}/message`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ message }),
          });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                fullResponse += data.content;
                setStreamingMessage(fullResponse);
              } else if (data.done) {
                // Streaming complete, add final message
                const personaMessage: Message = {
                  id: `persona-${Date.now()}`,
                  content: fullResponse,
                  speaker: 'persona',
                  timestamp: new Date(),
                };
                setMessages(prev => [...prev, personaMessage]);
                setStreamingMessage('');
                setPersonaTyping(false);
              } else if (data.error) {
                console.error('Streaming error:', data.error);
                setStreamingMessage('');
              }
            } catch (e) {
              // Ignore parsing errors for incomplete chunks
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setStreamingMessage('');
      setPersonaTyping(false);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <div className="text-lg">Loading simulation...</div>
      </div>
    );
  }

  if (!simulation) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Simulation not found</h1>
        <Link href="/student">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/student">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{simulation.case.title}</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Chatting with {simulation.persona.name}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-3">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <div className="relative">
                  <div className={`w-3 h-3 rounded-full shadow-lg ${
                    personaTyping 
                      ? 'bg-blue-500 shadow-blue-500/50 animate-pulse' 
                      : 'bg-green-500 shadow-green-500/50 animate-pulse'
                  }`}></div>
                  <div className={`absolute inset-0 w-3 h-3 rounded-full animate-ping opacity-75 ${
                    personaTyping ? 'bg-blue-400' : 'bg-green-400'
                  }`}></div>
                  <div className={`absolute inset-0 w-3 h-3 rounded-full animate-ping opacity-50 ${
                    personaTyping ? 'bg-blue-300' : 'bg-green-300'
                  }`} style={{ animationDelay: '0.5s' }}></div>
                </div>
                {personaTyping ? `${simulation.persona.name} is typing...` : 'Live Chat'}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
              <ChatWindow
                messages={messages}
                streamingMessage={streamingMessage}
                className="flex-1 min-h-0"
              />
              <div className="p-4 border-t">
                <MessageInput
                  onSendMessage={handleSendMessage}
                  disabled={sending}
                  placeholder={`Message ${simulation.persona.name}...`}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Case Information */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Case Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Mode</h4>
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  simulation.mode === 'learning' 
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                }`}>
                  {simulation.mode === 'learning' ? '📚 Learning' : '🎓 Assessment'}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Case Title</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {simulation.case.title}
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {simulation.case.description}
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Persona</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {simulation.persona.name}
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Messages</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {messages.length} messages exchanged
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
