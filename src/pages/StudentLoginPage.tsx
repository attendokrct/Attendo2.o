import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Lock, User } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-green-800 to-green-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <img
              src="https://stackblitz.com/storage/blobs/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBd0VNekE9PSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9pZCJ9fQ==--b6f84202e6b55e9d7df6e1aff46f2df993edcf97/300372602_367089768961179_2671218216233570040_n.jpg"
              alt="Attendo Logo"
              className="h-24 w-24 object-contain rounded-full shadow-md bg-white p-2"
            />
          </div>
          <h1 className="text-3xl font-bold text-white">Student Login</h1>
          <a
            className="mt-2 text-green-100 hover:text-green-200"
            href="https://krct-pc.github.io/home/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Powered by <strong>PROGRAMMING CLUB</strong>
          </a>
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
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="rollNumber"
                  name="rollNumber"
                  type="text"
                  autoComplete="username"
                  required
                  className="form-input pl-10"
                  placeholder="Enter your roll number"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
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
                className="w-full btn bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 py-3"
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
        </div>
      </div>
    </div>
  );
}