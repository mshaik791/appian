"use client";

import { RefObject } from 'react';
import { Volume2, Captions, Maximize } from 'lucide-react';

type Props = {
  videoRef: RefObject<HTMLVideoElement | null>;
  src: string;
  poster?: string;
  onEnded?: () => void;
  onLoadedMetadata?: () => void;
  onTimeUpdate?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  title: string;
  prompt: string;
  durationLabel?: string;
  speed?: string; // e.g., "1x"
  ccEnabled?: boolean;
  onToggleCC?: () => void;
  onToggleSpeed?: () => void;
  onFullscreen?: () => void;
  watermark?: string; // e.g., "1/2"
};

export default function VideoPromptFrame({
  videoRef,
  src,
  poster,
  onEnded,
  onLoadedMetadata,
  onTimeUpdate,
  onPlay,
  onPause,
  title,
  prompt,
  durationLabel,
  speed = '1x',
  ccEnabled,
  onToggleCC,
  onToggleSpeed,
  onFullscreen,
  watermark = '1/2',
}: Props) {
  return (
    <div className="relative rounded-2xl shadow-xl overflow-hidden bg-black">
      <video
        ref={videoRef}
        className="aspect-video w-full h-full object-cover"
        src={src}
        poster={poster}
        controls
        onEnded={onEnded}
        onLoadedMetadata={onLoadedMetadata}
        onTimeUpdate={onTimeUpdate}
        onPlay={onPlay}
        onPause={onPause}
      />

      {/* Vignette / gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/65 via-black/45 to-transparent" />

      {/* Text overlay */}
      <div className="absolute inset-0 flex items-center p-8 sm:p-10 lg:p-12">
        <div className="max-w-[46ch]">
          <div className="text-white/90 font-medium tracking-wide text-2xl sm:text-3xl lg:text-4xl">
            {title}
          </div>
          <div className="mt-4 text-white font-semibold leading-tight tracking-tight text-2xl sm:text-3xl lg:text-[40px]">
            {prompt}
          </div>
        </div>
      </div>

      {/* Control bar */}
      <div className="absolute top-4 right-4 flex items-center gap-2 rounded-full bg-black/45 backdrop-blur px-3 py-1.5 text-white/90">
        {durationLabel && (
          <span className="text-xs tabular-nums">{durationLabel}</span>
        )}
        <button
          type="button"
          className="rounded-full p-1 hover:bg-white/10"
          aria-label="Mute / Unmute"
          // Stub: actual mute toggle handled by parent via ref if desired
          onClick={() => {
            const v = videoRef.current; if (v) v.muted = !v.muted;
          }}
        >
          <Volume2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          className={`rounded-full px-2 py-0.5 text-xs hover:bg-white/10 ${ccEnabled ? 'bg-white/10' : ''}`}
          aria-pressed={!!ccEnabled}
          aria-label="Toggle captions"
          onClick={onToggleCC}
        >
          <div className="flex items-center gap-1">
            <Captions className="h-4 w-4" />
            <span className="hidden sm:inline">CC</span>
          </div>
        </button>
        <button
          type="button"
          className="rounded-full px-2 py-0.5 text-xs hover:bg-white/10"
          aria-label="Toggle playback speed"
          onClick={onToggleSpeed}
        >
          {speed}
        </button>
        <button
          type="button"
          className="rounded-full p-1 hover:bg-white/10"
          aria-label="Enter fullscreen"
          onClick={onFullscreen}
        >
          <Maximize className="h-4 w-4" />
        </button>
      </div>

      {/* Bottom-left watermark */}
      <div className="absolute bottom-4 left-4 text-white/80 text-sm font-medium">
        {watermark}
      </div>
    </div>
  );
}


