import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * SOS / emergency reporting – protected route (auth required via middleware).
 * Role-based content can be added here later.
 */
export default function SosPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="container mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>SOS / Signaler une urgence</CardTitle>
            <CardDescription>
              Cette page est protégée. Accès réservé aux utilisateurs connectés.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm mb-4">
              Vous pouvez utiliser le tableau de bord citoyen pour envoyer un signalement.
            </p>
            <Button asChild variant="outline">
              <Link href="/dashboard">Aller au tableau de bord</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
