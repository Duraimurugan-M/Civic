import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';
import DashboardLayout from './components/layout/DashboardLayout';
import Spinner from './components/common/Spinner';

const Landing              = lazy(() => import('./pages/Landing'));
const Login                = lazy(() => import('./pages/auth/Login'));
const Register             = lazy(() => import('./pages/auth/Register'));
const Dashboard            = lazy(() => import('./pages/citizen/Dashboard'));
const ReportIssue          = lazy(() => import('./pages/citizen/ReportIssue'));
const MyComplaints         = lazy(() => import('./pages/citizen/MyComplaints'));
const ComplaintDetail      = lazy(() => import('./pages/citizen/ComplaintDetail'));
const MapView              = lazy(() => import('./pages/citizen/MapView'));
const Notifications        = lazy(() => import('./pages/citizen/Notifications'));
const Profile              = lazy(() => import('./pages/citizen/Profile'));
const StaffDashboard       = lazy(() => import('./pages/staff/StaffDashboard'));
const StaffComplaints      = lazy(() => import('./pages/staff/StaffComplaints'));
const AdminDashboard       = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminComplaints      = lazy(() => import('./pages/admin/AdminComplaints'));
const UserManagement       = lazy(() => import('./pages/admin/UserManagement'));
const StaffManagement      = lazy(() => import('./pages/admin/StaffManagement'));
const DepartmentManagement = lazy(() => import('./pages/admin/DepartmentManagement'));
const Analytics            = lazy(() => import('./pages/admin/Analytics'));
const NotFound             = lazy(() => import('./pages/NotFound'));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-bg">
    <div className="text-center space-y-3">
      <Spinner size="lg" />
      <p className="text-xs text-slate-400 font-medium">Loading…</p>
    </div>
  </div>
);

function PrivateRoute({ children, roles }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { isAuthenticated, user } = useAuthStore();
  if (isAuthenticated) {
    const map = { admin:'/admin/dashboard', staff:'/staff/dashboard', supervisor:'/staff/dashboard' };
    return <Navigate to={map[user?.role] || '/dashboard'} replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            borderRadius: '12px',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            fontSize: '14px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          },
          success: { iconTheme: { primary: '#10B981', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
        }}
      />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public routes */}
          <Route path="/"         element={<Landing />} />
          <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

          {/* Citizen only */}
          <Route element={<PrivateRoute roles={['citizen']}><DashboardLayout /></PrivateRoute>}>
            <Route path="/dashboard"     element={<Dashboard />} />
            <Route path="/report"        element={<ReportIssue />} />
            <Route path="/my-complaints" element={<MyComplaints />} />
          </Route>

          {/* All authenticated users */}
          <Route element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
            <Route path="/complaints/:id" element={<ComplaintDetail />} />
            <Route path="/map"            element={<MapView />} />
            <Route path="/notifications"  element={<Notifications />} />
            <Route path="/profile"        element={<Profile />} />
          </Route>

          {/* Staff + Supervisor */}
          <Route element={<PrivateRoute roles={['staff','supervisor']}><DashboardLayout /></PrivateRoute>}>
            <Route path="/staff/dashboard"  element={<StaffDashboard />} />
            <Route path="/staff/complaints" element={<StaffComplaints />} />
          </Route>

          {/* Admin only */}
          <Route element={<PrivateRoute roles={['admin']}><DashboardLayout /></PrivateRoute>}>
            <Route path="/admin/dashboard"   element={<AdminDashboard />} />
            <Route path="/admin/complaints"  element={<AdminComplaints />} />
            <Route path="/admin/users"       element={<UserManagement />} />
            <Route path="/admin/staff"       element={<StaffManagement />} />
            <Route path="/admin/departments" element={<DepartmentManagement />} />
            <Route path="/admin/analytics"   element={<Analytics />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
