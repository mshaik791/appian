"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SimConfig() {
  const r = useRouter(); 
  const sp = useSearchParams();
  const [kb, setKb] = useState(sp.get("kb") || "");
  const [avatar, setAvatar] = useState(sp.get("avatar") || "Pedro_Chair_Sitting_public");
  const [voice, setVoice] = useState(sp.get("voice") || "Fpmh5GZLmV0wU1dCR06y");
  const [lang, setLang] = useState(sp.get("lang") || "English");
  const [quality, setQuality] = useState(sp.get("q") || "low");
  const [transport, setTransport] = useState(sp.get("t") || "websocket");
  const [stt, setStt] = useState(sp.get("stt") || "deepgram");

  useEffect(() => {
    const saved = sessionStorage.getItem("heygenConfig");
    if (saved) {
      const j = JSON.parse(saved);
      setKb(j.kb ?? kb); 
      setAvatar(j.avatar ?? avatar);
      setVoice(j.voice ?? voice); 
      setLang(j.lang ?? lang);
      setQuality(j.q ?? quality); 
      setTransport(j.t ?? transport);
      setStt(j.stt ?? stt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function go() {
    const cfg = { kb, avatar, voice, lang, q: quality, t: transport, stt };
    sessionStorage.setItem("heygenConfig", JSON.stringify(cfg));
    const q = new URLSearchParams(cfg as any).toString();
    r.push(`/sim/run?${q}`);
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Simulation Setup</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="space-y-1">
          <div>Custom Knowledge Base ID</div>
          <input 
            value={kb} 
            onChange={e=>setKb(e.target.value)} 
            className="w-full border rounded px-3 py-2" 
            placeholder="kb_..." 
          />
        </label>
        <label className="space-y-1">
          <div>Avatar (name or id)</div>
          <input 
            value={avatar} 
            onChange={e=>setAvatar(e.target.value)} 
            className="w-full border rounded px-3 py-2" 
          />
        </label>
        <label className="space-y-1">
          <div>Language</div>
          <select 
            value={lang} 
            onChange={e=>setLang(e.target.value)} 
            className="w-full border rounded px-3 py-2"
          >
            <option>English</option>
            <option>Spanish</option>
            <option>Arabic</option>
          </select>
        </label>
        <label className="space-y-1">
          <div>Avatar Quality</div>
          <select 
            value={quality} 
            onChange={e=>setQuality(e.target.value)} 
            className="w-full border rounded px-3 py-2"
          >
            <option>low</option>
            <option>medium</option>
            <option>high</option>
          </select>
        </label>
        <label className="space-y-1">
          <div>Voice Chat Transport</div>
          <select 
            value={transport} 
            onChange={e=>setTransport(e.target.value)} 
            className="w-full border rounded px-3 py-2"
          >
            <option>websocket</option>
            <option>webrtc</option>
          </select>
        </label>
        <label className="space-y-1">
          <div>Custom Voice ID</div>
          <input 
            value={voice} 
            onChange={e=>setVoice(e.target.value)} 
            className="w-full border rounded px-3 py-2" 
          />
        </label>
        <label className="space-y-1 md:col-span-2">
          <div>STT Provider</div>
          <select 
            value={stt} 
            onChange={e=>setStt(e.target.value)} 
            className="w-full border rounded px-3 py-2"
          >
            <option>deepgram</option>
            <option>whisper</option>
          </select>
        </label>
      </div>
      <div className="flex gap-3 pt-2">
        <button 
          onClick={go} 
          className="px-4 py-2 rounded bg-black text-white"
        >
          Start Voice Chat
        </button>
      </div>
    </div>
  );
}
