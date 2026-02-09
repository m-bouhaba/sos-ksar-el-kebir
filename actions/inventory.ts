'use server';

import { db } from '@/db';
import { inventory } from '@/db/schema';
import { InventoryItem } from '@/types';
import { eq, desc } from 'drizzle-orm';
import { z } from 'zod';

// Schéma de validation pour l'inventaire
const createInventoryItemSchema = z.object({
  itemName: z.nativeEnum(InventoryItem),
  quantity: z.number().min(0, 'La quantité doit être positive'),
  centerLocation: z.string().min(1, 'La localisation est requise')
});

const updateInventoryQuantitySchema = z.object({
  itemId: z.number().positive(),
  quantity: z.number().min(0, 'La quantité doit être positive')
});

// Créer un nouvel item d'inventaire
export async function createInventoryItemAction(data: z.infer<typeof createInventoryItemSchema>) {
  try {
    // Validation des données
    const validatedData = createInventoryItemSchema.parse(data);
    
    // Insérer le nouvel item
    const [newItem] = await db.insert(inventory).values(validatedData).returning();

    return {
      success: true,
      data: newItem,
      message: 'Item d\'inventaire créé avec succès'
    };
  } catch (error) {
    console.error('Erreur lors de la création de l\'item d\'inventaire:', error);
    
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

// Obtenir tout l'inventaire
export async function getAllInventoryAction() {
  try {
    const allItems = await db
      .select()
      .from(inventory)
      .orderBy(inventory.centerLocation, inventory.itemName);

    return {
      success: true,
      data: allItems
    };
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'inventaire:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}

// Obtenir l'inventaire par localisation
export async function getInventoryByLocationAction(location: string) {
  try {
    if (!location || location.trim().length === 0) {
      throw new Error('Localisation invalide');
    }

    const items = await db
      .select()
      .from(inventory)
      .where(eq(inventory.centerLocation, location))
      .orderBy(inventory.itemName);

    return {
      success: true,
      data: items
    };
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'inventaire par localisation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}

// Mettre à jour la quantité d'un item
export async function updateInventoryQuantityAction(data: z.infer<typeof updateInventoryQuantitySchema>) {
  try {
    // Validation des données
    const validatedData = updateInventoryQuantitySchema.parse(data);
    
    // Mettre à jour la quantité
    const [updatedItem] = await db
      .update(inventory)
      .set({ quantity: validatedData.quantity })
      .where(eq(inventory.id, validatedData.itemId))
      .returning();

    if (!updatedItem) {
      throw new Error('Item d\'inventaire non trouvé');
    }

    return {
      success: true,
      data: updatedItem,
      message: 'Quantité mise à jour avec succès'
    };
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la quantité:', error);
    
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

// Ajouter ou retirer de la quantité (opération d'ajustement)
export async function adjustInventoryQuantityAction(itemId: number, adjustment: number) {
  try {
    if (!itemId || itemId <= 0) {
      throw new Error('ID item invalide');
    }

    // Obtenir l'item actuel
    const currentItem = await db
      .select()
      .from(inventory)
      .where(eq(inventory.id, itemId))
      .limit(1);

    if (!currentItem.length) {
      throw new Error('Item d\'inventaire non trouvé');
    }

    const newQuantity = currentItem[0].quantity + adjustment;
    
    if (newQuantity < 0) {
      throw new Error('La quantité ne peut pas être négative');
    }

    // Mettre à jour la quantité
    const [updatedItem] = await db
      .update(inventory)
      .set({ quantity: newQuantity })
      .where(eq(inventory.id, itemId))
      .returning();

    return {
      success: true,
      data: updatedItem,
      message: `Quantité ajustée de ${adjustment > 0 ? '+' : ''}${adjustment} unités`
    };
  } catch (error) {
    console.error('Erreur lors de l\'ajustement de la quantité:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}

// Obtenir les statistiques de l'inventaire
export async function getInventoryStatsAction() {
  try {
    // Total des items par type
    const typeStats = await db
      .select({
        itemName: inventory.itemName,
        totalQuantity: inventory.quantity
      })
      .from(inventory)
      .groupBy(inventory.itemName);

    // Items par localisation
    const locationStats = await db
      .select({
        centerLocation: inventory.centerLocation,
        itemCount: inventory.id,
        totalQuantity: inventory.quantity
      })
      .from(inventory)
      .groupBy(inventory.centerLocation);

    // Items avec faible stock (moins de 10 unités)
    const lowStockItems = await db
      .select()
      .from(inventory)
      .where(eq(inventory.quantity, 0)) // Items avec quantité 0
      .orderBy(inventory.itemName);

    return {
      success: true,
      data: {
        typeStats,
        locationStats,
        lowStockItems: lowStockItems.length,
        criticalItems: lowStockItems
      }
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques inventaire:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}

// Initialiser l'inventaire par défaut
export async function initializeDefaultInventoryAction() {
  try {
    const defaultItems = [
      { itemName: InventoryItem.FIRST_AID_KIT, quantity: 100, centerLocation: 'Centre Principal' },
      { itemName: InventoryItem.FIRE_EXTINGUISHER, quantity: 50, centerLocation: 'Centre Principal' },
      { itemName: InventoryItem.WATER_BOTTLES, quantity: 500, centerLocation: 'Dépôt Nord' },
      { itemName: InventoryItem.FOOD_RATIONS, quantity: 300, centerLocation: 'Dépôt Nord' },
      { itemName: InventoryItem.EMERGENCY_BLANKET, quantity: 150, centerLocation: 'Centre Principal' },
      { itemName: InventoryItem.FLASHLIGHT, quantity: 200, centerLocation: 'Dépôt Sud' },
      { itemName: InventoryItem.RADIO, quantity: 75, centerLocation: 'Centre Principal' },
      { itemName: InventoryItem.BATTERIES, quantity: 400, centerLocation: 'Dépôt Sud' },
      { itemName: InventoryItem.MEDICAL_SUPPLIES, quantity: 250, centerLocation: 'Centre Principal' },
      { itemName: InventoryItem.RESCUE_EQUIPMENT, quantity: 80, centerLocation: 'Dépôt Nord' }
    ];

    // Insérer tous les items par défaut
    const insertedItems = await db.insert(inventory).values(defaultItems).returning();

    return {
      success: true,
      data: insertedItems,
      message: 'Inventaire par défaut initialisé avec succès'
    };
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de l\'inventaire:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}
