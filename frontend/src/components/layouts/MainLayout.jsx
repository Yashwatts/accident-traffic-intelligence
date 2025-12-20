import { Outlet } from 'react-router-dom';
import Header from '../common/Header';
import Sidebar from '../common/Sidebar';
import { useUIStore } from '../../store/uiStore';

function MainLayout() {
  const { isSidebarOpen } = useUIStore();

  return (
    <div className="min-h-screen bg-command-bg grid-bg relative">
      {/* Ambient glow effects */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-pulse-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none"></div>
      
      <Header />
        
      <div className="flex">
        <Sidebar />
        
        <main
          className={`flex-1 transition-all duration-300 ${
            isSidebarOpen ? 'ml-64' : 'ml-0'
          }`}
        >
          <div className="container mx-auto px-4 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
