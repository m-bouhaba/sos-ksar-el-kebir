'use server';

/**
 * Command Center Server Actions — secure, role-protected.
 *
 * WHO CAN USE THESE: Only users with "volunteer" or "admin" role.
 * Citizens are blocked — they get an error if they try.
 *
 * HOW SECURITY WORKS:
 *   1. Every action calls `getServerSession()` to check the cookie.
 *   2. We verify the user's role is "volunteer" or "admin".
 *   3. Only then do we run the database query.
 *
 * REUSE:
 *   - Uses existing Drizzle schema (`reports`, `users`, `inventory`).
 *   - Uses existing enums (`ReportStatus`, `UserRole`) from `@/types`.
 *   - Does NOT duplicate any schema or types.
 */

import { db } from '@/db';
import { reports, users, inventory } from '@/db/schema';
import { ReportStatus, UserRole } from '@/types';
import { getServerSession } from '@/lib/auth/session';
import { eq, desc } from 'drizzle-orm';

// ---------------------------------------------------------------------------
// ALLOWED ROLES — only these roles can access the command center
// ---------------------------------------------------------------------------
const ALLOWED_ROLES = [UserRole.VOLUNTEER, UserRole.ADMIN];

// ---------------------------------------------------------------------------
// Helper: check that the user is logged in AND is a volunteer/admin
// Returns the session user, or an error message.
// ---------------------------------------------------------------------------
async function requireCommandCenterAccess() {
    // Step 1: Get the session from the cookie
    const session = await getServerSession();

    // Step 2: Not logged in → block
    if (!session) {
        return { error: 'You must be logged in.' };
    }

    // Step 3: Check role — only volunteer and admin allowed
    if (!ALLOWED_ROLES.includes(session.user.role as UserRole)) {
        return { error: 'Access denied. Volunteers and admins only.' };
    }

    // Step 4: Return the user info (we'll need the name for "assigned to")
    return {
        user: {
            id: session.user.id,
            email: session.user.email,
            role: session.user.role,
        },
    };
}

// ---------------------------------------------------------------------------
// ACTION 1: Get all SOS reports (with reporter name)
// ---------------------------------------------------------------------------
export async function getCommandCenterReportsAction() {
    try {
        // Check authorization
        const auth = await requireCommandCenterAccess();
        if ('error' in auth) {
            return { success: false as const, error: auth.error };
        }

        // Query all reports with the reporter's name (LEFT JOIN with users table)
        // Ordered by newest first so the most urgent appear on top
        const allReports = await db
            .select({
                id: reports.id,
                type: reports.type,
                status: reports.status,
                location: reports.location,
                description: reports.description,
                createdAt: reports.createdAt,
                userId: reports.userId,
                userName: users.name,
                userEmail: users.email,
            })
            .from(reports)
            .leftJoin(users, eq(reports.userId, users.id))
            .orderBy(desc(reports.createdAt));

        return { success: true as const, data: allReports };
    } catch (error) {
        console.error('Error fetching command center reports:', error);
        return {
            success: false as const,
            error: 'Could not load reports.',
        };
    }
}

// ---------------------------------------------------------------------------
// ACTION 2: Get all inventory items
// ---------------------------------------------------------------------------
export async function getCommandCenterInventoryAction() {
    try {
        // Check authorization
        const auth = await requireCommandCenterAccess();
        if ('error' in auth) {
            return { success: false as const, error: auth.error };
        }

        // Query all inventory items
        const allItems = await db
            .select()
            .from(inventory)
            .orderBy(inventory.centerLocation, inventory.itemName);

        return { success: true as const, data: allItems };
    } catch (error) {
        console.error('Error fetching inventory:', error);
        return {
            success: false as const,
            error: 'Could not load inventory.',
        };
    }
}

// ---------------------------------------------------------------------------
// ACTION 3: Take charge of a pending report (set status to "in_progress")
//
// WHAT IT DOES:
//   - Changes the report from "pending" → "in_progress"
//   - This means a volunteer is now handling this emergency
// ---------------------------------------------------------------------------
export async function takeChargeOfReportAction(reportId: number) {
    try {
        // Check authorization
        const auth = await requireCommandCenterAccess();
        if ('error' in auth) {
            return { success: false as const, error: auth.error };
        }

        // Validate the report ID
        if (!reportId || reportId <= 0) {
            return { success: false as const, error: 'Invalid report ID.' };
        }

        // Update the report status to "in_progress"
        const [updatedReport] = await db
            .update(reports)
            .set({ status: ReportStatus.IN_PROGRESS })
            .where(eq(reports.id, reportId))
            .returning();

        // If no report was found with that ID
        if (!updatedReport) {
            return { success: false as const, error: 'Report not found.' };
        }

        return {
            success: true as const,
            data: updatedReport,
            message: 'Report taken in charge!',
        };
    } catch (error) {
        console.error('Error taking charge of report:', error);
        return {
            success: false as const,
            error: 'Could not update the report.',
        };
    }
}

// ---------------------------------------------------------------------------
// ACTION 4: Mark a report as resolved
//
// WHAT IT DOES:
//   - Changes the report from "in_progress" → "resolved"
//   - This means the emergency has been handled
// ---------------------------------------------------------------------------
export async function markReportResolvedAction(reportId: number) {
    try {
        // Check authorization
        const auth = await requireCommandCenterAccess();
        if ('error' in auth) {
            return { success: false as const, error: auth.error };
        }

        // Validate the report ID
        if (!reportId || reportId <= 0) {
            return { success: false as const, error: 'Invalid report ID.' };
        }

        // Update the report status to "resolved"
        const [updatedReport] = await db
            .update(reports)
            .set({ status: ReportStatus.RESOLVED })
            .where(eq(reports.id, reportId))
            .returning();

        // If no report was found with that ID
        if (!updatedReport) {
            return { success: false as const, error: 'Report not found.' };
        }

        return {
            success: true as const,
            data: updatedReport,
            message: 'Report marked as resolved!',
        };
    } catch (error) {
        console.error('Error marking report resolved:', error);
        return {
            success: false as const,
            error: 'Could not update the report.',
        };
    }
}
