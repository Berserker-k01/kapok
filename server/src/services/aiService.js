const { HfInference } = require('@huggingface/inference');

// Configuration
// 1. Google Gemini (Recommandé - Gratuit & Rapide)
// Clé intégrée directement
const GEMINI_API_KEY = "AIzaSyDLJ5CITPjaL9q9-_6u9mCFDdmtQ9sK3-M";

// 2. Hugging Face (Fallback)
const HF_API_KEY = process.env.HF_API_KEY || "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"; // Clé par défaut (peut être expirée)
const hf = new HfInference(HF_API_KEY);

const MODEL_NAME_HF = "mistralai/Mistral-7B-Instruct-v0.3";

/**
 * Appel à l'API Google Gemini (REST)
 */
async function callGemini(prompt) {
    if (!GEMINI_API_KEY) throw new Error("Gemini API Key missing");

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: prompt }]
            }]
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Gemini Error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}

/**
 * Appel à Hugging Face
 */
async function callHuggingFace(prompt) {
    const response = await hf.textGeneration({
        model: MODEL_NAME_HF,
        inputs: prompt,
        parameters: {
            max_new_tokens: 500,
            temperature: 0.7,
            return_full_text: false
        }
    });
    return response.generated_text.trim();
}

/**
 * Stratégie : Tenter Gemini d'abord, sinon Hugging Face
 */
async function generateText(prompt) {
    // 1. Essayer Gemini
    if (GEMINI_API_KEY) {
        try {
            return await callGemini(prompt);
        } catch (e) {
            console.warn("Gemini Failed, switching to Hugging Face:", e.message);
        }
    }

    // 2. Fallback Hugging Face
    return await callHuggingFace(prompt);
}

exports.generateDescription = async (productName, keywords) => {
    try {
        const prompt = `Tu es un expert en marketing e-commerce. Rédige une description produit persuasive et SEO pour : "${productName}".
            Mots-clés à inclure : ${keywords}.
            Ton : Professionnel, engageant, vendeur.
            Longueur : Environ 100-150 mots.
            Format : Une accroche, des points clés, et une conclusion.
            Réponds uniquement avec la description.`;

        const text = await generateText(prompt);
        return text;
    } catch (error) {
        console.error('AI Service Error:', error);
        throw new Error("Impossible de générer la description (Vérifiez les clés API)");
    }
};

exports.chat = async (messages) => {
    try {
        // Convert messages to simple prompt for now (or sophisticated chat structure)
        // Pour Gemini/HF simple, on concatène souvent ou on adapte.

        let prompt = "Tu es l'assistant IA de la plateforme e-commerce 'Assimε'. Aide le commerçant de manière concise.\n\n";
        messages.forEach(m => {
            prompt += `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}\n`;
        });
        prompt += "Assistant:";

        const text = await generateText(prompt);
        return text;

    } catch (error) {
        console.error('AI Chat Error:', error);
        throw new Error("Assistant IA indisponible");
    }
};
