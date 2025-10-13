'use client';

import { useState, useEffect, use, useRef, useCallback } from 'react';
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

// Message sender enum like vendor demo
enum MessageSender {
  CLIENT = "CLIENT",
  AVATAR = "AVATAR",
}

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
  const [transcript, setTranscript] = useState<Array<{ id: string; sender: MessageSender; content: string }>>([]);
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
  const currentSenderRef = useRef<MessageSender | null>(null);
  const messageIdCounter = useRef(0);
  
  // Generate truly unique IDs
  const generateUniqueId = () => {
    messageIdCounter.current += 1;
    return `${Date.now()}-${messageIdCounter.current}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Message handlers exactly like vendor demo
  const handleUserTalkingMessage = useCallback(({ detail }: { detail: any }) => {
    console.log("👤 User talking message:", detail.message);
    
    // Update captions for live display
    asrBufferRef.current = `${asrBufferRef.current}${detail.message}`;
    setCaptions(asrBufferRef.current);

    // Handle transcript exactly like vendor demo
    if (currentSenderRef.current === MessageSender.CLIENT) {
      setTranscript((prev) => [
        ...prev.slice(0, -1),
        {
          ...prev[prev.length - 1],
          content: [prev[prev.length - 1].content, detail.message].join(""),
        },
      ]);
    } else {
      currentSenderRef.current = MessageSender.CLIENT;
      setTranscript((prev) => [
        ...prev,
        {
          id: generateUniqueId(),
          sender: MessageSender.CLIENT,
          content: detail.message,
        },
      ]);
    }
  }, []);

  const handleStreamingTalkingMessage = useCallback(({ detail }: { detail: any }) => {
    console.log("🎭 Avatar talking message:", detail.message);
    
    // Handle transcript exactly like vendor demo
    if (currentSenderRef.current === MessageSender.AVATAR) {
      setTranscript((prev) => [
        ...prev.slice(0, -1),
        {
          ...prev[prev.length - 1],
          content: [prev[prev.length - 1].content, detail.message].join(""),
        },
      ]);
    } else {
      currentSenderRef.current = MessageSender.AVATAR;
      setTranscript((prev) => [
        ...prev,
        {
          id: generateUniqueId(),
          sender: MessageSender.AVATAR,
          content: detail.message,
        },
      ]);
    }
  }, []);

  const handleEndMessage = useCallback(() => {
    console.log("🔚 End message - resetting sender");
    currentSenderRef.current = null;
  }, []);

  const clearTranscript = () => {
    console.log("🧹 Clearing transcript");
    setTranscript([]);
    currentSenderRef.current = null;
    messageIdCounter.current = 0;
  };

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

        // Skip knowledge base creation for now - HeyGen API endpoint may not be available
        let knowledgeId: string | undefined;
        console.log("⚠️ Skipping knowledge base creation - using avatar without knowledge base");
        console.log("📝 Persona context:", `${simulation.persona.name} - ${simulation.case.title}`);
        console.log("📝 Persona prompt:", simulation.persona.promptTemplate);

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

        // Start HeyGen session with knowledge base for automatic responses
        const finalKnowledgeId = expKnowledgeId || knowledgeId || (typeof searchParams?.knowledgeId === 'string' ? searchParams?.knowledgeId : undefined);
        console.log("🔧 Starting HeyGen session with knowledge base:", finalKnowledgeId);
        
        const session = await startHeygenSession({
          token,
          videoEl: videoRef.current!,
          avatarName: "Pedro_Chair_Sitting_public",
          voiceId: expVoiceId || (typeof searchParams?.voiceId === 'string' && searchParams?.voiceId) || simulation.persona.voiceId || "Fpmh5GZLmV0wU1dCR06y",
          knowledgeId: finalKnowledgeId,
          language: expLanguage || (typeof searchParams?.language === 'string' ? searchParams?.language : undefined),
          quality: expQuality || (typeof searchParams?.quality === 'string' ? (searchParams?.quality as any) : undefined),
          onStartSpeak: () => {
            console.log("🎤 Avatar started speaking");
            setIsAvatarTalking(true);
            turnManagerRef.current?.lockForPersona();
          },
          onEndSpeak: () => {
            console.log("🎤 Avatar finished speaking");
            setIsAvatarTalking(false);
            turnManagerRef.current?.personaDone();
          },
        });

        // Create event handlers to avoid duplicate registrations
        const userStartHandler = () => {
          console.log("🎤 USER_START event - user started talking");
          setIsUserTalking(true);
        };
        
        const userStopHandler = () => {
          console.log("🎤 USER_STOP event - user stopped talking");
          setIsUserTalking(false);
        };
        
        const avatarStartHandler = () => {
          console.log("🎭 Avatar started talking");
          setIsAvatarTalking(true);
          turnManagerRef.current?.lockForPersona();
        };
        
        const avatarStopHandler = () => {
          console.log("🎭 Avatar stopped talking");
          setIsAvatarTalking(false);
          turnManagerRef.current?.personaDone();
        };
        
        const userEndHandler = () => {
          console.log("🔚 USER_END_MESSAGE - user finished speaking");
          const finalText = asrBufferRef.current.trim();
          asrBufferRef.current = "";
          setCaptions("");
          
          // In voice chat mode, let HeyGen handle the conversation with knowledge base
          console.log("User finished speaking:", finalText);
          console.log("Letting HeyGen knowledge base handle the response automatically");
          
          handleEndMessage();
        };
        
        const avatarEndHandler = () => {
          console.log("🔚 AVATAR_END_MESSAGE - avatar finished speaking");
          handleEndMessage();
        };

        // Register events exactly like vendor demo
        session.on(StreamingEvents.USER_START as any, userStartHandler);
        session.on(StreamingEvents.USER_STOP as any, userStopHandler);
        session.on(StreamingEvents.AVATAR_START_TALKING as any, avatarStartHandler);
        session.on(StreamingEvents.AVATAR_STOP_TALKING as any, avatarStopHandler);
        session.on(StreamingEvents.USER_TALKING_MESSAGE as any, handleUserTalkingMessage);
        session.on(StreamingEvents.AVATAR_TALKING_MESSAGE as any, handleStreamingTalkingMessage);
        session.on(StreamingEvents.USER_END_MESSAGE as any, userEndHandler);
        session.on(StreamingEvents.AVATAR_END_MESSAGE as any, avatarEndHandler);

        avatarRef.current = session;

        // Auto-start voice chat like the vendor demo
        try {
          await session.startVoice();
          setVoiceActive(true);
          console.log("✅ Voice chat started successfully");
          
          // Log knowledge base status
          if (finalKnowledgeId) {
            console.log("✅ Knowledge base available:", finalKnowledgeId);
            console.log("🎤 Avatar should respond automatically to user speech");
          } else {
            console.log("⚠️ No knowledge base available - avatar will respond to manual speak() calls only");
            console.log("💡 Try using the 'Speak' button to test avatar responses");
          }
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
        console.log("🧹 Cleaning up avatar session and event listeners");
        
        // Remove all event listeners to prevent duplicates
        avatarRef.current.off(StreamingEvents.USER_START as any);
        avatarRef.current.off(StreamingEvents.USER_STOP as any);
        avatarRef.current.off(StreamingEvents.AVATAR_START_TALKING as any);
        avatarRef.current.off(StreamingEvents.AVATAR_STOP_TALKING as any);
        avatarRef.current.off(StreamingEvents.USER_TALKING_MESSAGE as any);
        avatarRef.current.off(StreamingEvents.AVATAR_TALKING_MESSAGE as any);
        avatarRef.current.off(StreamingEvents.USER_END_MESSAGE as any);
        avatarRef.current.off(StreamingEvents.AVATAR_END_MESSAGE as any);
        avatarRef.current.off(StreamingEvents.CONNECTION_QUALITY_CHANGED as any);
        
        // Clear transcript and reset state
        setTranscript([]);
        currentSenderRef.current = null;
        messageIdCounter.current = 0;
        asrBufferRef.current = "";
        setCaptions("");
        
        // End the session
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

                // Let HeyGen SDK handle TTS automatically - don't manually call speak()
                // The SDK will emit AVATAR_TALKING_MESSAGE events which we handle above
                console.log("LLM response complete, letting HeyGen SDK handle TTS");
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Immersive Avatar Panel */}
        <div className="lg:col-span-2">
          <Card className="h-[700px] flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                {simulation.persona.name} — {simulation.case.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
              {/* Avatar Video - Better positioned */}
              <div className="flex-1 rounded-xl overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 relative">
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
                  className="w-full h-full object-cover"
                  style={{ objectPosition: 'center center' }}
                />
                {/* Status overlay */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    voiceActive ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                  }`}>
                    {voiceActive ? '🎤 Voice Active' : '🔇 Voice Inactive'}
                  </div>
                  {isUserTalking && (
                    <div className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      🗣️ You're speaking
                    </div>
                  )}
                  {isAvatarTalking && (
                    <div className="px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      🤖 Avatar speaking
                    </div>
                  )}
                </div>
              </div>
              
              {/* Controls */}
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-3">
                  <Button
                    onClick={async () => {
                      if (!avatarRef.current) return;
                      if (!voiceActive) {
                        try {
                          await avatarRef.current.startVoice();
                          setVoiceActive(true);
                        } catch (error) {
                          console.error('Failed to start voice:', error);
                        }
                      } else {
                        try {
                          avatarRef.current.stopVoice();
                          setVoiceActive(false);
                        } catch (error) {
                          console.error('Failed to stop voice:', error);
                        }
                      }
                    }}
                    variant={voiceActive ? "default" : "secondary"}
                    className={`${voiceActive ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                  >
                    {voiceActive ? '🎤 Voice Chat On' : '🎤 Start Voice Chat'}
                  </Button>
                  
                  <Button
                    onClick={async () => {
                      if (!avatarRef.current) {
                        console.warn('No avatar session available for mute toggle');
                        return;
                      }
                      try {
                        if (muted) {
                          console.log('Unmuting microphone...');
                          avatarRef.current.unmute();
                          setMuted(false);
                        } else {
                          console.log('Muting microphone...');
                          avatarRef.current.mute();
                          setMuted(true);
                        }
                      } catch (error) {
                        console.error('Failed to toggle mute:', error);
                      }
                    }}
                    variant={muted ? "destructive" : "secondary"}
                    className={`${muted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'} text-white`}
                  >
                    {muted ? '🔇 Unmute Mic' : '🎤 Mute Mic'}
                  </Button>
                  
                  <Button
                    onClick={async () => {
                      if (!avatarRef.current) {
                        console.warn('No avatar session available for interrupt');
                        return;
                      }
                      try {
                        console.log('Interrupting avatar...');
                        avatarRef.current.interrupt();
                      } catch (error) {
                        console.error('Failed to interrupt:', error);
                      }
                    }}
                    variant="secondary"
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    ⏹️ Interrupt
                  </Button>
                  
                  <Button
                    onClick={async () => {
                      if (!avatarRef.current) {
                        console.warn('No avatar session available for speak');
                        return;
                      }
                      try {
                        console.log('Testing avatar speak...');
                        await avatarRef.current.speak("Hello! I'm ready to help you. How can I assist you today?");
                      } catch (error) {
                        console.error('Failed to speak:', error);
                      }
                    }}
                    variant="secondary"
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    🗣️ Test Speak
                  </Button>
                </div>
                
                {/* Live captions */}
                <div className="text-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400 min-h-[20px] px-4">
                    {captions ? (
                      <span className="bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full text-blue-700 dark:text-blue-300">
                        {captions}
                      </span>
                    ) : (
                      <span className="text-gray-400">Listening...</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Transcript Panel */}
          <Card className="mt-4">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Live Transcript</CardTitle>
                <Button 
                  onClick={clearTranscript}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  Clear
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64 overflow-y-auto rounded-lg border bg-gray-50 dark:bg-gray-900 p-4">
                {transcript.length === 0 ? (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                    <div className="text-4xl mb-2">🎤</div>
                    <p>Start speaking to see the live transcript here</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {transcript.map((message) => (
                      <div
                        key={message.id}
                        className={`flex flex-col gap-1 max-w-[350px] ${
                          message.sender === MessageSender.CLIENT
                            ? "self-end items-end ml-auto"
                            : "self-start items-start mr-auto"
                        }`}
                      >
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {message.sender === MessageSender.AVATAR ? "Avatar" : "You"}
                        </p>
                        <div className={`px-3 py-2 rounded-lg text-sm ${
                          message.sender === MessageSender.CLIENT
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        }`}>
                          {message.content}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
