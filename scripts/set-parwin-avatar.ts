/* ts-node scripts/set-parwin-avatar.ts */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const name = "Samir Ahmad";
  const avatarId = "Pedro_Chair_Sitting_public";
  const voiceId  = "Fpmh5GZLmV0wU1dCR06y";
  const caseId = "cmg8u6rn1000ac9u3q1diqyvl"; // Afghan Refugee Parent case

  const parwin = await prisma.persona.findFirst({ where: { name } });
  if (!parwin) {
    console.log(`Persona "${name}" not found. Creating…`);
    await prisma.persona.create({
      data: {
        name,
        avatarId,
        voiceId,
        caseId,
        backgroundJson: {},
      promptTemplate: "You are Samir Ahmad, an Afghan refugee father in late 30s with light olive skin, seated in a modest room. You have a warm but reserved tone and are navigating healthcare/benefits with trauma history implied.",
        safetyJson: {},
      },
    });
  } else {
    await prisma.persona.update({
      where: { id: parwin.id },
      data: { avatarId, voiceId },
    });
  }
  console.log("✅ Samir avatar/voice updated.");
}
main().finally(() => prisma.$disconnect());
