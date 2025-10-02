import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

async function debugTokenIssue() {
  try {
    console.log('🔍 Debugging Token Issue...\n');

    // Create a mock request to test getToken
    const mockRequest = new NextRequest('http://localhost:3000/api/simulations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'next-auth.session-token=test', // This won't work, but let's see what happens
      },
    });

    const token = await getToken({ req: mockRequest });
    console.log('Mock token result:', token);

    console.log('\n💡 The issue is likely:');
    console.log('  1. JWT token not being sent in cookies from frontend');
    console.log('  2. NextAuth secret not configured properly');
    console.log('  3. Session not being created correctly during login');
    console.log('  4. Cookie domain/path issues');

    console.log('\n🔧 Let\'s check the NextAuth configuration...');

  } catch (error: any) {
    console.error('❌ Error debugging token issue:', error);
  }
}

debugTokenIssue();
