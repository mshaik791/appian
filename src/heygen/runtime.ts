"use client";

import StreamingAvatar, { StartAvatarRequest, AvatarQuality, VoiceChatTransport } from "@heygen/streaming-avatar";

export type HeygenOptions = {
  videoEl: HTMLVideoElement;
  token: string;
  avatarId?: string;
  avatarName?: string;
  voiceId?: string;
  knowledgeBaseId?: string;
  language?: string;             // e.g., "English"
  quality?: "low"|"medium"|"high";
  transport?: "websocket"|"webrtc";
};

export type HeygenSession = {
  speak: (text: string) => Promise<void>;
  interrupt: () => Promise<void>;
  end: () => void;
};

export async function startHeygen(opts: HeygenOptions): Promise<HeygenSession> {
  const { videoEl } = opts;

  // Create client exactly like the demo
  const client = new StreamingAvatar({
    token: opts.token,
  });

  // Autoplay constraints
  videoEl.muted = true;
  (videoEl as any).playsInline = true;
  try { 
    await videoEl.play().catch(() => {}); 
  } catch {}

  // Set up stream handling like the demo
  const handleStream = ({ detail }: { detail: MediaStream }) => {
    videoEl.srcObject = detail;
    videoEl.onloadedmetadata = () => {
      videoEl.play();
    };
  };

  // Set up event listeners like the demo
  client.on("stream_ready", handleStream);
  client.on("stream_disconnected", () => {
    console.log("Stream disconnected");
  });

  // Create the start avatar request exactly like the demo
  const config: StartAvatarRequest = {
    quality: opts.quality === "high" ? AvatarQuality.High : opts.quality === "medium" ? AvatarQuality.Medium : AvatarQuality.Low,
    avatarName: opts.avatarName || "Pedro_Chair_Sitting_public",
    knowledgeId: opts.knowledgeBaseId,
    voice: opts.voiceId ? { voiceId: opts.voiceId } : undefined,
    language: opts.language || "en",
    voiceChatTransport: opts.transport === "webrtc" ? VoiceChatTransport.WEBRTC : VoiceChatTransport.WEBSOCKET,
  };

  // Start the avatar session
  await client.createStartAvatar(config);

  // Return the session interface
  return {
    speak: async (text: string) => { 
      if (text?.trim()) {
        await client.speak({ text }); 
      }
    },
    interrupt: async () => { 
      try { 
        await client.interrupt(); 
      } catch (e) {
        console.error("Interrupt error:", e);
      } 
    },
    end: () => { 
      try { 
        client.stopAvatar();
        videoEl.pause();
        videoEl.srcObject = null;
      } catch (e) {
        console.error("End error:", e);
      }
    },
  };
}