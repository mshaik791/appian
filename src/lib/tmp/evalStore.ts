// Simple in-memory store for evaluations to enable testing without DB migrations.
// Keyed by `${caseId}::${simSessionId || 'demo'}`.
// Persist across Next.js dev hot-reloads by attaching to globalThis.

declare global {
  // eslint-disable-next-line no-var
  var __APP_EVAL_STORE__: Map<string, any> | undefined;
}

export function getTemporaryEvalStore() {
  if (!globalThis.__APP_EVAL_STORE__) {
    globalThis.__APP_EVAL_STORE__ = new Map<string, any>();
  }
  return globalThis.__APP_EVAL_STORE__;
}



