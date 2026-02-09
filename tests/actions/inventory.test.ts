import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createInventoryItemAction, getAllInventoryAction, updateInventoryQuantityAction, adjustInventoryQuantityAction } from '@/actions/inventory';
import { db } from '@/db';
import { inventory } from '@/db/schema';
import { InventoryItem } from '@/types';
import { eq } from 'drizzle-orm';

describe('Inventory Server Actions', () => {
  afterEach(async () => {
    // Nettoyer les données de test
    await db.delete(inventory).where(eq(inventory.itemName, InventoryItem.FIRST_AID_KIT));
    await db.delete(inventory).where(eq(inventory.itemName, InventoryItem.WATER_BOTTLES));
  });

  describe('createInventoryItemAction', () => {
    it('should create a new inventory item successfully', async () => {
      const itemData = {
        itemName: InventoryItem.FIRST_AID_KIT,
        quantity: 10,
        centerLocation: 'Test Center'
      };

      const result = await createInventoryItemAction(itemData);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.itemName).toBe(InventoryItem.FIRST_AID_KIT);
      expect(result.data?.quantity).toBe(10);
      expect(result.data?.centerLocation).toBe('Test Center');
    });

    it('should fail with negative quantity', async () => {
      const invalidData = {
        itemName: InventoryItem.FIRST_AID_KIT,
        quantity: -5,
        centerLocation: 'Test Center'
      };

      const result = await createInventoryItemAction(invalidData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Données invalides');
      expect(result.details).toBeDefined();
    });

    it('should fail with empty location', async () => {
      const invalidData = {
        itemName: InventoryItem.FIRST_AID_KIT,
        quantity: 10,
        centerLocation: ''
      };

      const result = await createInventoryItemAction(invalidData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Données invalides');
    });
  });

  describe('getAllInventoryAction', () => {
    beforeEach(async () => {
      await createInventoryItemAction({
        itemName: InventoryItem.FIRST_AID_KIT,
        quantity: 10,
        centerLocation: 'Test Center 1'
      });
      
      await createInventoryItemAction({
        itemName: InventoryItem.WATER_BOTTLES,
        quantity: 20,
        centerLocation: 'Test Center 2'
      });
    });

    it('should get all inventory items successfully', async () => {
      const result = await getAllInventoryAction();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data?.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('updateInventoryQuantityAction', () => {
    let itemId: number;

    beforeEach(async () => {
      const itemResult = await createInventoryItemAction({
        itemName: InventoryItem.FIRST_AID_KIT,
        quantity: 10,
        centerLocation: 'Test Center'
      });
      
      if (itemResult.success && itemResult.data) {
        itemId = itemResult.data.id;
      }
    });

    it('should update item quantity successfully', async () => {
      const result = await updateInventoryQuantityAction({
        itemId,
        quantity: 25
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.quantity).toBe(25);
    });

    it('should fail with negative quantity', async () => {
      const result = await updateInventoryQuantityAction({
        itemId,
        quantity: -5
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Données invalides');
    });

    it('should fail with non-existent item', async () => {
      const result = await updateInventoryQuantityAction({
        itemId: 99999,
        quantity: 25
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Item d\'inventaire non trouvé');
    });
  });

  describe('adjustInventoryQuantityAction', () => {
    let itemId: number;

    beforeEach(async () => {
      const itemResult = await createInventoryItemAction({
        itemName: InventoryItem.FIRST_AID_KIT,
        quantity: 20,
        centerLocation: 'Test Center'
      });
      
      if (itemResult.success && itemResult.data) {
        itemId = itemResult.data.id;
      }
    });

    it('should increase quantity successfully', async () => {
      const result = await adjustInventoryQuantityAction(itemId, 5);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.quantity).toBe(25);
      expect(result.message).toContain('+5');
    });

    it('should decrease quantity successfully', async () => {
      const result = await adjustInventoryQuantityAction(itemId, -3);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.quantity).toBe(17);
      expect(result.message).toContain('-3');
    });

    it('should fail when quantity would become negative', async () => {
      const result = await adjustInventoryQuantityAction(itemId, -25);

      expect(result.success).toBe(false);
      expect(result.error).toBe('La quantité ne peut pas être négative');
    });

    it('should fail with invalid item ID', async () => {
      const result = await adjustInventoryQuantityAction(99999, 5);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Item d\'inventaire non trouvé');
    });
  });
});
