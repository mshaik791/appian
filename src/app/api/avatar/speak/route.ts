import { NextResponse } from "next/server";

// Placeholder: if provider needs REST speak, implement here.
// For now, succeed immediately so UI can call it.
export async function POST() {
  return NextResponse.json({ ok: true });
}
