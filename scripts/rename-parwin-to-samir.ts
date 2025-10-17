/* ts-node scripts/rename-parwin-to-samir.ts */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const people = await prisma.persona.findMany({ where: { name: 'Parwin Ahmad' } });
  if (people.length === 0) {
    console.log('No Persona rows found with name "Parwin Ahmad"');
    return;
  }

  for (const p of people) {
    const newPrompt = (p.promptTemplate || '').replace(/Parwin Ahmad/g, 'Samir Ahmad');
    await prisma.persona.update({
      where: { id: p.id },
      data: {
        name: 'Samir Ahmad',
        promptTemplate: newPrompt,
      },
    });
    console.log(`Updated persona ${p.id} -> Samir Ahmad`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


