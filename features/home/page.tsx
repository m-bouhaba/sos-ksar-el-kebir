'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Users, CheckCircle, Clock, Shield, Heart } from 'lucide-react';

export default function HomePage() {
  // Données mockées pour les statistiques
  const stats = {
    activeReports: 12,
    resolvedReports: 45,
    volunteers: 28,
    responseTime: '8 min'
  };

  const emergencyLevel = 65; // Pourcentage d'urgence

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50">
      {/* Section Hero */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-red-600 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <Badge className="mb-4 bg-yellow-400 text-yellow-900 hover:bg-yellow-300">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Tempête Leonardo - État d'Urgence Actif
            </Badge>
            
            <h1 className="text-5xl font-bold mb-6">
              SOS Ksar El Kebir
            </h1>
            
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Plateforme critique de gestion des secours pour la survie de notre ville. 
              Chaque seconde compte dans une situation d'urgence.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white px-8 py-4">
                <AlertTriangle className="w-5 h-5 mr-2" />
                J'ai besoin d'aide
              </Button>
              
              <Button size="lg" variant="outline" className="bg-white/10 border-white text-white hover:bg-white/20 px-8 py-4">
                <Heart className="w-5 h-5 mr-2" />
                Je veux être bénévole
              </Button>
            </div>
          </div>
        </div>
        
        {/* Ondes décoratives */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V120Z" fill="#F9FAFB"/>
          </svg>
        </div>
      </section>

      {/* Section Statistiques en Direct */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Situation en Direct
          </h2>
          <p className="text-gray-600">
            Suivez l'état des opérations de secours en temps réel
          </p>
        </div>

        {/* Niveau d'Urgence */}
        <Card className="mb-8 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center text-red-800">
              <AlertTriangle className="w-6 h-6 mr-2" />
              Niveau d'Urgence Actuel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>État critique</span>
                <span>{emergencyLevel}%</span>
              </div>
              <Progress value={emergencyLevel} className="h-3" />
              <p className="text-sm text-gray-600">
                Les ressources sont sollicitées à {emergencyLevel}% de leur capacité maximale
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Grille de Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-orange-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-orange-800 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Rapports Actifs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {stats.activeReports}
              </div>
              <p className="text-sm text-gray-600">
                En attente d'intervention
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-green-800 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Cas Résolus
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {stats.resolvedReports}
              </div>
              <p className="text-sm text-gray-600">
                Aujourd'hui
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-blue-800 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Bénévoles Actifs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {stats.volunteers}
              </div>
              <p className="text-sm text-gray-600">
                Sur le terrain
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-purple-800 flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Temps de Réponse
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {stats.responseTime}
              </div>
              <p className="text-sm text-gray-600">
                Moyenne
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Section Actions Rapides */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Actions d'Urgence
            </h2>
            <p className="text-gray-600">
              Accédez rapidement aux services essentiels
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Signaler une Urgence</h3>
                <p className="text-gray-600 text-sm">
                  Signalez immédiatement une situation critique
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Devenir Bénévole</h3>
                <p className="text-gray-600 text-sm">
                  Rejoignez l'équipe de secours
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Centre de Commande</h3>
                <p className="text-gray-600 text-sm">
                  Accès réservé aux équipes d'intervention
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
