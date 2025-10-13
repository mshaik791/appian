import StreamingAvatar, {
  AvatarQuality,
  StreamingEvents,
  StartAvatarRequest,
  VoiceEmotion,
  ElevenLabsModel,
  VoiceChatTransport,
  STTProvider,
} from "@heygen/streaming-avatar";

export interface HeyGenSessionOptions {
  token: string;
  videoEl: HTMLVideoElement;
  avatarName?: string;
  avatarId?: string;
  voiceId?: string;
  knowledgeId?: string;
  language?: string;
  quality?: 'low' | 'medium' | 'high';
  transport?: 'websocket' | 'webrtc';
  onStartSpeak?: () => void;
  onEndSpeak?: () => void;
}

export interface HeyGenSession {
  speak: (text: string) => Promise<void>;
  end: () => void;
  startVoice: (opts?: { isInputAudioMuted?: boolean }) => Promise<void>;
  stopVoice: () => void;
  mute: () => void;
  unmute: () => void;
  interrupt: () => void;
  on: (
    event:
      | typeof StreamingEvents.USER_TALKING_MESSAGE
      | typeof StreamingEvents.USER_END_MESSAGE
      | typeof StreamingEvents.AVATAR_START_TALKING
      | typeof StreamingEvents.AVATAR_STOP_TALKING
      | typeof StreamingEvents.CONNECTION_QUALITY_CHANGED,
    handler: (e: any) => void,
  ) => void;
  off: (
    event:
      | typeof StreamingEvents.USER_TALKING_MESSAGE
      | typeof StreamingEvents.USER_END_MESSAGE
      | typeof StreamingEvents.AVATAR_START_TALKING
      | typeof StreamingEvents.AVATAR_STOP_TALKING
      | typeof StreamingEvents.CONNECTION_QUALITY_CHANGED,
    handler: (e: any) => void,
  ) => void;
}

export async function startHeygenSession({
  token,
  videoEl,
  avatarName,
  avatarId,
  voiceId = "Fpmh5GZLmV0wU1dCR06y",
  knowledgeId,
  language,
  quality,
  transport,
  onStartSpeak,
  onEndSpeak,
}: HeyGenSessionOptions): Promise<HeyGenSession> {
  // Create the streaming avatar instance
  const avatar = new StreamingAvatar({
    token,
  });

  // Configure the avatar request. The SDK's StartAvatarRequest supports avatarName;
  // for custom uploads by ID, we set the avatar via a separate call below before starting.
  const config: StartAvatarRequest = {
    quality: (quality === 'high' ? AvatarQuality.High : quality === 'medium' ? AvatarQuality.Medium : AvatarQuality.Low),
    avatarName: avatarName || (avatarId ? undefined as unknown as string : "Pedro_Chair_Sitting_public"),
    knowledgeId: knowledgeId,
    voice: {
      voiceId: voiceId,
      rate: 1.0, // Original speed
      emotion: VoiceEmotion.SERIOUS,
      model: ElevenLabsModel.eleven_flash_v2_5,
    },
    language: language || "en",
    voiceChatTransport: (transport === 'webrtc' ? VoiceChatTransport.WEBRTC : VoiceChatTransport.WEBSOCKET),
    sttSettings: {
      provider: STTProvider.DEEPGRAM, // Add STT settings like vendor demo
    },
  };

  // Set up event listeners
  avatar.on(StreamingEvents.AVATAR_START_TALKING, () => {
    console.log("Avatar started talking");
    onStartSpeak?.();
  });

  avatar.on(StreamingEvents.AVATAR_STOP_TALKING, () => {
    console.log("Avatar stopped talking");
    onEndSpeak?.();
  });

  avatar.on(StreamingEvents.STREAM_READY, (event) => {
    console.log("Stream ready:", event.detail);
    // Attach the video stream to the video element
    if (videoEl && event.detail) {
      videoEl.srcObject = event.detail;
      videoEl.onloadedmetadata = () => {
        videoEl.play().catch(console.error);
      };
    }
  });

  avatar.on(StreamingEvents.STREAM_DISCONNECTED, () => {
    console.log("Stream disconnected");
  });

  // If a custom avatarId is provided, set it explicitly before starting.
  if (avatarId && !avatarName) {
    try {
      // Some SDK builds expose setAvatar; this is a no-op if unsupported.
      await (avatar as any).setAvatar?.({ avatarId });
    } catch (e) {
      console.warn("setAvatar(avatarId) not supported in this SDK build:", e);
    }
  }

  // Start the avatar session
  await avatar.createStartAvatar(config as any);

  return {
    speak: async (text: string) => {
      if (!text?.trim()) return;
      try {
        await avatar.speak({ text });
      } catch (error) {
        console.error("Error speaking:", error);
      }
    },
    end: () => {
      try {
        avatar.stopAvatar();
      } catch (error) {
        console.error("Error stopping avatar:", error);
      }
      if (videoEl) {
        videoEl.pause();
        videoEl.srcObject = null;
      }
    },
    startVoice: async (opts?: { isInputAudioMuted?: boolean }) => {
      try {
        await (avatar as any).startVoiceChat?.({
          isInputAudioMuted: opts?.isInputAudioMuted,
        });
      } catch (e) {
        console.error("startVoiceChat error:", e);
      }
    },
    stopVoice: () => {
      try {
        (avatar as any).closeVoiceChat?.();
      } catch (e) {
        console.error("closeVoiceChat error:", e);
      }
    },
    mute: () => {
      try { (avatar as any).muteInputAudio?.(); } catch (e) { console.error("muteInputAudio error:", e); }
    },
    unmute: () => {
      try { (avatar as any).unmuteInputAudio?.(); } catch (e) { console.error("unmuteInputAudio error:", e); }
    },
    interrupt: () => {
      try { (avatar as any).interrupt?.(); } catch (e) { console.error("interrupt error:", e); }
    },
    on: (event, handler) => {
      (avatar as any).on?.(event, handler);
    },
    off: (event, handler) => {
      (avatar as any).off?.(event, handler);
    },
  };
}
