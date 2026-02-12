import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getSession, getServerSession } from '@/lib/auth/session';
import type { SessionResult, SessionUser, SessionMeta } from '@/lib/auth/session';

vi.mock('next/headers', () => ({
  headers: vi.fn(() => Promise.resolve(new Headers())),
}));

const mockGetSession = vi.fn();

vi.mock('@/lib/auth/auth', () => ({
  auth: {
    api: {
      getSession: (opts: { headers: Headers }) => mockGetSession(opts),
    },
  },
}));

describe('USER STORY 6.1 — Session Existence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when no session exists', async () => {
    mockGetSession.mockResolvedValue(null);

    const headers = new Headers();
    const result = await getSession(headers);

    expect(result).toBeNull();
  });

  it('returns session with user and session meta when session exists', async () => {
    const raw = {
      user: { id: 42, email: 'u@test.com', name: 'User', role: 'citizen' },
      session: { id: 'sess-1', expiresAt: new Date('2025-12-31') },
    };
    mockGetSession.mockResolvedValue(raw);

    const headers = new Headers();
    const result = await getSession(headers);

    expect(result).not.toBeNull();
    expect(result).toHaveProperty('user');
    expect(result).toHaveProperty('session');

    const user = (result as SessionResult).user as SessionUser;
    const session = (result as SessionResult).session as SessionMeta;

    expect(user.id).toBeDefined();
    expect(user.email).toBe('u@test.com');
    expect(user.role).toBe('citizen');
    expect(session.id).toBe('sess-1');
    expect(session.expiresAt).toEqual(new Date('2025-12-31'));
  });

  it('getServerSession returns same shape when session exists', async () => {
    const raw = {
      user: { id: 1, email: 'a@test.com', name: 'Admin', role: 'admin' },
      session: { id: 'sess-2', expiresAt: new Date() },
    };
    mockGetSession.mockResolvedValue(raw);

    const result = await getServerSession();

    expect(result).not.toBeNull();
    expect((result as SessionResult).user.id).toBe('1');
    expect((result as SessionResult).user.email).toBe('a@test.com');
    expect((result as SessionResult).user.role).toBe('admin');
    expect((result as SessionResult).session.id).toBe('sess-2');
  });
});
