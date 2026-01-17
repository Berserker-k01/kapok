import { FiLoader } from 'react-icons/fi'

// Loading Spinner Component
export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  return (
    <div className={`inline-block ${className}`}>
      <FiLoader className={`${sizes[size]} animate-spin text-primary-600`} />
    </div>
  )
}

// Full Page Loader
export const PageLoader = ({ message = 'Chargement...' }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50">
      <div className="text-center space-y-6 animate-fade-in-up">
        <div className="relative">
          <div className="w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-primary-200 animate-ping"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-primary-600 animate-spin"></div>
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-gray-900">{message}</h3>
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce animation-delay-100"></div>
            <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce animation-delay-200"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Skeleton Loader for Cards
export const SkeletonCard = () => {
  return (
    <div className="card animate-pulse">
      <div className="skeleton h-48 rounded-lg mb-4"></div>
      <div className="space-y-3">
        <div className="skeleton-title"></div>
        <div className="skeleton-text w-2/3"></div>
        <div className="skeleton-text w-1/2"></div>
      </div>
    </div>
  )
}

// Skeleton Grid
export const SkeletonGrid = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

// Inline Loader for buttons
export const ButtonLoader = ({ className = '' }) => {
  return (
    <svg className={`animate-spin h-5 w-5 ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  )
}

export default {
  LoadingSpinner,
  PageLoader,
  SkeletonCard,
  SkeletonGrid,
  ButtonLoader
}
