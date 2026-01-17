import { Link } from 'react-router-dom'
import { FiHome, FiArrowLeft, FiSearch } from 'react-icons/fi'

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center space-y-8 animate-fade-in-up">
        
        {/* 404 Illustration */}
        <div className="relative">
          <h1 className="text-[180px] md:text-[280px] font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-300 to-primary-600 leading-none select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 md:w-48 md:h-48 bg-primary-100 rounded-full animate-pulse opacity-50"></div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4 -mt-12">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900">
            Page introuvable
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-md mx-auto">
            Oups ! La page que vous recherchez semble avoir disparu dans les méandres du web.
          </p>
        </div>

        {/* Search Suggestion */}
        <div className="bg-white rounded-2xl p-6 shadow-soft-lg max-w-md mx-auto">
          <div className="flex items-center space-x-3 text-left">
            <FiSearch className="w-6 h-6 text-primary-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-gray-900">Vous cherchez quelque chose ?</p>
              <p className="text-sm text-gray-600">Essayez de rechercher ou retournez à l'accueil.</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to="/"
            className="inline-flex items-center px-8 py-4 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-all duration-300 shadow-soft-lg hover:shadow-glow hover-lift group"
          >
            <FiHome className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
            Retour à l'accueil
          </Link>

          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center px-8 py-4 bg-white text-gray-700 font-bold rounded-xl hover:bg-gray-50 border-2 border-gray-200 transition-all duration-300 shadow-soft hover:shadow-soft-lg hover-lift group"
          >
            <FiArrowLeft className="mr-2 w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Page précédente
          </button>
        </div>

        {/* Fun Fact */}
        <div className="pt-8 text-sm text-gray-500">
          <p className="italic">
            💡 Le saviez-vous ? La première erreur 404 a été enregistrée au CERN en 1992.
          </p>
        </div>
      </div>
    </div>
  )
}

export default NotFound
