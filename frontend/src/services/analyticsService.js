/**
 * Traffic Analytics Service
 * 
 * Provides logic-based algorithms for:
 * 1. Traffic Congestion Scoring
 * 2. Accident Hotspot Detection
 * 
 * No machine learning - pure algorithmic approaches
 */

import { calculateDistance } from '../lib/utils';

// ============================================================================
// TRAFFIC CONGESTION SCORING
// ============================================================================

/**
 * Calculate Traffic Congestion Score for a location
 * 
 * FORMULA:
 * Congestion Score = (Density Weight × Incident Density) + 
 *                    (Severity Weight × Avg Severity) +
 *                    (Time Weight × Time Decay Factor) +
 *                    (Type Weight × Traffic Type Ratio)
 * 
 * Score Range: 0-100
 * - 0-30: Low congestion (Green)
 * - 31-60: Moderate congestion (Yellow)
 * - 61-80: High congestion (Orange)
 * - 81-100: Severe congestion (Red)
 * 
 * @param {Object} params - Calculation parameters
 * @param {number} params.lat - Location latitude
 * @param {number} params.lng - Location longitude
 * @param {Array} params.incidents - Array of incident objects
 * @param {number} params.radius - Analysis radius in meters (default: 2000m = 2km)
 * @returns {Object} Congestion analysis result
 */
export function calculateCongestionScore({ lat, lng, incidents, radius = 2000 }) {
  // Filter incidents within radius
  const nearbyIncidents = incidents.filter(incident => {
    if (!incident.location?.coordinates) return false;
    const distance = calculateDistance(
      lat, lng,
      incident.location.coordinates[1],
      incident.location.coordinates[0]
    );
    return distance <= radius;
  });

  if (nearbyIncidents.length === 0) {
    return {
      score: 0,
      level: 'low',
      details: {
        incidentCount: 0,
        density: 0,
        avgSeverity: 0,
        trafficRatio: 0,
        timeDecay: 1
      }
    };
  }

  // 1. INCIDENT DENSITY COMPONENT
  // Formula: (Incident Count / Area) × Normalization Factor
  // Area = π × radius²
  const area = Math.PI * Math.pow(radius / 1000, 2); // Convert to km²
  const density = nearbyIncidents.length / area;
  // Normalize to 0-100 scale (assume max 50 incidents per km²)
  const normalizedDensity = Math.min((density / 50) * 100, 100);

  // 2. SEVERITY COMPONENT
  // Convert severity levels to numeric scores
  const severityScores = {
    'critical': 100,
    'severe': 80,
    'high': 60,
    'moderate': 40,
    'low': 20
  };
  
  const totalSeverity = nearbyIncidents.reduce((sum, incident) => {
    return sum + (severityScores[incident.severity] || 40);
  }, 0);
  const avgSeverity = totalSeverity / nearbyIncidents.length;

  // 3. TIME DECAY FACTOR
  // Recent incidents have more weight
  // Formula: e^(-λt) where λ = decay constant, t = time in hours
  // Decay constant λ = 0.1 (incidents lose 10% importance per hour)
  const now = Date.now();
  const timeWeights = nearbyIncidents.map(incident => {
    const ageHours = (now - new Date(incident.createdAt).getTime()) / (1000 * 60 * 60);
    return Math.exp(-0.1 * ageHours); // Exponential decay
  });
  const avgTimeWeight = timeWeights.reduce((a, b) => a + b, 0) / timeWeights.length;

  // 4. TRAFFIC TYPE RATIO
  // Traffic-specific incidents contribute more to congestion
  const trafficTypes = ['traffic', 'accident', 'construction'];
  const trafficIncidents = nearbyIncidents.filter(i => trafficTypes.includes(i.type));
  const trafficRatio = trafficIncidents.length / nearbyIncidents.length;
  const trafficScore = trafficRatio * 100;

  // FINAL SCORE CALCULATION
  // Weighted average of all components
  const weights = {
    density: 0.30,    // 30% - Number of incidents
    severity: 0.35,   // 35% - How severe they are
    time: 0.20,       // 20% - How recent they are
    traffic: 0.15     // 15% - Traffic-specific types
  };

  const score = Math.round(
    (weights.density * normalizedDensity) +
    (weights.severity * avgSeverity) +
    (weights.time * avgTimeWeight * 100) +
    (weights.traffic * trafficScore)
  );

  // Determine congestion level
  let level, color, label;
  if (score <= 30) {
    level = 'low';
    color = '#10b981'; // green
    label = 'Low Congestion';
  } else if (score <= 60) {
    level = 'moderate';
    color = '#f59e0b'; // yellow
    label = 'Moderate Congestion';
  } else if (score <= 80) {
    level = 'high';
    color = '#f97316'; // orange
    label = 'High Congestion';
  } else {
    level = 'severe';
    color = '#ef4444'; // red
    label = 'Severe Congestion';
  }

  return {
    score,
    level,
    color,
    label,
    details: {
      incidentCount: nearbyIncidents.length,
      density: density.toFixed(2),
      avgSeverity: avgSeverity.toFixed(1),
      trafficRatio: (trafficRatio * 100).toFixed(1),
      timeDecay: avgTimeWeight.toFixed(2),
      radius
    }
  };
}

