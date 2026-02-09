'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  AlertTriangle, 
  Send, 
  Clock, 
  CheckCircle, 
  User,
  MapPin,
  Phone,
  Heart,
  Activity
} from 'lucide-react';
import { ReportType, ReportStatus } from '@/types';

// Données mockées pour les rapports
const mockReports = [
  {
    id: 1,
    type: ReportType.MEDICAL,
    status: ReportStatus.PENDING,
    location: 'Rue Hassan II, Ksar El Kebir',
    description: 'Personne âgée tombée, besoin d\'assistance médicale urgente',
    createdAt: '2024-01-09T10:30:00Z'
  },
  {
    id: 2,
    type: ReportType.FIRE,
    status: ReportStatus.IN_PROGRESS,
    location: 'Avenue Mohammed V, Ksar El Kebir',
    description: 'Début d\'incendie dans un immeuble résidentiel',
    createdAt: '2024-01-09T09:15:00Z'
  },
  {
    id: 3,
    type: ReportType.ACCIDENT,
    status: ReportStatus.RESOLVED,
    location: 'Boulevard Zerktouni, Ksar El Kebir',
    description: 'Accident de voiture, blessés légers',
    createdAt: '2024-01-09T08:45:00Z'
  }
];

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

const getStatusIcon = (status: ReportStatus) => {
  switch (status) {
    case ReportStatus.PENDING:
      return <Clock className="w-4 h-4" />;
    case ReportStatus.IN_PROGRESS:
      return <Activity className="w-4 h-4" />;
    case ReportStatus.RESOLVED:
      return <CheckCircle className="w-4 h-4" />;
    default:
      return <Clock className="w-4 h-4" />;
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

export default function CitizenDashboard() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    type: ReportType.OTHER,
    location: '',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulation d'envoi de rapport
    setTimeout(() => {
      setIsSubmitting(false);
      setFormData({ type: ReportType.OTHER, location: '', description: '' });
      // Ici, la logique d'envoi sera implémentée plus tard
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Heart className="w-8 h-8 text-red-600" />
                <h1 className="text-2xl font-bold text-gray-900">SOS Ksar</h1>
              </div>
              <Badge variant="outline" className="text-green-600 border-green-600">
                Citoyen
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Phone className="w-4 h-4 mr-2" />
                Urgence: 15
              </Button>
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <User className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">Citoyen</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulaire SOS */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg">
              <CardHeader className="bg-red-50 border-b">
                <CardTitle className="flex items-center text-red-800">
                  <AlertTriangle className="w-6 h-6 mr-2" />
                  Signaler une Urgence
                </CardTitle>
                <CardDescription>
                  Décrivez votre situation pour obtenir une assistance rapide
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type d'urgence</Label>
                    <select
                      id="type"
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as ReportType }))}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value={ReportType.MEDICAL}>Médical</option>
                      <option value={ReportType.FIRE}>Incendie</option>
                      <option value={ReportType.ACCIDENT}>Accident</option>
                      <option value={ReportType.CRIME}>Crime</option>
                      <option value={ReportType.NATURAL_DISASTER}>Catastrophe naturelle</option>
                      <option value={ReportType.OTHER}>Autre</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Localisation</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="location"
                        placeholder="Adresse ou description du lieu"
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Décrivez la situation en détail..."
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-red-600 hover:bg-red-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Envoi en cours...
                      </div>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Envoyer le signal SOS
                      </>
                    )}
                  </Button>
                </form>

                {/* Info importante */}
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Important:</strong> En cas d'urgence vitale, appelez le 15 immédiatement.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Liste des rapports */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Mes Signalements</CardTitle>
                <CardDescription>
                  Suivez l'état de vos rapports d'urgence
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {mockReports.map((report) => (
                    <Card key={report.id} className="border-l-4 border-l-red-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <Badge className={getTypeColor(report.type)}>
                              {report.type}
                            </Badge>
                            <Badge className={getStatusColor(report.status)} variant="outline">
                              <div className="flex items-center gap-1">
                                {getStatusIcon(report.status)}
                                {report.status === 'pending' && 'En attente'}
                                {report.status === 'in_progress' && 'En cours'}
                                {report.status === 'resolved' && 'Résolu'}
                              </div>
                            </Badge>
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(report.createdAt).toLocaleString('fr-FR')}
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="w-4 h-4 mr-1" />
                            {report.location}
                          </div>
                          <p className="text-gray-800">
                            {report.description}
                          </p>
                        </div>

                        {report.status === ReportStatus.IN_PROGRESS && (
                          <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
                            <p className="text-sm text-blue-800">
                              <Activity className="w-4 h-4 inline mr-1" />
                              Une équipe est en route vers votre position
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {mockReports.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Vous n'avez pas encore de signalements</p>
                    <p className="text-sm">Utilisez le formulaire pour signaler une urgence</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
