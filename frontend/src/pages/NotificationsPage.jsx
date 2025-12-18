import { useState, useEffect } from 'react';
import { 
  Bell, 
  BellOff,
  AlertCircle, 
  MapPin, 
  Clock,
  X,
  Check,
  Filter,
  Archive,
  ChevronDown,
  Navigation,
  Volume2,
  VolumeX
} from 'lucide-react';
import { socketManager } from '../lib/socket';
import { useUIStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';
import { cn, formatRelativeTime, getSeverityColor, calculateDistance, formatDistance } from '../lib/utils';

// Alert priority levels
const getPriorityLevel = (severity, distance) => {
  // Distance in meters, closer = higher priority
  if (distance < 500) {
    if (severity === 'critical' || severity === 'severe') return 'urgent';
    if (severity === 'high') return 'high';
    return 'medium';
  }
  if (distance < 2000) {
    if (severity === 'critical' || severity === 'severe') return 'high';
    return 'medium';
  }
  return 'low';
};

const priorityConfig = {
  urgent: {
    color: 'bg-red-600',
    textColor: 'text-red-700',
    borderColor: 'border-red-500',
    bgColor: 'bg-red-50',
    label: '🚨 URGENT',
    ring: 'ring-red-500'
  },
  high: {
    color: 'bg-orange-500',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-500',
    bgColor: 'bg-orange-50',
    label: '⚠️ High Priority',
    ring: 'ring-orange-500'
  },
  medium: {
    color: 'bg-yellow-500',
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-500',
    bgColor: 'bg-yellow-50',
    label: '⚡ Medium',
    ring: 'ring-yellow-500'
  },
  low: {
    color: 'bg-blue-500',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-500',
    bgColor: 'bg-blue-50',
    label: 'ℹ️ Info',
    ring: 'ring-blue-500'
  }
};

// Alert card component
function AlertCard({ alert, onDismiss, userLocation }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const distance = userLocation && alert.location 
    ? calculateDistance(
        userLocation.lat,
        userLocation.lng,
        alert.location.coordinates[1],
        alert.location.coordinates[0]
      )
    : null;

  const priority = getPriorityLevel(alert.severity, distance);
  const config = priorityConfig[priority];

  return (
    <div
      className={cn(
        "rounded-xl border-2 p-4 transition-all duration-300 animate-fade-in",
        config.borderColor,
        config.bgColor,
        priority === 'urgent' && 'animate-pulse shadow-lg',
        alert.dismissed && 'opacity-60'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start space-x-3 flex-1">
          <div className={cn("p-2 rounded-lg", config.color)}>
            <AlertCircle className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wide">
                {alert.type === 'verification' ? '✅ VERIFIED' : 
                 alert.type === 'resolution' ? '✅ RESOLVED' : 
                 alert.type === 'report' ? '📋 NEW REPORT' : 
                 config.label}
              </span>
              {alert.severity && alert.severity !== 'success' && alert.severity !== 'info' && (
                <span className={cn(
                  "px-2 py-0.5 text-xs font-medium rounded-full",
                  getSeverityColor(alert.severity)
                )}>
                  {alert.severity}
                </span>
              )}
            </div>
            <h3 className="font-semibold text-gray-900">
              {alert.incidentType ? `${alert.incidentType} - ${alert.description}` : alert.type}
            </h3>
          </div>
        </div>

        {!alert.dismissed && (
          <button
            onClick={() => onDismiss(alert.id)}
            className="p-1 hover:bg-white/50 rounded-lg transition-colors"
            title="Dismiss"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        )}
      </div>

      {/* Distance and Time */}
      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
        {distance && (
          <div className="flex items-center space-x-1">
            <Navigation className="w-4 h-4" />
            <span className="font-medium">{formatDistance(distance)} away</span>
          </div>
        )}
        <div className="flex items-center space-x-1">
          <Clock className="w-4 h-4" />
          <span>{formatRelativeTime(alert.createdAt)}</span>
        </div>
      </div>

      {/* Location */}
      <div className="flex items-start space-x-2 text-sm text-gray-700 mb-3">
        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <span className="line-clamp-2">{alert.address}</span>
      </div>

      {/* Description (Expandable) */}
      {alert.description && (
        <div>
          <p className={cn(
            "text-sm text-gray-700",
            !isExpanded && "line-clamp-2"
          )}>
            {alert.description}
          </p>
          {alert.resolutionNotes && (
            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-xs font-medium text-green-800 mb-1">Resolution Notes:</p>
              <p className="text-sm text-green-700">{alert.resolutionNotes}</p>
            </div>
          )}
          {alert.description.length > 100 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium mt-1 flex items-center"
            >
              {isExpanded ? 'Show less' : 'Read more'}
              <ChevronDown className={cn(
                "w-4 h-4 ml-1 transition-transform",
                isExpanded && "rotate-180"
              )} />
            </button>
          )}
        </div>
      )}

      {/* Actions */}
      {!alert.dismissed && (
        <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={() => onDismiss(alert.id)}
            className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm flex items-center justify-center space-x-1"
          >
            <Check className="w-4 h-4" />
            <span>Dismiss</span>
          </button>
          {alert.location && alert.location.coordinates ? (
            <a
              href={`/dashboard/map?lat=${alert.location.coordinates[1]}&lng=${alert.location.coordinates[0]}`}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-sm flex items-center justify-center space-x-1"
            >
              <MapPin className="w-4 h-4" />
              <span>View on Map</span>
            </a>
          ) : alert.incidentId && (
            <a
              href={`/dashboard/incidents/${alert.incidentId}`}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-sm flex items-center justify-center space-x-1"
            >
              <AlertCircle className="w-4 h-4" />
              <span>View Details</span>
            </a>
          )}
        </div>
      )}
    </div>
  );
}

// Filter dropdown
function FilterDropdown({ filter, setFilter }) {
  const [isOpen, setIsOpen] = useState(false);

  const options = [
    { value: 'all', label: 'All Alerts' },
    { value: 'urgent', label: '🚨 Urgent Only' },
    { value: 'active', label: 'Active Only' },
    { value: 'dismissed', label: 'Dismissed' },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Filter className="w-4 h-4" />
        <span className="text-sm font-medium">
          {options.find(o => o.value === filter)?.label}
        </span>
        <ChevronDown className={cn(
          "w-4 h-4 transition-transform",
          isOpen && "rotate-180"
        )} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
            {options.map(option => (
              <button
                key={option.value}
                onClick={() => {
                  setFilter(option.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors",
                  filter === option.value && "bg-primary-50 text-primary-700 font-medium"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function NotificationsPage() {
  const { userLocation } = useUIStore();
  const { user } = useAuthStore();
  
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Load alerts from localStorage on mount
  useEffect(() => {
    const savedAlerts = localStorage.getItem('incident_alerts');
    if (savedAlerts) {
      setAlerts(JSON.parse(savedAlerts));
    }
    setIsLoading(false);
  }, []);

  // Save alerts to localStorage
  useEffect(() => {
    if (alerts.length > 0) {
      localStorage.setItem('incident_alerts', JSON.stringify(alerts));
    }
  }, [alerts]);

  // Setup socket listeners for real-time alerts
  useEffect(() => {
    const socket = socketManager.socket;
    
    if (socket && userLocation && notificationsEnabled) {
      // Subscribe to location-based updates
      socketManager.subscribeToLocation(
        userLocation.lat, 
        userLocation.lng, 
        user?.notificationPreferences?.alertRadius || 10
      ).catch(err => console.error('Socket subscription error:', err));

      // Listen for new incidents
      const handleNewIncident = (data) => {
        const newAlert = {
          id: data.incident.id || Date.now(),
          type: data.incident.type,
          severity: data.incident.severity,
          description: data.incident.description,
          location: data.incident.location,
          address: data.incident.address?.formattedAddress || 'Location not available',
          createdAt: data.incident.createdAt || new Date().toISOString(),
          dismissed: false,
        };

        // Add to alerts
        setAlerts(prev => [newAlert, ...prev]);

        // Play sound if enabled
        if (soundEnabled) {
          const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZRQ0PVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZ');
        }

        // Request browser notification permission if needed
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('New Incident Alert', {
            body: `${newAlert.type} reported nearby`,
            icon: '/logo.png',
            badge: '/logo.png',
          });
        }
      };

      // Listen for incident verification
      const handleIncidentVerified = (data) => {
        const newAlert = {
          id: `verified-${data.incident._id || Date.now()}`,
          type: 'verification',
          severity: 'info',
          description: 'Your incident has been verified by an admin',
          incidentType: data.incident.type,
          incidentId: data.incident._id,
          address: data.incident.address?.formattedAddress || 'N/A',
          createdAt: new Date().toISOString(),
          dismissed: false,
        };

        // Add to alerts
        setAlerts(prev => [newAlert, ...prev]);

        // Play sound if enabled
        if (soundEnabled) {
          const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZRQ0PVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZ');
        }

        // Request browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Incident Verified', {
            body: data.message || 'Your incident has been verified',
            icon: '/logo.png',
            badge: '/logo.png',
          });
        }
      };

      // Listen for new incident reports (admins only)
      const handleIncidentCreated = (data) => {
        if (user?.role === 'admin' || user?.role === 'responder') {
          const newAlert = {
            id: `created-${data.incident._id || Date.now()}`,
            type: 'report',
            severity: data.incident.severity,
            description: `New ${data.incident.type} reported`,
            incidentType: data.incident.type,
            incidentId: data.incident._id,
            address: data.incident.address?.formattedAddress || 'Location not available',
            createdAt: new Date().toISOString(),
            dismissed: false,
          };

          setAlerts(prev => [newAlert, ...prev]);

          if (soundEnabled) {
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZRQ0PVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZ');
            audio.play().catch(() => {});
          }

          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('New Incident Report', {
              body: `${data.incident.type} reported - ${data.incident.severity} severity`,
              icon: '/logo.png',
              badge: '/logo.png',
            });
          }
        }
      };

      // Listen for incident resolution
      const handleIncidentResolved = (data) => {
        console.log('🎉 Incident resolved event received:', data);
        const newAlert = {
          id: `resolved-${data.incident._id || Date.now()}`,
          type: 'resolution',
          severity: 'success',
          description: 'Your incident has been resolved',
          incidentType: data.incident.type,
          incidentId: data.incident._id,
          address: data.incident.address?.formattedAddress || 'N/A',
          resolutionNotes: data.incident.resolutionNotes,
          createdAt: new Date().toISOString(),
          dismissed: false,
        };

        console.log('Adding alert to list:', newAlert);
        // Add to alerts
        setAlerts(prev => {
          console.log('Previous alerts:', prev.length);
          return [newAlert, ...prev];
        });

        // Play sound if enabled
        if (soundEnabled) {
          const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZRQ0PVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZ');
          audio.play().catch(() => {});
        }

        // Request browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Incident Resolved', {
            body: data.message || 'Your incident has been marked as resolved',
            icon: '/logo.png',
            badge: '/logo.png',
          });
        }
      };

      // Listen for incident rejection
      const handleIncidentRejected = (data) => {
        const newAlert = {
          id: `rejected-${data.incident._id || Date.now()}`,
          type: 'rejection',
          severity: 'warning',
          description: 'Your incident has been rejected by admin',
          incidentType: data.incident.type,
          incidentId: data.incident._id,
          address: data.incident.address?.formattedAddress || 'N/A',
          createdAt: new Date().toISOString(),
          dismissed: false,
        };

        // Add to alerts
        setAlerts(prev => [newAlert, ...prev]);

        // Play sound if enabled
        if (soundEnabled) {
          const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZRQ0PVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZ');
          audio.play().catch(() => {});
        }

        // Request browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Incident Rejected', {
            body: data.message || 'Your incident has been rejected',
            icon: '/logo.png',
            badge: '/logo.png',
          });
        }
      };

      // Listen for incident becoming active in user's area
      const handleIncidentActive = (data) => {
        // Only show if it's not the user's own incident and it's in their area
        if (data.incident.reportedBy?._id !== user?.id && userLocation && data.incident.location?.coordinates) {
          const distance = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            data.incident.location.coordinates[1],
            data.incident.location.coordinates[0]
          );
          
          const alertRadius = (user?.notificationPreferences?.alertRadius || 10) * 1000; // Convert to meters
          
          if (distance <= alertRadius) {
            const newAlert = {
              id: `active-${data.incident._id || Date.now()}`,
              type: data.incident.type,
              severity: data.incident.severity,
              description: `${data.incident.type} reported nearby - Now Active`,
              location: data.incident.location,
              address: data.incident.address?.formattedAddress || 'Location not available',
              createdAt: new Date().toISOString(),
              dismissed: false,
              incidentId: data.incident._id,
            };

            // Add to alerts
            setAlerts(prev => [newAlert, ...prev]);

            // Play sound if enabled
            if (soundEnabled) {
              const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZRQ0PVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZRQwPVa3m76pZGAg+mtvuwG8iBzGH0fPTgjMGHm7A7+OZ');
              audio.play().catch(() => {});
            }

            // Request browser notification
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('New Active Incident Nearby', {
                body: `${data.incident.type} (${data.incident.severity}) - ${formatDistance(distance)}`,
                icon: '/logo.png',
                badge: '/logo.png',
              });
            }
          }
        }
      };

      socket.on('incident:created', user?.role === 'admin' || user?.role === 'responder' ? handleIncidentCreated : handleNewIncident);
      socket.on('incident:verified', handleIncidentVerified);
      socket.on('incident:resolved', handleIncidentResolved);
      socket.on('incident:rejected', handleIncidentRejected);
      socket.on('incident:updated', handleIncidentActive);

      return () => {
        socket.off('incident:created', user?.role === 'admin' || user?.role === 'responder' ? handleIncidentCreated : handleNewIncident);
        socket.off('incident:verified', handleIncidentVerified);
        socket.off('incident:resolved', handleIncidentResolved);
        socket.off('incident:rejected', handleIncidentRejected);
        socket.off('incident:updated', handleIncidentActive);
      };
    }
  }, [userLocation, notificationsEnabled, soundEnabled, user]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Dismiss alert
  const handleDismiss = (alertId) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, dismissed: true } : alert
    ));
  };

  // Dismiss all
  const handleDismissAll = () => {
    setAlerts(prev => prev.map(alert => ({ ...alert, dismissed: true })));
  };

  // Clear history
  const handleClearHistory = () => {
    setAlerts(prev => prev.filter(alert => !alert.dismissed));
    localStorage.removeItem('incident_alerts');
  };

  // Filter alerts
  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'active') return !alert.dismissed;
    if (filter === 'dismissed') return alert.dismissed;
    if (filter === 'urgent') {
      const distance = userLocation && alert.location 
        ? calculateDistance(
            userLocation.lat,
            userLocation.lng,
            alert.location.coordinates[1],
            alert.location.coordinates[0]
          )
        : 10000;
      return getPriorityLevel(alert.severity, distance) === 'urgent' && !alert.dismissed;
    }
    return true;
  });

  // Count active alerts
  const activeCount = alerts.filter(a => !a.dismissed).length;
  const urgentCount = alerts.filter(a => {
    if (a.dismissed) return false;
    const distance = userLocation && a.location 
      ? calculateDistance(
          userLocation.lat,
          userLocation.lng,
          a.location.coordinates[1],
          a.location.coordinates[0]
        )
      : 10000;
    return getPriorityLevel(a.severity, distance) === 'urgent';
  }).length;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Bell className="w-6 h-6 mr-2" />
                Alerts
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {activeCount} active · {urgentCount} urgent
              </p>
            </div>

            {/* Notification toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  soundEnabled 
                    ? "bg-primary-100 text-primary-600" 
                    : "bg-gray-100 text-gray-600"
                )}
                title={soundEnabled ? "Sound on" : "Sound off"}
              >
                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  notificationsEnabled 
                    ? "bg-primary-100 text-primary-600" 
                    : "bg-gray-100 text-gray-600"
                )}
                title={notificationsEnabled ? "Notifications on" : "Notifications off"}
              >
                {notificationsEnabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <FilterDropdown filter={filter} setFilter={setFilter} />
            
            <div className="flex items-center space-x-2">
              {activeCount > 0 && (
                <button
                  onClick={handleDismissAll}
                  className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                >
                  Dismiss All
                </button>
              )}
              {alerts.some(a => a.dismissed) && (
                <button
                  onClick={handleClearHistory}
                  className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  <Archive className="w-4 h-4" />
                  <span>Clear History</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading alerts...</p>
            </div>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Bell className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {filter === 'dismissed' ? 'No dismissed alerts' : 'No alerts yet'}
            </h3>
            <p className="text-gray-600 text-center max-w-md">
              {notificationsEnabled 
                ? "You'll receive real-time alerts about incidents in your area"
                : "Enable notifications to receive alerts"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAlerts.map(alert => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onDismiss={handleDismiss}
                userLocation={userLocation}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationsPage;
