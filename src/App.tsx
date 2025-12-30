import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

// Layout
import Layout from './components/layout/Layout';

// Auth
import Login from './pages/auth/Login';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Páginas
import Dashboard from './pages/dashboard/Dashboard';
import BannersManagement from './pages/banners/BannersManagement';
import UsersManagement from './pages/users/UsersManagement';
import JobsManagement from './pages/jobs/JobsManagement';
import StreamersManagement from './pages/streamers/StreamersManagement';
import ClipsManagement from './pages/clips/ClipsManagement';
import EducationManagement from './pages/education/EducationManagement';
import MarketplaceManagement from './pages/marketplace/MarketplaceManagement';
import VotoSeguroManagement from './pages/voto-seguro/VotoSeguroManagement';
import RedemptionsManagement from './pages/redemptions/RedemptionsManagement';
import AdsManagement from './pages/ads/AdsManagement';
import StreamingHealth from './pages/streaming-health/StreamingHealth';
import DonationsOverview from './pages/donations/DonationsOverview';
import StreamingAnalytics from './pages/streaming/StreamingAnalytics';
import YapePlinManagement from './pages/payments/YapePlinManagement';
import MetroSessionsManagement from './pages/sessions/MetroSessionsManagement';
import MicrosegurosManagement from './pages/microseguros/MicrosegurosManagement';
import PointsManagement from './pages/points/PointsManagement';
import ProviderAnalytics from './pages/provider-analytics/ProviderAnalytics';
import MetroDiscountsManagement from './pages/metro-discounts/MetroDiscountsManagement';
import PremiumManagement from './pages/premium/PremiumManagement';
import NotificationsManagement from './pages/notifications/NotificationsManagement';
import RadioAiPage from './pages/radio-ai/RadioAiPage';
import StreamerApply from './pages/public/StreamerApply';
import EstudIaManagement from './pages/estud-ia/EstudIaManagement';
import ApiTesting from './pages/testing/ApiTesting';
import RadioAiManagement from './pages/radio-ai/RadioAiManagement';
import SubscriptionsManagement from './pages/subscriptions/SubscriptionsManagement';
import MetroYaCouponsManagement from './pages/metro-ya-coupons/MetroYaCouponsManagement';

// Componentes
import ComingSoon from './components/common/ComingSoon';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App">
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            {/* Public Route */}
            <Route path="/apply-streamer" element={<StreamerApply />} />
            
            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="banners" element={<BannersManagement />} />
              <Route path="users" element={<UsersManagement />} />
              <Route path="jobs" element={<JobsManagement />} />
              <Route path="streamers" element={<StreamersManagement />} />
              <Route path="clips" element={<ClipsManagement />} />
              <Route path="education" element={<EducationManagement />} />
              <Route path="marketplace" element={<MarketplaceManagement />} />
              <Route path="voto-seguro" element={<VotoSeguroManagement />} />
              <Route path="redemptions" element={<RedemptionsManagement />} />
              <Route path="ads" element={<AdsManagement />} />
              <Route path="streaming-health" element={<StreamingHealth />} />
              <Route path="donations" element={<DonationsOverview />} />
              <Route path="streaming-analytics" element={<StreamingAnalytics />} />
              <Route path="yape-plin-payments" element={<YapePlinManagement />} />
              <Route path="subscriptions" element={<SubscriptionsManagement />} />
              <Route path="sessions" element={<MetroSessionsManagement />} />
              <Route path="microseguros" element={<MicrosegurosManagement />} />
              <Route path="points" element={<PointsManagement />} />
              <Route path="metro-ya-coupons" element={<MetroYaCouponsManagement />} />
              <Route path="provider-analytics" element={<ProviderAnalytics />} />
              <Route path="metro-discounts" element={<MetroDiscountsManagement />} />
              <Route path="premium" element={<PremiumManagement />} />
              <Route path="notifications" element={<NotificationsManagement />} />
              <Route path="estud-ia" element={<EstudIaManagement />} />
              <Route path="radio-ai" element={<RadioAiManagement />} />
              <Route path="api-testing" element={<ApiTesting />} />
            </Route>
            
            {/* Redirect any unknown routes to dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
      
      {/* Toast notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </QueryClientProvider>
  );
};

export default App;
