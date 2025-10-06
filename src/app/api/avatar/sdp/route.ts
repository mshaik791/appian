import { NextResponse } from "next/server";

// Placeholder: provider-specific signaling will go here.
// For now, just echo back a fake "answer" so the UI mounts and we can iterate.
export async function POST() {
  return NextResponse.json({
    answer: "v=0\r\n", // minimal SDP to satisfy flow; replace with real answer from HeyGen signaling API
  });
}
