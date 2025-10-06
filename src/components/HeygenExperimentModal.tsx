'use client';

import { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { StreamingEvents } from '@heygen/streaming-avatar';
import { Card } from '@/components/ui/card';
import { startHeygenSession, type HeyGenSession } from '@/drivers/heygen';

type Props = {
  open: boolean;
  onClose: () => void;
  defaultAvatarName?: string;
  defaultVoiceId?: string;
  onContinue?: () => void;
};

export function HeygenExperimentModal({ open, onClose, defaultAvatarName = 'Pedro_Chair_Sitting_public', defaultVoiceId = 'Fpmh5GZLmV0wU1dCR06y', onContinue }: Props) {
  const [avatarName, setAvatarName] = useState<string>(defaultAvatarName);
  const [voiceId, setVoiceId] = useState<string>(defaultVoiceId);
  const [quality, setQuality] = useState<'low'|'medium'|'high'>('low');
  const [knowledgeId, setKnowledgeId] = useState<string>('');
  const [language, setLanguage] = useState<string>('en');
  const [status, setStatus] = useState<'idle'|'connecting'|'ready'>('idle');
  const videoRef = useRef<HTMLVideoElement>(null);
  const sessionRef = useRef<HeyGenSession | null>(null);
  const [connectionQuality, setConnectionQuality] = useState<string>('');
  const [muted, setMuted] = useState<boolean>(false);
  const [transport, setTransport] = useState<'websocket'|'webrtc'>('websocket');

  useEffect(() => {
    if (!open) {
      sessionRef.current?.end();
      sessionRef.current = null;
      setStatus('idle');
    }
  }, [open]);

  async function getToken() {
    const r = await fetch('/api/avatar/session', { method: 'POST' });
    if (!r.ok) throw new Error(await r.text());
    return (await r.json()).token as string;
  }

  const startTextChat = async () => {
    if (!videoRef.current) return;
    setStatus('connecting');
    const token = await getToken();
    sessionRef.current = await startHeygenSession({
      token,
      videoEl: videoRef.current,
      avatarName,
      voiceId,
      knowledgeId,
      language,
      quality,
      transport,
    });
    sessionRef.current.on(StreamingEvents.CONNECTION_QUALITY_CHANGED as any, ({ detail }: any) => {
      setConnectionQuality(String(detail));
    });
    setStatus('ready');
  };

  const startVoiceChat = async () => {
    if (!sessionRef.current) await startTextChat();
    await sessionRef.current!.startVoice();
    // Navigate to simulation right after starting voice chat
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('heygen.experiment.voiceId', voiceId || '');
        sessionStorage.setItem('heygen.experiment.knowledgeId', knowledgeId || '');
        sessionStorage.setItem('heygen.experiment.language', language || '');
        sessionStorage.setItem('heygen.experiment.quality', quality || '');
      }
    } catch {}
    if (onContinue) onContinue();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>HeyGen Experiment</DialogTitle>
        </DialogHeader>
        {/* Hidden video for SDK to attach the stream; we don't show preview here */}
        <video ref={videoRef} autoPlay playsInline className="hidden" aria-hidden="true" />
        <div className="grid grid-cols-1 gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-3">
              <label className="block text-xs mb-1">Custom Knowledge Base ID</label>
              <input value={knowledgeId} onChange={(e)=>setKnowledgeId(e.target.value)} className="w-full rounded-md bg-neutral-800 text-white px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs mb-1">Avatar Name</label>
              <input value={avatarName} onChange={(e)=>setAvatarName(e.target.value)} className="w-full rounded-md bg-neutral-800 text-white px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs mb-1">Voice ID</label>
              <input value={voiceId} onChange={(e)=>setVoiceId(e.target.value)} className="w-full rounded-md bg-neutral-800 text-white px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs mb-1">Quality</label>
              <select value={quality} onChange={(e)=>setQuality(e.target.value as any)} className="w-full rounded-md bg-neutral-800 text-white px-3 py-2 text-sm">
                <option value="low">low</option>
                <option value="medium">medium</option>
                <option value="high">high</option>
              </select>
            </div>
            <div>
              <label className="block text-xs mb-1">Language</label>
              <select value={language} onChange={(e)=>setLanguage(e.target.value)} className="w-full rounded-md bg-neutral-800 text-white px-3 py-2 text-sm">
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
            <div>
              <label className="block text-xs mb-1">Voice Chat Transport</label>
              <select value={transport} onChange={(e)=>setTransport(e.target.value as any)} className="w-full rounded-md bg-neutral-800 text-white px-3 py-2 text-sm">
                <option value="websocket">websocket</option>
                <option value="webrtc">webrtc</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onClose}>Close</Button>
            <Button onClick={startVoiceChat}>Voice Chat</Button>
            <Button onClick={startTextChat} variant="secondary">Start Text Chat</Button>
          </div>
          <div className="text-xs text-white/60">Status: {status}</div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default HeygenExperimentModal;


