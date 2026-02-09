'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  Users, 
  Package,
  MapPin,
  Clock,
  CheckCircle,
  Activity,
  AlertTriangle,
  TrendingUp,
  Truck,
  Heart,
  Phone,
  Filter,
  Search,
  User
} from 'lucide-react';
import { ReportType, ReportStatus, InventoryItem } from '@/types';

// Données mockées pour les signaux SOS
const mockSignals = [
  {
    id: 1,
    type: ReportType.MEDICAL,
    status: ReportStatus.PENDING,
    priority: 'critical',
    location: 'Hôpital Ibn Sina, Ksar El Kebir',
    description: 'Patient en état critique nécessitant transfert immédiat',
    reportedBy: 'Citoyen Mohamed A.',
    reportedAt: '2024-01-09T11:30:00Z',
    assignedTo: null
  },
  {
    id: 2,
    type: ReportType.FIRE,
    status: ReportStatus.IN_PROGRESS,
    priority: 'high',
    location: 'Zone Industrielle, Ksar El Kebir',
    description: 'Incendie dans un entrepôt, évacuation en cours',
    reportedBy: 'Citoyen Fatima B.',
    reportedAt: '2024-01-09T10:45:00Z',
    assignedTo: 'Équipe Alpha'
  },
  {
    id: 3,
    type: ReportType.ACCIDENT,
    status: ReportStatus.IN_PROGRESS,
    priority: 'medium',
    location: 'Route Nationale 1, Ksar El Kebir',
    description: 'Accident de la route, 2 véhicules impliqués',
    reportedBy: 'Citoyen Ahmed K.',
    reportedAt: '2024-01-09T10:15:00Z',
    assignedTo: 'Équipe Beta'
  },
  {
    id: 4,
    type: ReportType.CRIME,
    status: ReportStatus.PENDING,
    priority: 'low',
    location: 'Centre Ville, Ksar El Kebir',
    description: 'Signalement de vol à main armée',
    reportedBy: 'Citoyen Sara L.',
    reportedAt: '2024-01-09T09:30:00Z',
    assignedTo: null
  }
];

