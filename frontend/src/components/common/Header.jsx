import { Link } from 'react-router-dom';
import { Bell, User, Menu, LogOut, Radio, Zap } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';

function Header() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { toggleSidebar } = useUIStore();

  return (
    <header className="sticky top-0 z-50 bg-command-elevated/95 backdrop-blur-2xl border-b border-command-border shadow-xl shadow-command-border/20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo and Menu Toggle */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {isAuthenticated && (
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-xl hover:bg-pulse-500/10 transition-all duration-300 border border-transparent hover:border-pulse-500/30 hover:scale-105 active:scale-95"
              >
                <Menu className="w-5 h-5 text-gray-300" />
              </button>
            )}
            
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-pulse-500 via-pulse-600 to-pulse-700 rounded-xl flex items-center justify-center shadow-lg shadow-pulse-500/20 group-hover:shadow-xl group-hover:shadow-pulse-500/30 transition-all duration-300">
                  <Radio className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3">
                  <span className="flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-alert-critical opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-alert-critical shadow-lg shadow-alert-critical/50"></span>
                  </span>
                </div>
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-display font-bold text-white group-hover:text-pulse-400 transition-colors">
                  URBAN PULSE
                </span>
                <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest -mt-1">
                  City Intelligence
                </div>
              </div>
            </Link>
          </div>

          {/* Right: User Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {isAuthenticated ? (
              <>
                <Link 
                  to="/dashboard/alerts" 
                  className="relative p-2 rounded-lg hover:bg-pulse-500/10 transition-all group border border-transparent hover:border-pulse-500/30"
                >
                  <Bell className="w-5 h-5 text-gray-300 group-hover:text-pulse-400 transition-colors" />
                  <span className="absolute top-1 right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-alert-critical opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-alert-critical"></span>
                  </span>
                </Link>

                <div className="flex items-center space-x-3 pl-4 border-l border-command-border">
                  <Link
                    to="/dashboard/profile"
                    className="flex items-center space-x-3 hover:bg-pulse-500/10 rounded-lg px-3 py-2 transition-all border border-transparent hover:border-pulse-500/30 group"
                  >
                    <div className="w-9 h-9 bg-gradient-to-br from-pulse-600 to-pulse-800 rounded-lg flex items-center justify-center shadow-glow-sm group-hover:shadow-glow transition-shadow">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left hidden lg:block">
                      <p className="text-sm font-semibold text-white">
                        {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'User'}
                      </p>
                      <p className="text-xs text-pulse-400 font-mono uppercase tracking-wider">
                        {user?.role || 'Citizen'}
                      </p>
                    </div>
                  </Link>

                  <button
                    onClick={logout}
                    className="p-2 rounded-lg hover:bg-alert-critical/10 text-gray-400 hover:text-alert-critical transition-all border border-transparent hover:border-alert-critical/30"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-gradient-to-r from-pulse-600 to-pulse-700 hover:from-pulse-500 hover:to-pulse-600 text-white rounded-lg font-semibold text-sm transition-all shadow-glow-sm hover:shadow-glow"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
