import { useEffect } from 'react';
import { AlertCircle, TrendingUp, Users, MapPin } from 'lucide-react';
import { useIncidentStore } from '../store/incidentStore';
import { useAuthStore } from '../store/authStore';

function DashboardPage() {
  const { user } = useAuthStore();
  const { incidents, fetchIncidents } = useIncidentStore();

  useEffect(() => {
    fetchIncidents({ limit: 10 });
  }, [fetchIncidents]);

  const stats = [
    {
      label: 'Active Incidents',
      value: incidents.filter(i => i.status === 'active').length,
      icon: AlertCircle,
      color: 'text-red-600 bg-red-50',
    },
    {
      label: 'Pending',
      value: incidents.filter(i => i.status === 'pending').length,
      icon: TrendingUp,
      color: 'text-orange-600 bg-orange-50',
    },
    {
      label: 'Your Reports',
      value: incidents.filter(i => {
        const reporterId = typeof i.reportedBy === 'object' ? i.reportedBy?._id : i.reportedBy;
        return reporterId === user?._id || reporterId === user?.id;
      }).length,
      icon: Users,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      label: 'Nearby',
      value: incidents.filter(i => i.status !== 'resolved' && i.status !== 'rejected').length,
      icon: MapPin,
      color: 'text-green-600 bg-green-50',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.firstName}!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-lg shadow p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Incidents */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Incidents</h2>
        {incidents.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No incidents to display</p>
        ) : (
          <div className="space-y-3">
            {incidents.slice(0, 5).map((incident) => (
              <div
                key={incident._id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{incident.type}</h3>
                  <p className="text-sm text-gray-600">
                    {incident.address?.formattedAddress || 'Location unavailable'}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 text-sm font-medium text-red-700 bg-red-50 rounded-full">
                    {incident.severity}
                  </span>
                  <span className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-full">
                    {incident.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;