// ============================================================================
// ACCIDENT HOTSPOT DETECTION
// ============================================================================

/**
 * Detect Accident Hotspots using Grid-Based Clustering
 * 
 * ALGORITHM:
 * 1. Divide area into grid cells (configurable size)
 * 2. Count incidents in each cell
 * 3. Calculate hotspot score per cell based on:
 *    - Incident frequency
 *    - Severity distribution
 *    - Time pattern (peak hours)
 *    - Incident type diversity
 * 4. Identify cells exceeding threshold as hotspots
 * 
 * HOTSPOT SCORE FORMULA:
 * Score = (Frequency × 0.4) + 
 *         (Severity × 0.3) + 
 *         (Recency × 0.2) + 
 *         (Diversity × 0.1)
 * 
 * Where:
 * - Frequency = Incident count normalized
 * - Severity = Average severity score
 * - Recency = Time-weighted factor
 * - Diversity = Entropy of incident types
 * 
 * @param {Array} incidents - Array of incident objects
 * @param {Object} options - Configuration options
 * @returns {Array} Array of hotspot objects
 */
export function detectHotspots(incidents, options = {}) {
  const {
    gridSize = 0.01,        // Grid cell size in degrees (~1km)
    minIncidents = 3,       // Minimum incidents to be considered a hotspot
    timeWindowDays = 30,    // Look at last N days
    scoreThreshold = 60     // Minimum score to be a hotspot
  } = options;

  // Filter incidents within time window
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - timeWindowDays);
  
  const recentIncidents = incidents.filter(incident => {
    const incidentDate = new Date(incident.createdAt);
    return incidentDate >= cutoffDate;
  });

  if (recentIncidents.length === 0) return [];

  // Create grid cells
  const grid = {};
  
  recentIncidents.forEach(incident => {
    if (!incident.location?.coordinates) return;
    
    const [lng, lat] = incident.location.coordinates;
    
    // Calculate grid cell ID
    const cellLat = Math.floor(lat / gridSize) * gridSize;
    const cellLng = Math.floor(lng / gridSize) * gridSize;
    const cellId = `${cellLat.toFixed(4)},${cellLng.toFixed(4)}`;
    
    if (!grid[cellId]) {
      grid[cellId] = {
        lat: cellLat + gridSize / 2, // Center of cell
        lng: cellLng + gridSize / 2,
        incidents: []
      };
    }
    
    grid[cellId].incidents.push(incident);
  });

  // Calculate hotspot scores for each cell
  const hotspots = [];
  
  Object.entries(grid).forEach(([cellId, cell]) => {
    const { incidents: cellIncidents, lat, lng } = cell;
    
    // Skip cells with too few incidents
    if (cellIncidents.length < minIncidents) return;

    // 1. FREQUENCY COMPONENT (40% weight)
    // Normalize by max observed incidents per cell
    const maxIncidents = Math.max(...Object.values(grid).map(c => c.incidents.length));
    const frequencyScore = (cellIncidents.length / maxIncidents) * 100;

    // 2. SEVERITY COMPONENT (30% weight)
    const severityScores = {
      'critical': 100,
      'severe': 80,
      'high': 60,
      'moderate': 40,
      'low': 20
    };
    
    const avgSeverity = cellIncidents.reduce((sum, inc) => {
      return sum + (severityScores[inc.severity] || 40);
    }, 0) / cellIncidents.length;

    // 3. RECENCY COMPONENT (20% weight)
    // More recent incidents increase hotspot relevance
    const now = Date.now();
    const avgAge = cellIncidents.reduce((sum, inc) => {
      const ageHours = (now - new Date(inc.createdAt).getTime()) / (1000 * 60 * 60);
      return sum + ageHours;
    }, 0) / cellIncidents.length;
    
    // Convert to score (newer = higher score)
    // Max age = timeWindowDays * 24 hours
    const maxAgeHours = timeWindowDays * 24;
    const recencyScore = Math.max(0, (1 - avgAge / maxAgeHours) * 100);

    // 4. DIVERSITY COMPONENT (10% weight)
    // Higher diversity of incident types indicates a problem area
    // Calculate Shannon Entropy: H = -Σ(p_i × log2(p_i))
    const typeCounts = {};
    cellIncidents.forEach(inc => {
      typeCounts[inc.type] = (typeCounts[inc.type] || 0) + 1;
    });
    
    const uniqueTypes = Object.keys(typeCounts).length;
    const entropy = Object.values(typeCounts).reduce((sum, count) => {
      const probability = count / cellIncidents.length;
      return sum - (probability * Math.log2(probability));
    }, 0);
    
    // Normalize entropy (max is log2(5) for 5 incident types)
    const maxEntropy = Math.log2(5);
    const diversityScore = (entropy / maxEntropy) * 100;

    // CALCULATE FINAL HOTSPOT SCORE
    const score = Math.round(
      (frequencyScore * 0.4) +
      (avgSeverity * 0.3) +
      (recencyScore * 0.2) +
      (diversityScore * 0.1)
    );

    // Only include if score exceeds threshold
    if (score >= scoreThreshold) {
      // Determine risk level
      let riskLevel, riskColor;
      if (score >= 85) {
        riskLevel = 'extreme';
        riskColor = '#dc2626';
      } else if (score >= 70) {
        riskLevel = 'high';
        riskColor = '#f97316';
      } else {
        riskLevel = 'moderate';
        riskColor = '#f59e0b';
      }

      hotspots.push({
        id: cellId,
        lat,
        lng,
        score,
        riskLevel,
        riskColor,
        incidentCount: cellIncidents.length,
        details: {
          frequency: frequencyScore.toFixed(1),
          severity: avgSeverity.toFixed(1),
          recency: recencyScore.toFixed(1),
          diversity: diversityScore.toFixed(1),
          avgAge: `${Math.round(avgAge)} hours`,
          uniqueTypes,
          typeBreakdown: typeCounts,
          mostCommonType: Object.entries(typeCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0]
        },
        incidents: cellIncidents
      });
    }
  });

  // Sort by score (highest first)
  hotspots.sort((a, b) => b.score - a.score);

  return hotspots;
}

