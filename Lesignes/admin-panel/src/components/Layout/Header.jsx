import { FiMenu, FiBell, FiUser, FiLogOut } from 'react-icons/fi'
import { useAuthStore } from '../../store/authStore'

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuthStore()

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-6">
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500"
          >
            <FiMenu className="h-6 w-6" />
          </button>
          
          <div className="ml-4 lg:ml-0">
            <h1 className="text-lg font-semibold text-gray-900">
              Panel Administrateur
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="p-2 text-gray-400 hover:text-gray-500 relative">
            <FiBell className="h-6 w-6" />
            <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User menu */}
          <div className="relative group">
            <button className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50">
              <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center">
                <FiUser className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">
                {user?.name || 'Admin'}
              </span>
            </button>

            {/* Dropdown menu */}
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="py-1">
                <a
                  href="#"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <FiUser className="mr-3 h-4 w-4" />
                  Mon Profil
                </a>
                <button
                  onClick={logout}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <FiLogOut className="mr-3 h-4 w-4" />
                  Déconnexion
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
