"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ResponsePanel from '@/components/bsw/ResponsePanel';

type Step = 'video' | 'q1' | 'q2' | 'q3' | 'review';

type Transcripts = {
  q1?: string;
  q2?: string;
  q3?: string;
};

type RecordingState = {
  isRecording: boolean;
  hasTranscript: boolean;
  error?: string;
};

declare global {
  interface Window {
    webkitSpeechRecognition?: any;
    SpeechRecognition?: any;
  }
}

const questions: Record<'q1' | 'q2' | 'q3', string> = {
  q1: '1) What did you notice about Maria’s priorities and concerns during the video? Provide 2-3 observations.',
  q2: '2) How would you demonstrate culturally responsive engagement in your next response to Maria? Include at least one specific phrase you would use.',
  q3: '3) Collaborate on one actionable next step with Maria that supports belonging and safety. Explain why it aligns with her goals.',
};

export default function MariaSession1Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const caseId = searchParams.get('caseId') || 'maria-aguilar-s1';
  const simSessionId = searchParams.get('sid') || searchParams.get('simSessionId') || 'session-1';

  const [step, setStep] = useState<Step>('video');
  const [transcripts, setTranscripts] = useState<Transcripts>({});
  const [recording, setRecording] = useState<RecordingState>({ isRecording: false, hasTranscript: false });
  const [liveText, setLiveText] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [isUnlockAllowed, setIsUnlockAllowed] = useState<boolean>(false);
  const [watchedPct, setWatchedPct] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const pendingConfirmRef = useRef<number | null>(null);
  const afterSeekNeedsConfirmRef = useRef<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const recognitionRef = useRef<any>(null);
  const accumulatedFinalRef = useRef<string>('');

  const currentQKey = useMemo<'q1' | 'q2' | 'q3' | null>(() => {
    if (step === 'q1' || step === 'q2' || step === 'q3') return step;
    return null;
  }, [step]);

  const progressIndex = useMemo(() => {
    return ['video', 'q1', 'q2', 'q3', 'review'].indexOf(step);
  }, [step]);

  const hasSpeechApi = typeof window !== 'undefined' && (window.webkitSpeechRecognition || (window as any).SpeechRecognition);
  const storageKey = 'bsw:maria:s1:videoUnlocked';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const devUnlock = searchParams.get('unlock');
    const persisted = window.sessionStorage.getItem(storageKey);
    if (devUnlock === '1' || persisted === '1') {
      setIsUnlockAllowed(true);
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.info('[videoGate] unlocked via', devUnlock === '1' ? 'query' : 'sessionStorage');
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persistUnlock = useCallback(() => {
    if (typeof window !== 'undefined') {
      try { window.sessionStorage.setItem(storageKey, '1'); } catch {}
    }
  }, []);

  const ensureRecognizer = useCallback(() => {
    if (!hasSpeechApi) return null;
    if (recognitionRef.current) return recognitionRef.current;
    const SpeechRecognition = window.webkitSpeechRecognition || (window as any).SpeechRecognition;
    const rec = new SpeechRecognition();
    rec.lang = 'en-US';
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        if (res.isFinal) {
          accumulatedFinalRef.current += (accumulatedFinalRef.current ? ' ' : '') + res[0].transcript.trim();
        } else {
          interim += res[0].transcript;
        }
      }
      setLiveText(accumulatedFinalRef.current + (interim ? (accumulatedFinalRef.current ? ' ' : '') + interim : ''));
    };
    rec.onerror = (e: any) => {
      setRecording(prev => ({ ...prev, error: e?.error || 'Speech recognition error' }));
    };
    rec.onend = () => {
      setRecording(prev => ({ ...prev, isRecording: false }));
    };
    recognitionRef.current = rec;
    return rec;
  }, [hasSpeechApi]);

  const startRecording = useCallback(() => {
    if (!currentQKey) return;
    const rec = ensureRecognizer();
    if (!rec) {
      setRecording({ isRecording: false, hasTranscript: false, error: 'Speech API not supported in this browser.' });
      return;
    }
    accumulatedFinalRef.current = '';
    setLiveText('');
    try {
      rec.start();
      setRecording({ isRecording: true, hasTranscript: false });
    } catch (e) {
      try { rec.stop(); } catch {}
      try { rec.start(); setRecording({ isRecording: true, hasTranscript: false }); } catch (err) {
        setRecording({ isRecording: false, hasTranscript: false, error: 'Could not start recognition.' });
      }
    }
  }, [currentQKey, ensureRecognizer]);

  const stopAndSave = useCallback(() => {
    if (!currentQKey) return;
    const rec = recognitionRef.current;
    try { rec?.stop?.(); } catch {}
    const finalText = (accumulatedFinalRef.current || liveText || '').trim();
    setTranscripts(prev => ({ ...prev, [currentQKey]: finalText }));
    setRecording({ isRecording: false, hasTranscript: !!finalText });
  }, [currentQKey, liveText]);

  const reRecord = useCallback(() => {
    if (!currentQKey) return;
    try { recognitionRef.current?.stop?.(); } catch {}
    accumulatedFinalRef.current = '';
    setLiveText('');
    setTranscripts(prev => ({ ...prev, [currentQKey]: '' }));
    setRecording({ isRecording: false, hasTranscript: false });
  }, [currentQKey]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'r' || e.key === 'R')) {
        e.preventDefault();
        if (!recording.isRecording) startRecording();
      } else if (e.altKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        if (recording.isRecording || liveText) stopAndSave();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [recording.isRecording, startRecording, stopAndSave, liveText]);

  useEffect(() => {
    return () => {
      try { recognitionRef.current?.stop?.(); } catch {}
    };
  }, []);

  const gotoNext = useCallback(() => {
    if (step === 'video') setStep('q1');
    else if (step === 'q1') setStep('q2');
    else if (step === 'q2') setStep('q3');
    else if (step === 'q3') setStep('review');
  }, [step]);

  const gotoPrev = useCallback(() => {
    if (step === 'q1') setStep('video');
    else if (step === 'q2') setStep('q1');
    else if (step === 'q3') setStep('q2');
    else if (step === 'review') setStep('q3');
  }, [step]);

  const saveTurns = useCallback(async () => {
    try {
      setSaving(true);
      const body = {
        caseId,
        simSessionId,
        answers: [
          { order: 1, text: transcripts.q1 || '' },
          { order: 2, text: transcripts.q2 || '' },
          { order: 3, text: transcripts.q3 || '' },
        ],
      };
      await fetch('/api/bsw/session/save-turns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch (e) {
    } finally {
      setSaving(false);
    }
  }, [caseId, simSessionId, transcripts]);

  const submitForEvaluation = useCallback(async () => {
    const answersText = [transcripts.q1, transcripts.q2, transcripts.q3].filter(Boolean).join('\n\n---\n\n');
    try {
      setSaving(true);
      await saveTurns();
      const res = await fetch('/api/bsw/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId, simSessionId, answersText }),
      });
      if (res.ok) {
        router.replace(`/bsw/maria-aguilar/results-loading?caseId=${encodeURIComponent(caseId)}&sid=${encodeURIComponent(simSessionId)}`);
      }
    } finally {
      setSaving(false);
    }
  }, [caseId, simSessionId, transcripts, router, saveTurns]);

  const formatTime = (s: number) => {
    if (!Number.isFinite(s)) return '00:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const VideoStep = (
    <div className="h-[70vh] md:h-[75vh]">
      <video
        ref={videoRef}
        className="w-full h-full rounded-xl shadow-lg overflow-hidden object-contain bg-black"
        src="/videos/Maria%20Final%20Video.mp4"
        controls
        onLoadedMetadata={() => {
          const d = videoRef.current?.duration || 0;
          if (!d || Number.isNaN(d)) { setVideoDuration(0); return; }
          setVideoDuration(d);
        }}
        onTimeUpdate={() => {
          const v = videoRef.current;
          if (!v || !videoDuration) return;
          setCurrentTime(v.currentTime);
          const pct = Math.min(100, Math.max(0, (v.currentTime / videoDuration) * 100));
          setWatchedPct(pct);
          if (pct >= 95 && !isUnlockAllowed) { setIsUnlockAllowed(true); persistUnlock(); }
        }}
        onEnded={() => { if (!isUnlockAllowed) { setIsUnlockAllowed(true); persistUnlock(); } }}
        onPlay={() => {
          setIsPlaying(true);
          if (afterSeekNeedsConfirmRef.current && videoDuration && !isUnlockAllowed) {
            if (pendingConfirmRef.current) window.clearTimeout(pendingConfirmRef.current);
            pendingConfirmRef.current = window.setTimeout(() => {
              if (!isUnlockAllowed) { setIsUnlockAllowed(true); persistUnlock(); }
              afterSeekNeedsConfirmRef.current = false;
            }, 3000);
          }
        }}
        onPause={() => {
          setIsPlaying(false);
          if (pendingConfirmRef.current) { window.clearTimeout(pendingConfirmRef.current); pendingConfirmRef.current = null; }
        }}
        onSeeked={() => {
          const v = videoRef.current;
          if (!v || !videoDuration || isUnlockAllowed) return;
          afterSeekNeedsConfirmRef.current = v.currentTime >= 0.95 * videoDuration;
        }}
      />
    </div>
  );

  const QuestionPanel = ({ qKey }: { qKey: 'q1' | 'q2' | 'q3' }) => {
    const saved = (transcripts[qKey] || '').trim().length > 0;
    
    const handleRecord = async () => {
      if (recording.isRecording) {
        // Stop recording and save
        stopAndSave();
        // Auto-advance after a brief delay
        setTimeout(() => {
          if (qKey === 'q1') setStep('q2');
          else if (qKey === 'q2') setStep('q3');
          else if (qKey === 'q3') setStep('review');
        }, 1000);
      } else {
        // Start recording
        startRecording();
      }
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle>Question {qKey.substring(1)}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-sm text-muted-foreground">{questions[qKey]}</div>
          
          <div className="flex flex-col items-center space-y-4">
            {/* Record Button */}
            <button
              onClick={handleRecord}
              disabled={!!recording.error}
              className={`w-20 h-20 rounded-full flex items-center justify-center text-white font-semibold transition-all duration-200 ${
                recording.isRecording 
                  ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
                  : 'bg-red-500 hover:bg-red-600'
              } ${recording.error ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {recording.isRecording ? 'STOP' : 'REC'}
            </button>

            {/* Wave Animation */}
            {recording.isRecording && (
              <div className="flex items-center space-x-1">
                <div className="w-1 h-4 bg-red-500 animate-pulse"></div>
                <div className="w-1 h-6 bg-red-500 animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-1 h-8 bg-red-500 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-1 h-6 bg-red-500 animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                <div className="w-1 h-4 bg-red-500 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                <div className="w-1 h-8 bg-red-500 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                <div className="w-1 h-6 bg-red-500 animate-pulse" style={{ animationDelay: '0.6s' }}></div>
                <div className="w-1 h-4 bg-red-500 animate-pulse" style={{ animationDelay: '0.7s' }}></div>
              </div>
            )}

            {/* Status */}
            <div className="text-sm text-muted-foreground text-center">
              {recording.isRecording ? 'Recording... Speak now' : 
               saved ? 'Response saved ✓' : 
               'Click to start recording'}
              {recording.error && <div className="text-red-500 mt-1">{recording.error}</div>}
            </div>

            {/* Live Transcript Preview */}
            {(liveText || saved) && (
              <div className="w-full max-w-2xl">
                <div className="text-sm font-medium mb-2">Your response:</div>
                <div className="p-3 rounded border bg-background text-sm whitespace-pre-wrap min-h-[80px]">
                  {saved ? transcripts[qKey] : liveText}
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={gotoPrev}>Back</Button>
            {saved && (
              <div className="text-sm text-green-600 flex items-center">
                ✓ Ready for next question
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const ReviewStep = (
    <Card>
      <CardHeader>
        <CardTitle>Review your answers</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {(['q1','q2','q3'] as const).map(k => (
          <div key={k} className="space-y-2">
            <div className="text-sm font-medium">Question {k.substring(1)}</div>
            <textarea
              className="w-full rounded border p-2 text-sm"
              rows={4}
              value={transcripts[k] || ''}
              onChange={(e) => setTranscripts(prev => ({ ...prev, [k]: e.target.value }))}
            />
          </div>
        ))}
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setStep('q3')}>Back to Questions</Button>
          <Button onClick={submitForEvaluation} disabled={saving || !transcripts.q1 || !transcripts.q2 || !transcripts.q3}>
            {saving ? 'Submitting…' : 'Submit for Evaluation'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const ProgressDots = (
    <div className="flex items-center gap-2">
      {['video','q1','q2','q3','review'].map((s, i) => (
        <div key={s} className={`h-2 w-2 rounded-full ${i <= progressIndex ? 'bg-indigo-600' : 'bg-muted'}`} />)
      )}
    </div>
  );

  const [announce, setAnnounce] = useState<string>('');
  useEffect(() => {
    if (isUnlockAllowed) setAnnounce('Response panel unlocked');
  }, [isUnlockAllowed]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!videoRef.current) return;
      if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        videoRef.current.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => () => {
    if (pendingConfirmRef.current) window.clearTimeout(pendingConfirmRef.current);
  }, []);

  const RightPanel = (
    <div className="relative">
      {step === 'video' ? (
        <div className="space-y-3 h-full">
          <ResponsePanel
            locked={!isUnlockAllowed}
            watchedPct={Math.round(watchedPct)}
            onFocusVideo={() => videoRef.current?.focus?.() || videoRef.current?.play?.()}
            onStartVideoResponse={() => setStep('q1')}
            onStartAudioResponse={() => setStep('q1')}
            announce={announce}
          />
        </div>
      ) : (
        <>
          {step === 'q1' && <QuestionPanel qKey="q1" />}
          {step === 'q2' && <QuestionPanel qKey="q2" />}
          {step === 'q3' && <QuestionPanel qKey="q3" />}
          {step === 'review' && ReviewStep}
        </>
      )}
    </div>
  );

  return (
    <section className="mx-auto max-w-screen-2xl px-4 lg:px-8 py-8">
      <div className="rounded-3xl bg-white dark:bg-neutral-950 shadow-2xl ring-1 ring-black/5 p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Maria Aguilar — Session 1</h1>
          {ProgressDots}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <div className="xl:col-span-7">
            {VideoStep}
          </div>
          <div className="xl:col-span-5">
            <div className="h-[70vh] md:h-[75vh]">{RightPanel}</div>
          </div>
        </div>
        <div className="sr-only" aria-live="polite">{announce}</div>
      </div>
    </section>
  );
}


