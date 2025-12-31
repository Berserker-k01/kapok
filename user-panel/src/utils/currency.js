export const formatCurrency = (amount, currency = 'XOF') => {
    if (!amount && amount !== 0) return '';

    // Configuration des devises supportées
    const currencies = {
        'XOF': { locale: 'fr-XO', currency: 'XOF', name: 'FCFA' },
        'GNF': { locale: 'fr-GN', currency: 'GNF', name: 'GNF' },
        'EUR': { locale: 'fr-FR', currency: 'EUR', name: '€' },
        'USD': { locale: 'en-US', currency: 'USD', name: '$' },
    };

    const config = currencies[currency] || currencies['XOF'];

    try {
        return new Intl.NumberFormat(config.locale, {
            style: 'currency',
            currency: config.currency,
            minimumFractionDigits: 0, // Pas de décimales pour FCFA/GNF généralement
            maximumFractionDigits: 0,
        }).format(amount);
    } catch (e) {
        // Fallback si la locale n'est pas supportée
        return `${amount} ${config.name}`;
    }
};
