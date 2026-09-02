import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Citizen Pages
import CitizenDashboard from './pages/citizen/CitizenDashboard';
import SubmitGrievancePage from './pages/citizen/SubmitGrievancePage';
import MyGrievancesPage from './pages/citizen/MyGrievancesPage';
import GrievanceDetailPage from './pages/citizen/GrievanceDetailPage';

// Officer Pages
import OfficerDashboard from './pages/officer/OfficerDashboard';
import OfficerGrievancesPage from './pages/officer/OfficerGrievancesPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminGrievancesPage from './pages/admin/AdminGrievancesPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import DepartmentManagementPage from './pages/admin/DepartmentManagementPage';
import CategoryManagementPage from './pages/admin/CategoryManagementPage';

// Shared Pages
import ProfilePage from './pages/shared/ProfilePage';
import NotFoundPage from './pages/shared/NotFoundPage';

// Home index redirect component
const RootRedirect = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (user?.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (user?.role === 'OFFICER') return <Navigate to="/officer/dashboard" replace />;
  return <Navigate to="/citizen/dashboard" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/" element={<RootRedirect />} />

            {/* Protected Routes Layout */}
            <Route
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              {/* Shared Protected Pages */}
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/grievances/:id" element={<GrievanceDetailPage />} />

              {/* Citizen Routes */}
              <Route
                path="/citizen/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['CITIZEN']}>
                    <CitizenDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/citizen/submit"
                element={
                  <ProtectedRoute allowedRoles={['CITIZEN']}>
                    <SubmitGrievancePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/citizen/grievances"
                element={
                  <ProtectedRoute allowedRoles={['CITIZEN']}>
                    <MyGrievancesPage />
                  </ProtectedRoute>
                }
              />

              {/* Officer Routes */}
              <Route
                path="/officer/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['OFFICER', 'ADMIN']}>
                    <OfficerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/officer/grievances"
                element={
                  <ProtectedRoute allowedRoles={['OFFICER', 'ADMIN']}>
                    <OfficerGrievancesPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/grievances"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminGrievancesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <UserManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/departments"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <DepartmentManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/categories"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <CategoryManagementPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* 404 Fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
