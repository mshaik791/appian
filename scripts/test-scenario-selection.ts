import { prisma } from '../src/lib/db';

async function testScenarioSelection() {
  try {
    console.log('🧪 Testing Scenario Selection...\n');

    // Test 1: Fetch competencies
    console.log('1. Testing competencies:');
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
      console.log(`   ${index + 1}. ${competency.name} (${competency._count.cases} cases)`);
    });
    console.log('');

    // Test 2: Fetch cases for each competency with personas and learning objectives
    console.log('2. Testing cases by competency with full data:');
    for (const competency of competencies) {
      const cases = await prisma.case.findMany({
        where: { competencyId: competency.id },
        include: {
          personas: {
            select: {
              id: true,
              name: true,
              avatarId: true,
              voiceId: true,
              backgroundJson: true,
            },
          },
          rubric: {
            select: { name: true },
          },
          competency: {
            select: { name: true },
          },
        },
      });

      console.log(`   ${competency.name}:`);
      cases.forEach((caseItem, index) => {
        console.log(`     ${index + 1}. ${caseItem.title}`);
        console.log(`        Description: ${caseItem.description.substring(0, 80)}...`);
        console.log(`        Rubric: ${caseItem.rubric.name}`);
        console.log(`        Personas: ${caseItem.personas.length}`);
        
        if (caseItem.learningObjectivesJson && Array.isArray(caseItem.learningObjectivesJson)) {
          console.log(`        Learning Objectives: ${(caseItem.learningObjectivesJson as string[]).length}`);
          (caseItem.learningObjectivesJson as string[]).forEach((objective, oIndex) => {
            console.log(`          ${oIndex + 1}. ${objective.substring(0, 60)}...`);
          });
        }

        caseItem.personas.forEach((persona, pIndex) => {
          console.log(`        Persona ${pIndex + 1}: ${persona.name}`);
          if (persona.backgroundJson && typeof persona.backgroundJson === 'object' && 'age' in persona.backgroundJson) {
            console.log(`          Age: ${persona.backgroundJson.age}`);
          }
        });
        console.log('');
      });
    }

    // Test 3: Test search functionality (simulate API behavior)
    console.log('3. Testing search functionality:');
    const searchTerm = 'refugee';
    const allCases = await prisma.case.findMany({
      include: {
        personas: true,
        competency: true,
      },
    });

    const searchResults = allCases.filter(caseItem =>
      caseItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseItem.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    console.log(`   Search for "${searchTerm}": Found ${searchResults.length} results`);
    searchResults.forEach((caseItem, index) => {
      console.log(`     ${index + 1}. ${caseItem.title} (${caseItem.competency.name})`);
    });

    console.log('\n✅ Scenario selection test completed successfully!');

  } catch (error: any) {
    console.error('❌ Error testing scenario selection:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testScenarioSelection();
