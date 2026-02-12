'use client';

/**
 * Command Center — the dashboard for VOLUNTEERS and ADMINS.
 *
 * WHAT THIS PAGE DOES:
 *   1. Shows ALL SOS reports from the database (not just the user's own)
 *   2. Shows inventory stock levels from the database
 *   3. Lets volunteers "Take charge" of pending reports → sets status to "in_progress"
 *   4. Lets volunteers "Mark resolved" on in-progress reports → sets status to "resolved"
 *
 * SECURITY:
 *   - All server actions check the user's role (volunteer/admin only).
 *   - Citizens cannot access any data — the actions return an error.
 *   - The session.ts `useSession()` hook provides client-side user info.
 *
 * NO MOCK DATA:
 *   - All data comes from the real Neon PostgreSQL database via Drizzle.
 *   - The old mockSignals and mockInventory arrays have been completely removed.
 */

import { useState, useEffect, useCallback } from 'react';
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
  User,
  Loader2,
} from 'lucide-react';
import { ReportType, ReportStatus } from '@/types';
import { useSession } from '@/lib/session';
import {
  getCommandCenterReportsAction,
  getCommandCenterInventoryAction,
  takeChargeOfReportAction,
  markReportResolvedAction,
} from '@/actions/command-center/actions';

// ---------------------------------------------------------------------------
// TypeScript types for the data we get from the server
// ---------------------------------------------------------------------------

/** Shape of a report returned by getCommandCenterReportsAction */
type CommandReport = {
  id: number;
  type: string;
  status: string;
  location: string;
  description: string;
  createdAt: Date;
  userId: number;
  userName: string | null;
  userEmail: string | null;
};

/** Shape of an inventory item returned by getCommandCenterInventoryAction */
type InventoryRow = {
  id: number;
  itemName: string;
  quantity: number;
  centerLocation: string;
};

// ---------------------------------------------------------------------------
// HELPER FUNCTIONS — colors, icons, and labels for the UI
// ---------------------------------------------------------------------------

