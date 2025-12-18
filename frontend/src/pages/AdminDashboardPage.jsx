import { useState, useEffect } from 'react';
import { 
  BarChart3,
  TrendingUp,
  Users,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Filter,
  Search,
  Eye,
  Trash2,
  Flag,
  MapPin,
  Calendar,
  Activity,
  FileText,
  RefreshCw,
  ChevronDown,
  MoreVertical,
  ShieldCheck,
  Ban
} from 'lucide-react';
import { useIncidentStore } from '../store/incidentStore';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { cn, formatRelativeTime, getSeverityColor, formatDistance } from '../lib/utils';
import { socketManager } from '../lib/socket';
import { incidentsAPI } from '../lib/api';
import { ConfirmModal, InputModal } from '../components/common/Modal';

// Calculate real analytics from incidents
const generateAnalytics = (incidents) => {
  const totalIncidents = incidents.length;
  const pendingVerification = incidents.filter(i => i.status === 'pending').length;
  const activeIncidents = incidents.filter(i => i.status === 'active').length;
  const resolvedIncidents = incidents.filter(i => i.status === 'resolved').length;
  
  // Calculate resolved today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const resolvedToday = incidents.filter(i => {
    if (i.status !== 'resolved' || !i.updatedAt) return false;
    const updatedDate = new Date(i.updatedAt);
    return updatedDate >= today && updatedDate < tomorrow;
  }).length;
  
  // Group by type
  const incidentsByType = incidents.reduce((acc, inc) => {
    acc[inc.type] = (acc[inc.type] || 0) + 1;
    return acc;
  }, {});
  
  // Group by severity
  const incidentsBySeverity = incidents.reduce((acc, inc) => {
    acc[inc.severity] = (acc[inc.severity] || 0) + 1;
    return acc;
  }, {});
  
  // Weekly data - last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    date.setHours(0, 0, 0, 0);
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    
    // Count only incidents CREATED/REPORTED on this day
    const dayIncidents = incidents.filter(inc => {
      const createdAt = new Date(inc.createdAt);
      return createdAt >= date && createdAt < nextDay;
    });
    
    // Count incidents RESOLVED on this day
    const dayResolved = incidents.filter(i => {
      if (i.status !== 'resolved' || !i.updatedAt) return false;
      const resolvedAt = new Date(i.updatedAt);
      return resolvedAt >= date && resolvedAt < nextDay;
    });
    
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      incidents: dayIncidents.length,
      resolved: dayResolved.length,
    };
  });

  // Calculate average response time from resolved incidents
  const resolvedWithTime = incidents.filter(i => i.status === 'resolved' && i.updatedAt && i.createdAt);
  let avgResponseTime = 'N/A';
  
  if (resolvedWithTime.length > 0) {
    const totalResponseTime = resolvedWithTime.reduce((sum, incident) => {
      const created = new Date(incident.createdAt);
      const resolved = new Date(incident.updatedAt);
      const diffMinutes = (resolved - created) / (1000 * 60); // Convert to minutes
      return sum + diffMinutes;
    }, 0);
    
    const avgMinutes = totalResponseTime / resolvedWithTime.length;
    
    if (avgMinutes < 60) {
      avgResponseTime = `${Math.round(avgMinutes)} min`;
    } else if (avgMinutes < 1440) { // Less than 24 hours
      avgResponseTime = `${(avgMinutes / 60).toFixed(1)} hrs`;
    } else {
      avgResponseTime = `${(avgMinutes / 1440).toFixed(1)} days`;
    }
  }

  return {
    totalIncidents,
    pendingVerification,
    activeIncidents,
    resolvedToday,
    avgResponseTime,
    weeklyData: last7Days,
    incidentsByType,
    incidentsBySeverity
  };
};

