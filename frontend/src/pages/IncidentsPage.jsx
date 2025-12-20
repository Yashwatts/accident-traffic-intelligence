import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, MapPin, Clock, Filter, Plus, Eye } from 'lucide-react';
import { useIncidentStore } from '../store/incidentStore';
import { useAuthStore } from '../store/authStore';
import { formatRelativeTime, getSeverityColor } from '../lib/utils';

function IncidentsPage() {
  const { incidents, fetchIncidents, isLoading } = useIncidentStore();
  const { user } = useAuthStore();
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Fetch all incidents for everyone to see
    fetchIncidents({ limit: 50 });
  }, [fetchIncidents]);

  const filteredIncidents = incidents.filter(incident => {
    if (filter === 'all') return true;
    if (filter === 'my-reports') {
      const reporterId = typeof incident.reportedBy === 'object' ? incident.reportedBy?._id : incident.reportedBy;
      return reporterId === user?._id || reporterId === user?.id;
    }
    return incident.status === filter;
  });

  const getStatusColor = (status) => {
    const colors = {
      'active': 'status-active',
      'in-progress': 'status-progress',
      'resolved': 'status-resolved',
      'pending': 'status-pending',
    };
    return colors[status] || 'status-pending';
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="glass-heavy rounded-2xl p-6 sm:p-8 border-l-4 border-pulse-500 shadow-2xl shadow-pulse-500/10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl lg:text-display-md font-display text-white mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Incidents
            </h1>
            <p className="text-gray-400 text-sm sm:text-base">
              View and manage all incidents
            </p>
          </div>
          <Link
            to="/dashboard/incidents/new"
            className="px-5 py-3 bg-gradient-to-r from-pulse-600 via-pulse-600 to-pulse-700 hover:from-pulse-500 hover:via-pulse-500 hover:to-pulse-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-pulse-500/20 hover:shadow-xl hover:shadow-pulse-500/30 flex items-center gap-2 w-full sm:w-auto justify-center hover:scale-105 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Report Incident
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-heavy rounded-2xl p-5 sm:p-6 shadow-lg">
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
          <div className="p-2.5 rounded-xl bg-pulse-500/10 border border-pulse-500/20 shadow-sm">
            <Filter className="w-5 h-5 text-pulse-400" />
          </div>
          {['all', 'active', 'in-progress', 'pending', 'resolved', 'my-reports'].map((filterType, idx) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-5 py-2.5 rounded-xl font-mono text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 whitespace-nowrap hover-pulse animate-fade-in ${
                filter === filterType
                  ? 'bg-gradient-to-r from-pulse-500/30 to-pulse-600/20 text-pulse-300 border border-pulse-400/40 shadow-lg shadow-pulse-500/20 scale-105'
                  : 'glass text-gray-400 hover:text-white border border-command-border hover:border-pulse-500/30 hover:bg-pulse-500/5 shadow-md'
              }`}
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              {filterType.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Incidents List */}
      <div className="glass-heavy rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-pulse-500/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-pulse-500 border-t-transparent rounded-full animate-spin shadow-glow"></div>
              <div className="absolute inset-0 border-4 border-pulse-400 border-b-transparent rounded-full animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}></div>
            </div>
            <p className="text-sm font-mono text-gray-400 animate-pulse">Loading incidents...</p>
          </div>
        ) : filteredIncidents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 rounded-xl bg-pulse-500/10 border border-pulse-500/20 flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-pulse-500" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No incidents found</h3>
            <p className="text-sm text-gray-400 mb-4">Try adjusting your filters</p>
            <Link
              to="/dashboard/incidents/new"
              className="px-4 py-2 bg-gradient-to-r from-pulse-600 to-pulse-700 hover:from-pulse-500 hover:to-pulse-600 text-white rounded-lg font-semibold transition-all shadow-glow-sm hover:shadow-glow"
            >
              Report New Incident
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-command-border">
            {filteredIncidents.map((incident, index) => (
              <Link
                key={incident._id}
                to={`/dashboard/incidents/${incident._id}`}
                className="block p-6 hover:bg-command-elevated transition-all duration-300 group hover-lift animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`p-3 rounded-xl bg-${getSeverityColor(incident.severity).split('-')[1]}/10 border border-${getSeverityColor(incident.severity).split('-')[1]}/20 flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                    <AlertCircle className={`w-6 h-6 text-${getSeverityColor(incident.severity).split('-')[1]} transition-transform`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="text-lg font-semibold text-white group-hover:text-pulse-400 transition-colors">
                        {incident.type}
                      </h3>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold uppercase tracking-wider bg-${getStatusColor(incident.status).split('-')[1]}/20 text-${getStatusColor(incident.status).split('-')[1]} border border-${getStatusColor(incident.status).split('-')[1]}/30 transition-all duration-300 group-hover:scale-105 group-hover:shadow-glow-sm`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                          {incident.status}
                        </span>
                        <span className={`px-3 py-1 text-xs font-mono rounded-full bg-${getSeverityColor(incident.severity).split('-')[1]}/10 text-${getSeverityColor(incident.severity).split('-')[1]} border border-${getSeverityColor(incident.severity).split('-')[1]}/20 transition-all duration-300 group-hover:scale-105`}>
                          {incident.severity}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{incident.address?.formattedAddress || 'Location unavailable'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 flex-shrink-0" />
                        <span className="font-mono">{formatRelativeTime(incident.createdAt)}</span>
                      </div>
                    </div>

                    {incident.description && (
                      <p className="text-sm text-gray-300 line-clamp-2 mb-3">
                        {incident.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500">Reported by:</span>
                      <span className="text-gray-300">
                        {typeof incident.reportedBy === 'object'
                          ? `${incident.reportedBy?.firstName} ${incident.reportedBy?.lastName}`
                          : 'Unknown'}
                      </span>
                    </div>
                  </div>

                  {/* View Icon */}
                  <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Eye className="w-5 h-5 text-pulse-400" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-heavy rounded-xl p-4">
          <div className="text-2xl font-display font-bold text-white mb-1">
            {incidents.filter(i => i.status === 'active').length}
          </div>
          <div className="text-xs font-mono uppercase tracking-wider text-gray-400">Active</div>
        </div>
        <div className="glass-heavy rounded-xl p-4">
          <div className="text-2xl font-display font-bold text-white mb-1">
            {incidents.filter(i => i.status === 'in-progress').length}
          </div>
          <div className="text-xs font-mono uppercase tracking-wider text-gray-400">In Progress</div>
        </div>
        <div className="glass-heavy rounded-xl p-4">
          <div className="text-2xl font-display font-bold text-white mb-1">
            {incidents.filter(i => i.status === 'pending').length}
          </div>
          <div className="text-xs font-mono uppercase tracking-wider text-gray-400">Pending</div>
        </div>
        <div className="glass-heavy rounded-xl p-4">
          <div className="text-2xl font-display font-bold text-white mb-1">
            {incidents.filter(i => i.status === 'resolved').length}
          </div>
          <div className="text-xs font-mono uppercase tracking-wider text-gray-400">Resolved</div>
        </div>
      </div>
    </div>
  );
}

export default IncidentsPage;
