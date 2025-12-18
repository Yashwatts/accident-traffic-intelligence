import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';

function IncidentsPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to map page after a short delay
    const timer = setTimeout(() => {
      navigate('/dashboard/map');
    }, 100);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-[50vh]">
      <div className="text-center">
        <MapPin className="w-16 h-16 text-primary-600 mx-auto mb-4 animate-pulse" />
        <p className="text-gray-600">Redirecting to map...</p>
      </div>
    </div>
  );
}

export default IncidentsPage;
