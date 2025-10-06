const STOPWORDS = new Set(["uh", "um", "hmm", "okay", "ok", "yeah", "right"]);

export function isLikelyEcho(text: string) {
  const t = text.toLowerCase().trim();
  if (t.length === 0) return true;
  if (t.split(/\s+/).length <= 2) return true; // too short
  if ([...STOPWORDS].some((s) => t === s)) return true; // filler only
  return false;
}


