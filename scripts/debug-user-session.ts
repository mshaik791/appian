import { prisma } from '../src/lib/db';

async function debugUserSession() {
  try {
    console.log('🔍 Debugging User Session Issues...\n');

    // Check all users in the database
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    console.log('📋 All Users in Database:');
    allUsers.forEach((user, index) => {
      console.log(`  ${index + 1}. ID: ${user.id}`);
      console.log(`     Email: ${user.email}`);
      console.log(`     Role: ${user.role}`);
      console.log(`     Created: ${user.createdAt}`);
      console.log('');
    });

    // Check if there are any simulations
    const simulations = await prisma.simulation.findMany({
      select: {
        id: true,
        studentId: true,
        caseId: true,
        personaId: true,
        status: true,
        startedAt: true,
      },
    });

    console.log('📋 Existing Simulations:');
    if (simulations.length === 0) {
      console.log('  No simulations found');
    } else {
      simulations.forEach((sim, index) => {
        console.log(`  ${index + 1}. ID: ${sim.id}`);
        console.log(`     Student ID: ${sim.studentId}`);
        console.log(`     Case ID: ${sim.caseId}`);
        console.log(`     Persona ID: ${sim.personaId}`);
        console.log(`     Status: ${sim.status}`);
        console.log(`     Started: ${sim.startedAt}`);
        console.log('');
      });
    }

    // Check foreign key relationships
    console.log('🔗 Checking Foreign Key Relationships:');
    
    // Check if student IDs in simulations exist in users table
    const studentIds = simulations.map(s => s.studentId);
    const uniqueStudentIds = [...new Set(studentIds)];
    
    for (const studentId of uniqueStudentIds) {
      const user = await prisma.user.findUnique({
        where: { id: studentId },
        select: { id: true, email: true, role: true },
      });
      
      if (user) {
        console.log(`  ✅ Student ID ${studentId} exists: ${user.email} (${user.role})`);
      } else {
        console.log(`  ❌ Student ID ${studentId} NOT FOUND in users table`);
      }
    }

    console.log('\n✅ Debug complete!');

  } catch (error: any) {
    console.error('❌ Error debugging user session:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugUserSession();
