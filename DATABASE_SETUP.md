# 🗄️ Configuration PostgreSQL pour SOS Ksar El Kebir

## 📋 Prérequis

1. **PostgreSQL installé** sur votre machine ou serveur
2. **Base de données créée** : `sos_ksar`
3. **Utilisateur PostgreSQL** avec permissions

## 🔧 Étapes de Configuration

### 1. Créer le fichier `.env.local`

Créez un fichier `.env.local` à la racine du projet (ce fichier est déjà dans `.gitignore`) :

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/sos_ksar"

# Project
NEXT_PUBLIC_APP_NAME="SOS Ksar El Kebir"

# Better Auth (à configurer plus tard)
BETTER_AUTH_SECRET="your-secret-key-here"
BETTER_AUTH_URL="http://localhost:3000"
```

**Remplacez `username:password` par vos véritables identifiants PostgreSQL.**

### 2. Appliquer les migrations

```bash
# Générer les migrations (déjà fait)
npm run db:generate

# Appliquer les migrations à la base de données
npm run db:migrate
```

### 3. Tester la connexion

```bash
# Tester la connexion à la base de données
npm run db:test
```

### 4. (Optionnel) Visualiser la base de données

```bash
# Ouvrir Drizzle Studio pour visualiser les données
npm run db:studio
```

## 📊 Structure de la Base de Données

### Tables créées :

#### `users`
- `id` (serial, primary key)
- `email` (varchar, unique)
- `name` (varchar)
- `role` (enum: citizen, volunteer, admin)
- `created_at` (timestamp)

#### `reports`
- `id` (serial, primary key)
- `user_id` (integer, foreign key → users.id)
- `type` (enum: medical, fire, accident, crime, natural_disaster, other)
- `status` (enum: pending, in_progress, resolved, cancelled)
- `location` (text)
- `description` (text)
- `created_at` (timestamp)

#### `inventory`
- `id` (serial, primary key)
- `item_name` (enum: first_aid_kit, fire_extinguisher, emergency_blanket, water_bottles, food_rations, flashlight, radio, batteries, medical_supplies, rescue_equipment)
- `quantity` (integer)
- `center_location` (text)

## 🔌 Server Actions Disponibles

### Gestion des Rapports (`/actions/reports.ts`)
- `createReportAction()` - Créer un nouveau rapport SOS
- `getAllReportsAction()` - Obtenir tous les rapports (centre de commande)
- `getUserReportsAction()` - Obtenir les rapports d'un utilisateur
- `updateReportStatusAction()` - Mettre à jour le statut d'un rapport
- `getReportStatsAction()` - Obtenir les statistiques des rapports

### Gestion des Utilisateurs (`/actions/users.ts`)
- `createUserAction()` - Créer un nouvel utilisateur
- `getUserByEmailAction()` - Obtenir un utilisateur par email
- `getUserByIdAction()` - Obtenir un utilisateur par ID
- `updateUserRoleAction()` - Mettre à jour le rôle d'un utilisateur
- `getAllUsersAction()` - Obtenir tous les utilisateurs
- `getUserStatsAction()` - Obtenir les statistiques des utilisateurs

### Gestion de l'Inventaire (`/actions/inventory.ts`)
- `createInventoryItemAction()` - Créer un item d'inventaire
- `getAllInventoryAction()` - Obtenir tout l'inventaire
- `getInventoryByLocationAction()` - Obtenir l'inventaire par localisation
- `updateInventoryQuantityAction()` - Mettre à jour la quantité d'un item
- `adjustInventoryQuantityAction()` - Ajuster la quantité (ajout/retrait)
- `getInventoryStatsAction()` - Obtenir les statistiques de l'inventaire
- `initializeDefaultInventoryAction()` - Initialiser l'inventaire par défaut

## 🧪 Tests

### Test de connexion complet
Le script `scripts/test-db-connection.ts` effectue les tests suivants :
1. Connexion à la base de données
2. Insertion d'un utilisateur test
3. Insertion d'un rapport test
4. Insertion d'un item d'inventaire test
5. Lecture avec jointures
6. Nettoyage des données de test

### Exécution des tests
```bash
npm run db:test
```

## 🚀 Prochaines Étapes

1. **Configurer Better Auth** pour l'authentification
2. **Intégrer les Server Actions** dans les composants UI
3. **Créer des tests unitaires** pour les Server Actions
4. **Ajouter la validation** côté client avec Zod
5. **Implémenter les notifications** en temps réel

## 🔍 Dépannage

### Erreur de connexion
- Vérifiez que PostgreSQL est en cours d'exécution
- Vérifiez les identifiants dans `DATABASE_URL`
- Assurez-vous que la base de données `sos_ksar` existe

### Erreur de migration
- Vérifiez que vous avez les permissions nécessaires
- Supprimez les tables existantes si nécessaire et recommencez

### Erreur de permissions
- Assurez-vous que l'utilisateur PostgreSQL a les permissions CREATE, INSERT, SELECT, UPDATE, DELETE

## 📝 Notes

- Les enums sont définis dans `/types/index.ts` et utilisés partout dans l'application
- Les Server Actions suivent les règles définies dans `.agent/rules.md`
- Toutes les opérations sont validées avec Zod avant d'être envoyées à la base de données
- La structure est prête pour l'intégration avec Better Auth
