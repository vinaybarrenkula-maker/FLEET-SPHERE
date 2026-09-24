import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';

// Layout & Core Pages
import Layout from './components/layout/Layout';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import DriverRegister from './pages/DriverRegister';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import Drivers from './pages/Drivers';
import DriverProfile from './pages/DriverProfile';
import Trips from './pages/Trips';
import RoutesPage from './pages/RoutesPage';
import Fuel from './pages/Fuel';
import Maintenance from './pages/Maintenance';
import Incidents from './pages/Incidents';
import Expenses from './pages/Expenses';
import Documents from './pages/Documents';
import Notifications from './pages/Notifications';
import AuditLogs from './pages/AuditLogs';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const App = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <BrowserRouter>
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: '#ffffff',
            color: '#3d3a37',
            border: '1px solid #e7e4e0',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(61, 58, 55, 0.08)',
            fontFamily: 'Outfit, sans-serif'
          }
        }}
      />
      <Routes>
        {/* Public Showcase & Landing Page (ai-dubbing.app style) */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/landing" element={<LandingPage />} />

        {/* Public Authentication Routes */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
        />
        <Route
          path="/driver/register"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <DriverRegister />}
        />
        {/* Disable public generic registration - redirect to login */}
        <Route path="/register" element={<Navigate to="/login" replace />} />

        {/* Protected Dashboard & App Routes */}
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="dashboard/admin" element={<Dashboard />} />
          <Route path="dashboard/fleet" element={<Dashboard />} />
          <Route path="dashboard/branch" element={<Dashboard />} />
          <Route path="dashboard/driver" element={<Dashboard />} />
          <Route path="dashboard/finance" element={<Dashboard />} />

          <Route path="vehicles" element={<Vehicles />} />
          <Route path="drivers" element={<Drivers />} />
          <Route path="profile" element={<DriverProfile />} />
          <Route path="trips" element={<Trips />} />
          <Route path="routes" element={<RoutesPage />} />
          <Route path="fuel" element={<Fuel />} />
          <Route path="maintenance" element={<Maintenance />} />
          <Route path="incidents" element={<Incidents />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="documents" element={<Documents />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="audit-logs" element={<AuditLogs />} />

          <Route
            path="*"
            element={
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#fff5f3] text-[#ff6b4a] flex items-center justify-center font-heading font-extrabold text-2xl mb-4 shadow-xs">
                  404
                </div>
                <h2 className="text-2xl font-bold font-heading text-[#3d3a37] mb-2">Page Not Found</h2>
                <p className="text-sm text-[#78716c] max-w-sm mb-6">The requested console screen does not exist or may have been relocated.</p>
                <Link to="/dashboard" className="btn-coral text-xs py-2.5 px-5">
                  Return to Dashboard
                </Link>
              </div>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
