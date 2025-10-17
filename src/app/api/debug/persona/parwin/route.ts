import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const p = await prisma.persona.findFirst({ where: { name: "Samir Ahmad" } });
  return NextResponse.json({ name: p?.name, avatarId: p?.avatarId, voiceId: p?.voiceId });
}

