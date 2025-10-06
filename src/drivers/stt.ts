"use client";
import { useEffect, useRef, useState } from "react";

type Handlers = { 
  onPartial?: (t: string) => void; 
  onFinal?: (t: string) => void; 
  canAccept?: () => boolean;
  turnState?: "idle" | "student_listening" | "persona_speaking" | "cooldown";
};
const CHUNK_MS = 2500;

export function useMicStt(h: Handlers = {}) {
  const [isOn, setIsOn] = useState(false);
  const mediaRef = useRef<MediaStream | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const bufRef = useRef<BlobPart[]>([]);
  const loopRef = useRef<boolean>(false);
  const mimeTypeRef = useRef<string>("audio/webm");

  useEffect(() => {
    return () => { stop(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function start() {
    if (isOn) return;
    
    try {
      mediaRef.current = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
      });
      
      // Try to find a supported audio format
      let mimeType = "audio/webm";
      if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
        mimeType = "audio/webm;codecs=opus";
      } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
        mimeType = "audio/mp4";
      } else if (MediaRecorder.isTypeSupported("audio/ogg;codecs=opus")) {
        mimeType = "audio/ogg;codecs=opus";
      }
      
      mimeTypeRef.current = mimeType;
      console.log("STT: Using audio format:", mimeType);
      const rec = new MediaRecorder(mediaRef.current, { mimeType });
      recRef.current = rec;
      setIsOn(true);
      loopRef.current = true;

      rec.ondataavailable = async (e) => { 
        if (e.data && e.data.size) {
          bufRef.current.push(e.data);
          // Flush each arriving chunk while recording continues
          await flushChunk(false);
        }
      };

      rec.onstop = async () => {
        // Final flush when stopped
        await flushChunk(true);
      };

      // Start chunked recording so dataavailable fires every CHUNK_MS
      rec.start(CHUNK_MS);
      // loop();      // no longer needed; we flush per dataavailable
      
      console.log("STT: MediaRecorder started successfully");
    } catch (error) {
      console.error("STT: Failed to start MediaRecorder:", error);
      setIsOn(false);
    }
  }

  async function loop() { /* no-op with timeslice; kept for safety */ }

  async function flushChunk(isFinal: boolean) {
    const parts = bufRef.current.splice(0);
    if (!parts.length) return;

    // Decide whether this chunk should be treated as a final user utterance
    // Treat as final if either: recorder stopped (isFinal) OR the app is currently
    // ready to accept a student final according to the turn manager.
    const canAcceptNow = h.canAccept ? !!h.canAccept() : true;
    const shouldFinalize = isFinal || canAcceptNow;

    const blob = new Blob(parts, { type: mimeTypeRef.current });
    const fd = new FormData();
    fd.append("audio", blob, `chunk.${mimeTypeRef.current.split('/')[1].split(';')[0]}`);

    try {
      // Send to STT
      const res = await fetch("/api/stt", { method: "POST", body: fd });
      if (!res.ok) {
        console.error("STT API error:", res.status);
        return;
      }
      const { text } = await res.json();

      if (!text?.trim()) return;

      // When the app can accept finals, promote chunk to final; otherwise surface as partial
      if (!shouldFinalize) {
        console.log("STT partial:", text);
        h.onPartial?.(text);
      } else {
        console.log("STT final:", text, "canAccept:", h.canAccept?.());
        h.onFinal?.(text);
      }
    } catch (error) {
      console.error("STT chunk processing error:", error);
    }
  }

  function stop() {
    if (!isOn) return;
    setIsOn(false);
    loopRef.current = false;
    
    try { 
      recRef.current?.stop(); 
    } catch (e) {
      console.error("STT: Error stopping MediaRecorder:", e);
    }
    recRef.current = null;
    
    // Stop tracks
    mediaRef.current?.getTracks().forEach(t => t.stop());
    mediaRef.current = null;
    
    console.log("STT: MediaRecorder stopped");
  }

  return { isOn, start, stop };
}
