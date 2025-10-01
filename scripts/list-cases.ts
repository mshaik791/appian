import { prisma } from '../src/lib/db';

async function listCases() {
  try {
    console.log('📋 Listing all cases with personas...\n');
    
        const cases = await prisma.case.findMany({
          include: {
            personas: true,
            creator: {
              select: { email: true }
            },
            rubric: {
              select: { name: true }
            },
            competency: {
              select: { name: true, desc: true }
            }
          },
          orderBy: { updatedAt: 'desc' }
        });

    if (cases.length === 0) {
      console.log('❌ No cases found in database');
      return;
    }

    console.log(`✅ Found ${cases.length} case(s):\n`);

        cases.forEach((caseItem, index) => {
          console.log(`${index + 1}. ${caseItem.title}`);
          console.log(`   Description: ${caseItem.description}`);
          console.log(`   Competency: ${caseItem.competency.name} - ${caseItem.competency.desc}`);
          console.log(`   Rubric: ${caseItem.rubric.name}`);
          console.log(`   Creator: ${caseItem.creator.email}`);
          console.log(`   Updated: ${caseItem.updatedAt.toISOString()}`);
          console.log(`   Personas: ${caseItem.personas.length}`);
          
          // Show learning objectives
          if (caseItem.learningObjectivesJson && Array.isArray(caseItem.learningObjectivesJson)) {
            console.log('   Learning Objectives:');
            (caseItem.learningObjectivesJson as string[]).forEach((objective, oIndex) => {
              console.log(`     ${oIndex + 1}. ${objective}`);
            });
          }

          if (caseItem.personas.length > 0) {
            console.log('   Persona details:');
            caseItem.personas.forEach((persona, pIndex) => {
              console.log(`     ${pIndex + 1}. ${persona.name}`);
              console.log(`        Avatar: ${persona.avatarId}`);
              console.log(`        Voice: ${persona.voiceId}`);
              console.log(`        Created: ${persona.createdAt.toISOString()}`);
            });
          }
          console.log('');
        });

    // Also check users
    const users = await prisma.user.findMany({
      select: { email: true, role: true, createdAt: true }
    });
    
    console.log(`👥 Found ${users.length} user(s):`);
    users.forEach(user => {
      console.log(`   - ${user.email} (${user.role}) - ${user.createdAt.toISOString()}`);
    });

  } catch (error) {
    console.error('❌ Error listing cases:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listCases();
