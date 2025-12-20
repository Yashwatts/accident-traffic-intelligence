import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error } = useAuthStore();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await login(formData);
      const userRole = response.data?.user?.role;
      
      // Check if there's a redirect path from location state
      const from = location.state?.from;
      
      // Redirect based on user role or stored redirect path
      if (from) {
        navigate(from);
      } else if (userRole === 'admin') {
        navigate('/dashboard/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="glass-heavy rounded-2xl shadow-2xl p-8 sm:p-10 border border-command-border hover:border-pulse-500/20 transition-all duration-300">
      <Link 
        to="/" 
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm">Back to Home</span>
      </Link>
      
      <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Welcome Back</h1>
      <p className="text-gray-400 mb-8 text-sm sm:text-base">Sign in to your account</p>

      {error && (
        <div className="mb-6 p-4 bg-alert-critical/10 border border-alert-critical/30 rounded-xl text-alert-critical text-sm shadow-lg shadow-alert-critical/10">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 bg-command-surface border border-command-border rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-pulse-500/30 focus:border-pulse-500 transition-all duration-300 shadow-sm hover:border-pulse-500/30"
            placeholder="your@email.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Password
          </label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-4 py-3 bg-command-surface border border-command-border rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-pulse-500/30 focus:border-pulse-500 transition-all duration-300 shadow-sm hover:border-pulse-500/30"
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 bg-gradient-to-r from-pulse-600 via-pulse-600 to-pulse-700 text-white rounded-xl hover:from-pulse-500 hover:via-pulse-500 hover:to-pulse-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-xl shadow-pulse-500/20 hover:shadow-2xl hover:shadow-pulse-500/30 hover:scale-[1.02] active:scale-95"
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-400">
        Don't have an account?{' '}
        <Link to="/register" className="text-pulse-400 hover:text-pulse-300 font-medium transition-colors">
          Sign up
        </Link>
      </p>
    </div>
  );
}

export default LoginPage;
