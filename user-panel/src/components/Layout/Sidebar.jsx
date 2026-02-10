import { useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import logoFull from '../../assets/logo-full.png'

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user, logout } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navigation = [
    {
      name: 'Accueil',
      href: '/',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      name: 'Commandes',
      href: '/orders',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      badge: '12'
    },
    {
      name: 'Produits',
      href: '/products',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    },
    {
      name: 'Collections',
      href: '/collections',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    {
      name: 'Clients',
      href: '/customers',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      )
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      name: 'Marketing',
      href: '/marketing',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
      )
    },
    {
      name: 'Réductions',
      href: '/discounts',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      )
    }
  ]

  const salesChannels = [
    { name: 'Boutique en ligne', href: '/online-store', active: true },
    { name: 'Point de vente', href: '/pos', active: false },
    { name: 'Facebook', href: '/facebook', active: true },
    { name: 'Instagram', href: '/instagram', active: false }
  ]

  const apps = [
    { name: 'Mobile Money', href: '/apps/mobile-money', icon: '📱' },
    { name: 'Assistant IA', href: '/apps/ai-assistant', icon: '🤖' },
    { name: 'Email Marketing', href: '/apps/email', icon: '📧' }
  ]

  const isCurrentPath = (path) => location.pathname === path

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-secondary-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-6 border-b border-secondary-200">
            <div className="flex items-center">
              <img src={logoFull} alt="Assime Logo" className="h-10 w-auto" />
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-1 rounded-md text-secondary-400 hover:text-secondary-500 hover:bg-secondary-100 ml-auto"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <div className="flex-1 px-3 py-4 overflow-y-auto">
            {/* Main Navigation */}
            <nav className="space-y-1">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center justify-between ${isCurrentPath(item.href) ? 'nav-link-active' : 'nav-link-inactive'}`}
                >
                  <div className="flex items-center">
                    <span className="mr-3">{item.icon}</span>
                    {item.name}
                  </div>
                  {item.badge && (
                    <span className="badge badge-primary">{item.badge}</span>
                  )}
                </a>
              ))}
            </nav>

            {/* Sales Channels */}
            <div className="mt-8">
              <h3 className="px-3 text-xs font-semibold text-secondary-500 uppercase tracking-wider">
                Canaux de vente
              </h3>
              <div className="mt-2 space-y-1">
                {salesChannels.map((channel) => (
                  <a
                    key={channel.name}
                    href={channel.href}
                    className="nav-link-inactive group flex items-center justify-between"
                  >
                    <span className="text-sm">{channel.name}</span>
                    <div className={`w-2 h-2 rounded-full ${channel.active ? 'bg-success-500' : 'bg-secondary-300'}`} />
                  </a>
                ))}
              </div>
            </div>

            {/* Apps */}
            <div className="mt-8">
              <h3 className="px-3 text-xs font-semibold text-secondary-500 uppercase tracking-wider">
                Applications
              </h3>
              <div className="mt-2 space-y-1">
                {apps.map((app) => (
                  <a
                    key={app.name}
                    href={app.href}
                    className="nav-link-inactive group flex items-center"
                  >
                    <span className="mr-3 text-lg">{app.icon}</span>
                    <span className="text-sm">{app.name}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* User info & Settings */}
          <div className="border-t border-secondary-200">
            <div className="p-4">
              <Link to="/settings" className="nav-link-inactive group flex items-center">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Paramètres
              </Link>
            </div>

            <div className="p-4 border-t border-secondary-200 bg-secondary-50">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-secondary-900 truncate">
                    {user?.name || 'Utilisateur Démo'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.plan ? (
                      user.plan === 'pro' ? (
                        `Plan Pro • ${user.shopCount || 0} boutique${(user.shopCount || 0) > 1 ? 's' : ''}`
                      ) : user.plan === 'basic' ? (
                        `Plan Basic • ${user.shopCount || 0}/${user.maxShops || 5} boutiques`
                      ) : (
                        `Plan Gratuit • ${user.shopCount || 0}/${user.maxShops || 2} boutiques`
                      )
                    ) : (
                      `Plan Gratuit • ${user.shopCount || 0}/${user.maxShops || 2} boutiques`
                    )}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1 text-secondary-400 hover:text-secondary-500 rounded"
                  title="Déconnexion"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar
