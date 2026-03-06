const nodemailer = require('nodemailer');

/**
 * Service global de notifications (Email, WhatsApp)
 */

// Configuration Nodemailer via variables d'environnement
const mailConfig = {
    host: process.env.SMTP_HOST || 'smtp.hostinger.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: true,
    auth: {
        user: process.env.SMTP_USER || 'noreply@assime.net',
        pass: process.env.SMTP_PASS || 'TvXNAxl8),MXAQiB'
    },
    // Timeout pour éviter les blocages silencieux
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000
};

console.log(`[Email] 📧 Configuration SMTP: ${mailConfig.host}:${mailConfig.port} (user: ${mailConfig.auth.user})`);

let transporter;
try {
    transporter = nodemailer.createTransport(mailConfig);
    // Vérifier la connexion au démarrage
    transporter.verify((error, success) => {
        if (error) {
            console.error('[Email] ❌ Échec connexion SMTP:', error.message);
        } else {
            console.log('[Email] ✅ Connexion SMTP vérifiée avec succès');
        }
    });
} catch (error) {
    console.error('[Email] ❌ Erreur création transporteur SMTP:', error.message);
}

/**
 * Envoie un email de confirmation de commande au CLIENT (acheteur)
 */
exports.sendOrderConfirmationToCustomer = async (customerEmail, shopName, orderData) => {
    if (!customerEmail || !customerEmail.includes('@')) {
        console.log(`[Email] ⏭️ Pas d'email client valide, notification ignorée`);
        return false;
    }

    try {
        const mailOptions = {
            from: `"${shopName} via Assimε" <${mailConfig.auth.user}>`,
            to: customerEmail,
            subject: `✅ Commande confirmée - ${orderData.order_number}`,
            html: `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px;">
                    <div style="background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                        <div style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 32px 40px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">✅ Commande confirmée !</h1>
                            <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 15px;">Boutique : <strong>${shopName}</strong></p>
                        </div>
                        <div style="padding: 32px 40px;">
                            <p style="color: #374151; font-size: 15px; line-height: 1.6;">Bonjour <strong>${orderData.customer?.name || ''}</strong>,</p>
                            <p style="color: #374151; font-size: 15px; line-height: 1.6;">Votre commande <strong>#${orderData.order_number}</strong> a bien été enregistrée.</p>
                            <div style="background: #f3f4f6; border-radius: 12px; padding: 20px; margin: 24px 0;">
                                <p style="margin: 0 0 8px; color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Montant total</p>
                                <p style="margin: 0; color: #111827; font-size: 22px; font-weight: 700;">${orderData.total_amount} ${orderData.currency || 'XOF'}</p>
                                <p style="margin: 8px 0 0; color: #6b7280; font-size: 14px;">Paiement à la livraison</p>
                            </div>
                            <p style="color: #374151; font-size: 15px;">Notre équipe vous contactera pour confirmer la livraison.</p>
                        </div>
                        <div style="border-top: 1px solid #e5e7eb; padding: 20px 40px; text-align: center;">
                            <p style="color: #9ca3af; font-size: 13px; margin: 0;">© ${new Date().getFullYear()} ${shopName} · Propulsé par <a href="https://assime.net" style="color: #6b7280; text-decoration: none;">Assimε</a></p>
                        </div>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`[Email] ✅ Confirmation client envoyée à ${customerEmail}`);
        return true;
    } catch (error) {
        console.error(`[Email] ❌ Erreur envoi email client (${customerEmail}):`, error.message);
        return false;
    }
};

/**
 * Envoie une notification de nouvelle commande au MARCHAND (propriétaire de la boutique)
 */
exports.sendOrderEmail = async (to, shopName, orderData) => {
    if (!to || !to.includes('@')) {
        console.log(`[Email] ⏭️ Pas d'email marchand valide, notification ignorée`);
        return false;
    }

    try {
        const itemsList = (orderData.items || [])
            .map(i => `<tr><td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;">${i.name}</td><td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;text-align:center;">×${i.quantity}</td></tr>`)
            .join('');

        const mailOptions = {
            from: `"Assimε Notifications" <${mailConfig.auth.user}>`,
            to: to,
            subject: `🛍️ Nouvelle commande #${orderData.order_number} — ${shopName}`,
            html: `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px;">
                    <div style="background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                        <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 32px 40px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">🛍️ Nouvelle commande !</h1>
                            <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 15px;">${shopName}</p>
                        </div>
                        <div style="padding: 32px 40px;">
                            <p style="color: #374151; font-size: 15px;">Vous avez reçu une nouvelle commande :</p>
                            
                            <div style="background: #fef2f2; border-radius: 12px; padding: 20px; margin: 16px 0; border-left: 4px solid #dc2626;">
                                <p style="margin: 0 0 4px; color: #6b7280; font-size: 13px; font-weight: 600;">COMMANDE</p>
                                <p style="margin: 0; color: #111827; font-size: 18px; font-weight: 700;">#${orderData.order_number}</p>
                            </div>

                            <div style="background: #f0fdf4; border-radius: 12px; padding: 20px; margin: 16px 0; border-left: 4px solid #16a34a;">
                                <p style="margin: 0 0 4px; color: #6b7280; font-size: 13px; font-weight: 600;">MONTANT TOTAL</p>
                                <p style="margin: 0; color: #16a34a; font-size: 24px; font-weight: 700;">${orderData.total_amount} ${orderData.currency || 'XOF'}</p>
                            </div>

                            ${orderData.customer_detail ? `
                            <div style="background: #f3f4f6; border-radius: 12px; padding: 20px; margin: 16px 0;">
                                <p style="margin: 0 0 8px; color: #6b7280; font-size: 13px; font-weight: 600;">INFORMATIONS CLIENT</p>
                                <p style="margin: 0; color: #111827; font-size: 14px; line-height: 1.8;">${orderData.customer_detail}</p>
                            </div>
                            ` : ''}

                            ${itemsList ? `
                            <table style="width:100%;border-collapse:collapse;margin:16px 0;">
                                <thead>
                                    <tr style="background:#f9fafb;">
                                        <th style="padding:8px 12px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase;">Produit</th>
                                        <th style="padding:8px 12px;text-align:center;font-size:12px;color:#6b7280;text-transform:uppercase;">Qté</th>
                                    </tr>
                                </thead>
                                <tbody>${itemsList}</tbody>
                            </table>
                            ` : ''}

                            <div style="text-align: center; margin: 32px 0;">
                                <a href="https://assime.net/orders" 
                                   style="background: #dc2626; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block;">
                                    Gérer cette commande →
                                </a>
                            </div>
                        </div>
                        <div style="border-top: 1px solid #e5e7eb; padding: 20px 40px; text-align: center;">
                            <p style="color: #9ca3af; font-size: 13px; margin: 0;">© ${new Date().getFullYear()} Assimε · Plateforme e-commerce</p>
                        </div>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`[Email] ✅ Notification marchand envoyée à ${to}`);
        return true;
    } catch (error) {
        console.error(`[Email] ❌ Erreur envoi email marchand (${to}):`, error.message);
        return false;
    }
};

/**
 * Envoie une notification WhatsApp au marchand
 */
exports.notifyWhatsAppMerchant = async (phone, shopName, orderData) => {
    if (!phone) return false;

    try {
        const message = `🛍️ *NOUVELLE COMMANDE - ${shopName}*\n\n` +
            `Commande : *${orderData.order_number}*\n` +
            `Client : ${orderData.customer?.name || 'S/O'}\n` +
            `Montant : *${orderData.total_amount} ${orderData.currency || 'XOF'}*\n` +
            `Lien Dashboard : https://assime.net/orders`;

        const encodedMessage = encodeURIComponent(message);
        const waLink = `https://api.whatsapp.com/send?phone=${phone}&text=${encodedMessage}`;

        console.log(`[WhatsApp] 📱 Nouvelle commande détectée. Notification pour: ${phone}`);
        console.log(`[WhatsApp Link] ${waLink}`);

        return true;
    } catch (error) {
        console.error('[WhatsApp] ❌ Erreur notification:', error.message);
        return false;
    }
};
