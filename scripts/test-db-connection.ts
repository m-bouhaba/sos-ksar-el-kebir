import { db } from '@/db';
import { users, reports, inventory } from '@/db/schema';
import { UserRole, ReportType, InventoryItem } from '@/types';

async function testDatabaseConnection() {
  console.log('🔍 Test de connexion à la base de données...');
  
  try {
    // Test 1: Connexion simple
    console.log('1. Test de connexion...');
    const result = await db.select().from(users).limit(1);
    console.log('✅ Connexion réussie');
    
    // Test 2: Insertion d'un utilisateur test
    console.log('2. Test d\'insertion utilisateur...');
    const [testUser] = await db.insert(users).values({
      email: 'test@example.com',
      name: 'Utilisateur Test',
      role: UserRole.CITIZEN
    }).returning();
    console.log('✅ Utilisateur créé:', testUser.name);
    
    // Test 3: Insertion d'un rapport test
    console.log('3. Test d\'insertion rapport...');
    const [testReport] = await db.insert(reports).values({
      userId: testUser.id,
      type: ReportType.MEDICAL,
      location: 'Test Location',
      description: 'Test description',
      status: 'pending'
    }).returning();
    console.log('✅ Rapport créé:', testReport.type);
    
    // Test 4: Insertion d'un item d'inventaire test
    console.log('4. Test d\'insertion inventaire...');
    const [testInventory] = await db.insert(inventory).values({
      itemName: InventoryItem.FIRST_AID_KIT,
      quantity: 10,
      centerLocation: 'Test Center'
    }).returning();
    console.log('✅ Item inventaire créé:', testInventory.itemName);
    
    // Test 5: Lecture avec jointures
    console.log('5. Test de lecture avec jointures...');
    const reportsWithUsers = await db
      .select({
        reportId: reports.id,
        reportType: reports.type,
        reportLocation: reports.location,
        userName: users.name,
        userEmail: users.email
      })
      .from(reports)
      .leftJoin(users, eq(reports.userId, users.id))
      .limit(5);
    
    console.log('✅ Jointure réussie, rapports trouvés:', reportsWithUsers.length);
    
    // Test 6: Nettoyage des données de test
    console.log('6. Nettoyage des données de test...');
    await db.delete(reports).where(eq(reports.id, testReport.id));
    await db.delete(inventory).where(eq(inventory.id, testInventory.id));
    await db.delete(users).where(eq(users.id, testUser.id));
    console.log('✅ Nettoyage terminé');
    
    console.log('🎉 Tous les tests de base de données ont réussi!');
    return true;
    
  } catch (error) {
    console.error('❌ Erreur lors du test de la base de données:', error);
    return false;
  }
}

// Importer eq manuellement pour éviter les problèmes d'import
import { eq } from 'drizzle-orm';

// Exporter pour utilisation dans d'autres scripts
export { testDatabaseConnection };

// Exécuter le test si ce fichier est appelé directement
if (require.main === module) {
  testDatabaseConnection()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Erreur inattendue:', error);
      process.exit(1);
    });
}
