import { useState, useEffect } from 'react';
import { 
  TrendingUp,
  MapPin,
  Clock,
  AlertTriangle,
  Activity,
  Zap,
  Shield,
  BarChart3,
  PieChart,
  Info,
  RefreshCw,
  Download
} from 'lucide-react';
import { useIncidentStore } from '../store/incidentStore';
import { useUIStore } from '../store/uiStore';
import { cn } from '../lib/utils';
import {
  calculateCongestionScore,
  detectHotspots,
  analyzePeakHours
} from '../services/analyticsService';

// Hotspot card component
function HotspotCard({ hotspot, rank }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-4 hover:shadow-lg transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: hotspot.riskColor }}
          >
            #{rank}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 capitalize">
              {hotspot.riskLevel} Risk Zone
            </h3>
            <p className="text-sm text-gray-600">
              {hotspot.incidentCount} incidents
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold" style={{ color: hotspot.riskColor }}>
            {hotspot.score}
          </div>
          <div className="text-xs text-gray-500">Risk Score</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-gray-50 rounded-lg p-2">
          <div className="text-xs text-gray-600 mb-1">Frequency</div>
          <div className="font-semibold text-gray-900">{hotspot.details.frequency}%</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <div className="text-xs text-gray-600 mb-1">Severity</div>
          <div className="font-semibold text-gray-900">{hotspot.details.severity}%</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <div className="text-xs text-gray-600 mb-1">Recency</div>
          <div className="font-semibold text-gray-900">{hotspot.details.recency}%</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <div className="text-xs text-gray-600 mb-1">Types</div>
          <div className="font-semibold text-gray-900">{hotspot.details.uniqueTypes}</div>
        </div>
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
      >
        {expanded ? 'Show Less' : 'Show Details'}
      </button>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="text-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Location:</span>
              <span className="font-medium text-gray-900">
                {hotspot.lat.toFixed(4)}, {hotspot.lng.toFixed(4)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Most Common:</span>
              <span className="font-medium text-gray-900 capitalize">
                {hotspot.details.mostCommonType}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Avg Age:</span>
              <span className="font-medium text-gray-900">
                {hotspot.details.avgAge}
              </span>
            </div>
          </div>
          <a
            href={`/dashboard/map?lat=${hotspot.lat}&lng=${hotspot.lng}&zoom=15`}
            className="mt-3 w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-sm flex items-center justify-center space-x-2"
          >
            <MapPin className="w-4 h-4" />
            <span>View on Map</span>
          </a>
        </div>
      )}
    </div>
  );
}

