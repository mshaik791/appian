import { getServerSession } from 'next-auth/next';
import { authOptions } from '../src/lib/auth';

async function testCurrentSession() {
  try {
    console.log('🔍 Testing Current Session...\n');

    // This won't work in a script context, but let's check what we can
    console.log('📋 Auth Configuration:');
    console.log('  JWT Callback: Sets token.id and token.role');
    console.log('  Session Callback: Uses token.id || token.sub');
    console.log('  Strategy: JWT');

    console.log('\n💡 The issue might be:');
    console.log('  1. User needs to log out and log back in for new JWT structure');
    console.log('  2. Existing session tokens still use old structure');
    console.log('  3. Cookie domain/path issues');

    console.log('\n🔧 Next Steps:');
    console.log('  1. Try logging out and logging back in');
    console.log('  2. Check browser cookies for NextAuth session');
    console.log('  3. Test with fresh session');

  } catch (error: any) {
    console.error('❌ Error testing session:', error);
  }
}

testCurrentSession();
