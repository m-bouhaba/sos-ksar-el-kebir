'use server';

import { db } from '@/db';
import { users } from '@/db/schema';
import { UserRole } from '@/types';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

// Schéma de validation pour les utilisateurs
const createUserSchema = z.object({
  email: z.string().email('Email invalide'),
  name: z.string().min(1, 'Le nom est requis'),
  role: z.nativeEnum(UserRole).default(UserRole.CITIZEN)
});

const updateUserRoleSchema = z.object({
  userId: z.number().positive(),
  role: z.nativeEnum(UserRole)
});

// Créer un nouvel utilisateur
export async function createUserAction(data: z.infer<typeof createUserSchema>) {
  try {
    // Validation des données
    const validatedData = createUserSchema.parse(data);
    
    // Vérifier si l'email existe déjà
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, validatedData.email))
      .limit(1);

    if (existingUser.length > 0) {
      throw new Error('Cet email est déjà utilisé');
    }

    // Insérer le nouvel utilisateur
    const [newUser] = await db.insert(users).values(validatedData).returning();

    return {
      success: true,
      data: newUser,
      message: 'Utilisateur créé avec succès'
    };
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    
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

// Obtenir un utilisateur par email
export async function getUserByEmailAction(email: string) {
  try {
    if (!email || !email.includes('@')) {
      throw new Error('Email invalide');
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return {
      success: true,
      data: user[0] || null
    };
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}

// Obtenir un utilisateur par ID
export async function getUserByIdAction(userId: number) {
  try {
    if (!userId || userId <= 0) {
      throw new Error('ID utilisateur invalide');
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return {
      success: true,
      data: user[0] || null
    };
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}

// Mettre à jour le rôle d'un utilisateur
export async function updateUserRoleAction(data: z.infer<typeof updateUserRoleSchema>) {
  try {
    // Validation des données
    const validatedData = updateUserRoleSchema.parse(data);
    
    // Mettre à jour le rôle
    const [updatedUser] = await db
      .update(users)
      .set({ role: validatedData.role })
      .where(eq(users.id, validatedData.userId))
      .returning();

    if (!updatedUser) {
      throw new Error('Utilisateur non trouvé');
    }

    return {
      success: true,
      data: updatedUser,
      message: 'Rôle utilisateur mis à jour avec succès'
    };
  } catch (error) {
    console.error('Erreur lors de la mise à jour du rôle:', error);
    
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

// Obtenir tous les utilisateurs (pour le centre de commande)
export async function getAllUsersAction() {
  try {
    const allUsers = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        createdAt: users.createdAt
      })
      .from(users)
      .orderBy(users.createdAt);

    return {
      success: true,
      data: allUsers
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}

// Obtenir les statistiques des utilisateurs
export async function getUserStatsAction() {
  try {
    // Statistiques par rôle
    const roleStats = await db
      .select({
        role: users.role,
        count: users.id
      })
      .from(users)
      .groupBy(users.role);

    // Total des utilisateurs
    const totalUsers = await db.select({ count: users.id }).from(users);

    return {
      success: true,
      data: {
        roleStats,
        total: totalUsers[0]?.count || 0
      }
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques utilisateurs:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}
