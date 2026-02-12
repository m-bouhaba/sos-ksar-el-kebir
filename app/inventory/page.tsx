import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Inventory – protected route (auth required via middleware).
 * Admin/volunteer-specific content can be added here later.
 */
export default function InventoryPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="container mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Inventaire</CardTitle>
            <CardDescription>
              Cette page est protégée. Accès réservé aux utilisateurs connectés.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm mb-4">
              Gestion des stocks et équipements – à personnaliser selon les rôles.
            </p>
            <Button asChild variant="outline">
              <Link href="/dashboard">Retour au tableau de bord</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