// Données mockées pour l'inventaire
const mockInventory = [
  { item: InventoryItem.FIRST_AID_KIT, quantity: 45, maxQuantity: 100, location: 'Centre Principal' },
  { item: InventoryItem.FIRE_EXTINGUISHER, quantity: 28, maxQuantity: 50, location: 'Centre Principal' },
  { item: InventoryItem.WATER_BOTTLES, quantity: 200, maxQuantity: 500, location: 'Dépôt Nord' },
  { item: InventoryItem.FOOD_RATIONS, quantity: 150, maxQuantity: 300, location: 'Dépôt Nord' },
  { item: InventoryItem.EMERGENCY_BLANKET, quantity: 80, maxQuantity: 150, location: 'Centre Principal' },
  { item: InventoryItem.FLASHLIGHT, quantity: 120, maxQuantity: 200, location: 'Dépôt Sud' }
];

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'critical':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'high':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusColor = (status: ReportStatus) => {
  switch (status) {
    case ReportStatus.PENDING:
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case ReportStatus.IN_PROGRESS:
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case ReportStatus.RESOLVED:
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getTypeColor = (type: ReportType) => {
  switch (type) {
    case ReportType.MEDICAL:
      return 'bg-red-100 text-red-800';
    case ReportType.FIRE:
      return 'bg-orange-100 text-orange-800';
    case ReportType.ACCIDENT:
      return 'bg-yellow-100 text-yellow-800';
    case ReportType.CRIME:
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function CommandCenter() {
  const [selectedFilter, setSelectedFilter] = useState('all');

  const stats = {
    totalSignals: mockSignals.length,
    criticalSignals: mockSignals.filter(s => s.priority === 'critical').length,
    activeTeams: 3,
    responseTime: '6 min'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Shield className="w-8 h-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">Centre de Commande</h1>
              </div>
              <Badge variant="outline" className="text-blue-600 border-blue-600">
                Bénévole
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Phone className="w-4 h-4 mr-2" />
                Ligne d'urgence: 15
              </Button>
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <User className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">Équipe Alpha</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Signaux totaux</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalSignals}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Urgences critiques</p>
                  <p className="text-2xl font-bold text-red-600">{stats.criticalSignals}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Équipes actives</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.activeTeams}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Temps de réponse</p>
                  <p className="text-2xl font-bold text-green-600">{stats.responseTime}</p>
                </div>
                <Clock className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Flux des signaux SOS */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Flux des Signaux SOS</CardTitle>
                    <CardDescription>
                      Signaux entrants triés par priorité
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filtrer
                    </Button>
                    <Button variant="outline" size="sm">
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {mockSignals.map((signal) => (
                    <Card key={signal.id} className="border-l-4 border-l-red-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <Badge className={getPriorityColor(signal.priority)}>
                              {signal.priority === 'critical' && 'Critique'}
                              {signal.priority === 'high' && 'Élevée'}
                              {signal.priority === 'medium' && 'Moyenne'}
                              {signal.priority === 'low' && 'Faible'}
                            </Badge>
                            <Badge className={getTypeColor(signal.type)}>
                              {signal.type}
                            </Badge>
                            <Badge className={getStatusColor(signal.status)} variant="outline">
                              {signal.status === 'pending' && 'En attente'}
                              {signal.status === 'in_progress' && 'En cours'}
                              {signal.status === 'resolved' && 'Résolu'}
                            </Badge>
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(signal.reportedAt).toLocaleTimeString('fr-FR')}
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="w-4 h-4 mr-1" />
                            {signal.location}
                          </div>
                          <p className="text-gray-800">{signal.description}</p>
                          <div className="flex items-center text-sm text-gray-600">
                            <User className="w-4 h-4 mr-1" />
                            Signalé par {signal.reportedBy}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between mt-4 pt-3 border-t">
                          <div className="flex items-center space-x-2">
                            {signal.assignedTo ? (
                              <Badge variant="outline" className="text-blue-600">
                                <Users className="w-3 h-3 mr-1" />
                                {signal.assignedTo}
                              </Badge>
                            ) : (
                              <Button size="sm" variant="outline">
                                <Users className="w-4 h-4 mr-2" />
                                Assigner
                              </Button>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {signal.status === ReportStatus.PENDING && (
                              <Button size="sm">
                                <Activity className="w-4 h-4 mr-2" />
                                Prendre en charge
                              </Button>
                            )}
                            {signal.status === ReportStatus.IN_PROGRESS && (
                              <Button size="sm" variant="outline">
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Marquer résolu
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Inventario et actions rapides */}
          <div className="space-y-6">
            {/* Widget d'Inventaire */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Inventaire des Stocks
                </CardTitle>
                <CardDescription>
                  État des ressources disponibles
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {mockInventory.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{item.item}</span>
                        <span className="text-gray-600">
                          {item.quantity}/{item.maxQuantity}
                        </span>
                      </div>
                      <Progress 
                        value={(item.quantity / item.maxQuantity) * 100} 
                        className="h-2"
                      />
                      <div className="text-xs text-gray-500">
                        {item.location}
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button className="w-full mt-4" variant="outline">
                  <Truck className="w-4 h-4 mr-2" />
                  Gérer l'inventaire
                </Button>
              </CardContent>
            </Card>

            {/* Actions Rapides */}
            <Card>
              <CardHeader>
                <CardTitle>Actions Rapides</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <Button className="w-full" variant="outline">
                  <Heart className="w-4 h-4 mr-2" />
                  Appeler les renforts
                </Button>
                <Button className="w-full" variant="outline">
                  <Truck className="w-4 h-4 mr-2" />
                  Déployer une équipe
                </Button>
                <Button className="w-full" variant="outline">
                  <Phone className="w-4 h-4 mr-2" />
                  Contacter l'hôpital
                </Button>
                <Button className="w-full" variant="outline">
                  <Shield className="w-4 h-4 mr-2" />
                  Alerte générale
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
