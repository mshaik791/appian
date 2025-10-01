import { prisma } from '../src/lib/db';

async function testCompetencySelector() {
  try {
    console.log('🧪 Testing Competency Selector...\n');

    // Test 1: Fetch competencies with case counts
    console.log('1. Testing competencies API data:');
    const competencies = await prisma.competency.findMany({
      include: {
        _count: {
          select: { cases: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    console.log(`✅ Found ${competencies.length} competencies:`);
    competencies.forEach((competency, index) => {
      console.log(`   ${index + 1}. ${competency.name}`);
      console.log(`      Description: ${competency.desc}`);
      console.log(`      Cases: ${competency._count.cases}`);
      console.log('');
    });

    // Test 2: Fetch cases for each competency
    console.log('2. Testing cases by competency:');
    for (const competency of competencies) {
      const cases = await prisma.case.findMany({
        where: { competencyId: competency.id },
        include: {
          personas: {
            select: {
              id: true,
              name: true,
            },
          },
          rubric: {
            select: { name: true },
          },
        },
      });

      console.log(`   ${competency.name}:`);
      cases.forEach((caseItem, index) => {
        console.log(`     ${index + 1}. ${caseItem.title}`);
        console.log(`        Personas: ${caseItem.personas.length}`);
        console.log(`        Rubric: ${caseItem.rubric.name}`);
        if (caseItem.learningObjectivesJson && Array.isArray(caseItem.learningObjectivesJson)) {
          console.log(`        Learning Objectives: ${(caseItem.learningObjectivesJson as string[]).length}`);
        }
      });
      console.log('');
    }

    console.log('✅ Competency selector test completed successfully!');

  } catch (error: any) {
    console.error('❌ Error testing competency selector:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCompetencySelector();
