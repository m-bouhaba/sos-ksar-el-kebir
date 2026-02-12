/**
 * Removes the admin user (and their account/sessions) so you can re-create it
 * with the create-admin-user script and a working password.
 *
 * Use when you get "Invalid email or password" because the user was created
 * without a proper password (e.g. by an older script).
 *
 * Usage: npx tsx scripts/remove-admin-user.ts
 */

import { db } from '@/db';
import { users, account, session } from '@/db/schema';
import { eq } from 'drizzle-orm';

const EMAIL = 'admin@sos-ksar.local';

async function removeAdminUser() {
  const [user] = await db.select().from(users).where(eq(users.email, EMAIL)).limit(1);

  if (!user) {
    console.log('ℹ️  No user found with email:', EMAIL);
    return;
  }

  const userIdStr = String(user.id);

  await db.delete(session).where(eq(session.userId, userIdStr));
  await db.delete(account).where(eq(account.userId, userIdStr));
  await db.delete(users).where(eq(users.id, user.id));

  console.log('✅ Removed user:', EMAIL);
  console.log('   Run with dev server: npx tsx scripts/create-admin-user.ts');
}

removeAdminUser().catch((e) => {
  console.error(e);
  process.exit(1);
});
