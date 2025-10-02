import { getServerSession } from 'next-auth/next';
import { authOptions } from '../src/lib/auth';

async function debugSession() {
  try {
    console.log('🔍 Debugging Session Issues...\n');

    // This won't work in a script context, but let's check the auth configuration
    console.log('📋 Auth Configuration:');
    console.log('  Auth Options:', JSON.stringify(authOptions, null, 2));

    console.log('\n💡 The issue is likely:');
    console.log('  1. Session not being passed correctly to API routes');
    console.log('  2. User ID mismatch between session and database');
    console.log('  3. NextAuth configuration issue');

    console.log('\n🔧 Let\'s check the simulation API for debugging...');

  } catch (error: any) {
    console.error('❌ Error debugging session:', error);
  }
}

debugSession();
