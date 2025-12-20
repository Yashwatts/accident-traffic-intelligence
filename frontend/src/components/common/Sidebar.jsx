import { NavLink } from 'react-router-dom';
import { Home, AlertCircle, User, BarChart3, Settings, Plus, MapPin, Bell, Route, Activity, Shield, ChevronRight } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../lib/utils';

function Sidebar() {
  const { isSidebarOpen } = useUIStore();
  const { user } = useAuthStore();

  // Organized navigation with sections for better hierarchy
  const getNavStructure = () => {
    const baseStructure = {
      primary: [],
      features: [
        { to: '/dashboard/routes', icon: Route, label: 'Route Advisor', badge: null },
        { to: '/dashboard/alerts', icon: Bell, label: 'Alerts', badge: null },
        { to: '/dashboard/incidents', icon: AlertCircle, label: 'Incidents', badge: null },
      ],
      insights: [],
      settings: [
        { to: '/dashboard/profile', icon: User, label: 'Profile', badge: null },
        { to: '/dashboard/settings', icon: Settings, label: 'Settings', badge: null },
      ]
    };

    // Add role-specific sections
    if (user?.role === 'admin') {
      baseStructure.primary.push({ 
        to: '/dashboard/admin', 
        icon: Shield, 
        label: 'Admin Dashboard', 
        badge: 'admin',
        highlight: true 
      });
      baseStructure.primary.push({ to: '/dashboard/map', icon: MapPin, label: 'Live Map', badge: 'live' });
      baseStructure.insights.push({ 
        to: '/dashboard/analytics', 
        icon: BarChart3, 
        label: 'Analytics', 
        badge: null 
      });
    } else {
      // Citizens get the regular dashboard
      baseStructure.primary.push({ to: '/dashboard', icon: Home, label: 'Dashboard', badge: null });
      baseStructure.primary.push({ to: '/dashboard/map', icon: MapPin, label: 'Live Map', badge: 'live' });
      
      if (user?.role === 'responder') {
        baseStructure.insights.push({ 
          to: '/dashboard/analytics', 
          icon: BarChart3, 
          label: 'Analytics', 
          badge: null 
        });
      }
    }

    return baseStructure;
  };

  const navStructure = getNavStructure();

  if (!isSidebarOpen) return null;

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 glass-heavy border-r border-command-border overflow-y-auto scrollbar-thin z-40">
      <div className="p-4 space-y-6">
        
        {/* Hero Action Button - More prominent */}
        <NavLink
          to="/dashboard/incidents/new"
          className="group relative flex items-center justify-center space-x-2 w-full px-4 py-3.5 bg-gradient-to-r from-alert-critical to-alert-high hover:from-alert-critical/90 hover:to-alert-high/90 text-white rounded-xl transition-all shadow-glow hover:shadow-glow-lg overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          <Plus className="w-5 h-5 relative z-10" />
          <span className="font-bold text-base relative z-10">Report Incident</span>
          <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity relative z-10" />
        </NavLink>

        {/* Primary Navigation - No section label for main items */}
        <nav className="space-y-1">
          {navStructure.primary.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard' || item.to === '/admin'}
              className={({ isActive }) =>
                cn(
                  'relative flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group',
                  isActive
                    ? 'bg-gradient-to-r from-pulse-500/20 to-pulse-600/10 text-white font-semibold border-l-4 border-pulse-400 pl-2 shadow-glow-sm'
                    : 'text-gray-300 hover:bg-pulse-500/5 hover:text-white border-l-4 border-transparent hover:border-pulse-500/30 pl-2',
                  item.highlight && 'bg-neon-violet/10 border-neon-violet/30'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      "w-9 h-9 rounded-lg flex items-center justify-center transition-all",
                      isActive 
                        ? "bg-pulse-500/30 shadow-glow-sm" 
                        : "bg-command-surface group-hover:bg-pulse-500/20"
                    )}>
                      <item.icon className={cn(
                        "w-4.5 h-4.5 transition-all",
                        isActive ? "text-pulse-300" : "text-gray-400 group-hover:text-pulse-400"
                      )} />
                    </div>
                    <span className="text-sm">{item.label}</span>
                  </div>
                  
                  {/* Badges */}
                  {item.badge && (
                    <div className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-mono font-bold",
                      item.badge === 'live' && "bg-alert-critical/20 text-alert-critical border border-alert-critical/30 animate-pulse",
                      item.badge === 'admin' && "bg-neon-violet/20 text-neon-violet border border-neon-violet/30",
                      typeof item.badge === 'string' && !['live', 'admin'].includes(item.badge) && "bg-pulse-500/20 text-pulse-400 border border-pulse-500/30"
                    )}>
                      {item.badge === 'live' ? '●' : item.badge}
                    </div>
                  )}
                  
                  {/* Active indicator line */}
                  {isActive && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-pulse-400 to-transparent rounded-l-full"></div>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Features Section - With divider and label */}
        <div>
          <div className="flex items-center gap-2 mb-3 px-2">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-command-border to-transparent"></div>
            <span className="text-xs font-mono uppercase tracking-wider text-gray-500">Tools</span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-command-border to-transparent"></div>
          </div>
          
          <nav className="space-y-1">
            {navStructure.features.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'relative flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group',
                    isActive
                      ? 'bg-gradient-to-r from-pulse-500/20 to-pulse-600/10 text-white font-semibold border-l-4 border-pulse-400 pl-2 shadow-glow-sm'
                      : 'text-gray-300 hover:bg-pulse-500/5 hover:text-white border-l-4 border-transparent hover:border-pulse-500/30 pl-2'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center space-x-3">
                      <div className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center transition-all",
                        isActive 
                          ? "bg-pulse-500/30 shadow-glow-sm" 
                          : "bg-command-surface group-hover:bg-pulse-500/20"
                      )}>
                        <item.icon className={cn(
                          "w-4.5 h-4.5 transition-all",
                          isActive ? "text-pulse-300" : "text-gray-400 group-hover:text-pulse-400"
                        )} />
                      </div>
                      <span className="text-sm">{item.label}</span>
                    </div>
                    
                    {item.badge && (
                      <div className="px-2 py-0.5 bg-alert-high/20 text-alert-high border border-alert-high/30 rounded-full text-xs font-mono font-bold">
                        {item.badge}
                      </div>
                    )}
                    
                    {isActive && (
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-pulse-400 to-transparent rounded-l-full"></div>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Insights Section - Conditional render */}
        {navStructure.insights.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3 px-2">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-command-border to-transparent"></div>
              <span className="text-xs font-mono uppercase tracking-wider text-gray-500">Insights</span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-command-border to-transparent"></div>
            </div>
            
            <nav className="space-y-1">
              {navStructure.insights.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'relative flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group',
                      isActive
                        ? 'bg-gradient-to-r from-pulse-500/20 to-pulse-600/10 text-white font-semibold border-l-4 border-pulse-400 pl-2 shadow-glow-sm'
                        : 'text-gray-300 hover:bg-pulse-500/5 hover:text-white border-l-4 border-transparent hover:border-pulse-500/30 pl-2'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center space-x-3">
                        <div className={cn(
                          "w-9 h-9 rounded-lg flex items-center justify-center transition-all",
                          isActive 
                            ? "bg-pulse-500/30 shadow-glow-sm" 
                            : "bg-command-surface group-hover:bg-pulse-500/20"
                        )}>
                          <item.icon className={cn(
                            "w-4.5 h-4.5 transition-all",
                            isActive ? "text-pulse-300" : "text-gray-400 group-hover:text-pulse-400"
                          )} />
                        </div>
                        <span className="text-sm">{item.label}</span>
                      </div>
                      
                      {isActive && (
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-pulse-400 to-transparent rounded-l-full"></div>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>
        )}

        {/* Settings Section - Always at bottom */}
        <div>
          <div className="flex items-center gap-2 mb-3 px-2">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-command-border to-transparent"></div>
            <span className="text-xs font-mono uppercase tracking-wider text-gray-500">Account</span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-command-border to-transparent"></div>
          </div>
          
          <nav className="space-y-1">
            {navStructure.settings.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'relative flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group',
                    isActive
                      ? 'bg-gradient-to-r from-pulse-500/20 to-pulse-600/10 text-white font-semibold border-l-4 border-pulse-400 pl-2 shadow-glow-sm'
                      : 'text-gray-300 hover:bg-pulse-500/5 hover:text-white border-l-4 border-transparent hover:border-pulse-500/30 pl-2'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center space-x-3">
                      <div className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center transition-all",
                        isActive 
                          ? "bg-pulse-500/30 shadow-glow-sm" 
                          : "bg-command-surface group-hover:bg-pulse-500/20"
                      )}>
                        <item.icon className={cn(
                          "w-4.5 h-4.5 transition-all",
                          isActive ? "text-pulse-300" : "text-gray-400 group-hover:text-pulse-400"
                        )} />
                      </div>
                      <span className="text-sm">{item.label}</span>
                    </div>
                    
                    {isActive && (
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-pulse-400 to-transparent rounded-l-full"></div>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Enhanced Status Card with more info */}
        <div className="relative glass-heavy rounded-xl p-4 border border-alert-safe/30 overflow-hidden">
          {/* Background glow */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-alert-safe/10 rounded-full blur-2xl"></div>
          
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-mono uppercase tracking-wider text-gray-400">
                System Status
              </h3>
              <Activity className="w-4 h-4 text-alert-safe animate-pulse" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-300">Connection</span>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-alert-safe rounded-full animate-pulse shadow-glow"></div>
                  <span className="font-mono font-bold text-alert-safe">LIVE</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-300">Updates</span>
                <span className="font-mono text-pulse-400">Real-time</span>
              </div>
              
              <div className="mt-3 pt-3 border-t border-command-border">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <MapPin className="w-3 h-3" />
                  <span>Tracking your area</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </aside>
  );
}

export default Sidebar;
