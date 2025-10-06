"use client";

async function loadHeygenClient() {
  const mod: any = await import("@heygen/streaming-avatar");
  const Cls = mod?.default ?? mod?.StreamingAvatar ?? mod?.StreamingAvatarClient ?? null;
  if (!Cls) {
    console.error("[HeyGen SDK] module keys:", Object.keys(mod || {}));
    throw new Error("[HeyGen SDK] No client class export found.");
  }
  console.info("[HeyGen SDK] Using client class:", Cls?.name || "(anonymous)");
  return Cls;
}

export type AvatarSession = { speak: (text: string) => Promise<void>; end: () => void };

export async function createHeygenSdkSession(
  token: string,
  video: HTMLVideoElement,
  opts?: {
    avatarId?: string;
    avatarName?: string;
    voiceId?: string;
    quality?: "low" | "medium" | "high";
    onStartSpeak?: () => void;
    onEndSpeak?: () => void;
  }
): Promise<AvatarSession> {
  const StreamingClient = await loadHeygenClient();

  // Some SDK builds expect { token }, others { apiToken }
  let client: any;
  try { client = new StreamingClient({ token }); }
  catch { client = new StreamingClient({ apiToken: token }); }

  // Attach video element (autoplay policies want muted + playsInline)
  video.muted = true;          // ✅ important for autoplay
  video.playsInline = true;
  try { await video.play().catch(() => {}); } catch {}

  await client.createConnection?.();
  await client.setOutputElement?.(video);

  // Choose avatar
  const quality = opts?.quality ?? "medium";
  const avatarSel = opts?.avatarName ? { avatarName: opts.avatarName } :
                    opts?.avatarId   ? { avatarId:   opts.avatarId   } : null;

  if (avatarSel) {
    // Some SDKs require an explicit "start" call that includes voice and quality
    const canCreateStart = typeof client.createStartAvatar === "function";
    const canStartAvatar = typeof client.startAvatar === "function";
    const canStart       = typeof client.start === "function";

    if (canCreateStart) {
      console.info("[HeyGen] createStartAvatar with", { ...avatarSel, voiceId: opts?.voiceId, quality });
      await client.createStartAvatar({
        ...avatarSel,
        voice: opts?.voiceId ? { voiceId: opts.voiceId } : undefined,
        quality
      });
    } else {
      // Fall back: set avatar + set voice separately
      if ("avatarName" in (avatarSel as any)) {
        await client.setAvatar?.({ avatarName: (avatarSel as any).avatarName });
        console.info("[HeyGen] setAvatar by name:", (avatarSel as any).avatarName);
      } else if ("avatarId" in (avatarSel as any)) {
        await client.setAvatar?.({ avatarId: (avatarSel as any).avatarId });
        console.info("[HeyGen] setAvatar by id:", (avatarSel as any).avatarId);
      }
      if (opts?.voiceId) {
        await client.setVoice?.({ voiceId: opts.voiceId });
        console.info("[HeyGen] setVoice:", opts.voiceId);
      }
      if (canStartAvatar) {
        console.info("[HeyGen] startAvatar()");
        await client.startAvatar();
      } else if (canStart) {
        console.info("[HeyGen] start()");
        await client.start();
      } else {
        console.info("[HeyGen] No explicit start method found; relying on setAvatar/setVoice to initiate stream.");
      }
    }
  } else {
    console.warn("[HeyGen] No avatar specified; stream may not start.");
  }

  // Optional: simple connection diagnostics if SDK exposes them
  try {
    client.on?.("connectionQuality", (q: any) => console.info("[HeyGen] connectionQuality:", q));
    client.on?.("error", (e: any) => console.error("[HeyGen] error:", e));
  } catch {}

  return {
    speak: async (text: string) => {
      if (!text?.trim()) return;
      try { opts?.onStartSpeak?.(); } catch {}
      await client.speak?.({ text });
      const approx = Math.min(6000, Math.max(1200, text.length * 60));
      setTimeout(() => { try { opts?.onEndSpeak?.(); } catch {} }, approx);
    },
    end: () => {
      try { client.close?.(); } catch {}
      try { video.pause?.(); } catch {}
      video.srcObject = null;
    }
  };
}