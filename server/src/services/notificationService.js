const nodemailer = require('nodemailer');

/**
 * Service global de notifications (Email, WhatsApp)
 */

// Configuration Nodemailer (Email de l'application)
// À modifier avec vos accès Hostinger Email
const mailConfig = {
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true,
    auth: {
        user: 'noreply@e-assime.com', // Utilisez un vrai mail d'envoi
        pass: 'Daniel2005k@ssi'       // Même mot de passe pour la DB/SaaS ? On suppose.
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
            from: `"${shopName}" <noreply@e-assime.com>`,
            to: to,
            subject: `Nouvelle Commande - ${orderData.order_number}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee;">
                    <h1 style="color: #4CAF50;">Merci pour votre commande !</h1>
                    <p>Bonjour,</p>
                    <p>Votre commande <b>${orderData.order_number}</b> sur <b>${shopName}</b> a été reçue avec succès.</p>
                    <hr/>
                    <h3>Détails du paiement :</h3>
                    <p><b>Total :</b> ${orderData.total_amount} ${orderData.currency || 'XOF'}</p>
                    <p><b>Statut :</b> En attente de traitement</p>
                    <hr/>
                    <p>Consultez votre facture et le suivi en cliquant ici : <a href="https://e-assime.com/validate-order/${orderData.id}">Suivre ma commande</a></p>
                    <p>&copy; 2025 ${shopName} - Kapok Marketplace</p>
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
