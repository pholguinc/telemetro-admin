import React, { useState } from 'react';
import { Plus, Edit, Trash2, Power, AlertCircle } from 'lucide-react';
import { usePointsRules, useDeleteRule, useToggleRuleStatus } from '../../../hooks/usePointsRules';
import type { PointsRule } from '../../../models/points-rules';

interface RulesConfigTabProps {
  onCreateRule: () => void;
  onEditRule: (rule: PointsRule) => void;
}

const RulesConfigTab: React.FC<RulesConfigTabProps> = ({ onCreateRule, onEditRule }) => {
  const { data: rulesData, isLoading } = usePointsRules();
  const deleteRule = useDeleteRule();
  const toggleRule = useToggleRuleStatus();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const rules = rulesData?.rules || [];

  const handleDelete = async (ruleId: string) => {
    if (!window.confirm('¿Estás seguro de eliminar esta regla?')) return;
    
    setDeletingId(ruleId);
    try {
      await deleteRule.mutateAsync(ruleId);
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggle = async (ruleId: string) => {
    await toggleRule.mutateAsync(ruleId);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (rules.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <AlertCircle className="mx-auto h-16 w-16 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          No hay reglas configuradas
        </h3>
        <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
          Crea tu primera regla de puntos para comenzar a recompensar a los usuarios.
        </p>
        <button
          onClick={onCreateRule}
          className="mt-6 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Crear Primera Regla
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Reglas de Puntos ({rules.length})
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Configura cómo se otorgan puntos por cada acción
          </p>
        </div>
        <button
          onClick={onCreateRule}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Regla
        </button>
      </div>

      {/* Lista de Reglas */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="divide-y divide-gray-200">
          {rules.map((rule) => (
            <div
              key={rule._id}
              className={`p-6 ${!rule.isActive ? 'bg-gray-50' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-medium text-gray-900">
                      {rule.action}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        rule.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {rule.isActive ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">{rule.description}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Puntos</p>
                      <p className="text-lg font-semibold text-blue-600">
                        {rule.pointsAwarded}
                      </p>
                    </div>

                    {rule.dailyLimit && (
                      <div>
                        <p className="text-xs text-gray-500">Límite Diario</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {rule.dailyLimit}
                        </p>
                      </div>
                    )}

                    {rule.cooldownMinutes && (
                      <div>
                        <p className="text-xs text-gray-500">Cooldown</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {rule.cooldownMinutes} min
                        </p>
                      </div>
                    )}

                    {rule.multipliers && (
                      <div>
                        <p className="text-xs text-gray-500">Multiplicadores</p>
                        <div className="flex space-x-2 text-xs mt-1">
                          {rule.multipliers.premium > 1 && (
                            <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                              Premium: {rule.multipliers.premium}x
                            </span>
                          )}
                          {rule.multipliers.weekend > 1 && (
                            <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                              Weekend: {rule.multipliers.weekend}x
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleToggle(rule._id)}
                    disabled={toggleRule.isPending}
                    className={`p-2 rounded-lg ${
                      rule.isActive
                        ? 'text-green-600 hover:bg-green-50'
                        : 'text-gray-400 hover:bg-gray-100'
                    }`}
                    title={rule.isActive ? 'Desactivar' : 'Activar'}
                  >
                    <Power className="h-5 w-5" />
                  </button>

                  <button
                    onClick={() => onEditRule(rule)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="Editar"
                  >
                    <Edit className="h-5 w-5" />
                  </button>

                  <button
                    onClick={() => handleDelete(rule._id)}
                    disabled={deletingId === rule._id}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    title="Eliminar"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RulesConfigTab;





