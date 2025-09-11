import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, Lock, ArrowLeft } from 'lucide-react';
import { useStudentAuthStore } from '../stores/studentAuthStore';

export default function StudentLoginPage() {
  const [rollNumber, setRollNumber] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useStudentAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const success = await login(rollNumber, password);
    if (success) {
      navigate('/student/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-success-800 to-success-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center text-success-200 hover:text-success-100 mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login Selection
          </Link>
          
          <div className="flex justify-center mb-4">
            <div className="bg-white p-4 rounded-full shadow-lg">
              <GraduationCap className="h-12 w-12 text-success-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white">Student Login</h1>
          <p className="mt-2 text-success-100">Access your attendance dashboard</p>
        </div>

        <div className="bg-white shadow-xl rounded-xl p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-error-50 text-error-700 p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="rollNumber" className="form-label">
                Roll Number
              </label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <GraduationCap className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="rollNumber"
                  name="rollNumber"
                  type="text"
                  autoComplete="username"
                  required
                  className="form-input pl-10"
                  placeholder="2I2442"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value.toUpperCase())}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="form-input pl-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full btn bg-success-600 text-white hover:bg-success-700 py-3"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin -ml-1 mr-3 h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Use your roll number and password <strong>Student@123</strong>
            </p>
            <p className="text-xs text-gray-500 mt-2">
              If your roll number is not found, please contact your administrator to add your record to the system
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}