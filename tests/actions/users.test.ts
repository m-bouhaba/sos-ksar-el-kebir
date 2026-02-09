import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createUserAction, getUserByEmailAction, getUserByIdAction, updateUserRoleAction, getAllUsersAction } from '@/actions/users';
import { db } from '@/db';
import { users } from '@/db/schema';
import { UserRole } from '@/types';
import { eq } from 'drizzle-orm';

describe('Users Server Actions', () => {
  afterEach(async () => {
    // Nettoyer les données de test
    await db.delete(users).where(eq(users.email, 'test@example.com'));
    await db.delete(users).where(eq(users.email, 'admin@example.com'));
  });

  describe('createUserAction', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.CITIZEN
      };

      const result = await createUserAction(userData);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.email).toBe('test@example.com');
      expect(result.data?.name).toBe('Test User');
      expect(result.data?.role).toBe(UserRole.CITIZEN);
    });

    it('should fail with invalid email', async () => {
      const invalidData = {
        email: 'invalid-email',
        name: 'Test User',
        role: UserRole.CITIZEN
      };

      const result = await createUserAction(invalidData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Données invalides');
      expect(result.details).toBeDefined();
    });

    it('should fail with empty name', async () => {
      const invalidData = {
        email: 'test@example.com',
        name: '',
        role: UserRole.CITIZEN
      };

      const result = await createUserAction(invalidData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Données invalides');
    });

    it('should fail with duplicate email', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.CITIZEN
      };

      // Créer le premier utilisateur
      await createUserAction(userData);

      // Essayer de créer le même utilisateur
      const result = await createUserAction(userData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Cet email est déjà utilisé');
    });
  });

  describe('getUserByEmailAction', () => {
    beforeEach(async () => {
      await createUserAction({
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.CITIZEN
      });
    });

    it('should get user by email successfully', async () => {
      const result = await getUserByEmailAction('test@example.com');

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.email).toBe('test@example.com');
      expect(result.data?.name).toBe('Test User');
    });

    it('should return null for non-existent email', async () => {
      const result = await getUserByEmailAction('nonexistent@example.com');

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });

    it('should fail with invalid email', async () => {
      const result = await getUserByEmailAction('invalid-email');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Email invalide');
    });
  });

  describe('getUserByIdAction', () => {
    let userId: number;

    beforeEach(async () => {
      const userResult = await createUserAction({
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.CITIZEN
      });
      
      if (userResult.success && userResult.data) {
        userId = userResult.data.id;
      }
    });

    it('should get user by ID successfully', async () => {
      const result = await getUserByIdAction(userId);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.id).toBe(userId);
      expect(result.data?.email).toBe('test@example.com');
    });

    it('should return null for non-existent ID', async () => {
      const result = await getUserByIdAction(99999);

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });

    it('should fail with invalid ID', async () => {
      const result = await getUserByIdAction(0);

      expect(result.success).toBe(false);
      expect(result.error).toBe('ID utilisateur invalide');
    });
  });

  describe('updateUserRoleAction', () => {
    let userId: number;

    beforeEach(async () => {
      const userResult = await createUserAction({
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.CITIZEN
      });
      
      if (userResult.success && userResult.data) {
        userId = userResult.data.id;
      }
    });

    it('should update user role successfully', async () => {
      const result = await updateUserRoleAction({
        userId,
        role: UserRole.VOLUNTEER
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.role).toBe(UserRole.VOLUNTEER);
    });

    it('should fail with non-existent user', async () => {
      const result = await updateUserRoleAction({
        userId: 99999,
        role: UserRole.ADMIN
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Utilisateur non trouvé');
    });
  });

  describe('getAllUsersAction', () => {
    beforeEach(async () => {
      await createUserAction({
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.CITIZEN
      });
      
      await createUserAction({
        email: 'admin@example.com',
        name: 'Admin User',
        role: UserRole.ADMIN
      });
    });

    it('should get all users successfully', async () => {
      const result = await getAllUsersAction();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data?.length).toBeGreaterThanOrEqual(2);
    });
  });
});
