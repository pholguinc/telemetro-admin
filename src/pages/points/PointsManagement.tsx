import React, { useState, useMemo } from 'react';
import { Star, TrendingUp, Award, Users, RefreshCw, Download, Search, Filter, AlertTriangle, Settings, Eye, Plus, Edit2, Trash2, Power } from 'lucide-react';
import { 
  usePointsOverview,
  usePointsTransactions,
  useExportPointsHistory
} from '../../hooks/usePoints';
import { usePointsRules, useDeleteRule, useToggleRuleStatus } from '../../hooks/usePointsRules';
import type { PointsTransaction } from '../../models/points';
import type { PointsRule } from '../../models/points-rules';
import CreateRuleModal from './components/CreateRuleModal';
import EditRuleModal from './components/EditRuleModal';

type Tab = 'overview' | 'transactions' | 'leaderboard' | 'audit' | 'config';

const PointsManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<number>(30);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [transactionFilters, setTransactionFilters] = useState<{
    source?: string;
    transactionType?: string;
  }>({
    source: undefined,
    transactionType: undefined
  });

  // Estados para modales de reglas
  const [isCreateRuleModalOpen, setIsCreateRuleModalOpen] = useState<boolean>(false);
  const [isEditRuleModalOpen, setIsEditRuleModalOpen] = useState<boolean>(false);
  const [selectedRule, setSelectedRule] = useState<PointsRule | null>(null);

  // Queries
  const { data: overview, isLoading: overviewLoading, refetch: refetchOverview } = usePointsOverview(selectedPeriod);
  const { data: transactionsData, isLoading: transactionsLoading, refetch: refetchTransactions } = usePointsTransactions({
    page: currentPage,
    limit: 20,
    source: (transactionFilters.source || undefined) as any,
    type: (transactionFilters.transactionType || undefined) as any,
  });
  const exportHistory = useExportPointsHistory();
  
  // Queries y mutations de reglas
  const { data: rulesData, isLoading: rulesLoading, refetch: refetchRules } = usePointsRules();
  const deleteRuleMutation = useDeleteRule();
  const toggleRuleStatusMutation = useToggleRuleStatus();
  const rules = rulesData?.rules || [];

  // Extraer datos de manera segura
  const stats = overview?.overview;
  const gameStats = overview?.gameStats || [];
  const topUsers = overview?.topUsers || [];
  const transactions = transactionsData?.transactions || [];
  const pagination = transactionsData?.pagination;

  // Filtrar transacciones por búsqueda
  const filteredTransactions = useMemo(() => {
    if (!searchTerm) return transactions;
    
    const searchLower = searchTerm.toLowerCase();
    return transactions.filter((transaction) => {
      const userName =
        typeof transaction.userId !== 'string' && transaction.userId
          ? transaction.userId.displayName?.toLowerCase() || ''
          : '';
      const userPhone =
        typeof transaction.userId !== 'string' && transaction.userId
          ? transaction.userId.phone?.toLowerCase() || ''
          : '';
      const description = transaction.description?.toLowerCase() || '';
      
      return (
        userName.includes(searchLower) ||
        userPhone.includes(searchLower) ||
        description.includes(searchLower)
      );
    });
  }, [transactions, searchTerm]);

  // Detectar anomalías
  const anomalyCount = useMemo(() => {
    return transactions.filter((t) => Math.abs(t.pointsAmount) >= 1000).length;
  }, [transactions]);

  const handleTabChange = (tab: Tab): void => {
    setActiveTab(tab);
  };

  const handleRefresh = (): void => {
    if (activeTab === 'overview' || activeTab === 'leaderboard') {
      refetchOverview();
    } else if (activeTab === 'transactions' || activeTab === 'audit') {
      refetchTransactions();
    } else if (activeTab === 'config') {
      refetchRules();
    }
  };

  const handleExport = async (): Promise<void> => {
    try {
      await exportHistory.mutateAsync({
        source: transactionFilters.source || undefined,
        transactionType: transactionFilters.transactionType || undefined,
      });
    } catch (error) {
      console.error('Error exporting history:', error);
    }
  };

  // Handlers para reglas
  const handleEditRule = (rule: PointsRule): void => {
    setSelectedRule(rule);
    setIsEditRuleModalOpen(true);
  };

  const handleDeleteRule = async (ruleId: string): Promise<void> => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta regla?')) {
      await deleteRuleMutation.mutateAsync(ruleId);
    }
  };

  const handleToggleRuleStatus = async (ruleId: string): Promise<void> => {
    await toggleRuleStatusMutation.mutateAsync(ruleId);
  };

  const formatNumber = (num: number | undefined): string => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionTypeColor = (type: string): string => {
    switch (type) {
      case 'earned':
        return 'bg-green-100 text-green-700';
      case 'spent':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getUserName = (transaction: PointsTransaction): string => {
    if (!transaction.userId || typeof transaction.userId === 'string') {
      return 'Usuario';
    }
    return transaction.userId.displayName || 'Usuario';
  };

  const getSourceLabel = (source: string): string => {
    const labels: Record<string, string> = {
      game: 'Juego',
      daily_bonus: 'Bonus Diario',
      referral: 'Referido',
      admin: 'Admin',
      streak: 'Racha',
      ad_view: 'Anuncio',
      marketplace: 'Marketplace',
      discount: 'Descuento',
    };
    return labels[source] || source;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">⭐ Gestión de Puntos</h1>
          <p className="text-gray-600 mt-2">
            Sistema completo de administración y auditoría de puntos
          </p>
        </div>
        
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={7}>Últimos 7 días</option>
            <option value={15}>Últimos 15 días</option>
            <option value={30}>Últimos 30 días</option>
            <option value={60}>Últimos 60 días</option>
            <option value={90}>Últimos 90 días</option>
          </select>

          <button
            onClick={handleRefresh}
            disabled={overviewLoading || transactionsLoading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${overviewLoading || transactionsLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>

          {(activeTab === 'transactions' || activeTab === 'audit') && (
            <button
              onClick={handleExport}
              disabled={exportHistory.isPending}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <Download className={`h-4 w-4 mr-2 ${exportHistory.isPending ? 'animate-bounce' : ''}`} />
              Exportar CSV
            </button>
          )}
        </div>
      </div>

      {/* Alerta de anomalías */}
      {(activeTab === 'transactions' || activeTab === 'audit') && anomalyCount > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-yellow-400 flex-shrink-0" />
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong className="font-semibold">{anomalyCount}</strong> transacciones de alto valor (≥1000 puntos) detectadas en el período seleccionado.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => handleTabChange('overview')}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <TrendingUp className="inline h-5 w-5 mr-2" />
            Vista General
          </button>

          <button
            onClick={() => handleTabChange('transactions')}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'transactions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Award className="inline h-5 w-5 mr-2" />
            Transacciones
          </button>

          <button
            onClick={() => handleTabChange('leaderboard')}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'leaderboard'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Star className="inline h-5 w-5 mr-2" />
            Ranking
          </button>

          <button
            onClick={() => handleTabChange('audit')}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'audit'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <AlertTriangle className="inline h-5 w-5 mr-2" />
            Auditoría
          </button>

          <button
            onClick={() => handleTabChange('config')}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'config'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Settings className="inline h-5 w-5 mr-2" />
            Configuración
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          {overviewLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : stats ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Puntos Ganados</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">
                      {formatNumber(stats.totalEarned)}
                    </p>
                    <p className="text-sm text-gray-500">{stats.period}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Puntos Gastados</p>
                    <p className="text-3xl font-bold text-red-600 mt-2">
                      {formatNumber(stats.totalSpent)}
                    </p>
                    <p className="text-sm text-gray-500">{stats.period}</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-lg">
                    <Award className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Balance Neto</p>
                    <p className="text-3xl font-bold text-blue-600 mt-2">
                      {formatNumber(stats.netBalance)}
                    </p>
                    <p className="text-sm text-gray-500">Diferencia</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Star className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Usuarios Activos</p>
                    <p className="text-3xl font-bold text-purple-600 mt-2">
                      {topUsers.length}
                    </p>
                    <p className="text-sm text-gray-500">Top usuarios</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {/* Puntos por Juego */}
          {gameStats.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Puntos por Juego
              </h2>
              <div className="space-y-4">
                {gameStats.map((game, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{game._id || 'Sin nombre'}</p>
                      <p className="text-sm text-gray-500">{game.totalSessions} sesiones</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-blue-600">{formatNumber(game.totalPoints)}</p>
                      <p className="text-xs text-gray-500">Prom: {Math.round(game.avgPoints)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="space-y-6">
          {/* Filtros */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Buscar usuario..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
                <select
                  value={transactionFilters.source || ''}
                  onChange={(e) => setTransactionFilters(prev => ({ ...prev, source: e.target.value || undefined }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="">Todas las fuentes</option>
                  <option value="game">Juegos</option>
                  <option value="daily_bonus">Bonus Diario</option>
                  <option value="referral">Referidos</option>
                  <option value="admin">Admin</option>
                  <option value="streak">Racha</option>
                  <option value="ad_view">Anuncios</option>
                  <option value="marketplace">Marketplace</option>
                  <option value="discount">Descuentos</option>
                </select>
              </div>

              <select
                value={transactionFilters.transactionType || ''}
                onChange={(e) => setTransactionFilters(prev => ({ ...prev, transactionType: e.target.value || undefined }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="">Todos los tipos</option>
                <option value="earned">Ganados</option>
                <option value="spent">Gastados</option>
              </select>
            </div>
          </div>

          {/* Lista de Transacciones */}
          {transactionsLoading ? (
            <div className="bg-white rounded-lg shadow p-6 animate-pulse">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="mb-4 h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Award className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                No hay transacciones
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                No se encontraron transacciones con los filtros aplicados
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fuente</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Puntos</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTransactions.map((transaction) => (
                      <tr key={transaction._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {getUserName(transaction)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${getTransactionTypeColor(transaction.transactionType)}`}>
                            {transaction.transactionType === 'earned' ? 'Ganado' : 'Gastado'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {getSourceLabel(transaction.source)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${transaction.transactionType === 'earned' ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.transactionType === 'earned' ? '+' : '-'}{Math.abs(transaction.pointsAmount)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {transaction.balanceAfter}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(transaction.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Paginación */}
          {pagination && pagination.totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={currentPage === pagination.totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Mostrando{' '}
                    <span className="font-medium">{(currentPage - 1) * pagination.limit + 1}</span> a{' '}
                    <span className="font-medium">{Math.min(currentPage * pagination.limit, pagination.total)}</span> de{' '}
                    <span className="font-medium">{pagination.total}</span> resultados
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Anterior
                    </button>
                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                      {currentPage} / {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                      disabled={currentPage === pagination.totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Siguiente
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              🏆 Top Usuarios por Puntos Ganados
            </h2>
            {overviewLoading ? (
              <div className="space-y-4">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            ) : topUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No hay datos</h3>
                <p className="mt-2 text-sm text-gray-500">
                  No se encontraron usuarios activos en el período seleccionado
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {topUsers.map((user, index) => (
                  <div key={user.userId} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-4">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-700' :
                        index === 1 ? 'bg-gray-100 text-gray-700' :
                        index === 2 ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        #{index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.displayName}</p>
                        <p className="text-sm text-gray-500">{user.phone}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-blue-600">
                        {formatNumber(user.totalPoints)}
                      </p>
                      <p className="text-sm text-gray-500">{user.transactions} transacciones</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              🔍 Actividades Sospechosas
            </h2>
            <p className="text-gray-600 mb-6">
              Transacciones que requieren revisión (≥1000 puntos)
            </p>
            
            {transactionsLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {transactions
                  .filter((t) => Math.abs(t.pointsAmount) >= 1000)
                  .map((transaction) => (
                    <div key={transaction._id} className="border-l-4 border-yellow-400 bg-yellow-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{getUserName(transaction)}</p>
                          <p className="text-sm text-gray-600">{transaction.description}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {getSourceLabel(transaction.source)} • {formatDate(transaction.createdAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-bold ${transaction.transactionType === 'earned' ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.transactionType === 'earned' ? '+' : '-'}{Math.abs(transaction.pointsAmount)}
                          </p>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Alto valor
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                {transactions.filter((t) => Math.abs(t.pointsAmount) >= 1000).length === 0 && (
                  <div className="text-center py-12">
                    <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">Todo en orden</h3>
                    <p className="mt-2 text-sm text-gray-500">
                      No se detectaron transacciones sospechosas en el período seleccionado
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'config' && (
        <div className="space-y-6">
          {/* Header de Configuración */}
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Reglas de Puntos</h3>
              <p className="text-sm text-gray-500">Gestiona las reglas automáticas de otorgamiento de puntos</p>
            </div>
            <button
              onClick={() => setIsCreateRuleModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Nueva Regla</span>
            </button>
          </div>

          {/* Lista de Reglas */}
          <div className="bg-white rounded-lg shadow">
            {rulesLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Cargando reglas...</p>
              </div>
            ) : rules.length === 0 ? (
              <div className="p-12 text-center">
                <Settings className="mx-auto h-16 w-16 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No hay reglas configuradas</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Crea tu primera regla para comenzar a automatizar el otorgamiento de puntos
                </p>
                <button
                  onClick={() => setIsCreateRuleModalOpen(true)}
                  className="mt-4 inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="h-5 w-5" />
                  <span>Crear Primera Regla</span>
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acción
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Puntos
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Límites
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Multiplicadores
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {rules.map((rule) => (
                      <tr key={rule._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{rule.action}</p>
                            <p className="text-xs text-gray-500">{rule.description}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-green-600">
                            +{rule.pointsAwarded}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {rule.dailyLimit && (
                            <div>Límite: {rule.dailyLimit}/día</div>
                          )}
                          {rule.cooldownMinutes && (
                            <div>Cooldown: {rule.cooldownMinutes}min</div>
                          )}
                          {!rule.dailyLimit && !rule.cooldownMinutes && (
                            <span className="text-gray-400">Sin límites</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                          {rule.multipliers && (
                            <div className="space-y-1">
                              {rule.multipliers.premium !== 1 && (
                                <div>Premium: x{rule.multipliers.premium}</div>
                              )}
                              {rule.multipliers.weekend !== 1 && (
                                <div>Weekend: x{rule.multipliers.weekend}</div>
                              )}
                              {rule.multipliers.special !== 1 && (
                                <div>Special: x{rule.multipliers.special}</div>
                              )}
                              {rule.multipliers.premium === 1 && 
                               rule.multipliers.weekend === 1 && 
                               rule.multipliers.special === 1 && (
                                <span className="text-gray-400">Sin multiplicadores</span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleRuleStatus(rule._id)}
                            disabled={toggleRuleStatusMutation.isPending}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              rule.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {rule.isActive ? 'Activa' : 'Inactiva'}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleToggleRuleStatus(rule._id)}
                              disabled={toggleRuleStatusMutation.isPending}
                              className="text-gray-600 hover:text-blue-600"
                              title={rule.isActive ? 'Desactivar' : 'Activar'}
                            >
                              <Power className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleEditRule(rule)}
                              className="text-gray-600 hover:text-blue-600"
                              title="Editar"
                            >
                              <Edit2 className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteRule(rule._id)}
                              disabled={deleteRuleMutation.isPending}
                              className="text-gray-600 hover:text-red-600"
                              title="Eliminar"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modales */}
      <CreateRuleModal
        isOpen={isCreateRuleModalOpen}
        onClose={() => setIsCreateRuleModalOpen(false)}
      />
      <EditRuleModal
        isOpen={isEditRuleModalOpen}
        onClose={() => {
          setIsEditRuleModalOpen(false);
          setSelectedRule(null);
        }}
        rule={selectedRule}
      />
    </div>
  );
};

export default PointsManagement;
