import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { useStudentAuthStore } from './stores/studentAuthStore';
import LoginSelectionPage from './pages/LoginSelectionPage';
import LoginPage from './pages/LoginPage';
import StudentLoginPage from './pages/StudentLoginPage';
import DashboardPage from './pages/DashboardPage';
import StudentDashboardPage from './pages/StudentDashboardPage';
import AttendancePage from './pages/AttendancePage';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import StudentProtectedRoute from './components/StudentProtectedRoute';

function App() {
  const { isAuthenticated: facultyAuthenticated, initAuth: initFacultyAuth } = useAuthStore();
  const { isAuthenticated: studentAuthenticated, initAuth: initStudentAuth } = useStudentAuthStore();

  useEffect(() => {
    initFacultyAuth();
    initStudentAuth();
  }, [initFacultyAuth, initStudentAuth]);

  return (
    <Routes>
      {/* Login Selection */}
      <Route path="/" element={<LoginSelectionPage />} />
      
      {/* Faculty Routes */}
      <Route path="/login/faculty" element={<LoginPage />} />
      
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/attendance/:periodId/:classCode" element={<AttendancePage />} />
        </Route>
      </Route>

      {/* Student Routes */}
      <Route path="/login/student" element={<StudentLoginPage />} />
      
      <Route element={<StudentProtectedRoute />}>
        <Route path="/student/dashboard" element={<StudentDashboardPage />} />
      </Route>

      {/* Redirects */}
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;