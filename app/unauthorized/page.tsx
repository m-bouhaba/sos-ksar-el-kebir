import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4">
            <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]">
                <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_500px_at_50%_200px,#d5c5ff,transparent)]"></div>
            </div>

            <Card className="w-full max-w-md border-red-100 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 ring-8 ring-red-50">
                        <ShieldAlert className="w-8 h-8 text-red-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">Accès Refusé</CardTitle>
                    <div className="flex items-center justify-center gap-2 mt-2 text-red-600 font-medium bg-red-50 py-1 px-3 rounded-full mx-auto w-fit">
                        <Lock className="w-3 h-3" />
                        <span>403 Unauthorized</span>
                    </div>
                </CardHeader>

                <CardContent className="text-center pt-4">
                    <p className="text-gray-600 mb-6">
                        Désolé, vous n'avez pas les permissions nécessaires pour accéder à cette page.
                        Si vous pensez qu'il s'agit d'une erreur, veuillez contacter un administrateur.
                    </p>
                </CardContent>

                <CardFooter className="flex justify-center pb-8">
                    <Link href="/dashboard" passHref>
                        <Button variant="default" className="gap-2 bg-gray-900 hover:bg-gray-800">
                            <ArrowLeft className="w-4 h-4" />
                            Retour au Tableau de Bord
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}
