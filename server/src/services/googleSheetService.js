const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

class GoogleSheetService {
    constructor() {
        this.doc = null;
        this.isReady = false;
    }

    async init() {
        try {
            if (!process.env.GOOGLE_SHEETS_ID || !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
                console.warn('Google Sheets configuration missing. Skipping initialization.');
                return;
            }

            const serviceAccountAuth = new JWT({
                email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                scopes: ['https://www.googleapis.com/auth/spreadsheets'],
            });

            this.doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEETS_ID, serviceAccountAuth);
            await this.doc.loadInfo();
            this.isReady = true;
            console.log(`Google Sheets connected: ${this.doc.title}`);
        } catch (error) {
            console.error('Failed to initialize Google Sheets:', error.message);
        }
    }

    async addOrder(order) {
        if (!this.isReady) {
            // Try to init if not ready (lazy init)
            await this.init();
            if (!this.isReady) return;
        }

        try {
            const sheet = this.doc.sheetsByIndex[0]; // Use first sheet

            // Map order data to row
            const row = {
                'Order ID': order.order_number,
                'Date': new Date(order.created_at).toLocaleString(),
                'Customer': order.customer?.name || 'Guest',
                'Email': order.customer?.email || 'N/A',
                'Phone': order.customer?.phone || 'N/A',
                'Total': `${order.total_amount} ${order.currency}`,
                'Status': order.status,
                'Payment': order.payment_status,
                'Items': order.items ? order.items.map(i => `${i.quantity}x ${i.name || 'Product'}`).join(', ') : ''
            };

            await sheet.addRow(row);
            console.log(`Order ${order.order_number} added to Google Sheet.`);
        } catch (error) {
            console.error('Error adding order to Google Sheet:', error.message);
        }
    }
}

module.exports = new GoogleSheetService();
