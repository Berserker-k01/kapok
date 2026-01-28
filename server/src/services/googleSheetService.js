const { google } = require('googleapis');

class GoogleSheetService {
    constructor() {
        this.sheets = null;
        this.isReady = false;
        this.spreadsheetId = null;
    }

    async init() {
        try {
            if (!process.env.GOOGLE_SHEETS_ID || !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
                console.warn('Google Sheets configuration missing. Skipping initialization.');
                return;
            }

            const auth = new google.auth.GoogleAuth({
                credentials: {
                    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                },
                scopes: ['https://www.googleapis.com/auth/spreadsheets'],
            });

            this.sheets = google.sheets({ version: 'v4', auth });
            this.spreadsheetId = process.env.GOOGLE_SHEETS_ID;
            this.isReady = true;
            console.log('Google Sheets service initialized (googleapis).');

        } catch (error) {
            console.error('Failed to initialize Google Sheets:', error.message);
        }
    }

    async addOrder(order) {
        if (!this.isReady) {
            await this.init();
            if (!this.isReady) return;
        }

        try {
            // Prepare row data (Fixed Column Order assumption: A to I)
            // Order ID | Date | Customer | Email | Phone | Total | Status | Payment | Items
            const values = [[
                order.order_number,
                new Date(order.created_at).toLocaleString(),
                order.customer?.name || 'Guest',
                order.customer?.email || 'N/A',
                order.customer?.phone || 'N/A',
                `${order.total_amount} ${order.currency}`,
                order.status,
                order.payment_status,
                order.items ? order.items.map(i => `${i.quantity}x ${i.name || 'Product'}`).join(', ') : ''
            ]];

            await this.sheets.spreadsheets.values.append({
                spreadsheetId: this.spreadsheetId,
                range: 'Sheet1!A:I',
                valueInputOption: 'USER_ENTERED',
                resource: {
                    values: values
                }
            });

            console.log(`Order ${order.order_number} added to Google Sheet.`);
        } catch (error) {
            console.error('Error adding order to Google Sheet:', error.message);
        }
    }
}

module.exports = new GoogleSheetService();
