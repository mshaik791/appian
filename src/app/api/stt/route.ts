import { NextResponse } from "next/server";
import OpenAI from "openai";
export const runtime = "nodejs";
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
const MODEL = process.env.STT_MODEL || "whisper-1";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const audio = form.get("audio");
    if (!(audio instanceof File)) return NextResponse.json({ error: "Missing audio file" }, { status: 400 });
    const tr = await client.audio.transcriptions.create({ model: MODEL, file: audio });
    return NextResponse.json({ text: (tr as any)?.text ?? "" });
  } catch (e: any) {
    console.error("[STT] error:", e?.message || e);
    return NextResponse.json({ error: "STT failed" }, { status: 500 });
  }
}