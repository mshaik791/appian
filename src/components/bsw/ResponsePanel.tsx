"use client";

import { Button } from '@/components/ui/button';
import { Mic, Video } from 'lucide-react';

type Props = {
  locked: boolean;
  watchedPct: number;
  onFocusVideo?: () => void;
  onStartVideoResponse?: () => void;
  onStartAudioResponse?: () => void;
  announce?: string; // sr-only text when unlocked
};

export default function ResponsePanel({
  locked,
  watchedPct,
  onFocusVideo,
  onStartVideoResponse,
  onStartAudioResponse,
  announce,
}: Props) {
  return (
    <div className="relative rounded-2xl bg-white dark:bg-neutral-900 shadow-xl p-8 h-full flex items-center justify-center">
      {!locked && (
        <div className="sr-only" aria-live="polite">{announce || 'Response panel unlocked'}</div>
      )}
      <div
        aria-disabled={locked}
        aria-hidden={locked}
        tabIndex={locked ? -1 : undefined as unknown as number}
        className={`${locked ? 'pointer-events-none' : ''} w-full`}
      >
        <div className="space-y-6">
          <h3 className="text-xl sm:text-2xl font-semibold text-neutral-900 dark:text-neutral-50 text-center">How would you like to respond?</h3>
          <div className="flex items-center justify-center gap-6">
            <Button
              variant="secondary"
              className="h-24 w-36 sm:h-28 sm:w-40 rounded-2xl shadow-md flex flex-col items-center justify-center gap-2"
              onClick={onStartVideoResponse}
            >
              <Video className="h-6 w-6" />
              <span className="text-xs tracking-wide">VIDEO</span>
            </Button>
            <Button
              variant="secondary"
              className="h-24 w-36 sm:h-28 sm:w-40 rounded-2xl shadow-md flex flex-col items-center justify-center gap-2"
              onClick={onStartAudioResponse}
            >
              <Mic className="h-6 w-6" />
              <span className="text-xs tracking-wide">AUDIO</span>
            </Button>
          </div>
          <div className="text-center text-xs text-muted-foreground">You can practice before sending</div>
        </div>
      </div>

      {locked && (
        <div className="absolute inset-0 rounded-2xl bg-white/60 dark:bg-neutral-900/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white dark:bg-neutral-900 border rounded-lg shadow p-4 w-[min(90%,28rem)] text-center space-y-3">
            <div className="text-3xl">🔒</div>
            <div className="font-medium">Watch the video to unlock your response</div>
            <div className="text-sm text-muted-foreground">Once the video finishes, this panel will unlock.</div>
            <div className="h-2 w-full bg-neutral-200 dark:bg-neutral-800 rounded overflow-hidden" role="progressbar" aria-valuenow={watchedPct} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full bg-neutral-900 dark:bg-neutral-100" style={{ width: `${Math.max(0, Math.min(100, watchedPct))}%` }} />
            </div>
            <div className="text-xs text-muted-foreground">Watched {Math.round(watchedPct)}%</div>
            <div className="pt-1">
              <Button variant="ghost" onClick={onFocusVideo}>Play video</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