// ============================================================================
// PEAK HOURS ANALYSIS
// ============================================================================

/**
 * Analyze Peak Traffic Hours
 * 
 * ALGORITHM:
 * 1. Group incidents by hour of day
 * 2. Weight by severity
 * 3. Identify hours with highest incident rate
 * 
 * @param {Array} incidents - Array of incident objects
 * @returns {Object} Peak hours analysis
 */
export function analyzePeakHours(incidents) {
  const hourlyData = Array(24).fill(0).map((_, hour) => ({
    hour,
    count: 0,
    severitySum: 0,
    incidents: []
  }));

  const severityWeights = {
    'critical': 5,
    'severe': 4,
    'high': 3,
    'moderate': 2,
    'low': 1
  };

  incidents.forEach(incident => {
    const date = new Date(incident.createdAt);
    const hour = date.getHours();
    
    hourlyData[hour].count++;
    hourlyData[hour].severitySum += severityWeights[incident.severity] || 2;
    hourlyData[hour].incidents.push(incident);
  });

  // Calculate weighted scores
  hourlyData.forEach(data => {
    data.weightedScore = data.count * (data.severitySum / Math.max(data.count, 1));
  });

  // Find peak hours (top 3)
  const sorted = [...hourlyData].sort((a, b) => b.weightedScore - a.weightedScore);
  const peakHours = sorted.slice(0, 3).map(d => d.hour);

  // Categorize times
  const timeLabels = {
    morning: [6, 7, 8, 9, 10],
    midday: [11, 12, 13, 14],
    afternoon: [15, 16, 17, 18],
    evening: [19, 20, 21],
    night: [22, 23, 0, 1, 2, 3, 4, 5]
  };

  const periodCounts = {
    morning: 0,
    midday: 0,
    afternoon: 0,
    evening: 0,
    night: 0
  };

  hourlyData.forEach(data => {
    Object.entries(timeLabels).forEach(([period, hours]) => {
      if (hours.includes(data.hour)) {
        periodCounts[period] += data.count;
      }
    });
  });

  const peakPeriod = Object.entries(periodCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0];

  return {
    hourlyData,
    peakHours,
    peakPeriod,
    periodCounts,
    insights: {
      busiestHour: sorted[0].hour,
      busiestHourCount: sorted[0].count,
      quietestHour: sorted[sorted.length - 1].hour,
      avgIncidentsPerHour: (incidents.length / 24).toFixed(1)
    }
  };
}

