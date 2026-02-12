import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getCurrentUser,
  requireAuth,
  requireRole,
  requireAnyRole,
  UnauthorizedError,
  ForbiddenError,
} from '@/lib/auth/auth-helpers';
import { UserRole } from '@/types';

vi.mock('next/headers', () => ({
  headers: vi.fn(() => Promise.resolve(new Headers())),
}));

const mockGetSession = vi.fn();

vi.mock('@/lib/auth/auth', () => ({
  auth: {
    api: {
      getSession: (opts: { headers: Headers }) => mockGetSession(),
    },
  },
}));

describe('Auth Helpers (USER STORY 4)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCurrentUser', () => {
    it('returns user when authenticated', async () => {
      const mockUser = { id: '1', email: 'u@test.com', role: UserRole.CITIZEN };
      mockGetSession.mockResolvedValue({ user: mockUser });

      const user = await getCurrentUser();
      expect(user).toEqual({ id: '1', email: 'u@test.com', role: 'citizen' });
    });

    it('returns null when not authenticated', async () => {
      mockGetSession.mockResolvedValue(null);

      const user = await getCurrentUser();
      expect(user).toBeNull();
    });
  });

  describe('requireAuth', () => {
    it('returns user when authenticated', async () => {
      const mockUser = { id: '1', role: UserRole.CITIZEN, email: 'u@test.com' };
      mockGetSession.mockResolvedValue({ user: mockUser });

      const user = await requireAuth();
      expect(user).toBeDefined();
      expect(user.id).toBe('1');
      expect(user.role).toBe('citizen');
    });

    it('throws UnauthorizedError when not authenticated', async () => {
      mockGetSession.mockResolvedValue(null);

      await expect(requireAuth()).rejects.toThrow(UnauthorizedError);
      await expect(requireAuth()).rejects.toThrow('Authentication required');
    });
  });

  describe('requireRole', () => {
    it('returns user when role matches', async () => {
      const mockUser = { id: '1', role: UserRole.ADMIN, email: 'a@test.com' };
      mockGetSession.mockResolvedValue({ user: mockUser });

      const user = await requireRole(UserRole.ADMIN);
      expect(user.role).toBe(UserRole.ADMIN);
    });

    it('throws ForbiddenError when role does not match', async () => {
      const mockUser = { id: '1', role: UserRole.CITIZEN, email: 'u@test.com' };
      mockGetSession.mockResolvedValue({ user: mockUser });

      await expect(requireRole(UserRole.ADMIN)).rejects.toThrow(ForbiddenError);
      await expect(requireRole(UserRole.ADMIN)).rejects.toThrow(/Role 'admin' required/);
    });

    it('throws UnauthorizedError when not authenticated', async () => {
      mockGetSession.mockResolvedValue(null);

      await expect(requireRole(UserRole.ADMIN)).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('requireAnyRole', () => {
    it('returns user when role is in allowed list', async () => {
      const mockUser = { id: '1', role: UserRole.VOLUNTEER, email: 'v@test.com' };
      mockGetSession.mockResolvedValue({ user: mockUser });

      const user = await requireAnyRole([UserRole.ADMIN, UserRole.VOLUNTEER]);
      expect(user.role).toBe(UserRole.VOLUNTEER);
    });

    it('throws ForbiddenError when role is not in allowed list', async () => {
      const mockUser = { id: '1', role: UserRole.CITIZEN, email: 'u@test.com' };
      mockGetSession.mockResolvedValue({ user: mockUser });

      await expect(
        requireAnyRole([UserRole.ADMIN, UserRole.VOLUNTEER])
      ).rejects.toThrow(ForbiddenError);
    });
  });
});
