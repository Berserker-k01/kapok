import { useState } from 'react';
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
  CreditCard
} from 'lucide-react';
import Button from '../ui/Button';
import { useAuthStore } from '../../store/authStore';
import AIAssistant from '../AIAssistant';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

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
      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 bg-white border-r border-secondary-200 transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'w-64' : 'w-20'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center justify-center border-b border-secondary-200">
            {sidebarOpen ? (
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                Assimε
              </h1>
            ) : (
              <span className="text-2xl font-bold text-primary-600">A</span>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-6 px-3 space-y-1">
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

                  {sidebarOpen && (
                    <span className="ml-3 font-medium text-sm">{item.label}</span>
                  )}

                  {!sidebarOpen && (
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
            <div className={`flex items-center ${sidebarOpen ? 'justify-start' : 'justify-center'}`}>
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                <User size={16} />
              </div>
              {sidebarOpen && (
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
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Header */}
        <header className="h-16 bg-white border-b border-secondary-200 sticky top-0 z-40 px-6 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-secondary-500"
          >
            <Menu size={20} />
          </Button>

          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" className="hidden sm:flex" onClick={handleLogout}>
              <LogOut size={16} className="mr-2" />
              Déconnexion
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      <AIAssistant />
    </div>
  );
};

export default Layout;
