import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/authStore';
import { useUIStore } from './store/uiStore';
import { socketManager } from './lib/socket';

// Layouts
import MainLayout from './components/layouts/MainLayout';
import AuthLayout from './components/layouts/AuthLayout';

// Components
import { ToastContainer } from './components/common/Toast';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import IncidentsPage from './pages/IncidentsPage';
import IncidentDetailPage from './pages/IncidentDetailPage';
import CreateIncidentPage from './pages/CreateIncidentPage';
import ProfilePage from './pages/ProfilePage';
import MapPage from './pages/MapPage';
import NotificationsPage from './pages/NotificationsPage';
import RouteAdvisorPage from './pages/RouteAdvisorPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// React Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  const { initialize, isAuthenticated } = useAuthStore();
  const { addToast } = useUIStore();

  useEffect(() => {
    // Initialize auth state from storage
    initialize();
  }, [initialize]);

  // Connect socket when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('User authenticated, connecting socket...');
      const socket = socketManager.connect();

      // Setup socket event listeners
      if (socket) {
        // Listen for incident events
        socket.on('incident:created', (data) => {
          console.log('New incident created:', data);
          queryClient.invalidateQueries(['incidents']);
        });

        socket.on('incident:updated', (data) => {
          console.log('Incident updated:', data);
          queryClient.invalidateQueries(['incidents', data.incidentId]);
        });

        socket.on('incident:cleared', (data) => {
          console.log('Incident cleared:', data);
          queryClient.invalidateQueries(['incidents']);
        });

        // Listen for incident status change events for citizens
        socket.on('incident:verified', (data) => {
          console.log('Incident verified:', data);
          queryClient.invalidateQueries(['incidents']);
          addToast({
            type: 'success',
            message: data.message || 'Your incident has been verified by admin',
            duration: 5000
          });
        });

        socket.on('incident:resolved', (data) => {
          console.log('Incident resolved:', data);
          queryClient.invalidateQueries(['incidents']);
          addToast({
            type: 'success',
            message: data.message || 'Your incident has been resolved',
            duration: 5000
          });
        });

        socket.on('incident:rejected', (data) => {
          console.log('Incident rejected:', data);
          queryClient.invalidateQueries(['incidents']);
          addToast({
            type: 'warning',
            message: data.message || 'Your incident has been rejected',
            duration: 5000
          });
        });
      }

      return () => {
        // Cleanup socket listeners
        if (socket) {
          socket.off('incident:created');
          socket.off('incident:updated');
          socket.off('incident:cleared');
          socket.off('incident:verified');
          socket.off('incident:resolved');
          socket.off('incident:rejected');
        }
      };
    } else {
      // Disconnect socket when user logs out
      socketManager.disconnect();
    }
  }, [isAuthenticated]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ToastContainer />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
          </Route>

          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="incidents" element={<IncidentsPage />} />
            <Route path="incidents/:id" element={<IncidentDetailPage />} />
            <Route path="incidents/new" element={<CreateIncidentPage />} />
            <Route path="map" element={<MapPage />} />
            <Route path="alerts" element={<NotificationsPage />} />
            <Route path="routes" element={<RouteAdvisorPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Admin Route */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboardPage />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