// Peak hours chart
function PeakHoursChart({ data }) {
  const maxScore = Math.max(...data.map(d => d.weightedScore));

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
        <Clock className="w-5 h-5 mr-2 text-primary-600" />
        Peak Hours Analysis
      </h3>
      
      <div className="space-y-2 mb-4">
        {data.map((item) => {
          const height = maxScore > 0 ? (item.weightedScore / maxScore) * 100 : 0;
          const isPeak = height > 60;
          
          return (
            <div key={item.hour} className="flex items-center space-x-3">
              <div className="w-16 text-sm text-gray-600 font-medium">
                {item.hour === 0 ? '12 AM' : 
                 item.hour < 12 ? `${item.hour} AM` : 
                 item.hour === 12 ? '12 PM' :
                 `${item.hour - 12} PM`}
              </div>
              <div className="flex-1">
                <div className="h-8 bg-gray-100 rounded-lg overflow-hidden relative">
                  <div
                    className={cn(
                      "h-full rounded-lg transition-all duration-500",
                      isPeak ? "bg-red-500" : "bg-primary-500"
                    )}
                    style={{ width: `${height}%` }}
                  />
                  {item.count > 0 && (
                    <div className="absolute inset-0 flex items-center px-3">
                      <span className={cn(
                        "text-xs font-semibold",
                        height > 20 ? "text-white" : "text-gray-700"
                      )}>
                        {item.count} incidents
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AnalyticsPage() {
  const { incidents, fetchIncidents } = useIncidentStore();
  const { userLocation, addToast } = useUIStore();

  const [congestionData, setCongestionData] = useState(null);
  const [hotspots, setHotspots] = useState([]);
  const [peakHoursData, setPeakHoursData] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [timeWindow, setTimeWindow] = useState(30); // days

  // Calculate analytics
  const calculateAnalytics = () => {
    setIsCalculating(true);

    setTimeout(() => {
      // Congestion scoring
      if (userLocation) {
        const congestion = calculateCongestionScore({
          lat: userLocation.lat,
          lng: userLocation.lng,
          incidents,
          radius: 2000
        });
        setCongestionData(congestion);
      }

      // Hotspot detection
      const detectedHotspots = detectHotspots(incidents, {
        gridSize: 0.01,
        minIncidents: 3,
        timeWindowDays: timeWindow,
        scoreThreshold: 60
      });
      setHotspots(detectedHotspots);

      // Peak hours analysis
      const peakData = analyzePeakHours(incidents);
      setPeakHoursData(peakData);

      setIsCalculating(false);
      addToast('Analytics calculated successfully', 'success');
    }, 500);
  };

  useEffect(() => {
    if (incidents.length === 0) {
      fetchIncidents().catch(err => console.error('Failed to fetch incidents:', err));
    }
  }, []);

  useEffect(() => {
    if (incidents.length > 0) {
      calculateAnalytics();
    }
  }, [incidents, timeWindow, userLocation]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <BarChart3 className="w-8 h-8 mr-3" />
            Traffic Analytics
          </h1>
          <p className="text-primary-100 mb-4">
            Logic-based congestion scoring and hotspot detection
          </p>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">Time Window:</label>
              <select
                value={timeWindow}
                onChange={(e) => setTimeWindow(Number(e.target.value))}
                className="px-3 py-2 bg-white text-gray-900 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500"
              >
                <option value={7}>Last 7 Days</option>
                <option value={14}>Last 14 Days</option>
                <option value={30}>Last 30 Days</option>
                <option value={90}>Last 90 Days</option>
              </select>
            </div>
            <button
              onClick={calculateAnalytics}
              disabled={isCalculating}
              className="px-4 py-2 bg-white text-primary-700 rounded-lg hover:bg-primary-50 transition-colors font-medium flex items-center space-x-2"
            >
              <RefreshCw className={cn("w-4 h-4", isCalculating && "animate-spin")} />
              <span>Recalculate</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Algorithm Explanations */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-bold text-blue-900 mb-3 flex items-center">
            <Info className="w-5 h-5 mr-2" />
            About These Analytics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-900">
            <div>
              <h3 className="font-semibold mb-2">🚦 Congestion Scoring</h3>
              <p className="text-blue-800">
                <strong>Formula:</strong> Score = 0.30×Density + 0.35×Severity + 0.20×Recency + 0.15×Traffic Type
              </p>
              <p className="text-blue-800 mt-1">
                Uses exponential time decay (e^-0.1t) to weight recent incidents higher.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">🔥 Hotspot Detection</h3>
              <p className="text-blue-800">
                <strong>Method:</strong> Grid-based clustering with weighted scoring
              </p>
              <p className="text-blue-800 mt-1">
                Score = 0.4×Frequency + 0.3×Severity + 0.2×Recency + 0.1×Diversity (Shannon Entropy)
              </p>
            </div>
          </div>
        </div>

        {/* Congestion Score Card */}
        {congestionData && userLocation && (
          <div className="bg-white rounded-xl p-6 border-2 border-gray-200 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Activity className="w-6 h-6 mr-2 text-primary-600" />
              Current Location Congestion
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="mb-4">
                  <div className="text-6xl font-bold mb-2" style={{ color: congestionData.color }}>
                    {congestionData.score}
                  </div>
                  <div className="text-xl font-semibold text-gray-700">
                    {congestionData.label}
                  </div>
                </div>
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${congestionData.score}%`,
                      backgroundColor: congestionData.color
                    }}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Incidents Nearby</span>
                  <span className="font-bold text-gray-900">{congestionData.details.incidentCount}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Incident Density</span>
                  <span className="font-bold text-gray-900">{congestionData.details.density} per km²</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Avg Severity</span>
                  <span className="font-bold text-gray-900">{congestionData.details.avgSeverity}%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Traffic Type Ratio</span>
                  <span className="font-bold text-gray-900">{congestionData.details.trafficRatio}%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Time Decay Factor</span>
                  <span className="font-bold text-gray-900">{congestionData.details.timeDecay}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hotspots Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <AlertTriangle className="w-6 h-6 mr-2 text-red-600" />
              Detected Hotspots
            </h2>
            <span className="text-sm text-gray-600">
              {hotspots.length} high-risk zones identified
            </span>
          </div>

          {hotspots.length === 0 ? (
            <div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
              <Shield className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No Major Hotspots Detected
              </h3>
              <p className="text-gray-600">
                Your area is relatively safe with no concentrated incident zones.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hotspots.map((hotspot, idx) => (
                <HotspotCard key={hotspot.id} hotspot={hotspot} rank={idx + 1} />
              ))}
            </div>
          )}
        </div>

        {/* Peak Hours */}
        {peakHoursData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <PeakHoursChart data={peakHoursData.hourlyData} />
            </div>
            <div className="space-y-4">
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Peak Period</h3>
                <div className="text-4xl font-bold text-primary-600 mb-2 capitalize">
                  {peakHoursData.peakPeriod}
                </div>
                <p className="text-sm text-gray-600">
                  Highest incident frequency
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Insights</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="text-gray-600">Busiest Hour</div>
                    <div className="font-bold text-gray-900">
                      {peakHoursData.insights.busiestHour}:00 ({peakHoursData.insights.busiestHourCount} incidents)
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600">Quietest Hour</div>
                    <div className="font-bold text-gray-900">
                      {peakHoursData.insights.quietestHour}:00
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600">Average per Hour</div>
                    <div className="font-bold text-gray-900">
                      {peakHoursData.insights.avgIncidentsPerHour}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AnalyticsPage;
