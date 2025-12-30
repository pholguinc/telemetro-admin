// Tipos para Metro Discounts

export type DiscountType = 'percentage' | 'fixed';
export type DiscountStatus = 'active' | 'used' | 'expired';
export type TripType = 'single' | 'round_trip' | 'monthly_pass';
export type UserType = 'regular' | 'university' | 'school';

export interface MetroDiscount {
  _id: string;
  userId: {
    _id: string;
    displayName: string;
    phone: string;
    email?: string;
  } | string | null;
  discountCode: string;
  discountType: DiscountType;
  discountValue: number;
  pointsUsed: number;
  originalPrice: number;
  finalPrice: number;
  validFrom: string;
  validUntil: string;
  stationFrom?: string;
  stationTo?: string;
  tripType: TripType;
  isUsed: boolean;
  usedAt?: string;
  metadata?: {
    generatedBy?: string;
    campaignId?: string;
    promotionCode?: string;
    operatorId?: string;
    stationUsed?: string;
    usedBy?: string;
    userType?: UserType;
  };
  createdAt: string;
  updatedAt: string;
  status?: DiscountStatus;
  user?: any;
}

export interface MetroDiscountStats {
  totalDiscounts: number;
  activeDiscounts: number;
  usedDiscounts: number;
  expiredDiscounts: number;
  totalPointsRedeemed: number;
  totalSavings: number;
  discountsByType: Array<{ _id: string; count: number }>;
  recentActivity: Array<{ _id: string; count: number }>;
}

export interface MetroPricing {
  single_trip: {
    regular: number;
    university: number;
    school: number;
  };
  round_trip: {
    regular: number;
    university: number;
    school: number;
  };
  monthly_pass: {
    regular: number;
    university: number;
    school: number;
  };
}

export interface DiscountOption {
  points: number;
  discount: number;
  enabled: boolean;
  premiumOnly: boolean;
}

export type DiscountOptions = Record<string, DiscountOption>;

export interface PricingConfig {
  pricing: MetroPricing;
  lastUpdated?: {
    updatedAt: string;
    lastUpdatedBy?: {
      displayName: string;
    };
    version: number;
  };
}

export interface DiscountOptionsConfig {
  discountOptions: DiscountOptions;
  lastUpdated?: {
    updatedAt: string;
    lastUpdatedBy?: {
      displayName: string;
    };
    version: number;
  };
}

export interface ExportFilters {
  status?: 'all' | 'used' | 'unused' | 'expired';
  startDate?: string;
  endDate?: string;
}

// ========== NUEVAS INTERFACES PARA OPCIONES PERSONALIZADAS ==========

export interface MetroDiscountOption {
  _id: string;
  discountType: string;
  discountValue: number;
  pointsRequired: number;
  cantidad_disponible: number;
  fecha_expiracion: string;
  premiumOnly: boolean;
  description: string;
  enabled: boolean;
  estimatedSavings: {
    single: number;
    roundTrip: number;
    monthlyPass: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateDiscountOptionData {
  discountType: string;
  discountValue: number;
  pointsRequired: number;
  cantidad_disponible: number;
  fecha_expiracion: string;
  premiumOnly?: boolean;
  description: string;
  enabled?: boolean;
}

export interface UpdateDiscountOptionData extends Partial<CreateDiscountOptionData> {
  id: string;
}

// ========== INTERFACES PARA USUARIOS PREMIUM ==========

export interface User {
  _id: string;
  displayName: string;
  phone: string;
  email?: string;
  hasMetroPremium: boolean;
  premiumExpiryDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserFilters {
  search?: string;
  premiumStatus?: 'all' | 'premium' | 'regular';
  page?: number;
  limit?: number;
}

export interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ========== INTERFACES PARA OPCIONES DEL SISTEMA ==========

export interface SystemDiscountOption {
  key: string;
  points: number;
  discount: number;
  enabled: boolean;
  premiumOnly: boolean;
}

export interface SystemDiscountOptionsConfig {
  discountOptions: Record<string, SystemDiscountOption>;
  lastUpdated?: {
    updatedAt: string;
    lastUpdatedBy?: {
      displayName: string;
    };
    version: number;
  };
}












