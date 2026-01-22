const { HfInference } = require('@huggingface/inference');

// Configuration Hugging Face
const hf = new HfInference("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");

const MAX_RETRIES = 3;
const MODEL_NAME = "mistralai/Mistral-7B-Instruct-v0.3";

async function retry(fn, retries = MAX_RETRIES) {
    try {
        return await fn();
    } catch (error) {
        if (retries > 0) {
            console.log(`Retrying... (${retries} attempts left)`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            return retry(fn, retries - 1);
        }
        throw error;
    }
}

exports.generateDescription = async (productName, keywords) => {
    try {
        const prompt = `<s>[INST] Tu es un expert en marketing e-commerce. Rédige une description produit persuasive et SEO pour : "${productName}".
            Mots-clés à inclure : ${keywords}.
            Ton : Professionnel, engageant, vendeur.
            Longueur : Environ 100-150 mots.
            Format : Une accroche, des points clés, et une conclusion.
            Réponds uniquement avec la description, sans texte introductif. [/INST]`;

        const response = await retry(() => hf.textGeneration({
            model: MODEL_NAME,
            inputs: prompt,
            parameters: {
                max_new_tokens: 500,
                temperature: 0.7,
                return_full_text: false
            }
        }));

        return response.generated_text.trim();
    } catch (error) {
        console.error('Hugging Face Error:', error);
        throw new Error("Erreur lors de la génération de la description");
    }
};

exports.chat = async (messages) => {
    try {
        // Convertir le format de messages pour Mistral si nécessaire
        const systemMessage = {
            role: "system",
            content: "Tu es l'assistant IA de la plateforme e-commerce 'Assimε'. Tu aides les commerçants à gérer leur boutique, optimiser leurs ventes et résoudre leurs problèmes techniques. Sois concis, utile et courtois."
        };

        const conversation = [systemMessage, ...messages];

        const response = await retry(() => hf.chatCompletion({
            model: MODEL_NAME,
            messages: conversation,
            max_tokens: 500,
            temperature: 0.7
        }));

        return response.choices[0].message.content;

    } catch (error) {
        console.error('Hugging Face Chat Error:', error);
        throw new Error("Erreur de l'assistant IA");
    }
};
