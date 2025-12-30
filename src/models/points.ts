// Models para el sistema de puntos

export interface PointsTransaction {
  _id: string;
  userId: string | {
    _id: string;
    displayName: string;
    phone: string;
    email?: string;
  };
  transactionType: 'earned' | 'spent';
  source: 'game' | 'daily_bonus' | 'referral' | 'admin' | 'streak' | 'ad_view' | 'marketplace' | 'discount';
  pointsAmount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  sourceDetails?: {
    gameName?: string;
    gameScore?: number;
    gameLevel?: number;
    productName?: string;
    referredUser?: string;
    [key: string]: any;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PointsOverview {
  overview: {
    totalEarned: number;
    totalSpent: number;
    netBalance: number;
    period: string;
  };
  gameStats: Array<{
    _id: string;
    totalPoints: number;
    totalSessions: number;
    avgPoints: number;
  }>;
  topUsers: Array<{
    userId: string;
    displayName: string;
    phone: string;
    totalPoints: number;
    transactions: number;
  }>;
  recentTransactions: PointsTransaction[];
}

export interface UserPointsStats {
  user: {
    id: string;
    displayName: string;
    phone: string;
    currentBalance: number;
    totalEarned: number;
    gamesPlayed: number;
  };
  stats: {
    totalEarned: number;
    totalSpent: number;
    gamePoints: number;
    transactions: number;
  };
  breakdown: any;
  recentHistory: PointsTransaction[];
}

export interface PointsHistoryResponse {
  transactions: PointsTransaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TransactionFilters {
  page?: number;
  limit?: number;
  userId?: string;
  source?: 'game' | 'daily_bonus' | 'referral' | 'admin' | 'streak' | 'ad_view' | 'marketplace' | 'discount';
  transactionType?: 'earned' | 'spent';
  startDate?: string;
  endDate?: string;
}





