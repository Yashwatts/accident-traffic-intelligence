import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Car,
  Construction,
  AlertTriangle,
  CloudRain,
  MapPin,
  Camera,
  Send,
  Loader,
  CheckCircle,
  XCircle,
  Navigation,
  Info
} from 'lucide-react';
import { useIncidentStore } from '../store/incidentStore';
import { useUIStore } from '../store/uiStore';
import { incidentsAPI } from '../lib/api';
import { cn } from '../lib/utils';

// Incident type configurations
const incidentTypes = [
  {
    id: 'accident',
    label: 'Vehicle Accident',
    icon: Car,
    color: 'bg-alert-critical',
    defaultSeverity: 'severe',
    description: 'Car crash, collision'
  },
  {
    id: 'traffic',
    label: 'Traffic Jam',
    icon: Car,
    color: 'bg-alert-high',
    defaultSeverity: 'moderate',
    description: 'Heavy congestion'
  },
  {
    id: 'hazard',
    label: 'Road Hazard',
    icon: AlertTriangle,
    color: 'bg-alert-moderate',
    defaultSeverity: 'high',
    description: 'Debris, pothole, danger'
  },
  {
    id: 'construction',
    label: 'Construction',
    icon: Construction,
    color: 'bg-pulse-600',
    defaultSeverity: 'low',
    description: 'Road work, lane closure'
  },
  {
    id: 'weather',
    label: 'Weather Alert',
    icon: CloudRain,
    color: 'bg-command-400',
    defaultSeverity: 'moderate',
    description: 'Flooding, ice, visibility'
  },
];

// Severity options
const severityLevels = [
  { value: 'low', label: 'Low', color: 'bg-alert-safe', emoji: '🟢' },
  { value: 'moderate', label: 'Moderate', color: 'bg-alert-moderate', emoji: '🟡' },
  { value: 'high', label: 'High', color: 'bg-alert-high', emoji: '🟠' },
  { value: 'severe', label: 'Severe', color: 'bg-alert-critical', emoji: '🔴' },
  { value: 'critical', label: 'Critical', color: 'bg-alert-critical', emoji: '⛔' },
];

