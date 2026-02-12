/**
 * One-time script to create the admin user so login works.
 *
 * Credentials:
 *   - Name: Admin
 *   - Email: admin@sos-ksar.local
 *   - Password: Admin@Ksar2026
 *   - Role: admin
 *
 * Option 1 (recommended): With dev server RUNNING (npm run dev), run:
 *   npx tsx scripts/create-admin-user.ts
 * This calls your app's sign-up API so the password is stored correctly by Better Auth.
 *
 * Option 2: If the script fails (e.g. server not running):
 *   1. Go to http://localhost:3000/auth
 *   2. Click "Don't have an account? Create one"
 *   3. Sign up with Email: admin@sos-ksar.local, Password: Admin@Ksar2026, Name: Admin
 *   4. Run: npx tsx scripts/set-admin-role.ts
 *
 * If you get "Invalid email or password" after a previous run: the old script may have
 * created the user without a stored password. Delete the user (and their account row)
 * in the DB, then run this script again with the server running.
 */

import { db } from '@/db';
import { users } from '@/db/schema';
import { UserRole } from '@/types';
import { eq } from 'drizzle-orm';

const EMAIL = 'admin@sos-ksar.local';
const PASSWORD = 'Admin@Ksar2026';
const NAME = 'Admin';

const BASE = process.env.BETTER_AUTH_URL ?? process.env.VERCEL_URL ?? 'http://localhost:3000';

async function createAdminUser() {
  console.log('🔐 Creating admin user...');
  console.log('   Make sure your app is running (npm run dev) so sign-up works.\n');

  // 1. Sign up via the app's API so Better Auth hashes and stores the password
  try {
    const signUpUrl = `${BASE}/api/auth/sign-up/email`;
    const res = await fetch(signUpUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: NAME,
        email: EMAIL,
        password: PASSWORD,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok) {
      console.log('✅ Admin account created via sign-up API');
    } else if (data?.message?.toLowerCase?.().includes('already') || res.status === 422) {
      console.log('ℹ️  Admin email already exists, will only set role to admin');
    } else {
      throw new Error(data?.message || `Sign-up failed: ${res.status}`);
    }
  } catch (err: any) {
    const msg = err?.message ?? String(err);
    if (msg.includes('fetch') || msg.includes('ECONNREFUSED')) {
      console.error('❌ Could not reach the app. Start the dev server (npm run dev) and run this script again.');
      console.error('   Or sign up manually at /auth with the admin email/password, then run: npx tsx scripts/set-admin-role.ts');
      return false;
    }
    console.warn('⚠️  Sign-up response:', msg);
  }

  // 2. Set role to admin for this email
  const updated = await db
    .update(users)
    .set({ role: UserRole.ADMIN })
    .where(eq(users.email, EMAIL))
    .returning();

  if (updated.length === 0) {
    console.error('❌ No user found with email:', EMAIL);
    console.error('   Sign up at /auth with that email and password, then run: npx tsx scripts/set-admin-role.ts');
    return false;
  }

  console.log('✅ Admin role set for:', updated[0].email);
  console.log('\n   You can now log in at /auth with:');
  console.log('   Email:', EMAIL);
  console.log('   Password:', PASSWORD);
  return true;
}

createAdminUser()
  .then((ok) => process.exit(ok ? 0 : 1))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
