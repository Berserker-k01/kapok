const PLANS = {
    free: {
        name: 'Gratuit',
        maxShops: 2,
        price: 0
    },
    basic: {
        name: 'Basic',
        maxShops: 5,
        price: 29.99
    },
    pro: {
        name: 'Pro',
        maxShops: Infinity,
        price: 99.99
    }
};

module.exports = PLANS;
