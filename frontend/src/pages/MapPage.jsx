import { useEffect, useState, useRef, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Circle } from '@react-google-maps/api';
import { 
  MapPin, 
  Filter, 
  Layers, 
  Navigation, 
  RefreshCw,
  AlertCircle,
  X,
  ChevronDown,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { socketManager } from '../lib/socket';
import { useIncidentStore } from '../store/incidentStore';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { cn, formatRelativeTime, getSeverityColor, calculateDistance } from '../lib/utils';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
const libraries = ['places'];

const mapContainerStyle = {
  width: '100%',
  height: '100vh'
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: false,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
};

// Get marker icon based on severity
const getMarkerIcon = (severity) => {
  const colors = {
    low: '#22c55e',
    moderate: '#eab308',
    high: '#f97316',
    severe: '#ef4444',
    critical: '#dc2626'
  };

  const color = colors[severity] || colors.moderate;

  return {
    path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
    fillColor: color,
    fillOpacity: 1,
    strokeColor: '#ffffff',
    strokeWeight: 3,
    scale: 12,
  };
};

// Filter panel component
function FilterPanel({ filters, setFilters, isOpen, onClose }) {
  const severityOptions = ['all', 'low', 'moderate', 'high', 'severe', 'critical'];
  const statusOptions = ['all', 'active', 'in-progress', 'on-scene', 'resolved'];
  const typeOptions = ['all', 'accident', 'traffic', 'hazard', 'construction', 'weather', 'other'];

  if (!isOpen) return null;

  return (
    <div className="absolute top-4 right-4 z-[1000] w-80 bg-white rounded-xl shadow-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 flex items-center">
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Severity Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Severity
          </label>
          <select
            value={filters.severity}
            onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {severityOptions.map(option => (
              <option key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {statusOptions.map(option => (
              <option key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type
          </label>
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {typeOptions.map(option => (
              <option key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Radius Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Radius: {filters.radius}km
          </label>
          <input
            type="range"
            min="1"
            max="50"
            value={filters.radius}
            onChange={(e) => setFilters({ ...filters, radius: parseInt(e.target.value) })}
            className="w-full"
          />
        </div>

        {/* Reset Button */}
        <button
          onClick={() => setFilters({
            severity: 'all',
            status: 'all',
            type: 'all',
            radius: 10
          })}
          className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
}

// Incident list sidebar
function IncidentList({ incidents, selectedIncident, onSelect, isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="absolute top-4 left-4 z-[1000] w-80 max-h-[calc(100vh-120px)] bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900 flex items-center">
          <AlertCircle className="w-4 h-4 mr-2" />
          Active Incidents ({incidents.length})
        </h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {incidents.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No incidents in this area</p>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {incidents.map(incident => (
              <button
                key={incident._id || incident.id}
                onClick={() => onSelect(incident)}
                className={cn(
                  "w-full text-left p-3 rounded-lg transition-all",
                  selectedIncident?._id === incident._id || selectedIncident?.id === incident.id
                    ? "bg-primary-50 border-2 border-primary-500"
                    : "bg-white border border-gray-200 hover:border-primary-300 hover:shadow-sm"
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="font-medium text-gray-900 text-sm">
                    {incident.type}
                  </span>
                  <span className={cn(
                    "px-2 py-0.5 text-xs font-medium rounded-full",
                    getSeverityColor(incident.severity)
                  )}>
                    {incident.severity}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-1 line-clamp-2">
                  {incident.address?.formattedAddress || 'Location not available'}
                </p>
                <p className="text-xs text-gray-500">
                  {formatRelativeTime(incident.createdAt)}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Main Map Page Component
function MapPage() {
  const { incidents, fetchNearbyIncidents, addIncident, updateIncidentFromSocket, removeIncident } = useIncidentStore();
  const { user } = useAuthStore();
  const { userLocation, setUserLocation } = useUIStore();
  
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: libraries,
    id: 'google-maps-script'
  });
  
  // Use user's alertRadius from profile settings
  const userAlertRadius = user?.notificationPreferences?.alertRadius || 10;
  
  const [filters, setFilters] = useState({
    severity: 'all',
    status: 'all',
    type: 'all',
    radius: userAlertRadius
  });
  
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showIncidentList, setShowIncidentList] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showRadiusCircle, setShowRadiusCircle] = useState(true);
  const [map, setMap] = useState(null);
  const [center, setCenter] = useState(userLocation || { lat: 20.5937, lng: 78.9629 }); // User location or Center of India
  const [zoom, setZoom] = useState(userLocation ? 13 : 5);

  // India geographical bounds
  const indiaBounds = {
    north: 35.5,
    south: 6.5,
    west: 68.0,
    east: 97.5
  };

  // Update radius when user's alertRadius changes
  useEffect(() => {
    setFilters(prev => ({ ...prev, radius: userAlertRadius }));
  }, [userAlertRadius]);

  const onLoad = useCallback((map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Get user location with better error handling
  useEffect(() => {
    if (!userLocation) {
      if (navigator.geolocation) {
        setIsLoading(true);
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            setUserLocation(location);
            setCenter(location);
            setZoom(13);
            setIsLoading(false);
          },
          (error) => {
            console.error('Error getting location:', error.message);
            // Default to San Francisco if location fails
            const defaultLocation = { lat: 37.7749, lng: -122.4194 };
            setUserLocation(defaultLocation);
            setCenter(defaultLocation);
            setIsLoading(false);
          },
          {
            enableHighAccuracy: false,
            timeout: 30000,
            maximumAge: 60000
          }
        );
      } else {
        console.error('Geolocation is not supported by this browser.');
        const defaultLocation = { lat: 37.7749, lng: -122.4194 };
        setUserLocation(defaultLocation);
        setCenter(defaultLocation);
      }
    } else {
      setCenter(userLocation);
      setZoom(13);
    }
  }, [userLocation, setUserLocation]);

  // Fetch nearby incidents
  useEffect(() => {
    if (userLocation) {
      setIsLoading(true);
      fetchNearbyIncidents(userLocation.lat, userLocation.lng, filters.radius)
        .catch(err => console.error('Error fetching incidents:', err))
        .finally(() => setIsLoading(false));
    }
  }, [userLocation, filters.radius, fetchNearbyIncidents]);

  // Setup socket listeners for real-time updates
  useEffect(() => {
    const socket = socketManager.socket;
    
    if (socket && userLocation) {
      // Subscribe to location-based updates
      socketManager.subscribeToLocation(userLocation.lat, userLocation.lng, filters.radius)
        .catch(err => console.error('Socket subscription error:', err));

      // Listen for new incidents
      socket.on('incident:created', (data) => {
        console.log('New incident received:', data);
        addIncident(data.incident);
      });

      // Listen for incident updates
      socket.on('incident:updated', (data) => {
        console.log('Incident updated:', data);
        updateIncidentFromSocket(data.incidentId, data.incident);
      });

      // Listen for cleared incidents
      socket.on('incident:cleared', (data) => {
        console.log('Incident cleared:', data);
        removeIncident(data.incidentId);
      });

      return () => {
        socket.off('incident:created');
        socket.off('incident:updated');
        socket.off('incident:cleared');
      };
    }
  }, [userLocation, filters.radius, addIncident, updateIncidentFromSocket, removeIncident]);

  // Filter incidents - show only active and verified incidents
  const filteredIncidents = incidents.filter(incident => {
    if (!incident || !incident._id) return false; // Safety check for undefined incidents
    
    // Only show active and verified incidents (exclude resolved, rejected, pending)
    if (incident.status !== 'active' && incident.status !== 'verified') {
      return false;
    }
    
    // Filter by distance from user location
    if (userLocation && incident.location?.coordinates) {
      const incidentLat = incident.location.coordinates[1];
      const incidentLng = incident.location.coordinates[0];
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        incidentLat,
        incidentLng
      );
      // Convert distance from meters to km and check if within radius
      if (distance / 1000 > filters.radius) {
        return false;
      }
    }
    
    if (filters.severity !== 'all' && incident.severity !== filters.severity) return false;
    if (filters.status !== 'all' && incident.status !== filters.status) return false;
    if (filters.type !== 'all' && incident.type !== filters.type) return false;
    return true;
  });

  // Handle refresh
  const handleRefresh = () => {
    if (userLocation) {
      setIsLoading(true);
      fetchNearbyIncidents(userLocation.lat, userLocation.lng, filters.radius)
        .finally(() => setIsLoading(false));
    }
  };

  // Handle locate me
  const handleLocateMe = () => {
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          setCenter(location);
          setZoom(15);
          if (map) {
            map.panTo(location);
          }
          setIsLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsLoading(false);
        },
        {
          enableHighAccuracy: false,
          timeout: 30000,
          maximumAge: 60000
        }
      );
    }
  };

  // Handle incident selection
  const handleIncidentSelect = (incident) => {
    setSelectedIncident(incident);
    const incidentLocation = {
      lat: incident.location.coordinates[1],
      lng: incident.location.coordinates[0]
    };
    setCenter(incidentLocation);
    setZoom(16);
    if (map) {
      map.panTo(incidentLocation);
    }
  };

  if (loadError) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-900 font-semibold mb-2">Error loading maps</p>
          <p className="text-gray-600">Please check your internet connection and refresh the page</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-primary-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          ...mapOptions,
          restriction: {
            latLngBounds: indiaBounds,
            strictBounds: true
          },
          minZoom: 5
        }}
      >
          {/* User location marker */}
          {userLocation && (
            <>
              <Marker
                position={userLocation}
                icon={{
                  path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
                  fillColor: '#4285F4',
                  fillOpacity: 1,
                  strokeColor: '#ffffff',
                  strokeWeight: 3,
                  scale: 10,
                }}
                title="Your Location"
              />
              {showRadiusCircle && (
                <Circle
                  center={userLocation}
                  radius={filters.radius * 1000} // User's alert radius from settings (km to meters)
                  options={{
                    fillColor: '#3b82f6',
                    fillOpacity: 0.1,
                    strokeColor: '#3b82f6',
                    strokeOpacity: 0.4,
                    strokeWeight: 2,
                  }}
                />
              )}
            </>
          )}

          {/* Incident markers */}
          {filteredIncidents.map(incident => (
            <Marker
              key={incident._id || incident.id}
              position={{
                lat: incident.location.coordinates[1],
                lng: incident.location.coordinates[0]
              }}
              icon={getMarkerIcon(incident.severity)}
              onClick={() => setSelectedIncident(incident)}
              title={incident.type}
            />
          ))}

          {/* Info window for selected incident */}
          {selectedIncident && (
            <InfoWindow
              position={{
                lat: selectedIncident.location.coordinates[1],
                lng: selectedIncident.location.coordinates[0]
              }}
              onCloseClick={() => setSelectedIncident(null)}
            >
              <div className="p-2 min-w-[200px]">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 text-sm">{selectedIncident.type}</h3>
                  <span className={cn(
                    "px-2 py-0.5 text-xs font-medium rounded-full ml-2",
                    getSeverityColor(selectedIncident.severity)
                  )}>
                    {selectedIncident.severity}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-1">
                  {selectedIncident.address?.formattedAddress || 'Location not available'}
                </p>
                <p className="text-xs text-gray-500 mb-2">
                  {formatRelativeTime(selectedIncident.createdAt)}
                </p>
                <a
                  href={`/dashboard/incidents/${selectedIncident._id || selectedIncident.id}`}
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                >
                  View Details →
                </a>
              </div>
            </InfoWindow>
          )}
      </GoogleMap>

      {/* Control Buttons */}
      <div className="absolute top-4 right-4 z-[999] flex flex-col space-y-2">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "p-3 bg-white rounded-lg shadow-lg hover:shadow-xl transition-all",
            showFilters && "bg-primary-50 text-primary-600"
          )}
          title="Filters"
        >
          <Filter className="w-5 h-5" />
        </button>

        <button
          onClick={() => setShowIncidentList(!showIncidentList)}
          className={cn(
            "p-3 bg-white rounded-lg shadow-lg hover:shadow-xl transition-all",
            showIncidentList && "bg-primary-50 text-primary-600"
          )}
          title="Incident List"
        >
          <Layers className="w-5 h-5" />
        </button>

        <button
          onClick={handleLocateMe}
          className="p-3 bg-white rounded-lg shadow-lg hover:shadow-xl transition-all"
          title="Locate Me"
        >
          <Navigation className="w-5 h-5" />
        </button>

        <button
          onClick={handleRefresh}
          className={cn(
            "p-3 bg-white rounded-lg shadow-lg hover:shadow-xl transition-all",
            isLoading && "animate-spin"
          )}
          title="Refresh"
          disabled={isLoading}
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Zoom Controls */}
      <div className="absolute bottom-24 right-4 z-[999] flex flex-col space-y-2">
        <button
          onClick={() => {
            setZoom(zoom + 1);
            if (map) map.setZoom(zoom + 1);
          }}
          className="p-3 bg-white rounded-lg shadow-lg hover:shadow-xl transition-all"
          title="Zoom In"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <button
          onClick={() => {
            setZoom(zoom - 1);
            if (map) map.setZoom(zoom - 1);
          }}
          className="p-3 bg-white rounded-lg shadow-lg hover:shadow-xl transition-all"
          title="Zoom Out"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
      </div>

      {/* Filter Panel */}
      <FilterPanel
        filters={filters}
        setFilters={setFilters}
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
      />

      {/* Incident List */}
      <IncidentList
        incidents={filteredIncidents}
        selectedIncident={selectedIncident}
        onSelect={handleIncidentSelect}
        isOpen={showIncidentList}
        onClose={() => setShowIncidentList(false)}
      />

      {/* Stats Bar */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[999] bg-white rounded-full shadow-lg px-6 py-3 flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-gray-700">Live</span>
        </div>
        <div className="w-px h-4 bg-gray-300"></div>
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-primary-600" />
          <span className="text-sm font-medium text-gray-700">
            {filteredIncidents.length} Incidents
          </span>
        </div>
        <div className="w-px h-4 bg-gray-300"></div>
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-primary-600" />
          <span className="text-sm font-medium text-gray-700">
            {filters.radius}km radius
          </span>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-[1001] bg-white rounded-lg shadow-lg px-4 py-2 flex items-center space-x-2">
          <RefreshCw className="w-4 h-4 text-primary-600 animate-spin" />
          <span className="text-sm text-gray-700">Updating...</span>
        </div>
      )}

    </div>
  );
}

export default MapPage;
