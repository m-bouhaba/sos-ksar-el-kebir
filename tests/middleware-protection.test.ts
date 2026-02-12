import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const mockGetSession = vi.fn();

vi.mock('@/lib/auth/auth', () => ({
  auth: {
    api: {
      getSession: (opts: { headers: Headers }) => mockGetSession(opts),
    },
  },
}));

describe('USER STORY 6.2 — Middleware Protection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function runMiddleware(pathname: string, session: { user?: { role?: string } } | null) {
    mockGetSession.mockResolvedValue(session);
    const { middleware } = await import('@/middleware');
    const url = `http://localhost:3000${pathname}`;
    const request = new NextRequest(url);
    return middleware(request);
  }

  it('redirects unauthenticated user to /auth when accessing /dashboard', async () => {
    const res = await runMiddleware('/dashboard', null);

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/auth');
  });

  it('redirects unauthenticated user to /auth when accessing /sos', async () => {
    const res = await runMiddleware('/sos', null);

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/auth');
  });

  it('redirects unauthenticated user to /auth when accessing /inventory', async () => {
    const res = await runMiddleware('/inventory', null);

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/auth');
  });

  it('redirects citizen to /unauthorized when accessing /command-center', async () => {
    const res = await runMiddleware('/command-center', {
      user: { id: '1', email: 'c@test.com', role: 'citizen' },
    });

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/unauthorized');
  });

  it('redirects volunteer to /unauthorized when accessing /dashboard/admin', async () => {
    const res = await runMiddleware('/dashboard/admin', {
      user: { id: '2', email: 'v@test.com', role: 'volunteer' },
    });

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/unauthorized');
  });

  it('allows admin to access /command-center (no redirect)', async () => {
    const res = await runMiddleware('/command-center', {
      user: { id: '3', email: 'a@test.com', role: 'admin' },
    });

    expect(res.headers.get('location')).toBeNull();
  });

  it('redirects /dashboard to /dashboard/citizen for citizen', async () => {
    const res = await runMiddleware('/dashboard', {
      user: { id: '1', email: 'c@test.com', role: 'citizen' },
    });

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/dashboard/citizen');
  });
});
