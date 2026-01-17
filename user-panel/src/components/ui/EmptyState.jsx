import { FiPackage, FiShoppingBag, FiInbox, FiSearch, FiAlertCircle, FiPlus } from 'react-icons/fi'
import { Link } from 'react-router-dom'

// Empty State Component
export const EmptyState = ({
  icon: Icon = FiInbox,
  title = 'Aucun élément',
  description = 'Il n\'y a rien à afficher pour le moment.',
  actionLabel,
  actionLink,
  onAction,
  variant = 'default'
}) => {
  const variants = {
    default: 'from-gray-50 to-white',
    primary: 'from-primary-50 to-white',
    success: 'from-green-50 to-white',
    warning: 'from-yellow-50 to-white'
  }

  return (
    <div className={`py-16 px-4 text-center bg-gradient-to-b ${variants[variant]} rounded-xl border-2 border-dashed border-gray-200`}>
      <div className="max-w-md mx-auto space-y-6 animate-fade-in-up">
        <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <Icon className="w-10 h-10 text-gray-400" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <p className="text-gray-600">{description}</p>
        </div>

        {(actionLabel || onAction) && (
          actionLink ? (
            <Link
              to={actionLink}
              className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-all duration-300 shadow-soft hover:shadow-soft-lg hover-lift"
            >
              <FiPlus className="mr-2" />
              {actionLabel}
            </Link>
          ) : (
            <button
              onClick={onAction}
              className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-all duration-300 shadow-soft hover:shadow-soft-lg hover-lift"
            >
              <FiPlus className="mr-2" />
              {actionLabel}
            </button>
          )
        )}
      </div>
    </div>
  )
}

// Specific Empty States
export const EmptyProducts = ({ onAddProduct }) => (
  <EmptyState
    icon={FiPackage}
    title="Aucun produit"
    description="Commencez à ajouter des produits à votre boutique pour qu'ils apparaissent ici."
    actionLabel="Ajouter un produit"
    onAction={onAddProduct}
    variant="primary"
  />
)

export const EmptyOrders = () => (
  <EmptyState
    icon={FiShoppingBag}
    title="Aucune commande"
    description="Vous n'avez pas encore reçu de commandes. Partagez votre boutique pour commencer à vendre !"
    variant="default"
  />
)

export const EmptySearch = ({ query }) => (
  <EmptyState
    icon={FiSearch}
    title="Aucun résultat"
    description={`Aucun résultat trouvé pour "${query}". Essayez avec d'autres mots-clés.`}
    variant="warning"
  />
)

export const ErrorState = ({ 
  title = 'Une erreur est survenue',
  description = 'Impossible de charger les données. Veuillez réessayer.',
  onRetry
}) => (
  <div className="py-16 px-4 text-center">
    <div className="max-w-md mx-auto space-y-6">
      <div className="mx-auto w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
        <FiAlertCircle className="w-10 h-10 text-red-600" />
      </div>
      
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
        >
          Réessayer
        </button>
      )}
    </div>
  </div>
)

export default {
  EmptyState,
  EmptyProducts,
  EmptyOrders,
  EmptySearch,
  ErrorState
}
