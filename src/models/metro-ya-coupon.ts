export interface MetroYaCoupon {
  id: string;
  code: string;
  title: string;
  description: string;
  icon: string;
  benefitType: 'discount_percentage' | 'discount_fixed' | 'free_trip' | 'points_bonus' | 'custom';
  discountPercentage?: number;
  discountAmount?: number;
  pointsBonus?: number;
  customData?: any;
  category: 'transport' | 'discount' | 'special' | 'bonus';
  isActive: boolean;
  validFrom: string;
  validUntil?: string;
  maxUsesPerCycle: number;
  displayOrder: number;
  requiresPremium?: boolean;
  
  // ✅ Estructura correcta según backend
  stats: {
    totalUses: number;
    activeUsers: number;
  };
  
  createdBy: {
    _id: string;
    displayName: string;
  };
  
  createdAt: string;
  updatedAt: string;
}

export interface MetroYaCouponUsage {
  id: string;
  couponId: string;
  userId: string;
  status: 'available' | 'used' | 'expired';
  cycleNumber: number;
  usedAt?: string;
  usageDetails?: any;
  createdAt: string;
}

export interface MetroYaCouponTemplate {
  key: string;
  title: string;
  description: string;
  icon: string;
  benefitType: 'discount_percentage' | 'discount_fixed' | 'free_trip' | 'points_bonus' | 'custom';
  discountPercentage?: number;
  discountAmount?: number;
  pointsBonus?: number;
  category: 'transport' | 'discount' | 'special' | 'bonus';
  maxUsesPerCycle: number;
}

export interface MetroYaCouponStats {
  totalCoupons: number;
  activeCoupons: number;
  inactiveCoupons: number;
  totalUsages: number;
  uniqueUsers: number;
}

export interface MetroYaCouponTopUsage {
  coupon: {
    code: string;
    title: string;
    icon: string;
  };
  totalUses: number;
}

export interface MetroYaCouponGlobalStats {
  stats: MetroYaCouponStats;
  topCoupons: MetroYaCouponTopUsage[];
}

export interface MetroYaCouponDetailStats {
  totalRecords: number;
  available: number;
  used: number;
  expired: number;
}

export interface MetroYaCouponDetail {
  coupon: MetroYaCoupon;
  stats: MetroYaCouponDetailStats;
  recentUsages: Array<{
    user: {
      id: string;
      displayName: string;
      phone: string;
    };
    usedAt: string;
    cycleNumber: number;
    details: any;
  }>;
}

export interface CreateMetroYaCouponRequest {
  code: string;
  title: string;
  description: string;
  icon?: string;
  benefitType: 'discount_percentage' | 'discount_fixed' | 'free_trip' | 'points_bonus' | 'custom';
  discountPercentage?: number;
  discountAmount?: number;
  pointsBonus?: number;
  customData?: any;
  validFrom?: string;
  validUntil?: string;
  maxUsesPerCycle?: number;
  category?: 'transport' | 'discount' | 'special' | 'bonus';
  displayOrder?: number;
}

export interface UpdateMetroYaCouponRequest {
  title?: string;
  description?: string;
  icon?: string;
  discountPercentage?: number;
  discountAmount?: number;
  pointsBonus?: number;
  customData?: any;
  validFrom?: string;
  validUntil?: string;
  maxUsesPerCycle?: number;
  category?: 'transport' | 'discount' | 'special' | 'bonus';
  displayOrder?: number;
  isActive?: boolean;
}

export interface MetroYaCouponFilters {
  page?: number;
  limit?: number;
  isActive?: boolean;
  category?: 'transport' | 'discount' | 'special' | 'bonus';
  benefitType?: 'discount_percentage' | 'discount_fixed' | 'free_trip' | 'points_bonus' | 'custom';
  search?: string;
}

export interface MetroYaCouponListResponse {
  coupons: MetroYaCoupon[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary: {
    total: number;
    active: number;
    inactive: number;
  };
}
