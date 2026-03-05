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
    }
};

const transporter = nodemailer.createTransport(mailConfig);

/**
 * Envoie un email de confirmation de commande
 */
exports.sendOrderEmail = async (to, shopName, orderData) => {
    if (!to || !to.includes('@')) return false;

    try {
        const mailOptions = {
            from: `"${shopName} via Assimε" <noreply@assime.net>`,
            to: to,
            subject: `✅ Commande confirmée - ${orderData.order_number}`,
            html: `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px;">
                    <div style="background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                        <div style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 32px 40px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">✅ Commande confirmée !</h1>
                            <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 15px;">Boutique : <strong>${shopName}</strong></p>
                        </div>
                        <div style="padding: 32px 40px;">
                            <p style="color: #374151; font-size: 15px; line-height: 1.6;">Bonjour,</p>
                            <p style="color: #374151; font-size: 15px; line-height: 1.6;">Votre commande <strong>#${orderData.order_number}</strong> a bien été enregistrée.</p>
                            <div style="background: #f3f4f6; border-radius: 12px; padding: 20px; margin: 24px 0;">
                                <p style="margin: 0 0 8px; color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Détails de la commande</p>
                                <p style="margin: 0; color: #111827; font-size: 22px; font-weight: 700;">${orderData.total_amount} ${orderData.currency || 'XOF'}</p>
                                <p style="margin: 8px 0 0; color: #6b7280; font-size: 14px;">Paiement à la livraison</p>
                            </div>
                            <p style="color: #374151; font-size: 15px;">Notre équipe vous contactera pour confirmer la livraison.</p>
                            <div style="text-align: center; margin: 32px 0;">
                                <a href="https://assime.net/validate-order/${orderData.id}" 
                                   style="background: #16a34a; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block;">
                                    Suivre ma commande →
                                </a>
                            </div>
                        </div>
                        <div style="border-top: 1px solid #e5e7eb; padding: 20px 40px; text-align: center;">
                            <p style="color: #9ca3af; font-size: 13px; margin: 0;">© ${new Date().getFullYear()} ${shopName} · Propulsé par <a href="https://assime.net" style="color: #6b7280; text-decoration: none;">Assimε</a></p>
                        </div>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`[Email] ✅ Confirmation envoyée à ${to}`);
        return true;
    } catch (error) {
        console.error('[Email] ❌ Erreur envoi email:', error.message);
        return false;
    }
};

/**
 * Envoie une notification WhatsApp au marchand
 * Utilisation d'un lien direct cliquable (Simulé car API Native est payante)
 * Alternative: Intégration via UltraMsg/WA-API si disponible.
 */
exports.notifyWhatsAppMerchant = async (phone, shopName, orderData) => {
    if (!phone) return false;

    try {
        const message = `🛍️ *NOUVELLE COMMANDE - ${shopName}*\n\n` +
            `Commande : *${orderData.order_number}*\n` +
            `Client : ${orderData.customer?.name || 'S/O'}\n` +
            `Montant : *${orderData.total_amount} ${orderData.currency || 'XOF'}*\n` +
            `Lien Dashboard : https://e-assime.com/orders`;

        // Si l'utilisateur a une passerelle API WhatsApp (ex: UltraMsg), on l'appelle ici.
        // Pour l'instant on se contente de loguer le lien vers l'API WhatsApp officielle
        // permettant au système d'envoyer le clic au mobile du marchand.
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
