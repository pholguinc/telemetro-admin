// Tipos para Redemptions (Canjes)

export type RedemptionStatus = 'pending' | 'confirmed' | 'delivered' | 'cancelled';

export interface RedemptionStation {
  name: string;
  code: string;
  deviceId?: string;
}

export interface RedemptionAuditEntry {
  action: string;
  at: string;
  stationCode?: string;
  deviceId?: string;
  outcome: string;
}

export interface RedemptionAudit {
  entries: RedemptionAuditEntry[];
}

export interface Redemption {
  _id: string;
  userId: {
    _id: string;
    displayName: string;
    phone: string;
    email?: string;
  } | string | null;
  productId: {
    _id: string;
    name: string;
    category?: string;
    imageUrl?: string;
  } | string | null;
  code: string;
  status: RedemptionStatus;
  pointsSpent: number;
  station?: RedemptionStation;
  confirmedAt?: string;
  deliveredAt?: string;
  audit?: RedemptionAudit;
  createdAt: string;
  updatedAt: string;
}

export interface RedemptionStats {
  total: number;
  delivered: number;
  pending: number;
  confirmed: number;
  recent: Array<{
    status: string;
    code: string;
    updatedAt: string;
    confirmedAt?: string;
    deliveredAt?: string;
  }>;
}

export interface ConfirmRedemptionData {
  code: string;
  station?: {
    name: string;
    code: string;
    deviceId?: string;
  };
}

export interface DeliverRedemptionData {
  code: string;
}

export interface ExportRedemptionsFilters {
  from?: string;
  to?: string;
  stationCode?: string;
}