function CreateIncidentPage() {
  const navigate = useNavigate();
  const { createIncident } = useIncidentStore();
  const { addToast, userLocation, setUserLocation } = useUIStore();

  // Form state
  const [selectedType, setSelectedType] = useState(null);
  const [severity, setSeverity] = useState('moderate');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [photos, setPhotos] = useState([]);

  // UI state
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: type, 2: details, 3: confirm

  // Auto-detect location on mount
  useEffect(() => {
    if (!userLocation) {
      handleGetLocation();
    } else {
      setLocation(userLocation);
      fetchAddress(userLocation);
    }
  }, [userLocation]);

  // Get user location
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    setIsLoadingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setLocation(loc);
        setUserLocation(loc);
        fetchAddress(loc);
        setIsLoadingLocation(false);
      },
      (error) => {
        console.error('Location error:', error);
        setLocationError('Unable to get your location. Please enable location services.');
        setIsLoadingLocation(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 30000,
        maximumAge: 60000,
      }
    );
  };

  // Fetch address from coordinates (reverse geocoding)
  const fetchAddress = async (loc) => {
    try {
      // Using OpenStreetMap Nominatim for reverse geocoding (free, no API key)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${loc.lat}&lon=${loc.lng}`
      );
      const data = await response.json();
      setAddress(data.display_name || 'Address not found');
    } catch (error) {
      console.error('Geocoding error:', error);
      setAddress(`${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`);
    }
  };

  // Handle type selection
  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setSeverity(type.defaultSeverity);
    setCurrentStep(2);
  };

  // Handle photo upload
  const handlePhotoChange = async (e) => {
    const files = Array.from(e.target.files);
    
    // Convert files to base64
    const base64Promises = files.map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });
    
    try {
      const base64Photos = await Promise.all(base64Promises);
      setPhotos([...photos, ...base64Photos]);
    } catch (error) {
      console.error('Error converting photos:', error);
      addToast({ type: 'error', message: 'Failed to process photos' });
    }
  };

  // Remove photo
  const removePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  // Handle submit with optimistic UI
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedType) {
      addToast({ type: 'error', message: 'Please select an incident type' });
      return;
    }

    if (!location) {
      addToast({ type: 'error', message: 'Location is required' });
      return;
    }

    setIsSubmitting(true);

    // Optimistic UI - show success with smooth transition
    setTimeout(() => setShowSuccess(true), 300);

    const incidentData = {
      type: selectedType.id,
      severity,
      description: description || `${selectedType.label} reported`,
      location: {
        type: 'Point',
        coordinates: [location.lng, location.lat],
      },
      address: {
        formattedAddress: address,
      },
      photos: photos.length > 0 ? photos : undefined,
    };

    try {
      // Actually submit in background
      await createIncident(incidentData);

      // Show success toast
      addToast({
        type: 'success',
        message: 'Incident reported successfully!',
        duration: 3000,
      });

      // Redirect after animation
      setTimeout(() => {
        navigate('/dashboard/map');
      }, 1800);
    } catch (error) {
      console.error('Submit error:', error);
      
      // Revert optimistic UI
      setShowSuccess(false);
      setIsSubmitting(false);

      addToast({
        type: 'error',
        message: error.message || 'Failed to report incident',
        duration: 5000,
      });
    }
  };

  // Success animation screen
  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-command-darker to-command-dark">
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 bg-gradient-to-br from-alert-safe to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce shadow-glow">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Report Submitted!</h2>
          <p className="text-gray-400">Thank you for keeping your community safe</p>
          <div className="mt-4">
            <Loader className="w-5 h-5 text-pulse-400 animate-spin mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="glass-heavy border-b border-command-border sticky top-0 z-10 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">Report Incident</h1>
              <p className="text-sm text-gray-400">Step {currentStep} of 2</p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="text-gray-400 hover:text-white transition-colors">
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="mt-4 h-1 bg-command-surface rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pulse-600 to-pulse-400 transition-all duration-300 shadow-glow"
              style={{ width: `${(currentStep / 2) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Step 1: Select Type */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                What's happening?
              </h2>
              <p className="text-gray-400">Select the type of incident</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {incidentTypes.map((type, idx) => (
                <button
                  key={type.id}
                  onClick={() => handleTypeSelect(type)}
                  className={cn(
                    "flex items-center p-4 rounded-xl border-2 transition-all duration-300 animate-fade-in",
                    "hover:shadow-glow hover:scale-[1.02] active:scale-[0.98] hover:-translate-y-0.5",
                    selectedType?.id === type.id
                      ? "border-pulse-500 glass-heavy shadow-glow scale-[1.02]"
                      : "border-command-border glass hover:border-pulse-500/30"
                  )}
                  style={{ animationDelay: `${idx * 80}ms` }}
                >
                  <div className={cn("p-3 rounded-lg shadow-glow transition-transform duration-300", type.color, selectedType?.id === type.id && "scale-110 rotate-3")}>
                    <type.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4 text-left flex-1">
                    <h3 className="font-semibold text-white transition-colors">{type.label}</h3>
                    <p className="text-sm text-gray-400">{type.description}</p>
                  </div>
                  {selectedType?.id === type.id && (
                    <CheckCircle className="w-6 h-6 text-pulse-400 animate-scale-in" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Details */}
        {currentStep === 2 && (
          <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
            {/* Location Section */}
            <div className="glass-heavy rounded-xl p-4 border border-command-border">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-white flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-pulse-400" />
                  Location
                </h3>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={isLoadingLocation}
                  className="text-sm text-pulse-400 hover:text-pulse-300 font-medium flex items-center transition-colors"
                >
                  {isLoadingLocation ? (
                    <>
                      <Loader className="w-4 h-4 mr-1 animate-spin" />
                      Getting...
                    </>
                  ) : (
                    <>
                      <Navigation className="w-4 h-4 mr-1" />
                      Refresh
                    </>
                  )}
                </button>
              </div>

              {locationError ? (
                <div className="flex items-start p-3 bg-alert-critical/10 border border-alert-critical rounded-lg">
                  <XCircle className="w-5 h-5 text-alert-critical mt-0.5 mr-2 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-alert-critical">{locationError}</p>
                    <button
                      type="button"
                      onClick={handleGetLocation}
                      className="text-sm text-alert-critical font-medium mt-1 hover:underline"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              ) : location ? (
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-alert-safe mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-white font-medium">Location detected</p>
                    <p className="text-xs text-gray-400 mt-1">{address}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Loader className="w-6 h-6 text-pulse-400 animate-spin mx-auto" />
                  <p className="text-sm text-gray-400 mt-2">Detecting location...</p>
                </div>
              )}
            </div>

            {/* Severity Selection */}
            <div className="glass-heavy rounded-xl p-4 border border-command-border">
              <h3 className="font-semibold text-white mb-3">Severity Level</h3>
              <div className="grid grid-cols-5 gap-2">
                {severityLevels.map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => setSeverity(level.value)}
                    className={cn(
                      "p-3 rounded-lg border-2 transition-all",
                      "hover:scale-105 active:scale-95",
                      severity === level.value
                        ? "border-gray-900 shadow-lg"
                        : "border-gray-200"
                    )}
                  >
                    <div className="text-2xl mb-1">{level.emoji}</div>
                    <div className="text-xs font-medium text-gray-700">
                      {level.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Description (Optional) */}
            <div className="glass-heavy rounded-xl p-4 border border-command-border">
              <label className="block font-semibold text-white mb-2">
                Additional Details
                <span className="text-sm text-gray-400 font-normal ml-2">(Optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Any additional information..."
                rows={3}
                className="w-full px-3 py-2 bg-command-surface border border-command-border text-white placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent resize-none"
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1 text-right">
                {description.length}/500
              </p>
            </div>

            {/* Photos (Optional) */}
            <div className="glass-heavy rounded-xl p-4 border border-command-border">
              <label className="block font-semibold text-white mb-3">
                Photos
                <span className="text-sm text-gray-400 font-normal ml-2">(Optional)</span>
              </label>
              
              {photos.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img
                        src={photo}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-command-border"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-alert-critical text-white rounded-full flex items-center justify-center hover:bg-alert-severe transition-colors shadow-lg"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <label className="flex items-center justify-center p-4 border-2 border-dashed border-command-border rounded-lg hover:border-pulse-500 cursor-pointer transition-colors bg-command-surface/50 hover:bg-command-surface">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                <Camera className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-300">Add photos</span>
              </label>
            </div>

            {/* Info Banner */}
            <div className="flex items-start p-3 bg-pulse-500/10 border border-pulse-500/30 rounded-lg">
              <Info className="w-5 h-5 text-pulse-400 mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-sm text-gray-300">
                Your report helps emergency responders and your community stay informed.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="flex-1 px-6 py-4 glass border border-command-border text-gray-300 rounded-xl font-semibold hover:bg-pulse-500/10 hover:border-pulse-500/30 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !location}
                className={cn(
                  "flex-1 px-6 py-4 rounded-xl font-semibold transition-all duration-300",
                  "flex items-center justify-center space-x-2",
                  isSubmitting || !location
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed opacity-60"
                    : "btn-primary hover-pulse shadow-glow-sm hover:shadow-glow"
                )}
              >
                {isSubmitting ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span className="loading-dots flex gap-1\">
                      Submitting<span>.</span><span>.</span><span>.</span>
                    </span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 transition-transform group-hover:translate-x-0.5\" />
                    <span>Submit Report</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Bottom spacing for mobile */}
      <div className="h-20 md:h-0" />
    </div>
  );
}

export default CreateIncidentPage;
