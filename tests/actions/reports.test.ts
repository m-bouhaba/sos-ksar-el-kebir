import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createReportAction, getAllReportsAction, getUserReportsAction, updateReportStatusAction } from '@/actions/reports';
import { createUserAction } from '@/actions/users';
import { db } from '@/db';
import { users, reports } from '@/db/schema';
import { ReportType, ReportStatus, UserRole } from '@/types';
import { eq } from 'drizzle-orm';

describe('Reports Server Actions', () => {
  let testUserId: number;

  beforeEach(async () => {
    // Créer un utilisateur de test
    const userResult = await createUserAction({
      email: 'test@example.com',
      name: 'Test User',
      role: UserRole.CITIZEN
    });
    
    if (userResult.success && userResult.data) {
      testUserId = userResult.data.id;
    }
  });

  afterEach(async () => {
    // Nettoyer les données de test
    await db.delete(reports).where(eq(reports.userId, testUserId));
    await db.delete(users).where(eq(users.id, testUserId));
  });

  describe('createReportAction', () => {
    it('should create a new report successfully', async () => {
      const reportData = {
        type: ReportType.MEDICAL,
        location: 'Test Location',
        description: 'Test Description',
        userId: testUserId
      };

      const result = await createReportAction(reportData);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.type).toBe(ReportType.MEDICAL);
      expect(result.data?.location).toBe('Test Location');
      expect(result.data?.description).toBe('Test Description');
      expect(result.data?.status).toBe(ReportStatus.PENDING);
    });

    it('should fail with invalid data', async () => {
      const invalidData = {
        type: ReportType.MEDICAL,
        location: '', // Empty location
        description: 'Test Description',
        userId: testUserId
      };

      const result = await createReportAction(invalidData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Données invalides');
      expect(result.details).toBeDefined();
    });

    it('should fail with non-existent user', async () => {
      const reportData = {
        type: ReportType.MEDICAL,
        location: 'Test Location',
        description: 'Test Description',
        userId: 99999 // Non-existent user ID
      };

      const result = await createReportAction(reportData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Utilisateur non trouvé');
    });
  });

  describe('getUserReportsAction', () => {
    it('should get user reports successfully', async () => {
      // Créer un rapport d'abord
      await createReportAction({
        type: ReportType.FIRE,
        location: 'Test Location 2',
        description: 'Test Description 2',
        userId: testUserId
      });

      const result = await getUserReportsAction(testUserId);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data?.length).toBeGreaterThan(0);
    });

    it('should return empty array for user with no reports', async () => {
      const result = await getUserReportsAction(testUserId);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data?.length).toBe(0);
    });
  });

  describe('updateReportStatusAction', () => {
    let reportId: number;

    beforeEach(async () => {
      // Créer un rapport pour les tests de mise à jour
      const reportResult = await createReportAction({
        type: ReportType.ACCIDENT,
        location: 'Test Location 3',
        description: 'Test Description 3',
        userId: testUserId
      });
      
      if (reportResult.success && reportResult.data) {
        reportId = reportResult.data.id;
      }
    });

    it('should update report status successfully', async () => {
      const result = await updateReportStatusAction({
        reportId,
        status: ReportStatus.IN_PROGRESS
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.status).toBe(ReportStatus.IN_PROGRESS);
    });

    it('should fail with invalid report ID', async () => {
      const result = await updateReportStatusAction({
        reportId: 99999,
        status: ReportStatus.RESOLVED
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Rapport non trouvé');
    });
  });
});
