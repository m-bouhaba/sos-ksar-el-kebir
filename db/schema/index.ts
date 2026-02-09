import { pgTable, text, timestamp, integer, varchar, pgEnum, serial } from 'drizzle-orm/pg-core';
import { UserRole, ReportStatus, ReportType, InventoryItem } from '@/types';

// Enums
export const userRoleEnum = pgEnum('user_role', Object.values(UserRole) as [string, ...string[]]);
export const reportStatusEnum = pgEnum('report_status', Object.values(ReportStatus) as [string, ...string[]]);
export const reportTypeEnum = pgEnum('report_type', Object.values(ReportType) as [string, ...string[]]);
export const inventoryItemEnum = pgEnum('inventory_item', Object.values(InventoryItem) as [string, ...string[]]);

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  role: userRoleEnum('role').notNull().default(UserRole.CITIZEN),
  createdAt: timestamp('created_at').notNull().defaultNow(),
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
