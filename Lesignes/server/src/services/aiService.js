const OpenAI = require('openai');

// Configuration DeepSeek
const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: process.env.DEEPSEEK_API_KEY || 'sk-a439b183a41148a0888c70d77551454a' // Fallback temporaire pour dev, à mettre dans .env
});

exports.generateDescription = async (productName, keywords) => {
    try {
        const prompt = `
            Tu es un expert en marketing e-commerce. Rédige une description produit persuasive et SEO pour : "${productName}".
            Mots-clés à inclure : ${keywords}.
            Ton : Professionnel, engageant, vendeur.
            Longueur : Environ 100-150 mots.
            Format : Une accroche, des points clés, et une conclusion.
        `;

        const completion = await openai.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "deepseek-chat",
        });

        return completion.choices[0].message.content;
    } catch (error) {
        console.error('DeepSeek Error:', error);
        throw new Error("Erreur lors de la génération de la description");
    }
};

exports.chat = async (messages) => {
    try {
        // Ajouter le contexte système si ce n'est pas le cas
        const systemMessage = {
            role: "system",
            content: "Tu es l'assistant IA de la plateforme e-commerce 'Lesigne'. Tu aides les commerçants à gérer leur boutique, optimiser leurs ventes et résoudre leurs problèmes techniques. Sois concis, utile et courtois."
        };

        const conversation = [systemMessage, ...messages];

        const completion = await openai.chat.completions.create({
            messages: conversation,
            model: "deepseek-chat",
        });

        return completion.choices[0].message.content;
    } catch (error) {
        console.error('DeepSeek Chat Error:', error);
        throw new Error("Erreur de l'assistant IA");
    }
};
