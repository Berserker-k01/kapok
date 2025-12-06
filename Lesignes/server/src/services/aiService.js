// Service IA simulé (Mock)
// À remplacer par une vraie intégration OpenAI/Gemini plus tard

exports.generateDescription = async (productName, keywords) => {
    // Simulation d'un délai réseau
    await new Promise(resolve => setTimeout(resolve, 1500));

    const adjectives = ['incroyable', 'élégant', 'durable', 'tendance', 'premium', 'indispensable'];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];

    const intros = [
        `Découvrez notre ${productName}, le choix ${adj} pour votre quotidien.`,
        `Vous allez adorer ce ${productName}. C'est tout simplement ${adj}.`,
        `Ne passez pas à côté du ${productName}, un produit ${adj} et de qualité supérieure.`
    ];

    const intro = intros[Math.floor(Math.random() * intros.length)];

    let keywordText = "";
    if (keywords && keywords.length > 0) {
        keywordText = ` Conçu avec une attention particulière aux détails : ${keywords}.`;
    }

    const conclusion = " Commandez dès maintenant et profitez d'une livraison rapide !";

    return `${intro}${keywordText}${conclusion}`;
};
