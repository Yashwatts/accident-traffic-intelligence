import { NavLink } from 'react-router-dom';
import { Home, AlertCircle, User, BarChart3, Settings, Plus, MapPin, Bell, Route } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../lib/utils';

function Sidebar() {
  const { isSidebarOpen } = useUIStore();
  const { user } = useAuthStore();

  let navItems = [];

  // Admin navigation
  if (user?.role === 'admin') {
    navItems = [
      { to: '/admin', icon: BarChart3, label: 'Admin Dashboard' },
      { to: '/dashboard/map', icon: MapPin, label: 'Live Map' },
      { to: '/dashboard/routes', icon: Route, label: 'Route Advisor' },
      { to: '/dashboard/alerts', icon: Bell, label: 'Alerts' },
      { to: '/dashboard/incidents', icon: AlertCircle, label: 'Incidents' },
      { to: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
      { to: '/dashboard/profile', icon: User, label: 'Profile' },
      { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
    ];
  } 
  // Responder navigation
  else if (user?.role === 'responder') {
    navItems = [
      { to: '/dashboard', icon: Home, label: 'Dashboard' },
      { to: '/dashboard/map', icon: MapPin, label: 'Live Map' },
      { to: '/dashboard/routes', icon: Route, label: 'Route Advisor' },
      { to: '/dashboard/alerts', icon: Bell, label: 'Alerts' },
      { to: '/dashboard/incidents', icon: AlertCircle, label: 'Incidents' },
      { to: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
      { to: '/dashboard/profile', icon: User, label: 'Profile' },
      { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
    ];
  } 
  // Citizen navigation
  else {
    navItems = [
      { to: '/dashboard', icon: Home, label: 'Dashboard' },
      { to: '/dashboard/map', icon: MapPin, label: 'Live Map' },
      { to: '/dashboard/routes', icon: Route, label: 'Route Advisor' },
      { to: '/dashboard/alerts', icon: Bell, label: 'Alerts' },
      { to: '/dashboard/incidents', icon: AlertCircle, label: 'Incidents' },
      { to: '/dashboard/profile', icon: User, label: 'Profile' },
      { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
    ];
  }

  if (!isSidebarOpen) return null;

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 overflow-y-auto scrollbar-thin">
      <div className="p-4">
        {/* Quick Action */}
        <NavLink
          to="/dashboard/incidents/new"
          className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors mb-6"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Report Incident</span>
        </NavLink>

        {/* Navigation */}
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard'}
              className={({ isActive }) =>
                cn(
                  'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                )
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Status Card */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-sm font-medium text-blue-900 mb-2">
            Real-time Updates
          </h3>
          <p className="text-xs text-blue-700">
            Connected to live incident feed
          </p>
          <div className="mt-2 flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-700">Active</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
