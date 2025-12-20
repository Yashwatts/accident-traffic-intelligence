import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertCircle, 
  TrendingUp, 
  MapPin, 
  Activity,
  Radio,
  Zap,
  Clock
} from 'lucide-react';
import { useIncidentStore } from '../store/incidentStore';
import { useAuthStore } from '../store/authStore';
import { formatRelativeTime } from '../lib/utils';

function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { incidents, fetchIncidents } = useIncidentStore();
  const [time, setTime] = useState(new Date());

  // Redirect admin users to admin dashboard
  useEffect(() => {
    if (user && user.role === 'admin') {
      navigate('/dashboard/admin', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    // For citizens, only fetch their own incidents
    const params = { limit: 10 };
    if (user?.role === 'citizen') {
      params.reportedBy = user._id || user.id;
    }
    fetchIncidents(params);
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, [fetchIncidents, user]);

  // Filter incidents to show only user's own reports for citizens
  const filteredIncidents = user?.role === 'citizen' 
    ? incidents.filter(i => {
        const reporterId = typeof i.reportedBy === 'object' ? i.reportedBy?._id : i.reportedBy;
        return reporterId === user?._id || reporterId === user?.id;
      })
    : incidents;

  const activeCount = filteredIncidents.filter(i => i.status === 'active').length;
  const pendingCount = filteredIncidents.filter(i => i.status === 'pending').length;
  const resolvedToday = filteredIncidents.filter(i => {
    const updatedAt = new Date(i.updatedAt);
    const today = new Date();
    return i.status === 'resolved' && 
           updatedAt.toDateString() === today.toDateString();
  }).length;
  const userReportsCount = filteredIncidents.length;

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in p-4 sm:p-6 lg:p-8">
      {/* Command Header */}
      <div className="glass-heavy rounded-2xl p-6 sm:p-8 border-l-4 border-pulse-500 shadow-2xl shadow-pulse-500/10 hover:shadow-pulse-500/20 transition-all duration-300">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <span className="live-indicator text-xs font-mono uppercase text-alert-critical font-bold px-3 py-1.5 bg-alert-critical/10 rounded-full border border-alert-critical/30">
                Live
              </span>
              <span className="text-xs font-mono text-gray-500">
                System Operational
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-display-md font-display text-white mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Command Center
            </h1>
            <p className="text-gray-400 text-sm sm:text-base">
              Welcome back, <span className="text-pulse-400 font-semibold">{user?.firstName}</span>
            </p>
          </div>
          <div className="text-left lg:text-right glass rounded-xl p-4 sm:p-6 w-full lg:w-auto">
            <div className="text-3xl sm:text-4xl font-mono font-bold text-white mb-2 bg-gradient-to-br from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              {time.toLocaleTimeString('en-US', { hour12: false })}
            </div>
            <div className="text-xs sm:text-sm text-gray-400 font-mono">
              {time.toLocaleDateString('en-US', { 
                weekday: 'short', 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="glass-heavy rounded-xl p-4 sm:p-6 border border-command-border transition-all duration-300 group">
          <div className="flex items-center justify-between mb-3">
            <Activity className="w-8 h-8 sm:w-10 sm:h-10 text-pulse-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{activeCount}</div>
          <div className="text-xs sm:text-sm text-gray-400">Active Incidents</div>
        </div>

        <div className="glass-heavy rounded-xl p-4 sm:p-6 border border-command-border transition-all duration-300 group">
          <div className="flex items-center justify-between mb-3">
            <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{pendingCount}</div>
          <div className="text-xs sm:text-sm text-gray-400">Pending</div>
        </div>

        <div className="glass-heavy rounded-xl p-4 sm:p-6 border border-command-border transition-all duration-300 group">
          <div className="flex items-center justify-between mb-3">
            <Zap className="w-8 h-8 sm:w-10 sm:h-10 text-green-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{resolvedToday}</div>
          <div className="text-xs sm:text-sm text-gray-400">Resolved Today</div>
        </div>

        <div className="glass-heavy rounded-xl p-4 sm:p-6 border border-command-border transition-all duration-300 group">
          <div className="flex items-center justify-between mb-3">
            <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-blue-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{userReportsCount}</div>
          <div className="text-xs sm:text-sm text-gray-400">Your Reports</div>
        </div>
      </div>

      {/* Live Activity Feed */}
      <div className="glass-heavy rounded-xl border border-command-border overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-command-border bg-command-surface">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Radio className="w-5 h-5 text-pulse-400 animate-pulse" />
              <h2 className="text-lg sm:text-xl font-bold text-white">Live Activity Feed</h2>
            </div>
            <span className="text-xs sm:text-sm text-gray-400">{filteredIncidents.length} incidents</span>
          </div>
        </div>

        <div className="divide-y divide-command-border max-h-[600px] overflow-y-auto">
          {filteredIncidents.length === 0 ? (
            <div className="p-8 sm:p-12 text-center">
              <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">No Incidents</h3>
              <p className="text-sm sm:text-base text-gray-400">You haven't reported any incidents yet</p>
            </div>
          ) : (
            filteredIncidents.map((incident) => (
              <div 
                key={incident._id || incident.id} 
                className="p-4 sm:p-6 bg-command-surface hover:bg-command-elevated transition-all duration-200 cursor-pointer group"
                onClick={() => navigate(`/dashboard/incidents/${incident._id || incident.id}`)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
                      <span className={`px-2 sm:px-3 py-1 text-xs font-semibold rounded-full ${
                        incident.severity === 'critical' ? 'bg-alert-critical/20 text-alert-critical border border-alert-critical/30' :
                        incident.severity === 'high' ? 'bg-alert-high/20 text-alert-high border border-alert-high/30' :
                        incident.severity === 'moderate' ? 'bg-alert-moderate/20 text-alert-moderate border border-alert-moderate/30' :
                        'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                      }`}>
                        {incident.severity}
                      </span>
                      <span className="text-sm sm:text-base font-semibold text-white capitalize">{incident.type}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-400 mb-2 line-clamp-2">
                      {incident.description || 'No description provided'}
                    </p>
                    <div className="flex items-center gap-3 sm:gap-4 text-xs text-gray-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate max-w-[150px] sm:max-w-none">
                          {incident.address?.formattedAddress || 'Location unavailable'}
                        </span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatRelativeTime(incident.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-2 sm:px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                      incident.status === 'active' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                      incident.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                      incident.status === 'resolved' ? 'bg-gray-500/20 text-gray-400 border border-gray-500/30' :
                      'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}>
                      {incident.status}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
