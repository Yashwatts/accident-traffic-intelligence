import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';

function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading, error } = useAuthStore();
  const { addToast } = useUIStore();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      addToast('Passwords do not match', 'error');
      return;
    }

    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...registrationData } = formData;
      console.log('Sending registration data:', registrationData);
      await register(registrationData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration failed:', error);
      console.error('Error message:', error.message);
      console.error('Error details:', error.details);
    }
  };

  return (
    <div className="glass-heavy rounded-xl shadow-glow p-8 border border-command-border">
      <Link 
        to="/" 
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm">Back to Home</span>
      </Link>
      
      <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
      <p className="text-gray-400 mb-6">Join the incident reporting community</p>

      {error && (
        <div className="mb-4 p-3 bg-alert-critical/10 border border-alert-critical rounded-lg text-alert-critical text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              First Name
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full px-4 py-2 bg-command-surface border border-command-border rounded-lg text-white focus:ring-2 focus:ring-pulse-500/20 focus:border-pulse-500 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Last Name
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full px-4 py-2 bg-command-surface border border-command-border rounded-lg text-white focus:ring-2 focus:ring-pulse-500/20 focus:border-pulse-500 transition-all"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2 bg-command-surface border border-command-border rounded-lg text-white focus:ring-2 focus:ring-pulse-500/20 focus:border-pulse-500 transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Phone (Optional)
          </label>
          <input
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            className="w-full px-4 py-2 bg-command-surface border border-command-border rounded-lg text-white focus:ring-2 focus:ring-pulse-500/20 focus:border-pulse-500 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Password
          </label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-4 py-2 bg-command-surface border border-command-border rounded-lg text-white focus:ring-2 focus:ring-pulse-500/20 focus:border-pulse-500 transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Confirm Password
          </label>
          <input
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            className="w-full px-4 py-2 bg-command-surface border border-command-border rounded-lg text-white focus:ring-2 focus:ring-pulse-500/20 focus:border-pulse-500 transition-all"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-gradient-to-r from-pulse-600 to-pulse-700 text-white rounded-lg hover:from-pulse-500 hover:to-pulse-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-glow"
        >
          {isLoading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-400">
        Already have an account?{' '}
        <Link to="/login" className="text-pulse-400 hover:text-pulse-300 font-medium transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default RegisterPage;
