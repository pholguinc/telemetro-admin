// Tipos para Premium Subscriptions

export type PremiumPlan = 'monthly' | 'quarterly' | 'yearly';
export type SubscriptionStatus = 'active' | 'pending_payment' | 'cancelled' | 'expired';
export type PaymentMethod = 'yape' | 'plin' | 'yape_plin' | 'admin';

export interface PremiumBenefits {
  noAds: boolean;
  jobSearch: boolean;
  microCourses: boolean;
  irlExclusive: boolean;
  dailyPoints: number;
  premiumDiscounts: boolean;
}

export interface PremiumSubscription {
  _id: string;
  userId: {
    _id: string;
    displayName: string;
    phone: string;
    email?: string;
  } | string | null;
  plan: PremiumPlan;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  price: number;
  currency: string;
  paymentMethod: PaymentMethod;
  paymentReference?: string;
  paymentProof?: string;
  benefits: PremiumBenefits;
  autoRenewal: boolean;
  cancelledAt?: string;
  cancelReason?: string;
  metadata?: {
    activatedBy?: string;
    originalPrice?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PremiumStats {
  totalSubscriptions: number;
  activeSubscriptions: number;
  pendingPayments: number;
  monthlyRevenue: number;
  conversionRate: string;
  recentSubscriptions: PremiumSubscription[];
}

export interface PaymentConfig {
  yapeNumber: string;
  plinNumber: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface PremiumPlanInfo {
  id: string;
  name: string;
  price: number;
  discount: number;
  duration: number;
  unit: string;
  popular: boolean;
}

export interface ActivatePremiumData {
  plan: PremiumPlan;
  duration: number;
}

