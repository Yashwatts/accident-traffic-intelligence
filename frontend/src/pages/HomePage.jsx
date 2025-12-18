import { useState, useEffect } from 'react';
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
  Smartphone
} from 'lucide-react';
import { cn } from '../lib/utils';

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
        ? "border-primary-500 bg-primary-50 shadow-lg scale-105" 
        : "border-gray-200 bg-white hover:border-primary-300 hover:shadow-md"
    )}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <MapPin className={cn(
            "w-5 h-5",
            isActive ? "text-primary-600" : "text-gray-400"
          )} />
          <h3 className="font-semibold text-gray-900">{name}</h3>
        </div>
        {isActive && (
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-600 font-medium">Live</span>
          </div>
        )}
      </div>
      <p className="text-sm text-gray-600 mb-2">{state}</p>
      <div className="flex items-center space-x-2">
        <AlertCircle className="w-4 h-4 text-orange-500" />
        <span className="text-sm font-medium text-gray-700">
          {incidents} active incidents
        </span>
      </div>
    </div>
  );
}

// Feature card component
function FeatureCard({ icon: Icon, title, description }) {
  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-primary-600" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
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
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-primary-50 border border-primary-200 rounded-full px-4 py-2 mb-8">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-primary-700">
                Real-time incident tracking
              </span>
            </div>

            {/* Main heading */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
              Stay Informed.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-blue-600">
                Stay Safe.
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Report and track accidents, traffic incidents, and emergencies in real-time.
              Join thousands helping make communities safer.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
              <Link
                to="/register"
                className="group w-full sm:w-auto px-8 py-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              >
                <span className="font-semibold">Get Started Free</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 border-2 border-gray-300 rounded-lg hover:border-primary-500 transition-all duration-300 font-semibold"
              >
                Sign In
              </Link>
            </div>

            {/* Live Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="text-3xl font-bold text-primary-600 mb-1">
                  <AnimatedCounter end={stats.totalIncidents} />+
                </div>
                <div className="text-sm text-gray-600">Incidents Reported</div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="text-3xl font-bold text-primary-600 mb-1">
                  <AnimatedCounter end={stats.activeUsers} />+
                </div>
                <div className="text-sm text-gray-600">Active Users</div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="text-3xl font-bold text-primary-600 mb-1">
                  <AnimatedCounter end={stats.citiesCovered} />+
                </div>
                <div className="text-sm text-gray-600">Cities Covered</div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="text-3xl font-bold text-primary-600 mb-1">
                  {stats.avgResponseTime}
                  <span className="text-xl">min</span>
                </div>
                <div className="text-sm text-gray-600">Avg Response Time</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive City Preview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Active in Your City
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
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
          <div className="mt-12 p-8 bg-gradient-to-r from-primary-50 to-blue-50 rounded-2xl border border-primary-200">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {cities[activeCityIndex].name}, {cities[activeCityIndex].state}
                </h3>
                <p className="text-gray-600">
                  Currently tracking {cities[activeCityIndex].incidents} active incidents
                </p>
              </div>
              <Link
                to="/dashboard/map"
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                View Live Map
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Incident Reporter?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
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
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Create Account
              </h3>
              <p className="text-gray-600">
                Sign up in seconds with your email or phone number
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Set Your Location
              </h3>
              <p className="text-gray-600">
                Enable location services to receive relevant alerts
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Stay Informed
              </h3>
              <p className="text-gray-600">
                Get real-time updates and report incidents instantly
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials / Social Proof */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trusted by Communities
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <CheckCircle key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                "Incredible platform! I've been able to avoid traffic jams and stay safe during emergencies. The real-time updates are a game changer."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary-600" />
                </div>
                <div className="ml-3">
                  <p className="font-semibold text-gray-900">Priya Sharma</p>
                  <p className="text-sm text-gray-600">Mumbai, Maharashtra</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <CheckCircle key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                "As a first responder, this tool helps me coordinate with my team and get to incidents faster. Highly recommend!"
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary-600" />
                </div>
                <div className="ml-3">
                  <p className="font-semibold text-gray-900">Michael Chen</p>
                  <p className="text-sm text-gray-600">Emergency Responder</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <CheckCircle key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                "The community reporting feature is fantastic. I feel more connected and informed about what's happening in my neighborhood."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <Globe className="w-5 h-5 text-primary-600" />
                </div>
                <div className="ml-3">
                  <p className="font-semibold text-gray-900">Amit Patel</p>
                  <p className="text-sm text-gray-600">Bengaluru, Karnataka</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Smartphone className="w-16 h-16 text-white mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of users staying informed and safe every day.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 bg-white text-primary-600 rounded-lg hover:bg-gray-100 transition-all duration-300 shadow-lg font-semibold"
            >
              Create Free Account
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 bg-transparent text-white border-2 border-white rounded-lg hover:bg-white/10 transition-all duration-300 font-semibold"
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
