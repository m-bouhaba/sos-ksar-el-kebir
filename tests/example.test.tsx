import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { UserRole } from '@/types';

describe('Shared Types', () => {
  it('should have correct UserRole enum values', () => {
    expect(UserRole.CITIZEN).toBe('citizen');
    expect(UserRole.VOLUNTEER).toBe('volunteer');
    expect(UserRole.ADMIN).toBe('admin');
  });

  it('should have all required user roles', () => {
    const roles = Object.values(UserRole);
    expect(roles).toContain('citizen');
    expect(roles).toContain('volunteer');
    expect(roles).toContain('admin');
    expect(roles).toHaveLength(3);
  });
});
