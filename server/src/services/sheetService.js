const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

/**
 * Service pour synchroniser les commandes sur Google Sheets
 * Chaque boutique peut avoir son propre ID de feuille.
 */

// Chemin vers le fichier credentials.json - Ce fichier contient le compte de service.
// Ce fichier doit être présent à la racine du projet (hors dossier src).
const CREDENTIALS_PATH = path.join(__dirname, '../../credentials.json');

const getAuthClient = () => {
    if (!fs.existsSync(CREDENTIALS_PATH)) {
        console.warn('[Sheets] ⚠️ credentials.json manquant. La synchronisation est temporairement indisponible.');
        return null;
    }

    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: CREDENTIALS_PATH,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
        return auth;
    } catch (error) {
        console.error('[Sheets] ❌ Erreur d\'authentification Google:', error.message);
        return null;
    }
};

/**
 * Envoie une commande vers un Google Sheet spécifique.
 */
exports.addOrder = async (order, spreadsheetId) => {
    if (!spreadsheetId) {
        // console.log(`[Sheets] ℹ️ Pas d'ID Google Sheet configuré pour cette boutique.`);
        return false;
    }

    const auth = getAuthClient();
    if (!auth) return false;

    try {
        const sheets = google.sheets({ version: 'v4', auth });

        // Préparer les données (Formatage propre)
        // Colonnes : ID, Date, Client, Téléphone, Adresse, Produits, Total, Statut
        const values = [
            [
                order.order_number || order.id || 'N/A',
                new Date(order.created_at || Date.now()).toLocaleString('fr-FR'),
                order.customer?.name || 'Client Anonyme',
                order.customer?.phone || '',
                order.customer?.address || '',
                order.items?.map(i => `${i.quantity}x ${i.name || 'Produit'}`).join(', ') || '',
                order.total_amount,
                order.status || 'pending'
            ]
        ];

        await sheets.spreadsheets.values.append({
            spreadsheetId: spreadsheetId,
            range: 'Commandes!A:H', // On s'attend à un onglet nommé "Commandes"
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS',
            resource: { values },
        });

        console.log(`[Sheets] ✅ Commande ${order.order_number} synchronisée.`);
        return true;
    } catch (error) {
        console.error(`[Sheets] ❌ Échec synchro Sheet ${spreadsheetId}:`, error.message);
        return false;
    }
};
