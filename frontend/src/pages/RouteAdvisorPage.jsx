import { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, DirectionsRenderer, Marker, Autocomplete } from '@react-google-maps/api';
import { 
  Navigation, 
  MapPin, 
  Clock, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Play,
  Square,
  ArrowRight,
  RefreshCw,
  Target,
  Route as RouteIcon,
  AlertCircle,
  X
} from 'lucide-react';
import { useUIStore } from '../store/uiStore';
import { useIncidentStore } from '../store/incidentStore';
import { cn, formatDistance, calculateDistance } from '../lib/utils';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
const libraries = ['places'];

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

// India geographical bounds
const indiaBounds = {
  north: 35.5,
  south: 6.5,
  west: 68.0,
  east: 97.5
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
  restriction: {
    latLngBounds: indiaBounds,
    strictBounds: true
  },
  minZoom: 5
};

function RouteAdvisorPage() {
  const { userLocation, setUserLocation, addToast } = useUIStore();
  const { incidents } = useIncidentStore();

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: libraries,
    id: 'google-maps-script'
  });

  const [map, setMap] = useState(null);
  const [originAutocomplete, setOriginAutocomplete] = useState(null);
  const [destinationAutocomplete, setDestinationAutocomplete] = useState(null);
  
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [originPlace, setOriginPlace] = useState(null);
  const [destinationPlace, setDestinationPlace] = useState(null);
  
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [incidentsOnRoute, setIncidentsOnRoute] = useState([]);
  
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [progress, setProgress] = useState(0);
  
  const originRef = useRef(null);
  const destinationRef = useRef(null);
  const navigationIntervalRef = useRef(null);

  const onLoad = useCallback((map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
    if (navigationIntervalRef.current) {
      clearInterval(navigationIntervalRef.current);
    }
  }, []);

  const onOriginLoad = (autocomplete) => {
    setOriginAutocomplete(autocomplete);
  };

  const onDestinationLoad = (autocomplete) => {
    setDestinationAutocomplete(autocomplete);
  };

  const onOriginPlaceChanged = () => {
    if (originAutocomplete !== null) {
      const place = originAutocomplete.getPlace();
      if (place.geometry) {
        setOriginPlace(place);
        setOrigin(place.formatted_address || place.name);
      }
    }
  };

  const onDestinationPlaceChanged = () => {
    if (destinationAutocomplete !== null) {
      const place = destinationAutocomplete.getPlace();
      if (place.geometry) {
        setDestinationPlace(place);
        setDestination(place.formatted_address || place.name);
      }
    }
  };

  const useCurrentLocation = (field) => {
    if (!navigator.geolocation) {
      addToast('Geolocation is not supported by your browser', 'error');
      return;
    }

    addToast('Getting your location...', 'info');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const currentLoc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        // Update UI store with user location
        setUserLocation(currentLoc);

        const location = {
          geometry: {
            location: {
              lat: () => currentLoc.lat,
              lng: () => currentLoc.lng
            }
          },
          formatted_address: 'Current Location'
        };

        if (field === 'origin') {
          setOriginPlace(location);
          setOrigin('Current Location');
        } else {
          setDestinationPlace(location);
          setDestination('Current Location');
        }

        addToast('Location set successfully', 'success');
      },
      (error) => {
        console.error('Error getting location:', error);
        let errorMessage = 'Unable to get your location';
        
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = 'Location permission denied. Please enable location access.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = 'Location information unavailable.';
        } else if (error.code === error.TIMEOUT) {
          errorMessage = 'Location request timed out.';
        }
        
        addToast(errorMessage, 'error');
      },
      {
        enableHighAccuracy: false,
        timeout: 30000,
        maximumAge: 60000
      }
    );
  };

  const calculateRoute = async () => {
    if (!originPlace || !destinationPlace) {
      addToast('Please select both origin and destination', 'error');
      return;
    }

    try {
      const directionsService = new window.google.maps.DirectionsService();
      
      const results = await directionsService.route({
        origin: {
          lat: originPlace.geometry.location.lat(),
          lng: originPlace.geometry.location.lng()
        },
        destination: {
          lat: destinationPlace.geometry.location.lat(),
          lng: destinationPlace.geometry.location.lng()
        },
        travelMode: window.google.maps.TravelMode.DRIVING,
      });

      setDirectionsResponse(results);
      
      // Extract route information
      const route = results.routes[0];
      const leg = route.legs[0];
      
      setRouteInfo({
        distance: leg.distance.text,
        duration: leg.duration.text,
        distanceValue: leg.distance.value,
        durationValue: leg.duration.value,
      });

      // Check for incidents along the route
      checkIncidentsOnRoute(route);
      
      addToast('Route calculated successfully', 'success');
    } catch (error) {
      console.error('Error calculating route:', error);
      addToast('Failed to calculate route', 'error');
    }
  };

  const checkIncidentsOnRoute = (route) => {
    const path = route.overview_path;
    const nearbyIncidents = [];

    incidents.forEach(incident => {
      if (!incident.location?.coordinates) return;
      
      // Only include active incidents (exclude resolved, rejected, pending)
      if (incident.status === 'resolved' || incident.status === 'rejected' || incident.status === 'pending') {
        return;
      }
      
      const incidentLat = incident.location.coordinates[1];
      const incidentLng = incident.location.coordinates[0];

      // Check if incident is near any point on the route (within 500m)
      for (let point of path) {
        const distance = window.google.maps.geometry.spherical.computeDistanceBetween(
          new window.google.maps.LatLng(incidentLat, incidentLng),
          point
        );
        
        if (distance <= 500) {
          nearbyIncidents.push(incident);
          break;
        }
      }
    });

    setIncidentsOnRoute(nearbyIncidents);
  };

  const startNavigation = () => {
    if (!directionsResponse) {
      addToast('Please calculate a route first', 'error');
      return;
    }

    if (!navigator.geolocation) {
      addToast('Geolocation is not supported by your browser', 'error');
      return;
    }

    setIsNavigating(true);
    setProgress(0);
    addToast('Starting navigation... Follow the blue route', 'info');

    // Get destination coordinates
    const destination = {
      lat: destinationPlace.geometry.location.lat(),
      lng: destinationPlace.geometry.location.lng()
    };

    // Watch user's real-time position
    navigationIntervalRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const userPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        setCurrentPosition(userPos);

        // Calculate distance to destination
        const distanceToDestination = window.google.maps.geometry.spherical.computeDistanceBetween(
          new window.google.maps.LatLng(userPos.lat, userPos.lng),
          new window.google.maps.LatLng(destination.lat, destination.lng)
        );

        // Calculate progress based on remaining distance
        const totalDistance = routeInfo.distanceValue;
        const remainingDistance = distanceToDestination;
        const progressPercent = Math.max(0, Math.min(100, ((totalDistance - remainingDistance) / totalDistance) * 100));
        setProgress(progressPercent);

        // Check if user reached destination (within 50 meters)
        if (distanceToDestination < 50) {
          stopNavigation();
          addToast('🎉 You have arrived at your destination!', 'success');
          return;
        }

        // Keep map centered on user's position
        if (map) {
          map.panTo(userPos);
        }
      },
      (error) => {
        console.error('Navigation error:', error);
        addToast('Unable to get your location. Please check GPS settings.', 'error');
        stopNavigation();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const stopNavigation = () => {
    setIsNavigating(false);
    if (navigationIntervalRef.current) {
      navigator.geolocation.clearWatch(navigationIntervalRef.current);
      navigationIntervalRef.current = null;
    }
  };

  const clearRoute = () => {
    setDirectionsResponse(null);
    setRouteInfo(null);
    setIncidentsOnRoute([]);
    setOrigin('');
    setDestination('');
    setOriginPlace(null);
    setDestinationPlace(null);
    stopNavigation();
  };

  if (loadError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Map Loading Error</h2>
          <p className="text-gray-600">Failed to load Google Maps. Please check your API key.</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Route Advisor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <RouteIcon className="w-8 h-8 mr-3" />
            Route Advisor
          </h1>
          <p className="text-primary-100">
            Find the best route and navigate with real-time incident awareness
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Input Section */}
        <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Origin Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Starting Point
              </label>
              <div className="flex items-center space-x-2">
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                  <Autocomplete
                    onLoad={onOriginLoad}
                    onPlaceChanged={onOriginPlaceChanged}
                    options={{
                      componentRestrictions: { country: 'in' },
                      bounds: indiaBounds,
                      strictBounds: true
                    }}
                  >
                    <input
                      ref={originRef}
                      type="text"
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                      placeholder="Enter starting location"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </Autocomplete>
                </div>
                <button
                  onClick={() => useCurrentLocation('origin')}
                  className="p-3 bg-primary-100 text-primary-600 rounded-lg hover:bg-primary-200 transition-colors"
                  title="Use current location"
                >
                  <Target className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Destination Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Destination
              </label>
              <div className="flex items-center space-x-2">
                <div className="flex-1 relative">
                  <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                  <Autocomplete
                    onLoad={onDestinationLoad}
                    onPlaceChanged={onDestinationPlaceChanged}
                    options={{
                      componentRestrictions: { country: 'in' },
                      bounds: indiaBounds,
                      strictBounds: true
                    }}
                  >
                    <input
                      ref={destinationRef}
                      type="text"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="Enter destination"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </Autocomplete>
                </div>
                <button
                  onClick={() => useCurrentLocation('destination')}
                  className="p-3 bg-primary-100 text-primary-600 rounded-lg hover:bg-primary-200 transition-colors"
                  title="Use current location"
                >
                  <Target className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={calculateRoute}
              disabled={!originPlace || !destinationPlace}
              className={cn(
                "flex-1 py-3 rounded-lg font-semibold text-white transition-all flex items-center justify-center space-x-2",
                !originPlace || !destinationPlace
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-primary-600 hover:bg-primary-700"
              )}
            >
              <RouteIcon className="w-5 h-5" />
              <span>Calculate Route</span>
            </button>

            {directionsResponse && !isNavigating && (
              <button
                onClick={startNavigation}
                className="flex-1 py-3 rounded-lg font-semibold text-white bg-green-600 hover:bg-green-700 transition-all flex items-center justify-center space-x-2"
              >
                <Play className="w-5 h-5" />
                <span>Start Navigation</span>
              </button>
            )}

            {isNavigating && (
              <button
                onClick={stopNavigation}
                className="flex-1 py-3 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 transition-all flex items-center justify-center space-x-2"
              >
                <Square className="w-5 h-5" />
                <span>Stop Navigation</span>
              </button>
            )}

            {directionsResponse && (
              <button
                onClick={clearRoute}
                className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title="Clear route"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            )}
          </div>
        </div>

        {/* Route Info */}
        {routeInfo && (
          <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                <MapPin className="w-8 h-8 text-blue-600" />
                <div>
                  <div className="text-xs text-blue-600 font-semibold">Distance</div>
                  <div className="text-xl font-bold text-blue-900">{routeInfo.distance}</div>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
                <Clock className="w-8 h-8 text-green-600" />
                <div>
                  <div className="text-xs text-green-600 font-semibold">Duration</div>
                  <div className="text-xl font-bold text-green-900">{routeInfo.duration}</div>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg">
                <AlertTriangle className="w-8 h-8 text-red-600" />
                <div>
                  <div className="text-xs text-red-600 font-semibold">Incidents</div>
                  <div className="text-xl font-bold text-red-900">{incidentsOnRoute.length} on route</div>
                </div>
              </div>
            </div>

            {/* Incidents Warning */}
            {incidentsOnRoute.length > 0 && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-900 mb-1">
                      Incidents on Your Route
                    </h4>
                    <ul className="text-sm text-yellow-800 space-y-1">
                      {incidentsOnRoute.map((incident, index) => (
                        <li key={incident._id || index}>
                          • {incident.type} - {incident.severity}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Map */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden" style={{ height: '600px' }}>
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={
              currentPosition ||
              (originPlace && {
                lat: originPlace.geometry.location.lat(),
                lng: originPlace.geometry.location.lng()
              }) ||
              userLocation ||
              { lat: 20.5937, lng: 78.9629 } // Center of India
            }
            zoom={isNavigating ? 17 : 13}
            options={mapOptions}
            onLoad={onLoad}
            onUnmount={onUnmount}
          >
            {/* Directions */}
            {directionsResponse && (
              <DirectionsRenderer
                directions={directionsResponse}
                options={{
                  polylineOptions: {
                    strokeColor: '#2563eb',
                    strokeWeight: 5,
                  },
                  suppressMarkers: isNavigating, // Hide default markers during navigation
                }}
              />
            )}

            {/* Navigation Car Marker */}
            {isNavigating && currentPosition && (
              <Marker
                position={currentPosition}
                icon={{
                  path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                  fillColor: '#2563eb',
                  fillOpacity: 1,
                  strokeColor: '#ffffff',
                  strokeWeight: 2,
                  scale: 7,
                  rotation: 0, // In production, calculate bearing
                }}
              />
            )}

            {/* All Incident Markers */}
            {incidents.filter(i => i.location?.coordinates && i.status !== 'resolved' && i.status !== 'rejected').map((incident) => {
              const severityColors = {
                low: '#22c55e',
                moderate: '#eab308',
                high: '#f97316',
                severe: '#ef4444',
                critical: '#dc2626'
              };

              // Check if this incident is on the route (highlight it differently)
              const isOnRoute = incidentsOnRoute.some(i => i._id === incident._id);

              return (
                <Marker
                  key={incident._id}
                  position={{
                    lat: incident.location.coordinates[1],
                    lng: incident.location.coordinates[0]
                  }}
                  icon={{
                    path: window.google.maps.SymbolPath.CIRCLE,
                    fillColor: severityColors[incident.severity] || '#eab308',
                    fillOpacity: isOnRoute ? 1 : 0.6,
                    strokeColor: isOnRoute ? '#ffffff' : '#666666',
                    strokeWeight: isOnRoute ? 3 : 2,
                    scale: isOnRoute ? 12 : 8,
                  }}
                  title={`${incident.type} - ${incident.severity}${isOnRoute ? ' (On Route)' : ''}`}
                />
              );
            })}
          </GoogleMap>
        </div>
      </div>
    </div>
  );
}

export default RouteAdvisorPage;
