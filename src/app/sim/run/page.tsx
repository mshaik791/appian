"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { startHeygen, type HeygenSession } from "@/heygen/runtime";
import { useSearchParams } from "next/navigation";

function parseCfg(sp: URLSearchParams) {
  const fallback = sessionStorage.getItem("heygenConfig");
  const s = fallback ? { ...JSON.parse(fallback) } : {};
  const get = (k: string, d?: string) => sp.get(k) ?? (s as any)[k] ?? d;
  return {
    kb: get("kb", ""),
    avatar: get("avatar", "Pedro_Chair_Sitting_public"),
    voice: get("voice", "Fpmh5GZLmV0wU1dCR06y"),
    lang: get("lang", "English"),
    q: get("q", "low") as "low"|"medium"|"high",
    t: get("t", "websocket") as "websocket"|"webrtc",
  };
}

export default function RunPage() {
  const sp = useSearchParams();
  const cfg = useMemo(() => parseCfg(sp), [sp]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const sessionRef = useRef<HeygenSession|null>(null);
  const [status, setStatus] = useState("connecting");
  const [text, setText] = useState("Hello Parwin, how are you adjusting to school and healthcare here?");

  async function getToken() {
    const r = await fetch("/api/avatar/session", { method: "POST" });
    if (!r.ok) throw new Error(await r.text());
    return (await r.json()).token as string;
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = await getToken();
        if (!videoRef.current) return;

        const opts = {
          token,
          videoEl: videoRef.current,
          transport: cfg.t,
          knowledgeBaseId: cfg.kb || undefined,
          language: cfg.lang,
          quality: cfg.q,
          voiceId: cfg.voice,
          avatarName: cfg.avatar, // Always use avatarName for consistency with demo
        } as const;

        sessionRef.current = await startHeygen(opts);
        if (!cancelled) setStatus("ready");
      } catch (e) {
        console.error("Run connect error:", e);
        if (!cancelled) setStatus("error");
      }
    })();
    return () => { 
      cancelled = true; 
      sessionRef.current?.end(); 
      sessionRef.current = null; 
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Simulation (HeyGen demo flow)</h1>
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        className="w-[960px] h-[540px] rounded-xl bg-black/20" 
      />
      <div className="text-sm opacity-70">Status: {status}</div>
      <div className="flex gap-2">
        <input 
          value={text} 
          onChange={e=>setText(e.target.value)} 
          className="px-3 py-2 rounded border w-[640px]" 
        />
        <button 
          onClick={() => sessionRef.current?.speak(text)} 
          disabled={status!=="ready"} 
          className="px-4 py-2 rounded bg-black text-white"
        >
          Speak
        </button>
        <button 
          onClick={() => sessionRef.current?.interrupt()} 
          className="px-3 py-2 rounded border"
        >
          Interrupt
        </button>
      </div>
      <pre className="text-xs opacity-60">{JSON.stringify(cfg, null, 2)}</pre>
    </div>
  );
}
