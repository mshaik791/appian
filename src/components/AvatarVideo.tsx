"use client";
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { createHeygenSdkSession, type AvatarSession } from "@/drivers/avatar";

export type AvatarVideoHandle = { speak: (text: string) => Promise<void>; end: () => void; };
type Props = { avatarId?: string; avatarName?: string; voiceId?: string; className?: string; onStartSpeak?: () => void; onEndSpeak?: () => void; };

async function getSessionToken() {
  const r = await fetch("/api/avatar/session", { method: "POST" });
  if (!r.ok) throw new Error(await r.text());
  return r.json() as Promise<{ token: string }>;
}

const AvatarVideo = forwardRef<AvatarVideoHandle, Props>(({ avatarId, avatarName, voiceId, className, onStartSpeak, onEndSpeak }, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sessionRef = useRef<AvatarSession | null>(null);
  const [status, setStatus] = useState<"idle"|"connecting"|"ready"|"error">("idle");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setStatus("connecting");
        const { token } = await getSessionToken();
        if (cancelled || !videoRef.current) return;
        sessionRef.current = await createHeygenSdkSession(token, videoRef.current, {
          avatarId, avatarName, voiceId, onStartSpeak, onEndSpeak
        });
        if (!cancelled) setStatus("ready");
      } catch (e) {
        console.error("Avatar connect error:", e);
        if (!cancelled) setStatus("error");
      }
    })();
    return () => { cancelled = true; sessionRef.current?.end(); sessionRef.current = null; };
  }, [avatarId, avatarName, voiceId]);

  useImperativeHandle(ref, () => ({
    speak: async (t: string) => { await sessionRef.current?.speak(t); },
    end: () => { sessionRef.current?.end(); },
  }));

  return (
    <div className={className}>
      <video ref={videoRef} autoPlay playsInline className="w-full rounded-2xl shadow-lg bg-black/20" />
      {status !== "ready" && <div className="mt-2 text-sm text-gray-400">
        {status === "connecting" ? "Connecting avatar…" : status === "error" ? "Avatar connection failed." : null}
      </div>}
    </div>
  );
});
AvatarVideo.displayName = "AvatarVideo";
export default AvatarVideo;