// ============================================================================
// ROUTE SAFETY SCORING
// ============================================================================

/**
 * Calculate Safety Score for a route
 * 
 * FORMULA:
 * Safety Score = 100 - (Incident Penalty + Severity Penalty + Hotspot Penalty)
 * 
 * Where penalties are calculated based on:
 * - Number of incidents along route
 * - Severity of those incidents
 * - Proximity to known hotspots
 * 
 * @param {Array} routeCoordinates - Array of [lng, lat] coordinates
 * @param {Array} incidents - Array of incident objects
 * @param {Array} hotspots - Array of hotspot objects
 * @param {number} buffer - Buffer distance in meters (default: 500m)
 * @returns {Object} Safety score and details
 */
export function calculateRouteSafety(routeCoordinates, incidents, hotspots = [], buffer = 500) {
  let incidentPenalty = 0;
  let severityPenalty = 0;
  let hotspotPenalty = 0;

  const incidentsNearRoute = [];
  const hotspotsNearRoute = [];

  // Check each route point
  routeCoordinates.forEach(([lng, lat]) => {
    // Check incidents
    incidents.forEach(incident => {
      if (!incident.location?.coordinates) return;
      
      const distance = calculateDistance(
        lat, lng,
        incident.location.coordinates[1],
        incident.location.coordinates[0]
      );

      if (distance <= buffer) {
        incidentsNearRoute.push(incident);
        
        // Incident penalty: 5 points per incident, reduced by distance
        const distanceFactor = 1 - (distance / buffer);
        incidentPenalty += 5 * distanceFactor;

        // Severity penalty
        const severityScores = {
          'critical': 20,
          'severe': 15,
          'high': 10,
          'moderate': 5,
          'low': 2
        };
        severityPenalty += (severityScores[incident.severity] || 5) * distanceFactor;
      }
    });

    // Check hotspots
    hotspots.forEach(hotspot => {
      const distance = calculateDistance(lat, lng, hotspot.lat, hotspot.lng);
      
      if (distance <= buffer * 2) { // Larger buffer for hotspots
        hotspotsNearRoute.push(hotspot);
        
        // Hotspot penalty: based on hotspot score and distance
        const distanceFactor = 1 - (distance / (buffer * 2));
        hotspotPenalty += (hotspot.score / 5) * distanceFactor;
      }
    });
  });

  // Calculate final safety score (0-100)
  const totalPenalty = Math.min(incidentPenalty + severityPenalty + hotspotPenalty, 100);
  const safetyScore = Math.max(0, 100 - totalPenalty);

  // Determine safety level
  let level, color, recommendation;
  if (safetyScore >= 80) {
    level = 'safe';
    color = '#10b981';
    recommendation = 'Route is safe with minimal incidents';
  } else if (safetyScore >= 60) {
    level = 'moderate';
    color = '#f59e0b';
    recommendation = 'Exercise caution, some incidents reported';
  } else if (safetyScore >= 40) {
    level = 'risky';
    color = '#f97316';
    recommendation = 'Consider alternative route';
  } else {
    level = 'dangerous';
    color = '#ef4444';
    recommendation = 'Avoid this route if possible';
  }

  return {
    score: Math.round(safetyScore),
    level,
    color,
    recommendation,
    details: {
      incidentsNearRoute: incidentsNearRoute.length,
      hotspotsNearRoute: hotspotsNearRoute.length,
      penalties: {
        incidents: incidentPenalty.toFixed(1),
        severity: severityPenalty.toFixed(1),
        hotspots: hotspotPenalty.toFixed(1),
        total: totalPenalty.toFixed(1)
      }
    },
    incidents: incidentsNearRoute,
    hotspots: hotspotsNearRoute
  };
}

export default {
  calculateCongestionScore,
  detectHotspots,
  analyzePeakHours,
  calculateRouteSafety
};
