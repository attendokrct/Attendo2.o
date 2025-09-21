import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  // Show loading indicator while checking authentication
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Render child routes
  return <Outlet />;
}