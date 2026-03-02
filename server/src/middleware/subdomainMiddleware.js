/**
 * Middleware de détection des sous-domaines (SaaS Style)
 * Permet d'identifier une boutique via shop-slug.assime.com
 */
module.exports = (req, res, next) => {
    const host = req.get('host');
    if (!host) return next();

    // Ignorer localhost ou les IPs si on n'est pas en mode développement spécifique
    if (host.includes('localhost') || host.includes('127.0.0.1')) {
        // En local, on peut simuler via shop1.localhost:5000
        const parts = host.split('.');
        if (parts.length >= 2 && !parts[0].includes('localhost')) {
            const subdomain = parts[0].toLowerCase();
            const excluded = ['www', 'api', 'admin', 'user', 'app', 'dev'];
            if (!excluded.includes(subdomain)) {
                req.detectedSubdomain = subdomain;
                // console.log(`[Subdomain Local] 🏠 Boutique détectée: ${subdomain}`);
            }
        }
        return next();
    }

    // Pour la production (ex: assime.com)
    const parts = host.split('.');

    // Si on a shop.assime.com (3 parts) ou shop.sub.assime.com (4 parts)
    if (parts.length >= 3) {
        // Le premier segment est le slug de la boutique
        const subdomain = parts[0].toLowerCase();

        // Liste des sous-domaines réservés par la plateforme
        const reserved = ['www', 'api', 'admin', 'user', 'app', 'panel', 'dashboard', 'dev', 'static', 'assets', 'mail'];

        if (!reserved.includes(subdomain)) {
            req.detectedSubdomain = subdomain;
            console.log(`[Subdomain Prod] 🌐 Boutique détectée: ${subdomain}`);
        }
    }

    next();
};
