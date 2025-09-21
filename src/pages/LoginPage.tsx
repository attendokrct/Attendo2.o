import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Lock, Mail } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-800 to-primary-900 flex items-center justify-center p-4">
  <div className="max-w-md w-full space-y-8 animate-fade-in">
    <div className="text-center">
      <div className="flex justify-center mb-4">
        <img
  src="https://stackblitz.com/storage/blobs/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBOW9JekE9PSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9pZCJ9fQ==--34b399fc84ba0b256150849d28e9f3b09a59edc3/300372602_367089768961179_2671218216233570040_n.jpg"
  alt="Attendo Logo"
  className="h-24 w-24 object-contain rounded-full shadow-md bg-white p-2"
/>
      </div>
      <h1 className="text-3xl font-bold text-white">Faculty Login</h1>
      <a
        className="mt-2 text-primary-100 hover:text-primary-200"
        href="https://shorturl.at/HEbEg"
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
          <label htmlFor="email" className="form-label">
            Email Address
          </label>
          <div className="relative mt-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="form-input pl-10"
              placeholder="nameinit.sh@krct.ac.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            className="w-full btn btn-primary py-3"
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
