/**
 * Sets the role of an existing user to admin.
 * Use this after signing up manually at /auth with the admin email/password.
 *
 * Usage: npx tsx scripts/set-admin-role.ts
 *
 * Default email: admin@sos-ksar.local
 * To use another email: npx tsx scripts/set-admin-role.ts other@example.com
 */

import { db } from '@/db';
import { users } from '@/db/schema';
import { UserRole } from '@/types';
import { eq } from 'drizzle-orm';

const email = process.argv[2] ?? 'admin@sos-ksar.local';

async function setAdminRole() {
  const updated = await db
    .update(users)
    .set({ role: UserRole.ADMIN })
    .where(eq(users.email, email))
    .returning();

  if (updated.length === 0) {
    console.error('❌ No user found with email:', email);
    process.exit(1);
  }

  console.log('✅ Role set to admin for:', updated[0].email);
}

setAdminRole().catch((e) => {
  console.error(e);
  process.exit(1);
});
