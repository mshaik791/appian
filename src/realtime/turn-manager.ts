export type TurnState = "idle" | "student_listening" | "persona_speaking" | "cooldown";

type Events = {
  onStateChange?: (s: TurnState) => void;
};

export class TurnManager {
  private state: TurnState = "idle";
  private cooldownMs = 1200; // longer buffer after avatar finishes to prevent rapid transitions
  private cooldownTimer: any = null;
  constructor(private ev: Events = {}) {}

  getState() { return this.state; }
  private setState(s: TurnState) {
    this.state = s;
         console.log("🔄 TurnManager state:", this.state, "->", s);
         this.ev.onStateChange?.(s);
  }

  /** Call when sim screen loads */
  start() {
    this.setState("student_listening");
  }

  /** Student finished speaking -> ready for persona to speak */
  lockForPersona() {
    if (this.cooldownTimer) { clearTimeout(this.cooldownTimer); this.cooldownTimer = null; }
    this.setState("persona_speaking");
  }

  /** Persona finished speaking -> short cooldown -> back to student */
  personaDone() {
    this.setState("cooldown");
    if (this.cooldownTimer) clearTimeout(this.cooldownTimer);
    this.cooldownTimer = setTimeout(() => {
      this.setState("student_listening");
    }, this.cooldownMs);
  }

  /** Can we accept/forward student audio→LLM now? */
  canAcceptStudentFinal(): boolean {
    return this.state === "student_listening";
  }
}


