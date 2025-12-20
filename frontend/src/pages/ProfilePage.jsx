import { useEffect } from 'react';
import { User, Mail, Shield, Calendar, Info } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useIncidentStore } from '../store/incidentStore';

function ProfilePage() {
  const { user } = useAuthStore();
  const { incidents, fetchIncidents } = useIncidentStore();

  useEffect(() => {
    // Fetch user's incidents to calculate stats
    if (user?.role === 'citizen' && (user._id || user.id)) {
      fetchIncidents({ reportedBy: user._id || user.id, limit: 1000 });
    }
  }, [user, fetchIncidents]);

  // Calculate user's incidents count
  const userIncidents = incidents.filter(i => {
    const reporterId = typeof i.reportedBy === 'object' ? i.reportedBy?._id : i.reportedBy;
    return reporterId === user?._id || reporterId === user?.id;
  });

  const incidentsReported = userIncidents.length;
  
  // Calculate contribution score based on incidents
  // Formula: verified incidents * 10 + resolved incidents * 5 + all incidents * 1
  const contributionScore = userIncidents.reduce((score, incident) => {
    let points = 1; // Base point for reporting
    if (incident.verified) points += 10;
    if (incident.status === 'resolved') points += 5;
    return score + points;
  }, 0);

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="glass-heavy rounded-2xl p-6 sm:p-8 border-l-4 border-pulse-500 shadow-2xl shadow-pulse-500/10">
        <h1 className="text-3xl sm:text-4xl lg:text-display-md font-display text-white mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Profile
        </h1>
        <p className="text-gray-400 text-sm sm:text-base">Manage your account information</p>
      </div>

      {/* Profile Card */}
      <div className="glass-heavy rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-pulse-400 to-pulse-600 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 bg-gradient-to-br from-pulse-500 via-pulse-600 to-pulse-800 rounded-2xl flex items-center justify-center shadow-2xl shadow-pulse-500/30 ring-2 ring-pulse-400/20">
              <User className="w-14 h-14 sm:w-16 sm:h-16 text-white" />
            </div>
          </div>
          <div className="text-center sm:text-left flex-1">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-2 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-pulse-400 font-mono uppercase tracking-wider text-sm sm:text-base px-3 py-1.5 bg-pulse-500/10 rounded-lg inline-block border border-pulse-500/30">
              {user?.role || 'Citizen'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          <div className="glass rounded-xl p-5 hover:bg-pulse-500/5 transition-all duration-300 group">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-pulse-500/10 rounded-lg group-hover:scale-110 transition-transform">
                <Mail className="w-5 h-5 text-pulse-400" />
              </div>
              <label className="text-xs sm:text-sm font-mono uppercase tracking-wider text-gray-400">Email</label>
            </div>
            <p className="text-white font-semibold text-sm sm:text-base">{user?.email}</p>
          </div>
          
          <div className="glass rounded-xl p-5 hover:bg-pulse-500/5 transition-all duration-300 group">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-pulse-500/10 rounded-lg group-hover:scale-110 transition-transform">
                <Shield className="w-5 h-5 text-pulse-400" />
              </div>
              <label className="text-xs sm:text-sm font-mono uppercase tracking-wider text-gray-400">Role</label>
            </div>
            <p className="text-white font-semibold capitalize text-sm sm:text-base">{user?.role}</p>
          </div>

          {user?.phoneNumber && (
            <div className="glass rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-5 h-5 text-pulse-400" />
                <label className="text-sm font-mono uppercase tracking-wider text-gray-400">Phone</label>
              </div>
              <p className="text-white font-semibold">{user.phoneNumber}</p>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        <div className="glass-heavy rounded-2xl p-6 sm:p-8 hover-lift shadow-lg hover:shadow-xl transition-all duration-300 border border-command-border hover:border-pulse-500/30">
          <div className="text-4xl sm:text-5xl font-display font-bold text-white mb-3 bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">
            {incidentsReported}
          </div>
          <div className="text-xs font-mono uppercase tracking-wider text-gray-400">Incidents Reported</div>
        </div>
        <div className="glass-heavy rounded-2xl p-6 sm:p-8 hover-lift shadow-lg hover:shadow-xl transition-all duration-300 border border-command-border hover:border-pulse-500/30">
          <div className="text-4xl sm:text-5xl font-display font-bold text-white mb-3 bg-gradient-to-br from-pulse-400 to-pulse-600 bg-clip-text text-transparent">
            {contributionScore}
          </div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-gray-400">
            <span>Contribution Score</span>
            <div className="relative group/tooltip">
              <Info className="w-4 h-4 text-pulse-400 cursor-help" />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-command-elevated border border-command-border rounded-lg shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 w-64 z-50">
                <p className="text-xs text-gray-300 normal-case tracking-normal leading-relaxed">
                  <span className="font-semibold text-pulse-400">How it's calculated:</span><br/>
                  • +1 point per incident reported<br/>
                  • +10 points for verified incidents<br/>
                  • +5 points for resolved incidents
                </p>
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-command-elevated border-b border-r border-command-border rotate-45"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="glass-heavy rounded-2xl p-6 sm:p-8 hover-lift shadow-lg hover:shadow-xl transition-all duration-300 border border-command-border hover:border-pulse-500/30">
          <div className="text-xl sm:text-2xl font-display font-bold text-white mb-3">
            {new Date(user?.createdAt).toLocaleDateString() || 'N/A'}
          </div>
          <div className="text-xs font-mono uppercase tracking-wider text-gray-400">Member Since</div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
