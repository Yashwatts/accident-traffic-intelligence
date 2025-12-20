import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  AlertCircle, 
  MapPin, 
  Users, 
  Clock, 
  Shield, 
  Zap, 
  Bell,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Globe,
  Smartphone,
  Radio,
  Eye,
  Activity
} from 'lucide-react';
import { cn } from '../lib/utils';

// Animated incident marker for the map visualization
function IncidentMarker({ x, y, severity, delay = 0 }) {
  const severityColors = {
    critical: 'bg-alert-critical',
    high: 'bg-alert-high',
    moderate: 'bg-alert-moderate',
    low: 'bg-alert-info'
  };

  return (
    <div 
      className="absolute animate-ping-slow"
      style={{ 
        left: `${x}%`, 
        top: `${y}%`,
        animationDelay: `${delay}ms`
      }}
    >
      <div className={cn(
        "w-3 h-3 rounded-full shadow-glow",
        severityColors[severity]
      )} />
      <div className={cn(
        "absolute inset-0 rounded-full animate-pulse opacity-50",
        severityColors[severity]
      )} />
    </div>
  );
}

// Live activity ticker
function LiveActivityTicker() {
  const [activities, setActivities] = useState([
    { id: 1, text: 'Accident reported on Highway 42', time: '2s ago', severity: 'critical' },
    { id: 2, text: 'Traffic cleared on Main Street', time: '15s ago', severity: 'low' },
    { id: 3, text: 'Road hazard detected near City Center', time: '32s ago', severity: 'high' },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newActivities = [
        'Vehicle collision on Route 5',
        'Construction zone ahead on Park Ave',
        'Weather alert: Heavy rain affecting visibility',
        'Emergency services responding to incident',
        'Traffic congestion building on Interstate'
      ];
      
      setActivities(prev => {
        const newActivity = {
          id: Date.now(),
          text: newActivities[Math.floor(Math.random() * newActivities.length)],
          time: 'Just now',
          severity: ['critical', 'high', 'moderate', 'low'][Math.floor(Math.random() * 4)]
        };
        return [newActivity, ...prev].slice(0, 3);
      });
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-2">
      {activities.map((activity) => (
        <div 
          key={activity.id}
          className="flex items-center gap-2 text-sm animate-slide-down"
        >
          <Activity className={cn(
            "w-4 h-4",
            activity.severity === 'critical' ? 'text-alert-critical' :
            activity.severity === 'high' ? 'text-alert-high' :
            activity.severity === 'moderate' ? 'text-alert-moderate' :
            'text-alert-info'
          )} />
          <span className="text-gray-300 flex-1">{activity.text}</span>
          <span className="text-gray-500 text-xs">{activity.time}</span>
        </div>
      ))}
    </div>
  );
}

// Animated counter component
function AnimatedCounter({ end, duration = 2000, suffix = '' }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      setCount(Math.floor(end * percentage));
      
      if (percentage < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [end, duration]);

  return <span>{count.toLocaleString()}{suffix}</span>;
}

// City card component
function CityCard({ name, state, incidents, isActive }) {
  return (
    <div className={cn(
      "p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer",
      isActive 
        ? "border-pulse-500 glass-heavy shadow-glow scale-105" 
        : "border-command-border glass hover:border-pulse-400 hover:shadow-glow"
    )}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <MapPin className={cn(
            "w-5 h-5",
            isActive ? "text-pulse-400" : "text-gray-500"
          )} />
          <h3 className="font-semibold text-white">{name}</h3>
        </div>
        {isActive && (
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-alert-safe rounded-full animate-pulse shadow-glow"></div>
            <span className="text-xs text-alert-safe font-medium">Live</span>
          </div>
        )}
      </div>
      <p className="text-sm text-gray-400 mb-2">{state}</p>
      <div className="flex items-center space-x-2">
        <AlertCircle className="w-4 h-4 text-alert-high" />
        <span className="text-sm font-medium text-gray-300">
          {incidents} active incidents
        </span>
      </div>
    </div>
  );
}

// Feature card component
function FeatureCard({ icon: Icon, title, description }) {
  return (
    <div className="p-6 glass-heavy rounded-xl border border-command-border hover:shadow-glow transition-all duration-300 hover:-translate-y-1">
      <div className="w-12 h-12 bg-gradient-to-br from-pulse-600 to-pulse-800 rounded-lg flex items-center justify-center mb-4 shadow-glow">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}

function HomePage() {
  const [activeCityIndex, setActiveCityIndex] = useState(0);
  const [stats, setStats] = useState({
    totalIncidents: 15234,
    activeUsers: 8456,
    citiesCovered: 127,
    avgResponseTime: 4.2
  });

  const cities = [
    { name: 'Mumbai', state: 'Maharashtra', incidents: 45 },
    { name: 'Delhi', state: 'Delhi NCR', incidents: 67 },
    { name: 'Bengaluru', state: 'Karnataka', incidents: 52 },
    { name: 'Hyderabad', state: 'Telangana', incidents: 38 },
    { name: 'Chennai', state: 'Tamil Nadu', incidents: 41 },
    { name: 'Kolkata', state: 'West Bengal', incidents: 33 },
  ];

  const features = [
    {
      icon: Zap,
      title: 'Real-time Updates',
      description: 'Get instant notifications about incidents in your area with live WebSocket connections.'
    },
    {
      icon: MapPin,
      title: 'Location-based Alerts',
      description: 'Receive alerts for incidents within your customizable radius using geolocation.'
    },
    {
      icon: Shield,
      title: 'Verified Reports',
      description: 'All incidents are verified by our community and responders for accuracy.'
    },
    {
      icon: Bell,
      title: 'Smart Notifications',
      description: 'Customizable notification preferences for different severity levels.'
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Join thousands of users helping keep their communities informed and safe.'
    },
    {
      icon: TrendingUp,
      title: 'Analytics Dashboard',
      description: 'Track incident patterns and trends with comprehensive analytics tools.'
    },
  ];

  // Rotate active city every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCityIndex((prev) => (prev + 1) % cities.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [cities.length]);

  // Simulate stats updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        totalIncidents: prev.totalIncidents + Math.floor(Math.random() * 3),
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 5) - 2,
        citiesCovered: prev.citiesCovered,
        avgResponseTime: prev.avgResponseTime,
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section - Map First Design */}
      <section className="relative h-screen overflow-hidden">
        {/* Animated Map Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-command-darker via-command-dark to-command-bg">
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgb(14 165 233 / 0.15) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
          
          {/* Animated incident markers */}
          <IncidentMarker x={25} y={30} severity="critical" delay={0} />
          <IncidentMarker x={65} y={45} severity="high" delay={300} />
          <IncidentMarker x={45} y={60} severity="moderate" delay={600} />
          <IncidentMarker x={75} y={25} severity="low" delay={900} />
          <IncidentMarker x={35} y={75} severity="high" delay={1200} />
          <IncidentMarker x={55} y={35} severity="moderate" delay={1500} />
          
          {/* Pulsing circles for hotspots */}
          <div className="absolute top-1/3 left-1/4 w-32 h-32 bg-alert-critical/10 rounded-full animate-pulse blur-xl"></div>
          <div className="absolute bottom-1/3 right-1/4 w-40 h-40 bg-pulse-500/10 rounded-full animate-pulse blur-xl" style={{ animationDelay: '1s' }}></div>
        </div>

        {/* Content Overlay */}
        <div className="relative h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              
              {/* Left: Hero Content */}
              <div className="space-y-8 animate-fade-in">
                {/* Live indicator badge */}
                <div className="inline-flex items-center gap-3 glass-heavy border border-pulse-500/30 rounded-full px-5 py-2.5 shadow-glow">
                  <div className="relative flex items-center">
                    <div className="w-2.5 h-2.5 bg-alert-critical rounded-full animate-pulse shadow-glow"></div>
                    <div className="absolute w-2.5 h-2.5 bg-alert-critical rounded-full animate-ping"></div>
                  </div>
                  <span className="text-sm font-mono font-semibold text-pulse-400 uppercase tracking-wider">
                    <AnimatedCounter end={stats.totalIncidents} /> Live Incidents
                  </span>
                  <Radio className="w-4 h-4 text-pulse-400 animate-pulse" />
                </div>

                {/* Main headline - Emotional & Action-oriented */}
                <div>
                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-tight mb-6">
                    <span className="text-white">Every Second</span>
                    <br />
                    <span className="text-white">Counts on the</span>
                    <br />
                    <span className="text-neon-cyan text-glow animate-pulse">Road.</span>
                  </h1>
                  
                  <p className="text-xl md:text-2xl text-gray-300 leading-relaxed max-w-xl">
                    Real-time accident tracking. Instant alerts. Community-powered safety.
                    <span className="block mt-2 text-pulse-400 font-semibold">
                      Be the eyes that save lives.
                    </span>
                  </p>
                </div>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/register"
                    className="group relative px-8 py-4 bg-gradient-to-r from-pulse-600 to-pulse-700 text-white rounded-xl font-bold text-lg shadow-glow hover:shadow-glow-lg transition-all duration-300 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-pulse-500 to-pulse-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative flex items-center justify-center gap-2">
                      <span>Report Incident Now</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                  
                  <Link
                    to="/dashboard/map"
                    className="group px-8 py-4 glass-heavy border-2 border-command-border hover:border-pulse-500 text-white rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Eye className="w-5 h-5" />
                    <span>View Live Map</span>
                  </Link>
                </div>

                {/* Quick stats */}
                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="glass rounded-lg p-4 border border-command-border">
                    <div className="text-2xl font-bold text-white mb-1">
                      <AnimatedCounter end={stats.activeUsers} />+
                    </div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider font-mono">Active Users</div>
                  </div>
                  <div className="glass rounded-lg p-4 border border-command-border">
                    <div className="text-2xl font-bold text-white mb-1">
                      <AnimatedCounter end={stats.citiesCovered} />
                    </div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider font-mono">Cities</div>
                  </div>
                  <div className="glass rounded-lg p-4 border border-command-border">
                    <div className="text-2xl font-bold text-pulse-400 mb-1">
                      {stats.avgResponseTime}<span className="text-sm">min</span>
                    </div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider font-mono">Response</div>
                  </div>
                </div>
              </div>

              {/* Right: Live Activity Feed */}
              <div className="hidden lg:block space-y-6 animate-slide-up">
                {/* Live activity card */}
                <div className="glass-heavy rounded-2xl p-6 border border-command-border shadow-glow">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-pulse-400" />
                      <h3 className="text-lg font-bold text-white">Live Activity</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-alert-critical rounded-full animate-pulse"></div>
                      <span className="text-xs text-gray-400 font-mono">REAL-TIME</span>
                    </div>
                  </div>
                  
                  <LiveActivityTicker />
                  
                  <div className="mt-6 pt-4 border-t border-command-border">
                    <Link 
                      to="/dashboard/incidents"
                      className="text-pulse-400 hover:text-pulse-300 text-sm font-semibold flex items-center gap-2 transition-colors"
                    >
                      <span>View All Incidents</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                {/* System status indicators */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass rounded-xl p-4 border border-command-border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-alert-safe/20 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-alert-safe" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 font-mono mb-1">SYSTEM STATUS</div>
                        <div className="text-sm font-bold text-alert-safe">All Operational</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="glass rounded-xl p-4 border border-command-border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-pulse-500/20 rounded-lg flex items-center justify-center">
                        <Globe className="w-5 h-5 text-pulse-400 animate-pulse" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 font-mono mb-1">COVERAGE</div>
                        <div className="text-sm font-bold text-white">{stats.citiesCovered} Cities</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-gray-600 rounded-full p-1">
            <div className="w-1 h-3 bg-pulse-400 rounded-full mx-auto animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Interactive City Preview */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Active in Your City
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              See real-time incident tracking across major cities. Select any city to explore.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cities.map((city, index) => (
              <div
                key={city.name}
                onMouseEnter={() => setActiveCityIndex(index)}
              >
                <CityCard
                  {...city}
                  isActive={index === activeCityIndex}
                />
              </div>
            ))}
          </div>

          {/* City Stats */}
          <div className="mt-12 p-8 glass-heavy rounded-2xl border border-pulse-500/30 shadow-glow">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {cities[activeCityIndex].name}, {cities[activeCityIndex].state}
                </h3>
                <p className="text-gray-400">
                  Currently tracking {cities[activeCityIndex].incidents} active incidents
                </p>
              </div>
              <Link
                to="/dashboard/map"
                className="px-6 py-3 bg-gradient-to-r from-pulse-600 to-pulse-700 text-white rounded-lg hover:from-pulse-500 hover:to-pulse-600 transition-all font-medium shadow-glow"
              >
                View Live Map
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why Choose Incident Reporter?
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Powerful features designed to keep you informed and your community safe.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <FeatureCard {...feature} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center glass-heavy rounded-2xl p-8 border border-command-border hover:shadow-glow transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-pulse-600 to-pulse-800 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold shadow-glow">
                1
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Create Account
              </h3>
              <p className="text-gray-400">
                Sign up in seconds with your email or phone number
              </p>
            </div>

            <div className="text-center glass-heavy rounded-2xl p-8 border border-command-border hover:shadow-glow transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-pulse-600 to-pulse-800 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold shadow-glow">
                2
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Set Your Location
              </h3>
              <p className="text-gray-400">
                Enable location services to receive relevant alerts
              </p>
            </div>

            <div className="text-center glass-heavy rounded-2xl p-8 border border-command-border hover:shadow-glow transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-pulse-600 to-pulse-800 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold shadow-glow">
                3
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Stay Informed
              </h3>
              <p className="text-gray-400">
                Get real-time updates and report incidents instantly
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials / Social Proof */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Trusted by Communities
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-heavy rounded-xl border border-command-border p-6 hover:shadow-glow transition-all">
              <div className="flex items-center mb-4">
                <div className="flex text-alert-moderate">
                  {[...Array(5)].map((_, i) => (
                    <CheckCircle key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-gray-300 mb-4">
                "Incredible platform! I've been able to avoid traffic jams and stay safe during emergencies. The real-time updates are a game changer."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-pulse-500/20 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-pulse-400" />
                </div>
                <div className="ml-3">
                  <p className="font-semibold text-white">Priya Sharma</p>
                  <p className="text-sm text-gray-400">Mumbai, Maharashtra</p>
                </div>
              </div>
            </div>

            <div className="glass-heavy rounded-xl border border-command-border p-6 hover:shadow-glow transition-all">
              <div className="flex items-center mb-4">
                <div className="flex text-alert-moderate">
                  {[...Array(5)].map((_, i) => (
                    <CheckCircle key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-gray-300 mb-4">
                "As a first responder, this tool helps me coordinate with my team and get to incidents faster. Highly recommend!"
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-pulse-500/20 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-pulse-400" />
                </div>
                <div className="ml-3">
                  <p className="font-semibold text-white">Michael Chen</p>
                  <p className="text-sm text-gray-400">Emergency Responder</p>
                </div>
              </div>
            </div>

            <div className="glass-heavy rounded-xl border border-command-border p-6 hover:shadow-glow transition-all">
              <div className="flex items-center mb-4">
                <div className="flex text-alert-moderate">
                  {[...Array(5)].map((_, i) => (
                    <CheckCircle key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-gray-300 mb-4">
                "The community reporting feature is fantastic. I feel more connected and informed about what's happening in my neighborhood."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-pulse-500/20 rounded-full flex items-center justify-center">
                  <Globe className="w-5 h-5 text-pulse-400" />
                </div>
                <div className="ml-3">
                  <p className="font-semibold text-white">Amit Patel</p>
                  <p className="text-sm text-gray-400">Bengaluru, Karnataka</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-pulse-600/20 to-neon-cyan/20 blur-3xl"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Smartphone className="w-16 h-16 text-pulse-400 mx-auto mb-6 animate-pulse" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of users staying informed and safe every day.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-pulse-600 to-pulse-700 text-white rounded-lg hover:from-pulse-500 hover:to-pulse-600 transition-all duration-300 shadow-glow font-semibold"
            >
              Create Free Account
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 glass-heavy text-white border-2 border-command-border hover:border-pulse-500 rounded-lg transition-all duration-300 font-semibold"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">IR</span>
                </div>
                <span className="text-lg font-bold">Incident Reporter</span>
              </div>
              <p className="text-gray-400">
                Real-time accident and traffic incident reporting platform.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Incident Reporter. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
