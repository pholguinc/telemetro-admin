// Modelo de Regla de Puntos
export interface PointsRule {
  _id: string;
  action: string;
  pointsAwarded: number;
  dailyLimit?: number;
  cooldownMinutes?: number;
  multipliers?: {
    premium?: number;
    weekend?: number;
    special?: number;
  };
  isActive: boolean;
  description: string;
  createdAt: string;
  updatedAt: string;
}

// Tipo para crear una nueva regla
export interface CreateRuleData {
  action: string;
  pointsAwarded: number;
  dailyLimit?: number;
  cooldownMinutes?: number;
  multipliers?: {
    premium?: number;
    weekend?: number;
    special?: number;
  };
  description: string;
  isActive?: boolean;
}

// Tipo para actualizar una regla existente
export interface UpdateRuleData {
  pointsAwarded?: number;
  dailyLimit?: number;
  cooldownMinutes?: number;
  multipliers?: {
    premium?: number;
    weekend?: number;
    special?: number;
  };
  description?: string;
  isActive?: boolean;
}

// Respuesta del endpoint de reglas
export interface PointsRulesResponse {
  success: boolean;
  data?: {
    rules: PointsRule[];
    total: number;
  };
  message?: string;
}

// Respuesta del endpoint de regla individual
export interface PointsRuleResponse {
  success: boolean;
  data?: {
    rule: PointsRule;
  };
  message?: string;
}
