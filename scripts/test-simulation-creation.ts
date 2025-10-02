import { prisma } from '../src/lib/db';
import { SimulationMode, SimulationStatus } from '@prisma/client';

async function testSimulationCreation() {
  try {
    console.log('🧪 Testing Simulation Creation...\n');

    // Get a test case and persona
    const testCase = await prisma.case.findFirst({
      include: {
        personas: {
          take: 1,
        },
      },
    });

    if (!testCase || testCase.personas.length === 0) {
      console.log('❌ No test case with personas found');
      return;
    }

    const testPersona = testCase.personas[0];
    const testUser = await prisma.user.findFirst({
      where: { role: 'STUDENT' },
    });

    if (!testUser) {
      console.log('❌ No test student user found');
      return;
    }

    console.log(`✅ Found test case: ${testCase.title}`);
    console.log(`✅ Found test persona: ${testPersona.name}`);
    console.log(`✅ Found test user: ${testUser.email}`);

    // Test simulation creation
    const simulation = await prisma.simulation.create({
      data: {
        caseId: testCase.id,
        personaId: testPersona.id,
        studentId: testUser.id,
        mode: SimulationMode.chat,
        status: SimulationStatus.active,
      },
      include: {
        case: {
          select: { title: true },
        },
        persona: {
          select: { name: true },
        },
      },
    });

    console.log(`✅ Simulation created successfully:`);
    console.log(`   ID: ${simulation.id}`);
    console.log(`   Case: ${simulation.case.title}`);
    console.log(`   Persona: ${simulation.persona.name}`);
    console.log(`   Mode: ${simulation.mode}`);
    console.log(`   Status: ${simulation.status}`);

    // Clean up
    await prisma.simulation.delete({
      where: { id: simulation.id },
    });

    console.log('✅ Test simulation cleaned up');

    console.log('\n✅ Simulation creation test passed!');

  } catch (error: any) {
    console.error('❌ Error testing simulation creation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSimulationCreation();
