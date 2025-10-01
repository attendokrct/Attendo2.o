import { Navigate, Outlet } from 'react-router-dom';
import { useStudentAuthStore } from '../stores/studentAuthStore';

export default function StudentProtectedRoute() {
  const { isAuthenticated } = useStudentAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login/student" replace />;
  }

  return <Outlet />;
}