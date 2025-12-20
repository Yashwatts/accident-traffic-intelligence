import { useState } from 'react';
import { User, Bell, Lock, Globe, Save } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';

function SettingsPage() {
  const { user, updateProfile, isLoading } = useAuthStore();
  const { addToast } = useUIStore();

  const [formData, setFormData] = useState({
    // Profile settings
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    
    // Notification preferences
    pushNotifications: user?.notificationPreferences?.push ?? true,
    emailNotifications: user?.notificationPreferences?.email ?? true,
    smsNotifications: user?.notificationPreferences?.sms ?? false,
    alertRadius: user?.notificationPreferences?.alertRadius || 10,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        pushNotifications: formData.pushNotifications,
        emailNotifications: formData.emailNotifications,
        smsNotifications: formData.smsNotifications,
        alertRadius: formData.alertRadius,
      });
      
      addToast('Settings saved successfully', 'success');
    } catch (error) {
      console.error('Error saving settings:', error);
      const errorMessage = error?.message || error?.response?.data?.message || 'Failed to save settings';
      
      // If token expired and refresh failed, user was redirected to login
      if (error?.status === 401 || error?.code === 'UNAUTHORIZED') {
        addToast('Session expired. Please log in again.', 'error');
      } else {
        addToast(errorMessage, 'error');
      }
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in p-4 sm:p-6 lg:p-8">
      <div className="glass-heavy rounded-2xl p-6 sm:p-8 border-l-4 border-pulse-500 shadow-2xl shadow-pulse-500/10">
        <h1 className="text-3xl sm:text-4xl lg:text-display-md font-display text-white mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Settings</h1>
        <p className="text-gray-400 text-sm sm:text-base">Manage your account and preferences</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 md:space-y-8">
        {/* Profile Settings */}
        <div className="glass-heavy rounded-2xl p-6 sm:p-8 border border-command-border shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2.5 bg-pulse-500/10 rounded-xl">
              <User className="w-5 h-5 text-pulse-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-white">Profile Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2.5">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-command-surface border border-command-border rounded-lg text-white focus:ring-2 focus:ring-pulse-500/20 focus:border-pulse-500 transition-all"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-command-surface border border-command-border rounded-lg text-white focus:ring-2 focus:ring-pulse-500/20 focus:border-pulse-500 transition-all"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-command-surface/50 border border-command-border rounded-lg text-gray-400 focus:ring-2 focus:ring-pulse-500/20 focus:border-pulse-500 transition-all"
                disabled
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-command-surface border border-command-border rounded-lg text-white focus:ring-2 focus:ring-pulse-500/20 focus:border-pulse-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="glass-heavy rounded-xl p-6 border border-command-border">
            <div className="flex items-center space-x-2 mb-4">
              <Bell className="w-5 h-5 text-pulse-400" />
              <h2 className="text-xl font-semibold text-white">Notification Preferences</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-white">Push Notifications</h3>
                  <p className="text-sm text-gray-400">Receive push notifications on your device</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="pushNotifications"
                    checked={formData.pushNotifications}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-white">Email Notifications</h3>
                  <p className="text-sm text-gray-400">Receive email updates about incidents</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="emailNotifications"
                    checked={formData.emailNotifications}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-command-surface peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pulse-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-command-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pulse-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-white">SMS Notifications</h3>
                  <p className="text-sm text-gray-400">Receive SMS alerts for critical incidents</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="smsNotifications"
                    checked={formData.smsNotifications}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-command-surface peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pulse-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-command-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pulse-600"></div>
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Alert Radius (km)
                </label>
                <input
                  type="number"
                  name="alertRadius"
                  value={formData.alertRadius}
                  onChange={handleChange}
                  min="1"
                  max="100"
                  className="w-full px-4 py-2 bg-command-surface border border-command-border rounded-lg text-white focus:ring-2 focus:ring-pulse-500/20 focus:border-pulse-500 transition-all"
                />
                <p className="text-sm text-gray-400 mt-1">
                  You'll receive alerts for incidents within this radius
                </p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-pulse-600 to-pulse-700 text-white rounded-lg hover:from-pulse-500 hover:to-pulse-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-glow"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
    </div>
  );
}

export default SettingsPage;
