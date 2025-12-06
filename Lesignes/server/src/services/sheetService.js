const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

// Chemin vers le fichier credentials.json
const CREDENTIALS_PATH = path.join(__dirname, '../../credentials.json');

// ID du Google Sheet (à récupérer depuis les variables d'environnement ou la DB)
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;

const getAuthClient = () => {
    if (!fs.existsSync(CREDENTIALS_PATH)) {
        console.warn('⚠️ Fichier credentials.json manquant. La synchro Google Sheets est désactivée.');
        return null;
    }

    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: CREDENTIALS_PATH,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
        return auth;
    } catch (error) {
        console.error('Erreur authentification Google:', error);
        return null;
    }
};

exports.appendOrder = async (order) => {
    const auth = getAuthClient();
    if (!auth || !SPREADSHEET_ID) {
        console.log('Skipping Google Sheet sync (Auth or Sheet ID missing)');
        return false;
    }

    try {
        const sheets = google.sheets({ version: 'v4', auth });

        const values = [
            [
                order.order_number || order.id,
                new Date(order.created_at).toLocaleString('fr-FR'),
                order.customer?.name || 'Anonyme',
                order.customer?.phone || '',
                order.customer?.address || '',
                order.items?.map(i => `${i.quantity}x ${i.product_name}`).join(', ') || '',
                order.total_amount,
                order.status
            ]
        ];

        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Commandes!A:H', // Assurez-vous que l'onglet s'appelle "Commandes"
            valueInputOption: 'USER_ENTERED',
            resource: { values },
        });

        console.log(`✅ Commande ${order.id} synchronisée avec Google Sheets`);
        return true;
    } catch (error) {
        console.error('❌ Erreur synchro Google Sheets:', error.message);
        return false;
    }
};
