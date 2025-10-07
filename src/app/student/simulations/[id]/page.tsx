'use client';

import { useState, useEffect, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { ChatWindow } from '@/components/ChatWindow';
import { MessageInput } from '@/components/MessageInput';
import { startHeygenSession, type HeyGenSession } from '@/drivers/heygen';
import { StreamingEvents } from '@heygen/streaming-avatar';
// Vendor-style TTS: speak once per final response (no incremental buffer)
import { TurnManager } from '@/realtime/turn-manager';

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
    avatarId: string;
    voiceId: string;
  };
  turns: Array<{
    id: string;
    speaker: 'student' | 'persona';
    text: string;
    createdAt: string;
  }>;
}

export default function SimulationPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams?: Record<string, string | string[]> }) {
  const resolvedParams = use(params);
  const [simulation, setSimulation] = useState<SimulationData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [transcript, setTranscript] = useState<Array<{ id: string; sender: 'user' | 'avatar'; content: string }>>([]);
  const [muted, setMuted] = useState<boolean>(false);
  const [voiceActive, setVoiceActive] = useState<boolean>(false);
  const [isUserTalking, setIsUserTalking] = useState<boolean>(false);
  const [isAvatarTalking, setIsAvatarTalking] = useState<boolean>(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [personaTyping, setPersonaTyping] = useState(false);
  const [captions, setCaptions] = useState<string>("");
  const [turnState, setTurnState] = useState<"idle" | "student_listening" | "persona_speaking" | "cooldown">("student_listening");
  const avatarRef = useRef<HeyGenSession | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const turnManagerRef = useRef<TurnManager | null>(null);
  const router = useRouter();
  // Buffer for live ASR emitted by HeyGen SDK
  const asrBufferRef = useRef<string>("");
  const transcriptSenderRef = useRef<'user'|'avatar'|null>(null);

  // Initialize turn manager
  useEffect(() => {
    turnManagerRef.current = new TurnManager({
      onStateChange: (newState) => {
        console.log("🎯 Turn state changed:", newState);
        setTurnState(newState);
      }
    });
    turnManagerRef.current.start();
    return () => { turnManagerRef.current = null; };
  }, []);

  // No custom mic auto-start; voice chat is handled by HeyGen SDK
  useEffect(() => {}, [turnState]);

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

  // Initialize HeyGen avatar session when simulation data is loaded
  useEffect(() => {
    if (!simulation || !videoRef.current) return;

    const initAvatar = async () => {
      try {
        // Get token from our API
        const response = await fetch("/api/avatar/session", {
          method: "POST",
        });

        if (!response.ok) {
          throw new Error(`Failed to get token: ${response.status}`);
        }

        const { token } = await response.json();

        // Pull any experiment selections from sessionStorage if present
        let expVoiceId: string | undefined;
        let expKnowledgeId: string | undefined;
        let expLanguage: string | undefined;
        let expQuality: any;
        try {
          if (typeof window !== 'undefined') {
            expVoiceId = sessionStorage.getItem('heygen.experiment.voiceId') || undefined;
            expKnowledgeId = sessionStorage.getItem('heygen.experiment.knowledgeId') || undefined;
            expLanguage = sessionStorage.getItem('heygen.experiment.language') || undefined;
            expQuality = (sessionStorage.getItem('heygen.experiment.quality') as any) || undefined;
          }
        } catch {}

        // Start HeyGen session
        const session = await startHeygenSession({
          token,
          videoEl: videoRef.current!,
          avatarName: "Pedro_Chair_Sitting_public",
          voiceId: expVoiceId || (typeof searchParams?.voiceId === 'string' && searchParams?.voiceId) || simulation.persona.voiceId || "Fpmh5GZLmV0wU1dCR06y",
          knowledgeId: expKnowledgeId || (typeof searchParams?.knowledgeId === 'string' ? searchParams?.knowledgeId : undefined),
          language: expLanguage || (typeof searchParams?.language === 'string' ? searchParams?.language : undefined),
          quality: expQuality || (typeof searchParams?.quality === 'string' ? (searchParams?.quality as any) : undefined),
          onStartSpeak: () => {
            setIsAvatarTalking(true);
            turnManagerRef.current?.lockForPersona();
          },
          onEndSpeak: () => {
            setIsAvatarTalking(false);
            turnManagerRef.current?.personaDone();
          },
        });

        // Vendor-style event handling
        session.on(StreamingEvents.USER_START as any, () => {
          setIsUserTalking(true);
        });
        session.on(StreamingEvents.USER_STOP as any, () => {
          setIsUserTalking(false);
        });
        session.on(StreamingEvents.AVATAR_START_TALKING as any, () => {
          setIsAvatarTalking(true);
          turnManagerRef.current?.lockForPersona();
        });
        session.on(StreamingEvents.AVATAR_STOP_TALKING as any, () => {
          setIsAvatarTalking(false);
          turnManagerRef.current?.personaDone();
        });
        session.on(StreamingEvents.USER_TALKING_MESSAGE as any, ({ detail }: any) => {
          asrBufferRef.current = `${asrBufferRef.current}${detail.message}`;
          setCaptions(asrBufferRef.current);

          // Append to transcript as USER (merge tokens like vendor)
          setTranscript((prev) => {
            if (transcriptSenderRef.current === 'user' && prev.length > 0) {
              const last = prev[prev.length - 1];
              return [...prev.slice(0, -1), { ...last, content: last.content + detail.message }];
            }
            transcriptSenderRef.current = 'user';
            return [...prev, { id: `${Date.now()}-u`, sender: 'user', content: detail.message }];
          });
        });
        session.on(StreamingEvents.USER_END_MESSAGE as any, async () => {
          const finalText = asrBufferRef.current.trim();
          asrBufferRef.current = "";
          setCaptions("");
          if (finalText.length >= 3 && turnManagerRef.current?.canAcceptStudentFinal()) {
            await handleSendMessage(finalText);
          }
          transcriptSenderRef.current = null;
        });

        session.on(StreamingEvents.AVATAR_TALKING_MESSAGE as any, ({ detail }: any) => {
          // Append to transcript as AVATAR
          setTranscript((prev) => {
            if (transcriptSenderRef.current === 'avatar' && prev.length > 0) {
              const last = prev[prev.length - 1];
              return [...prev.slice(0, -1), { ...last, content: last.content + detail.message }];
            }
            transcriptSenderRef.current = 'avatar';
            return [...prev, { id: `${Date.now()}-a`, sender: 'avatar', content: detail.message }];
          });
        });
        session.on(StreamingEvents.AVATAR_END_MESSAGE as any, () => {
          transcriptSenderRef.current = null;
        });

        avatarRef.current = session;

        // Auto-start voice chat like the vendor demo
        try {
          await session.startVoice();
          setVoiceActive(true);
        } catch (e) {
          console.warn('Auto-start voice chat failed; user gesture may be required', e);
        }
      } catch (error) {
        console.error("Error initializing avatar:", error);
      }
    };

    initAvatar();

    return () => {
      if (avatarRef.current) {
        avatarRef.current.off(StreamingEvents.USER_START as any);
        avatarRef.current.off(StreamingEvents.USER_STOP as any);
        avatarRef.current.off(StreamingEvents.AVATAR_START_TALKING as any);
        avatarRef.current.off(StreamingEvents.AVATAR_STOP_TALKING as any);
        avatarRef.current.off(StreamingEvents.USER_TALKING_MESSAGE as any);
        avatarRef.current.off(StreamingEvents.USER_END_MESSAGE as any);
        avatarRef.current.off(StreamingEvents.AVATAR_TALKING_MESSAGE as any);
        avatarRef.current.off(StreamingEvents.AVATAR_END_MESSAGE as any);
        avatarRef.current.off(StreamingEvents.CONNECTION_QUALITY_CHANGED as any);
        avatarRef.current.end();
        avatarRef.current = null;
      }
    };
  }, [simulation]);

  const handleSendMessage = async (message: string) => {
    console.log("💬 handleSendMessage called with:", message);
    if (!simulation) {
      console.log("❌ No simulation data");
      return;
    }

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

      console.log("📤 Sending to LLM API...");
      // Send to API and handle streaming response
      const response = await fetch(`/api/simulations/${simulation.id}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message }),
      });
      
      console.log("📥 LLM API response:", response.status, response.ok);

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      // Handle streaming response (vendor behavior for TTS: speak once at end)
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let fullResponse = '';
      
      // Lock for persona; avatar will speak after we receive final text
      turnManagerRef.current?.lockForPersona();

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

                // Single-utterance TTS like vendor - only if avatar is not already talking
                if (avatarRef.current && fullResponse.trim() && !isAvatarTalking) {
                  try {
                    await avatarRef.current.speak(fullResponse);
                  } catch (error) {
                    console.error("Error speaking:", error);
                  }
                }
                // Transcript append
                setTranscript(prev => [...prev, { id: `t-${Date.now()}`, sender: 'avatar', content: fullResponse }]);
                // If SDK doesn't emit "end", call personaDone
                turnManagerRef.current?.personaDone();
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
        {/* Immersive Avatar Panel */}
        <div className="lg:col-span-3">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                {simulation.persona.name} — {simulation.case.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 grid grid-rows-[1fr_auto] gap-4">
              <div className="flex-1 rounded-2xl overflow-hidden bg-black/20">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  onClick={async () => {
                    // One-tap to start voice chat (browser gesture)
                    if (!avatarRef.current) return;
                    if (!voiceActive) {
                      try { await avatarRef.current.startVoice(); setVoiceActive(true); } catch {}
                    }
                  }}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={async () => {
                      if (!avatarRef.current) return;
                      if (!voiceActive) {
                        await avatarRef.current.startVoice();
                        setVoiceActive(true);
                      } else {
                        avatarRef.current.stopVoice();
                        setVoiceActive(false);
                      }
                    }}
                    className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors shadow ${voiceActive ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                  >
                    {voiceActive ? 'Voice Chat On' : 'Start Voice Chat'}
                  </button>
                  <button
                    onClick={() => {
                      if (!avatarRef.current) return;
                      if (muted) {
                        avatarRef.current.unmute();
                        setMuted(false);
                      } else {
                        avatarRef.current.mute();
                        setMuted(true);
                      }
                    }}
                    className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors shadow ${muted ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-gray-600 hover:bg-gray-700 text-white'}`}
                  >
                    {muted ? 'Unmute Mic' : 'Mute Mic'}
                  </button>
                  <button
                    onClick={() => {
                      avatarRef.current?.interrupt();
                    }}
                    className="rounded-md px-4 py-2 text-sm font-semibold transition-colors shadow bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    Interrupt
                  </button>
                </div>
                <div className="text-sm text-white/70 mt-2 text-center min-h-5">
                  {captions || ' '}
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Transcript below stream - merges live USER/AVATAR messages like vendor */}
          <div className="mt-4">
            <div className="text-xs uppercase tracking-wide text-white/60 mb-2">Transcript</div>
            <div className="h-48 overflow-auto rounded-md border border-white/10 bg-white/5 px-3 py-3 text-sm text-white/80">
              {transcript.length === 0 && (
                <div className="text-white/40">Speak to the avatar or click Start Voice Chat to see the live transcript…</div>
              )}
              {transcript.map((m) => (
                <div key={m.id} className="mb-2 leading-relaxed">
                  <span className={`mr-2 rounded px-1.5 py-0.5 text-[10px] uppercase tracking-wide ${m.sender === 'user' ? 'bg-blue-500/30 text-blue-200' : 'bg-green-500/30 text-green-200'}`}>{m.sender === 'user' ? 'You' : 'Avatar'}</span>
                  <span>{m.content}</span>
                </div>
              ))}
            </div>
          </div>
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
