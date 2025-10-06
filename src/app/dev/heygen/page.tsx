"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { startHeygenSession, type HeyGenSession } from "@/drivers/heygen";

export default function HeyGenTestPage() {
  const [session, setSession] = useState<HeyGenSession | null>(null);
  const [status, setStatus] = useState<"idle" | "connecting" | "ready" | "error">("idle");
  const [error, setError] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);

  const startSession = async () => {
    if (!videoRef.current) {
      setError("Video element not found");
      return;
    }

    try {
      setStatus("connecting");
      setError("");

      // Get token from our API
      const response = await fetch("/api/avatar/session", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`Failed to get token: ${response.status}`);
      }

      const { token } = await response.json();

      // Start HeyGen session
      const newSession = await startHeygenSession({
        token,
        videoEl: videoRef.current,
        avatarName: "Pedro_Chair_Sitting_public",
        voiceId: "Fpmh5GZLmV0wU1dCR06y",
        onStartSpeak: () => {
          console.log("Avatar started speaking");
        },
        onEndSpeak: () => {
          console.log("Avatar finished speaking");
        },
      });

      setSession(newSession);
      setStatus("ready");
    } catch (err) {
      console.error("Error starting session:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setStatus("error");
    }
  };

  const speak = async () => {
    if (!session) return;
    
    try {
      await session.speak("Hello! This is a test of the HeyGen streaming avatar. I can speak naturally and respond to your interactions.");
    } catch (err) {
      console.error("Error speaking:", err);
      setError(err instanceof Error ? err.message : "Speech error");
    }
  };

  const endSession = () => {
    if (session) {
      session.end();
      setSession(null);
      setStatus("idle");
    }
  };

  useEffect(() => {
    return () => {
      if (session) {
        session.end();
      }
    };
  }, [session]);

  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>HeyGen Streaming Avatar Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Video Container */}
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-contain"
            />
            {status !== "ready" && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
                {status === "connecting" && "Connecting..."}
                {status === "error" && "Connection Failed"}
                {status === "idle" && "Click 'Start Session' to begin"}
              </div>
            )}
          </div>

          {/* Status */}
          <div className="text-center">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              status === "ready" ? "bg-green-100 text-green-800" :
              status === "connecting" ? "bg-yellow-100 text-yellow-800" :
              status === "error" ? "bg-red-100 text-red-800" :
              "bg-gray-100 text-gray-800"
            }`}>
              Status: {status.toUpperCase()}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Controls */}
          <div className="flex gap-4 justify-center">
            {status === "idle" && (
              <Button onClick={startSession} size="lg">
                Start Session
              </Button>
            )}
            
            {status === "ready" && (
              <>
                <Button onClick={speak} size="lg" variant="default">
                  Speak Test Message
                </Button>
                <Button onClick={endSession} size="lg" variant="outline">
                  End Session
                </Button>
              </>
            )}

            {status === "error" && (
              <Button onClick={startSession} size="lg" variant="outline">
                Retry
              </Button>
            )}
          </div>

          {/* Instructions */}
          <div className="text-sm text-gray-600 space-y-2">
            <h3 className="font-medium">Instructions:</h3>
            <ol className="list-decimal list-inside space-y-1">
              <li>Click "Start Session" to initialize the HeyGen streaming avatar</li>
              <li>Wait for the avatar to appear in the video</li>
              <li>Click "Speak Test Message" to make the avatar speak</li>
              <li>Click "End Session" to stop the avatar</li>
            </ol>
            <p className="text-xs text-gray-500 mt-2">
              Make sure HEYGEN_API_KEY is set in your .env.local file
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
