import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Store,
  Users,
  CreditCard,
  Settings,
  Menu,
  LogOut,
  ShieldCheck,
  Bell,
  Clock,
  Package,
  Phone
} from 'lucide-react';
import Button from '../ui/Button';
import logoFull from '../../assets/logo-full.png';
import logoIcon from '../../assets/logo-icon.png';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Users, label: 'Utilisateurs', path: '/users' },
    { icon: Store, label: 'Boutiques', path: '/shops' },
    { icon: CreditCard, label: 'Abonnements', path: '/subscriptions' },
    { icon: Clock, label: 'Paiements en attente', path: '/payment-requests' },
    { icon: Package, label: 'Gestion des plans', path: '/plans' },
    { icon: Phone, label: 'Numéros de paiement', path: '/payment-numbers' },
    { icon: Settings, label: 'Paramètres', path: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-secondary-50 flex">
      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 bg-secondary-900 text-white transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'w-64' : 'w-20'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center justify-center border-b border-secondary-800">
            {sidebarOpen ? (
              <div className="flex items-center space-x-2 px-4">
                <img src={logoFull} alt="Assime Admin" className="h-8 w-auto filter invert brightness-0 invert" />
              </div>
            ) : (
              <img src={logoIcon} alt="Assime Admin" className="h-8 w-auto filter invert brightness-0 invert" />
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
                      ? 'bg-red-600 text-white'
                      : 'text-secondary-400 hover:bg-secondary-800 hover:text-white'
                    }
                  `}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-secondary-400 group-hover:text-white'}`} />

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

          {/* Admin Profile */}
          <div className="p-4 border-t border-secondary-800">
            <div className={`flex items-center ${sidebarOpen ? 'justify-start' : 'justify-center'}`}>
              <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white font-bold">
                A
              </div>
              {sidebarOpen && (
                <div className="ml-3 overflow-hidden">
                  <p className="text-sm font-medium text-white truncate">Super Admin</p>
                  <p className="text-xs text-secondary-400 truncate">admin@assime.com</p>
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
            <Button variant="ghost" size="sm" className="relative text-secondary-500">
              <Bell size={20} />
              <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>
            <Button variant="outline" size="sm" className="hidden sm:flex border-red-200 text-red-600 hover:bg-red-50">
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
    </div>
  );
};

export default Layout;
