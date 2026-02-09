'use server';

import { db } from '@/db';
import { reports, users } from '@/db/schema';
import { ReportType, ReportStatus } from '@/types';
import { eq, desc } from 'drizzle-orm';
import { z } from 'zod';

// Schéma de validation pour les rapports
const createReportSchema = z.object({
  type: z.nativeEnum(ReportType),
  location: z.string().min(1, 'La localisation est requise'),
  description: z.string().min(1, 'La description est requise'),
  userId: z.number().positive()
});

const updateReportStatusSchema = z.object({
  reportId: z.number().positive(),
  status: z.nativeEnum(ReportStatus),
  assignedTo: z.string().optional()
});

// Créer un nouveau rapport SOS
export async function createReportAction(data: z.infer<typeof createReportSchema>) {
  try {
    // Validation des données
    const validatedData = createReportSchema.parse(data);
    
    // Vérifier que l'utilisateur existe
    const user = await db.select().from(users).where(eq(users.id, validatedData.userId)).limit(1);
    if (!user.length) {
      throw new Error('Utilisateur non trouvé');
    }

    // Insérer le nouveau rapport
    const [newReport] = await db.insert(reports).values({
      userId: validatedData.userId,
      type: validatedData.type,
      location: validatedData.location,
      description: validatedData.description,
      status: ReportStatus.PENDING
    }).returning();

    return {
      success: true,
      data: newReport,
      message: 'Rapport SOS créé avec succès'
    };
  } catch (error) {
    console.error('Erreur lors de la création du rapport:', error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Données invalides',
        details: error.issues
      };
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}

// Obtenir tous les rapports (pour le centre de commande)
export async function getAllReportsAction() {
  try {
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
        userEmail: users.email
      })
      .from(reports)
      .leftJoin(users, eq(reports.userId, users.id))
      .orderBy(desc(reports.createdAt));

    return {
      success: true,
      data: allReports
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des rapports:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}

// Obtenir les rapports d'un utilisateur spécifique
export async function getUserReportsAction(userId: number) {
  try {
    if (!userId || userId <= 0) {
      throw new Error('ID utilisateur invalide');
    }

    const userReports = await db
      .select()
      .from(reports)
      .where(eq(reports.userId, userId))
      .orderBy(desc(reports.createdAt));

    return {
      success: true,
      data: userReports
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des rapports utilisateur:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}

// Mettre à jour le statut d'un rapport
export async function updateReportStatusAction(data: z.infer<typeof updateReportStatusSchema>) {
  try {
    // Validation des données
    const validatedData = updateReportStatusSchema.parse(data);
    
    // Mettre à jour le rapport
    const [updatedReport] = await db
      .update(reports)
      .set({ 
        status: validatedData.status,
        // Note: assignedTo serait ajouté dans une version future avec une table séparée
      })
      .where(eq(reports.id, validatedData.reportId))
      .returning();

    if (!updatedReport) {
      throw new Error('Rapport non trouvé');
    }

    return {
      success: true,
      data: updatedReport,
      message: 'Statut du rapport mis à jour avec succès'
    };
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Données invalides',
        details: error.issues
      };
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}

// Obtenir les statistiques des rapports
export async function getReportStatsAction() {
  try {
    // Statistiques par statut
    const statusStats = await db
      .select({
        status: reports.status,
        count: reports.id
      })
      .from(reports)
      .groupBy(reports.status);

    // Statistiques par type
    const typeStats = await db
      .select({
        type: reports.type,
        count: reports.id
      })
      .from(reports)
      .groupBy(reports.type);

    // Total des rapports
    const totalReports = await db.select({ count: reports.id }).from(reports);

    return {
      success: true,
      data: {
        statusStats,
        typeStats,
        total: totalReports[0]?.count || 0
      }
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}
