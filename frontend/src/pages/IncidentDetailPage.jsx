import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  User,
  Calendar,
  Trash2,
  Flag
} from 'lucide-react';
import { useIncidentStore } from '../store/incidentStore';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { cn, formatRelativeTime, getSeverityColor } from '../lib/utils';
import { incidentsAPI } from '../lib/api';
import { ConfirmModal } from '../components/common/Modal';

function IncidentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedIncident, fetchIncident } = useIncidentStore();
  const { user } = useAuthStore();
  const { addToast } = useUIStore();
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(false);

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      fetchIncident(id)
        .catch(err => {
          console.error('Error fetching incident:', err);
          addToast('Failed to load incident details', 'error');
          navigate('/dashboard/incidents');
        })
        .finally(() => setIsLoading(false));
    }
  }, [id]);

  const handleDelete = async () => {
    try {
      // TODO: Implement API call when endpoint is ready
      // await incidentsAPI.delete(id);
      addToast('Delete functionality coming soon', 'info');
      // navigate('/dashboard/incidents');
    } catch (error) {
      console.error('Error deleting incident:', error);
      addToast('Failed to delete incident', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pulse-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading incident details...</p>
        </div>
      </div>
    );
  }

  if (!selectedIncident) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Incident Not Found</h2>
          <p className="text-gray-400 mb-6">The incident you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/dashboard/incidents')}
            className="px-6 py-3 bg-gradient-to-r from-pulse-600 to-pulse-700 text-white rounded-lg hover:from-pulse-500 hover:to-pulse-600 transition-all shadow-glow"
          >
            Back to Incidents
          </button>
        </div>
      </div>
    );
  }

  const incident = selectedIncident;
  const severityColor = getSeverityColor(incident.severity);
  const isOwner = user?.id === incident.reportedBy?._id || user?.id === incident.reportedBy;
  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-400 hover:text-white mb-4 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Incident Details</h1>
              <div className="flex items-center space-x-3">
                <span className={cn(
                  "px-3 py-1 rounded-full text-sm font-medium",
                  severityColor
                )}>
                  {incident.severity}
                </span>
                <span className={cn(
                  "px-3 py-1 rounded-full text-sm font-medium",
                  incident.status === 'active' ? 'bg-pulse-500/20 text-pulse-300' :
                  incident.status === 'pending' ? 'bg-alert-moderate/20 text-alert-moderate' :
                  incident.status === 'resolved' ? 'bg-alert-safe/20 text-alert-safe' :
                  'bg-command-surface text-gray-400'
                )}>
                  {incident.status}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-neon-violet/20 text-neon-violet">
                  {incident.type}
                </span>
              </div>
            </div>
            
            {(isOwner || isAdmin) && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setDeleteModal(true)}
                  className="p-2 text-gray-400 hover:text-alert-critical hover:bg-alert-critical/10 rounded-lg transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="glass-heavy rounded-xl p-6 border border-command-border">
              <h2 className="text-xl font-semibold text-white mb-4">Description</h2>
              <p className="text-gray-300 whitespace-pre-wrap">
                {incident.description || 'No description provided.'}
              </p>
            </div>

            {/* Location */}
            <div className="glass-heavy rounded-xl p-6 border border-command-border">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-pulse-400" />
                Location
              </h2>
              <div className="space-y-2">
                {incident.address?.formattedAddress && (
                  <p className="text-gray-300">{incident.address.formattedAddress}</p>
                )}
                {incident.location?.coordinates && (
                  <p className="text-sm text-gray-400">
                    Coordinates: {incident.location.coordinates[1]?.toFixed(6)}, {incident.location.coordinates[0]?.toFixed(6)}
                  </p>
                )}
              </div>
              
              {/* Map Preview */}
              {incident.location?.coordinates && (
                <div className="mt-4 h-64 bg-command-surface rounded-lg overflow-hidden border border-command-border">
                  <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${incident.location.coordinates[0]-0.01},${incident.location.coordinates[1]-0.01},${incident.location.coordinates[0]+0.01},${incident.location.coordinates[1]+0.01}&layer=mapnik&marker=${incident.location.coordinates[1]},${incident.location.coordinates[0]}`}
                  />
                </div>
              )}
            </div>

            {/* Photos */}
            {incident.photos && incident.photos.length > 0 && (
              <div className="glass-heavy rounded-xl p-6 border border-command-border">
                <h2 className="text-xl font-semibold text-white mb-4">Photos</h2>
                <div className="grid grid-cols-2 gap-4">
                  {incident.photos.map((photo, index) => (
                    <img
                      key={index}
                      src={photo}
                      alt={`Incident photo ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg border border-command-border"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Reported By */}
            <div className="glass-heavy rounded-xl p-6 border border-command-border">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-pulse-400" />
                Reported By
              </h2>
              <div className="space-y-2">
                <p className="font-medium text-white">
                  {incident.reportedBy?.firstName} {incident.reportedBy?.lastName}
                </p>
                <p className="text-sm text-gray-400">{incident.reportedBy?.email}</p>
                {incident.reportedBy?.phoneNumber && (
                  <p className="text-sm text-gray-400">{incident.reportedBy.phoneNumber}</p>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="glass-heavy rounded-xl p-6 border border-command-border">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-pulse-400" />
                Timeline
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-400">Reported</p>
                  <p className="font-medium text-white">
                    {formatRelativeTime(incident.createdAt)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(incident.createdAt).toLocaleString()}
                  </p>
                </div>
                
                {incident.updatedAt !== incident.createdAt && (
                  <div>
                    <p className="text-sm text-gray-400">Last Updated</p>
                    <p className="font-medium text-white">
                      {formatRelativeTime(incident.updatedAt)}
                    </p>
                  </div>
                )}

                {incident.verifiedAt && (
                  <div>
                    <p className="text-sm text-gray-400">Verified</p>
                    <p className="font-medium text-white">
                      {formatRelativeTime(incident.verifiedAt)}
                    </p>
                    {incident.verifiedBy && (
                      <p className="text-xs text-gray-500">
                        by {incident.verifiedBy.firstName} {incident.verifiedBy.lastName}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Verification Status */}
            <div className="glass-heavy rounded-xl p-6 border border-command-border">
              <h2 className="text-lg font-semibold text-white mb-4">Status</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Current Status</span>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium",
                    incident.status === 'active' ? 'bg-pulse-500/20 text-pulse-300' :
                    incident.status === 'pending' ? 'bg-alert-moderate/20 text-alert-moderate' :
                    incident.status === 'resolved' ? 'bg-alert-safe/20 text-alert-safe' :
                    incident.status === 'rejected' ? 'bg-alert-critical/20 text-alert-critical' :
                    'bg-command-surface text-gray-400'
                  )}>
                    {incident.status}
                  </span>
                </div>

                {incident.verified && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Verified</span>
                    <CheckCircle className="w-5 h-5 text-status-resolved" />
                  </div>
                )}
                
                {incident.updateCount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Updates</span>
                    <span className="text-sm font-medium text-white">{incident.updateCount}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Admin Actions */}
            {isAdmin && !incident.verified && (
              <button
                onClick={async () => {
                  try {
                    await incidentsAPI.verify(id);
                    addToast('Incident verified successfully', 'success');
                    // Reload incident details
                    await fetchIncident(id);
                  } catch (error) {
                    console.error('Error verifying incident:', error);
                    addToast('Failed to verify incident', 'error');
                  }
                }}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-status-resolved to-green-600 text-white rounded-lg hover:from-status-resolved/90 hover:to-green-500 transition-all shadow-lg"
              >
                <Flag className="w-5 h-5" />
                <span>Verify Incident</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
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

export default IncidentDetailPage;
