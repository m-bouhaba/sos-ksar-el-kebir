import { pgTable, text, timestamp, integer, varchar, pgEnum, serial, boolean } from 'drizzle-orm/pg-core';
import { UserRole, ReportStatus, ReportType, InventoryItem } from '@/types';

// Enums
export const userRoleEnum = pgEnum('user_role', Object.values(UserRole) as [string, ...string[]]);
export const reportStatusEnum = pgEnum('report_status', Object.values(ReportStatus) as [string, ...string[]]);
export const reportTypeEnum = pgEnum('report_type', Object.values(ReportType) as [string, ...string[]]);
export const inventoryItemEnum = pgEnum('inventory_item', Object.values(InventoryItem) as [string, ...string[]]);

// Users table (used by Better Auth; extra columns for auth compatibility)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  role: userRoleEnum('role').notNull().default(UserRole.CITIZEN),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Better Auth: session table (cookie-based sessions). Timestamps with timezone for Neon.
const tsTz = (name: string) => timestamp(name, { withTimezone: true });

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  token: text('token').notNull().unique(),
  expiresAt: tsTz('expires_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: tsTz('created_at').notNull().defaultNow(),
  updatedAt: tsTz('updated_at').notNull().defaultNow(),
});

// Better Auth: account table (OAuth / credential links). Timestamps with timezone for Neon.
export const account = pgTable('account', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  accessTokenExpiresAt: tsTz('access_token_expires_at'),
  refreshTokenExpiresAt: tsTz('refresh_token_expires_at'),
  scope: text('scope'),
  idToken: text('id_token'),
  password: text('password'),
  createdAt: tsTz('created_at').notNull().defaultNow(),
  updatedAt: tsTz('updated_at').notNull().defaultNow(),
});

// Better Auth: verification table (OAuth state, email verification). value must be text so JSON.parse(data.value) works in callback.
export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: tsTz('expires_at').notNull(),
  createdAt: tsTz('created_at').notNull().defaultNow(),
  updatedAt: tsTz('updated_at').notNull().defaultNow(),
});

// Reports table
export const reports = pgTable('reports', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: reportTypeEnum('type').notNull(),
  status: reportStatusEnum('status').notNull().default(ReportStatus.PENDING),
  location: text('location').notNull(),
  description: text('description').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Inventory table
export const inventory = pgTable('inventory', {
  id: serial('id').primaryKey(),
  itemName: inventoryItemEnum('item_name').notNull(),
  quantity: integer('quantity').notNull().default(0),
  centerLocation: text('center_location').notNull(),
});

// Types for TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Report = typeof reports.$inferSelect;
export type NewReport = typeof reports.$inferInsert;
export type Inventory = typeof inventory.$inferSelect;
export type NewInventory = typeof inventory.$inferInsert;
export type Session = typeof session.$inferSelect;
export type NewSession = typeof session.$inferInsert;
export type Account = typeof account.$inferSelect;
export type NewAccount = typeof account.$inferInsert;
export type Verification = typeof verification.$inferSelect;
export type NewVerification = typeof verification.$inferInsert;
