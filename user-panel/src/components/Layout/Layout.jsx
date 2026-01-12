import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Store,
  Package,
  ShoppingCart,
  BarChart2,
  Settings,
  Menu,
  LogOut,
  User,
  CreditCard,
  X // Added close icon
} from 'lucide-react';
import Button from '../ui/Button';
import { useAuthStore } from '../../store/authStore';
import AIAssistant from '../AIAssistant';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768); // Auto-close on mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  // Handle resize for responsiveness
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile && sidebarOpen) setSidebarOpen(false);
      if (!mobile && !sidebarOpen) setSidebarOpen(true);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar on route change on mobile
  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [location, isMobile]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Store, label: 'Mes Boutiques', path: '/shops' },
    { icon: Package, label: 'Produits', path: '/products' },
    { icon: ShoppingCart, label: 'Commandes', path: '/orders' },
    { icon: BarChart2, label: 'Analytics', path: '/analytics' },
    { icon: CreditCard, label: 'Abonnements', path: '/subscriptions' },
    { icon: Settings, label: 'Paramètres', path: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-secondary-50 flex">
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 bg-white border-r border-secondary-200 transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${sidebarOpen && !isMobile ? 'w-64' : (isMobile ? 'w-64' : 'w-20')}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-secondary-200">
            {sidebarOpen || isMobile ? (
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                Assimε
              </h1>
            ) : (
              <span className="text-2xl font-bold text-primary-600 mx-auto">A</span>
            )}

            {isMobile && (
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-secondary-500 hover:text-secondary-700"
              >
                <X size={24} />
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center px-3 py-2.5 rounded-lg transition-colors group relative
                    ${isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900'
                    }
                  `}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : 'text-secondary-400 group-hover:text-secondary-600'}`} />

                  {(sidebarOpen || isMobile) && (
                    <span className="ml-3 font-medium text-sm">{item.label}</span>
                  )}

                  {!sidebarOpen && !isMobile && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-secondary-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-secondary-200">
            <div className={`flex items-center ${(sidebarOpen || isMobile) ? 'justify-start' : 'justify-center'}`}>
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold shrink-0">
                <User size={16} />
              </div>
              {(sidebarOpen || isMobile) && (
                <div className="ml-3 overflow-hidden">
                  <p className="text-sm font-medium text-secondary-900 truncate">{user?.name || 'Utilisateur'}</p>
                  <p className="text-xs text-secondary-500 truncate">{user?.email || ''}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div
        className={`
          flex-1 flex flex-col transition-all duration-300 
          ${!isMobile && sidebarOpen ? 'ml-64' : (!isMobile ? 'ml-20' : 'ml-0')}
        `}
      >
        {/* Header */}
        <header className="h-16 bg-white border-b border-secondary-200 sticky top-0 z-30 px-4 md:px-6 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-secondary-500 md:hidden"
          >
            <Menu size={24} />
          </Button>

          {/* Desktop Toggle (only when not mobile) */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-secondary-500 hidden md:flex"
          >
            <Menu size={20} />
          </Button>

          <div className="flex items-center space-x-2 md:space-x-4">
            <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center">
              <LogOut size={16} className="md:mr-2" />
              <span className="hidden md:inline">Déconnexion</span>
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto w-full">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
      <AIAssistant />
    </div>
  );
};

export default Layout;