// Stats Card Component
function StatsCard({ title, value, change, icon: Icon, color = 'primary' }) {
  const colorConfig = {
    primary: 'bg-primary-100 text-primary-600',
    success: 'bg-green-100 text-green-600',
    warning: 'bg-yellow-100 text-yellow-600',
    danger: 'bg-red-100 text-red-600',
    info: 'bg-blue-100 text-blue-600'
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={cn("p-3 rounded-lg", colorConfig[color])}>
          <Icon className="w-6 h-6" />
        </div>
        {change && (
          <div className={cn(
            "flex items-center space-x-1 text-sm font-medium px-2 py-1 rounded",
            change > 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
          )}>
            <TrendingUp className={cn("w-4 h-4", change < 0 && "rotate-180")} />
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
      <p className="text-sm text-gray-600">{title}</p>
    </div>
  );
}

// Simple Bar Chart Component
function BarChart({ data, title }) {
  const maxValue = Math.max(...data.map(d => d.incidents));

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <h3 className="text-lg font-bold text-gray-900 mb-6">{title}</h3>
      <div className="space-y-4">
        {data.map((item, idx) => (
          <div key={`chart-${item.date}-${idx}`}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600">{item.date}</span>
              <div className="flex items-center space-x-4">
                <span className="text-primary-600 font-medium">{item.incidents} new</span>
                <span className="text-green-600 font-medium">{item.resolved} resolved</span>
              </div>
            </div>
            <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full bg-primary-500 rounded-lg transition-all duration-500"
                style={{ width: `${(item.incidents / maxValue) * 100}%` }}
              />
              <div
                className="absolute left-0 top-0 h-full bg-green-500 rounded-lg transition-all duration-500"
                style={{ width: `${(item.resolved / maxValue) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Incident Row Component
function IncidentRow({ incident, onVerify, onReject, onResolve, onDelete, onViewDetails }) {
  const [showActions, setShowActions] = useState(false);
  
  return (
    <div className="bg-white border-b border-gray-200 hover:bg-gray-50 transition-colors">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Incident Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-2">
              <span className={cn(
                "px-2 py-1 text-xs font-semibold rounded-full",
                getSeverityColor(incident.severity)
              )}>
                {incident.severity}
              </span>
              <span className="font-semibold text-gray-900 capitalize">{incident.type}</span>
              {incident.status === 'pending' && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>Pending Verification</span>
                </span>
              )}
              {incident.status === 'verified' && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Verified</span>
                </span>
              )}
              {incident.status === 'active' && (
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Active</span>
                </span>
              )}
              {incident.status === 'resolved' && (
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Resolved</span>
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 line-clamp-1 mb-2">
              {incident.description || 'No description provided'}
            </p>
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span className="flex items-center space-x-1">
                <MapPin className="w-3 h-3" />
                <span>{incident.address?.formattedAddress || 'Location unavailable'}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>{formatRelativeTime(incident.createdAt)}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Users className="w-3 h-3" />
                <span>Reporter: {incident.reportedBy?.name || 'Anonymous'}</span>
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 ml-4">
            {incident.status === 'pending' && (
              <>
                <button
                  onClick={() => onVerify(incident._id || incident.id)}
                  className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center space-x-1"
                  title="Verify incident"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Verify</span>
                </button>
                <button
                  onClick={() => onReject(incident._id || incident.id)}
                  className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center space-x-1"
                  title="Reject incident"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject</span>
                </button>
              </>
            )}
            {(incident.status === 'active' || incident.status === 'verified') && (
              <button
                onClick={() => onResolve(incident._id || incident.id)}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center space-x-1"
                title="Resolve incident"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Resolve</span>
              </button>
            )}
            <button
              onClick={() => onViewDetails(incident)}
              className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center space-x-1"
            >
              <Eye className="w-4 h-4" />
              <span>View</span>
            </button>
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>
              {showActions && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowActions(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
                    <button
                      onClick={() => {
                        onDelete(incident._id || incident.id);
                        setShowActions(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                    <button
                      onClick={() => {
                        // Flag for review
                        setShowActions(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2"
                    >
                      <Flag className="w-4 h-4" />
                      <span>Flag</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Export dropdown
function ExportDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { incidents } = useIncidentStore();
  const { addToast } = useUIStore();

  const exportCSV = () => {
    const headers = ['ID', 'Type', 'Severity', 'Status', 'Description', 'Location', 'Created At'];
    const rows = incidents.map(i => [
      i.id,
      i.type,
      i.severity,
      i.status,
      i.description || '',
      i.address?.formattedAddress || '',
      new Date(i.createdAt).toISOString()
    ]);

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `incidents-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    addToast('CSV exported successfully', 'success');
    setIsOpen(false);
  };

  const exportJSON = () => {
    const json = JSON.stringify(incidents, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `incidents-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    addToast('JSON exported successfully', 'success');
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center space-x-2"
      >
        <Download className="w-4 h-4" />
        <span>Export</span>
        <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
            <button
              onClick={exportCSV}
              className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors flex items-center space-x-3"
            >
              <FileText className="w-4 h-4 text-gray-600" />
              <div>
                <div className="font-medium text-gray-900">Export as CSV</div>
                <div className="text-xs text-gray-500">Excel compatible</div>
              </div>
            </button>
            <button
              onClick={exportJSON}
              className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors flex items-center space-x-3"
            >
              <FileText className="w-4 h-4 text-gray-600" />
              <div>
                <div className="font-medium text-gray-900">Export as JSON</div>
                <div className="text-xs text-gray-500">Developer friendly</div>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function AdminDashboardPage() {
  const { incidents, fetchIncidents } = useIncidentStore();
  const { user } = useAuthStore();
  const { addToast } = useUIStore();

  const [analytics, setAnalytics] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Modal states
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const [resolveModal, setResolveModal] = useState({ isOpen: false, id: null });

  // Check admin access
  useEffect(() => {
    if (user && user.role !== 'admin') {
      addToast('Access denied. Admin privileges required.', 'error');
      window.location.href = '/dashboard';
    }
  }, [user]);

  // Load data
  useEffect(() => {
    if (incidents.length === 0) {
      fetchIncidents().catch(err => console.error('Failed to fetch incidents:', err));
    }
    console.log('Incidents in admin dashboard:', incidents.length);
    console.log('Sample incident:', incidents[0]);
    const newAnalytics = generateAnalytics(incidents);
    console.log('Generated analytics:', newAnalytics);
    setAnalytics(newAnalytics);
  }, [incidents]);

  // Real-time updates
  useEffect(() => {
    const socket = socketManager.socket;
    if (socket) {
      socket.on('incident:created', () => {
        fetchIncidents();
      });
      socket.on('incident:updated', () => {
        fetchIncidents();
      });
    }
  }, []);

  // Refresh data
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchIncidents()
      .then(() => {
        setAnalytics(generateAnalytics(incidents));
        addToast('Data refreshed', 'success');
      })
      .catch(err => addToast('Failed to refresh data', 'error'))
      .finally(() => setIsRefreshing(false));
  };

  // Verification actions
  const handleVerify = async (id) => {
    try {
      // Check if user is authenticated
      if (!user || !user.role === 'admin') {
        addToast('Authentication required', 'error');
        return;
      }

      console.log('Verifying incident:', id);
      console.log('User:', user);
      
      const response = await incidentsAPI.verify(id);
      console.log('Verify response:', response);
      
      addToast('Incident verified successfully', 'success');
      // Refresh incidents list
      await fetchIncidents();
      setAnalytics(generateAnalytics(incidents));
    } catch (error) {
      console.error('Error verifying incident:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      
      addToast(error.response?.data?.message || 'Failed to verify incident', 'error');
    }
  };

  const handleReject = async (id) => {
    try {
      await incidentsAPI.updateStatus(id, 'rejected', 'Rejected by admin');
      addToast('Incident rejected', 'info');
      // Refresh incidents list
      await fetchIncidents();
      setAnalytics(generateAnalytics(incidents));
    } catch (error) {
      console.error('Error rejecting incident:', error);
      addToast('Failed to reject incident', 'error');
    }
  };

  const handleResolve = async (notes) => {
    try {
      await incidentsAPI.resolve(resolveModal.id, notes);
      addToast('Incident resolved successfully', 'success');
      // Refresh incidents list
      await fetchIncidents();
      setAnalytics(generateAnalytics(incidents));
    } catch (error) {
      console.error('Error resolving incident:', error);
      addToast('Failed to resolve incident', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      // In production: call API to delete incident
      // await incidentsAPI.delete(deleteModal.id);
      addToast('Incident deleted', 'success');
      await fetchIncidents();
      setAnalytics(generateAnalytics(incidents));
    } catch (error) {
      console.error('Error deleting incident:', error);
      addToast('Failed to delete incident', 'error');
    }
  };

  const handleViewDetails = (incident) => {
    window.location.href = `/dashboard/incidents/${incident._id || incident.id}`;
  };

  // Filter incidents
  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = !searchQuery || 
      incident.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incident.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incident.address?.formattedAddress?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || incident.status === filterStatus;
    const matchesSeverity = filterSeverity === 'all' || incident.severity === filterSeverity;
    
    return matchesSearch && matchesStatus && matchesSeverity;
  });

  if (!analytics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                <BarChart3 className="w-8 h-8 mr-3 text-primary-600" />
                Admin Dashboard
              </h1>
              <p className="text-gray-600">
                Monitor and manage incidents in real-time
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center space-x-2"
              >
                <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
                <span>Refresh</span>
              </button>
              <ExportDropdown />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatsCard
            title="Total Incidents"
            value={analytics.totalIncidents}
            change={12}
            icon={AlertCircle}
            color="primary"
          />
          <StatsCard
            title="Pending Verification"
            value={analytics.pendingVerification}
            change={-8}
            icon={Clock}
            color="warning"
          />
          <StatsCard
            title="Active Incidents"
            value={analytics.activeIncidents}
            icon={Activity}
            color="danger"
          />
          <StatsCard
            title="Resolved Today"
            value={analytics.resolvedToday}
            change={15}
            icon={CheckCircle}
            color="success"
          />
          <StatsCard
            title="Avg Response Time"
            value={analytics.avgResponseTime}
            change={-5}
            icon={TrendingUp}
            color="info"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <BarChart data={analytics.weeklyData} title="7-Day Incident Trend" />
          
          {/* Incidents by Type */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Incidents by Type</h3>
            <div className="space-y-4">
              {Object.entries(analytics.incidentsByType).map(([type, count]) => {
                const total = Object.values(analytics.incidentsByType).reduce((a, b) => a + b, 0);
                const percentage = (count / total) * 100;
                return (
                  <div key={type}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-700 capitalize font-medium">{type}</span>
                      <span className="text-gray-900 font-semibold">{count}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Incident Management Section */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Live Incident Management
              </h2>
              <span className="text-sm text-gray-600">
                {filteredIncidents.length} incidents
              </span>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search incidents..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="resolved">Resolved</option>
              </select>

              {/* Severity Filter */}
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Severity</option>
                <option value="critical">Critical</option>
                <option value="severe">Severe</option>
                <option value="high">High</option>
                <option value="moderate">Moderate</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          {/* Incident List */}
          <div className="max-h-[600px] overflow-y-auto">
            {filteredIncidents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-600">No incidents found</p>
              </div>
            ) : (
              filteredIncidents.map(incident => (
                <IncidentRow
                  key={incident._id || incident.id}
                  incident={incident}
                  onVerify={handleVerify}
                  onReject={handleReject}
                  onResolve={(id) => setResolveModal({ isOpen: true, id })}
                  onDelete={(id) => setDeleteModal({ isOpen: true, id })}
                  onViewDetails={handleViewDetails}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Resolve Modal */}
      <InputModal
        isOpen={resolveModal.isOpen}
        onClose={() => setResolveModal({ isOpen: false, id: null })}
        onConfirm={handleResolve}
        title="Resolve Incident"
        message="Enter resolution notes (optional):"
        placeholder="Describe how the incident was resolved..."
        confirmText="Resolve"
        type="success"
      />

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Incident"
        message="Are you sure you want to delete this incident? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}

export default AdminDashboardPage;
