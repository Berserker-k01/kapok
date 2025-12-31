// Utilitaires de formatage partagés

export const formatCurrency = (amount, currency = 'XOF') => {
  const noDecimalCurrencies = ['XOF', 'XAF', 'GNF', 'JPY'];
  const maximumFractionDigits = noDecimalCurrencies.includes(currency) ? 0 : 2;

  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits,
    minimumFractionDigits: maximumFractionDigits
  }).format(amount)
}

export const formatDate = (date, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }

  return new Intl.DateTimeFormat('fr-FR', {
    ...defaultOptions,
    ...options,
  }).format(new Date(date))
}

export const formatDateTime = (date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export const formatNumber = (number) => {
  return new Intl.NumberFormat('fr-FR').format(number)
}

export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export const slugify = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const capitalizeFirst = (text) => {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2)
}
