import { Outlet } from 'react-router-dom';
import Header from '../common/Header';
import Sidebar from '../common/Sidebar';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { useEffect } from 'react';

function MainLayout() {
  const { isSidebarOpen, closeSidebar } = useUIStore();
  const { isAuthenticated } = useAuthStore();

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && !isSidebarOpen) {
        // Auto-open sidebar on desktop if closed
        // Commented out to preserve user preference
        // openSidebar();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-command-bg grid-bg relative">
      {/* Ambient glow effects */}
      <div className="fixed top-0 left-0 w-64 h-64 sm:w-96 sm:h-96 bg-pulse-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="fixed bottom-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-purple-500/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none"></div>
      
      <Header />
      
      {/* Mobile overlay backdrop - Only show when authenticated */}
      {isAuthenticated && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden top-16"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}
        
      <div className="flex min-h-[calc(100vh-4rem)]">
        <Sidebar />
        
        <main
          className={
            `flex-1 transition-all duration-300 ease-in-out w-full
            ${isAuthenticated && isSidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`
          }
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
