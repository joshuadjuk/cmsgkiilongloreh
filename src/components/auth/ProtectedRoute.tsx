import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../context/AuthContext';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

// Halaman default per role jika mencoba akses route yang tidak diizinkan
const roleHome: Record<string, string> = {
  bendahara:  '/keuangan',
  sekretaris: '/dashboard',
  admin:      '/dashboard',
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-400 dark:text-gray-500 text-sm">Memuat...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={roleHome[user.role] ?? '/'} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
