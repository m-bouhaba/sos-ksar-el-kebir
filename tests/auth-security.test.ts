import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requireAuth, requireRole, requireAnyRole } from '@/lib/auth/auth-helpers';
import { UserRole } from '@/types';
import * as navigation from 'next/navigation';

// Mock dependecies
vi.mock('next/headers', () => ({
    headers: vi.fn(),
}));

vi.mock('next/navigation', () => ({
    redirect: vi.fn(),
}));

const mockGetSession = vi.fn();

vi.mock('@/lib/auth/auth', () => ({
    auth: {
        api: {
            getSession: () => mockGetSession(),
        },
    },
}));

describe('Authorization Helpers', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('requireAuth', () => {
        it('should return user if authenticated', async () => {
            const mockUser = { id: 1, role: UserRole.CITIZEN };
            mockGetSession.mockResolvedValue({ user: mockUser });

            const user = await requireAuth();
            expect(user).toEqual(mockUser);
            expect(navigation.redirect).not.toHaveBeenCalled();
        });

        it('should redirect to login if not authenticated', async () => {
            mockGetSession.mockResolvedValue(null);

            try {
                await requireAuth();
            } catch (e) {
                // redirect throws, so we catch it
            }
            expect(navigation.redirect).toHaveBeenCalledWith('/auth/login');
        });
    });

    describe('requireRole', () => {
        it('should return user if role matches', async () => {
            const mockUser = { id: 1, role: UserRole.ADMIN };
            mockGetSession.mockResolvedValue({ user: mockUser });

            const user = await requireRole(UserRole.ADMIN);
            expect(user).toEqual(mockUser);
        });

        it('should redirect to unauthorized if role mismatches', async () => {
            const mockUser = { id: 1, role: UserRole.CITIZEN };
            mockGetSession.mockResolvedValue({ user: mockUser });

            try {
                await requireRole(UserRole.ADMIN);
            } catch (e) { }
            expect(navigation.redirect).toHaveBeenCalledWith('/unauthorized');
        });
    });

    describe('requireAnyRole', () => {
        it('should return user if role is in allowed list', async () => {
            const mockUser = { id: 1, role: UserRole.VOLUNTEER };
            mockGetSession.mockResolvedValue({ user: mockUser });

            const user = await requireAnyRole([UserRole.ADMIN, UserRole.VOLUNTEER]);
            expect(user).toEqual(mockUser);
        });

        it('should redirect if role is not in allowed list', async () => {
            const mockUser = { id: 1, role: UserRole.CITIZEN };
            mockGetSession.mockResolvedValue({ user: mockUser });

            try {
                await requireAnyRole([UserRole.ADMIN, UserRole.VOLUNTEER]);
            } catch (e) { }
            expect(navigation.redirect).toHaveBeenCalledWith('/unauthorized');
        });
    });
});