/** Status badge color */
const getStatusColor = (status: string) => {
  switch (status) {
    case ReportStatus.PENDING:
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case ReportStatus.IN_PROGRESS:
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case ReportStatus.RESOLVED:
      return 'bg-green-100 text-green-800 border-green-200';
    case ReportStatus.CANCELLED:
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

/** Report type badge color */
const getTypeColor = (type: string) => {
  switch (type) {
    case ReportType.MEDICAL:
      return 'bg-red-100 text-red-800';
    case ReportType.FIRE:
      return 'bg-orange-100 text-orange-800';
    case ReportType.ACCIDENT:
      return 'bg-yellow-100 text-yellow-800';
    case ReportType.CRIME:
      return 'bg-purple-100 text-purple-800';
    case ReportType.NATURAL_DISASTER:
      return 'bg-teal-100 text-teal-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/** French label for the status */
const getStatusLabel = (status: string) => {
  switch (status) {
    case ReportStatus.PENDING:
      return 'En attente';
    case ReportStatus.IN_PROGRESS:
      return 'En cours';
    case ReportStatus.RESOLVED:
      return 'Résolu';
    case ReportStatus.CANCELLED:
      return 'Annulé';
    default:
      return status;
  }
};

/** French label for the report type */
const getTypeLabel = (type: string) => {
  switch (type) {
    case ReportType.MEDICAL:
      return '🏥 Médical';
    case ReportType.FIRE:
      return '🔥 Incendie';
    case ReportType.ACCIDENT:
      return '🚗 Accident';
    case ReportType.CRIME:
      return '🚨 Crime';
    case ReportType.NATURAL_DISASTER:
      return '🌊 Catastrophe';
    case ReportType.OTHER:
      return '📋 Autre';
    default:
      return type;
  }
};

/** User-friendly name for inventory items (replaces underscores with spaces) */
const formatItemName = (name: string) => {
  return name
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// ---------------------------------------------------------------------------
// INVENTORY "max quantity" estimate
// Since the DB schema doesn't have a maxQuantity column,
// we use a sensible default for progress bars.
// ---------------------------------------------------------------------------
const DEFAULT_MAX_QUANTITY = 200;

// ---------------------------------------------------------------------------
// MAIN COMPONENT
// ---------------------------------------------------------------------------
export default function CommandCenter() {
  const { user } = useSession();

  // ── State ──
  const [reportsList, setReportsList] = useState<CommandReport[]>([]);
  const [inventoryList, setInventoryList] = useState<InventoryRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [updatingReportId, setUpdatingReportId] = useState<number | null>(null);

  // ── Filter state (to filter reports by status) ──
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // ── Load data from the database ──
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError('');

    // Fetch reports and inventory in parallel (faster!)
    const [reportsResult, inventoryResult] = await Promise.all([
      getCommandCenterReportsAction(),
      getCommandCenterInventoryAction(),
    ]);

    // Handle reports
    if (reportsResult.success && reportsResult.data) {
      setReportsList(reportsResult.data as CommandReport[]);
    } else {
      setError(reportsResult.error || 'Could not load reports.');
    }

    // Handle inventory
    if (inventoryResult.success && inventoryResult.data) {
      setInventoryList(inventoryResult.data as InventoryRow[]);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Handle "Take Charge" button click ──
  const handleTakeCharge = async (reportId: number) => {
    setUpdatingReportId(reportId);
    setActionMessage('');

    const result = await takeChargeOfReportAction(reportId);

    if (result.success) {
      // Update the report in the local list (no full refetch needed)
      setReportsList((prev) =>
        prev.map((r) =>
          r.id === reportId ? { ...r, status: ReportStatus.IN_PROGRESS } : r
        )
      );
      setActionMessage('✅ Rapport pris en charge !');
    } else {
      setActionMessage(`❌ ${result.error}`);
    }

    setUpdatingReportId(null);
  };

  // ── Handle "Mark Resolved" button click ──
  const handleMarkResolved = async (reportId: number) => {
    setUpdatingReportId(reportId);
    setActionMessage('');

    const result = await markReportResolvedAction(reportId);

    if (result.success) {
      // Update the report in the local list
      setReportsList((prev) =>
        prev.map((r) =>
          r.id === reportId ? { ...r, status: ReportStatus.RESOLVED } : r
        )
      );
      setActionMessage('✅ Rapport marqué comme résolu !');
    } else {
      setActionMessage(`❌ ${result.error}`);
    }

    setUpdatingReportId(null);
  };

  // ── Computed values for statistics ──
  const totalReports = reportsList.length;
  const pendingReports = reportsList.filter((r) => r.status === ReportStatus.PENDING).length;
  const inProgressReports = reportsList.filter((r) => r.status === ReportStatus.IN_PROGRESS).length;
  const resolvedReports = reportsList.filter((r) => r.status === ReportStatus.RESOLVED).length;

  // ── Filter reports by status ──
  const filteredReports =
    statusFilter === 'all'
      ? reportsList
      : reportsList.filter((r) => r.status === statusFilter);

  // ── ROLE CHECK: If user is a citizen, block access ──
  if (user && user.role === 'citizen') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Accès refusé</h2>
            <p className="text-gray-500 mb-4">
              Seuls les bénévoles et administrateurs peuvent accéder au Centre de Commande.
            </p>
            <Button onClick={() => (window.location.href = '/dashboard/citizen')}>
              Retour au tableau de bord
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── LOADING STATE ──
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-gray-500">Chargement du Centre de Commande...</p>
        </div>
      </div>
    );
  }

  // ── ERROR STATE ──
  if (error && reportsList.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Erreur</h2>
            <p className="text-gray-500 mb-4">{error}</p>
            <Button onClick={loadData}>Réessayer</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── MAIN DASHBOARD ──
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── HEADER ── */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Shield className="w-8 h-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">Centre de Commande</h1>
              </div>
              <Badge variant="outline" className="text-blue-600 border-blue-600">
                {user?.role === 'admin' ? 'Administrateur' : 'Bénévole'}
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
                <span className="text-sm font-medium">{user?.name || 'Utilisateur'}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* ── ACTION MESSAGE (success/error from take charge / mark resolved) ── */}
        {actionMessage && (
          <div className="mb-4 p-3 rounded-md bg-white border text-sm">
            {actionMessage}
          </div>
        )}

        {/* ── STATISTICS CARDS ── */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Signaux totaux</p>
                  <p className="text-2xl font-bold text-gray-900">{totalReports}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">En attente</p>
                  <p className="text-2xl font-bold text-red-600">{pendingReports}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">En cours</p>
                  <p className="text-2xl font-bold text-blue-600">{inProgressReports}</p>
                </div>
                <Activity className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Résolus</p>
                  <p className="text-2xl font-bold text-green-600">{resolvedReports}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── MAIN CONTENT: Reports (left) + Inventory (right) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── LEFT: SOS Reports Feed ── */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Flux des Signaux SOS</CardTitle>
                    <CardDescription>
                      {filteredReports.length} signalements
                      {statusFilter !== 'all' && ` (${getStatusLabel(statusFilter)})`}
                    </CardDescription>
                  </div>

                  {/* ── Status Filter Buttons ── */}
                  <div className="flex items-center space-x-1">
                    {['all', ReportStatus.PENDING, ReportStatus.IN_PROGRESS, ReportStatus.RESOLVED].map(
                      (filter) => (
                        <Button
                          key={filter}
                          variant={statusFilter === filter ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setStatusFilter(filter)}
                        >
                          {filter === 'all' ? 'Tous' : getStatusLabel(filter)}
                        </Button>
                      )
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {filteredReports.length === 0 ? (
                  /* ── Empty State ── */
                  <div className="text-center py-12 text-gray-500">
                    <Shield className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="font-medium">Aucun signalement trouvé.</p>
                    <p className="text-sm mt-1">
                      {statusFilter !== 'all'
                        ? 'Essayez un autre filtre.'
                        : 'Aucun rapport SOS dans la base de données.'}
                    </p>
                  </div>
                ) : (
                  /* ── Report Cards ── */
                  <div className="space-y-4">
                    {filteredReports.map((report) => (
                      <Card
                        key={report.id}
                        className={`border-l-4 ${report.status === ReportStatus.PENDING
                            ? 'border-l-red-500'
                            : report.status === ReportStatus.IN_PROGRESS
                              ? 'border-l-blue-500'
                              : 'border-l-green-500'
                          }`}
                      >
                        <CardContent className="p-4">
                          {/* Row 1: Badges + Time */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-2 flex-wrap gap-1">
                              <Badge className={getTypeColor(report.type)}>
                                {getTypeLabel(report.type)}
                              </Badge>
                              <Badge className={getStatusColor(report.status)} variant="outline">
                                {getStatusLabel(report.status)}
                              </Badge>
                            </div>
                            <span className="text-sm text-gray-500 whitespace-nowrap ml-2">
                              {new Date(report.createdAt).toLocaleString('fr-FR', {
                                dateStyle: 'short',
                                timeStyle: 'short',
                              })}
                            </span>
                          </div>

                          {/* Row 2: Location */}
                          <div className="flex items-center text-sm text-gray-600 mb-1">
                            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                            {report.location}
                          </div>

                          {/* Row 3: Description */}
                          <p className="text-gray-800 mb-2">{report.description}</p>

                          {/* Row 4: Reporter name */}
                          <div className="flex items-center text-sm text-gray-500 mb-3">
                            <User className="w-4 h-4 mr-1" />
                            Signalé par {report.userName || report.userEmail || `Utilisateur #${report.userId}`}
                          </div>

                          {/* Row 5: Action Buttons */}
                          <div className="flex items-center justify-end space-x-2 pt-3 border-t">
                            {/* "Take charge" — only for PENDING reports */}
                            {report.status === ReportStatus.PENDING && (
                              <Button
                                size="sm"
                                onClick={() => handleTakeCharge(report.id)}
                                disabled={updatingReportId === report.id}
                              >
                                {updatingReportId === report.id ? (
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                  <Activity className="w-4 h-4 mr-2" />
                                )}
                                Prendre en charge
                              </Button>
                            )}

                            {/* "Mark resolved" — only for IN_PROGRESS reports */}
                            {report.status === ReportStatus.IN_PROGRESS && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleMarkResolved(report.id)}
                                disabled={updatingReportId === report.id}
                              >
                                {updatingReportId === report.id ? (
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                )}
                                Marquer résolu
                              </Button>
                            )}

                            {/* Resolved reports show a green checkmark */}
                            {report.status === ReportStatus.RESOLVED && (
                              <Badge className="bg-green-100 text-green-700">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Résolu
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ── RIGHT: Inventory + Quick Actions ── */}
          <div className="space-y-6">
            {/* ── Inventory Widget ── */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Inventaire des Stocks
                </CardTitle>
                <CardDescription>
                  {inventoryList.length} ressources enregistrées
                </CardDescription>
              </CardHeader>

              <CardContent>
                {inventoryList.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">
                    Aucun stock enregistré dans la base de données.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {inventoryList.map((item) => {
                      // Calculate the progress percentage
                      const percentage = Math.min(
                        (item.quantity / DEFAULT_MAX_QUANTITY) * 100,
                        100
                      );

                      return (
                        <div key={item.id} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">
                              {formatItemName(item.itemName)}
                            </span>
                            <span className="text-gray-600">{item.quantity}</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                          <div className="text-xs text-gray-500">{item.centerLocation}</div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <Button className="w-full mt-4" variant="outline">
                  <Truck className="w-4 h-4 mr-2" />
                  Gérer l&apos;inventaire
                </Button>
              </CardContent>
            </Card>

            {/* ── Quick Actions ── */}
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
                  Contacter l&apos;hôpital
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
