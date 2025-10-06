export class SpeechBuffer {
  private buf = "";
  private timer: any;
  constructor(private speak: (text:string)=>Promise<void>, private delay=200) {}
  push(token: string) {
    this.buf += token;
    if (this.timer) return;
    this.timer = setTimeout(async () => {
      const text = this.buf.trim();
      this.buf = "";
      this.timer = null;
      if (text) await this.speak(text);
    }, this.delay);
  }
  flush() {
    if (this.timer) { clearTimeout(this.timer); this.timer = null; }
    const text = this.buf.trim();
    this.buf = "";
    return text;
  }
}
