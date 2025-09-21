import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useStudentAuthStore } from '../stores/studentAuthStore';

export default function StudentProtectedRoute() {
  const { isAuthenticated, isLoading } = useStudentAuthStore();
  const location = useLocation();

  // Show loading indicator while checking authentication
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-success-600"></div>
      </div>
    );
  }

  // Redirect to student login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login/student" state={{ from: location }} replace />;
  }

  // Render child routes
  return <Outlet />;
}