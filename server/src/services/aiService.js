const { HfInference } = require('@huggingface/inference');

// Configuration
// Clé Gemini — priorité variable d'env, fallback hardcoded
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyDLJ5CITPjaL9q9-_6u9mCFDdmtQ9sK3-M";

// Hugging Face (Fallback si Gemini est indisponible)
const HF_API_KEY = process.env.HF_API_KEY || "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";
const hf = new HfInference(HF_API_KEY);
const MODEL_NAME_HF = "mistralai/Mistral-7B-Instruct-v0.3";

/**
 * Appel à l'API Google Gemini (REST) — gemini-2.0-flash
 */
async function callGemini(prompt, systemInstruction = null) {
    if (!GEMINI_API_KEY) throw new Error("Gemini API Key missing");

    // Utiliser gemini-2.0-flash (plus rapide et disponible gratuitement)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

    const body = {
        contents: [{ parts: [{ text: prompt }], role: 'user' }],
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800
        }
    };

    if (systemInstruction) {
        body.systemInstruction = { parts: [{ text: systemInstruction }] };
    }

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Gemini Error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    if (!data.candidates || data.candidates.length === 0) {
        throw new Error("Gemini returned no candidates");
    }
    return data.candidates[0].content.parts[0].text;
}

/**
 * Appel Gemini en mode chat multi-tour (avec historique)
 */
async function callGeminiChat(messages) {
    if (!GEMINI_API_KEY) throw new Error("Gemini API Key missing");

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

    // Convertir les messages au format Gemini
    const contents = messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
    }));

    const body = {
        contents,
        systemInstruction: {
            parts: [{ text: "Tu es l'assistant IA de la plateforme e-commerce 'Assimε'. Tu aides les commerçants africains à gérer leurs boutiques en ligne. Réponds toujours en français, de manière concise, pratique et bienveillante. Pas plus de 3 paragraphes par réponse." }]
        },
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 600
        }
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Gemini Chat Error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    if (!data.candidates || data.candidates.length === 0) {
        throw new Error("Gemini returned no candidates");
    }
    return data.candidates[0].content.parts[0].text;
}

/**
 * Appel à Hugging Face (fallback)
 */
async function callHuggingFace(prompt) {
    const response = await hf.textGeneration({
        model: MODEL_NAME_HF,
        inputs: prompt,
        parameters: { max_new_tokens: 500, temperature: 0.7, return_full_text: false }
    });
    return response.generated_text.trim();
}

/**
 * Génère du texte — Gemini d'abord, Hugging Face en fallback
 */
async function generateText(prompt, systemInstruction = null) {
    if (GEMINI_API_KEY) {
        try {
            return await callGemini(prompt, systemInstruction);
        } catch (e) {
            console.warn("[AI] Gemini failed, switching to Hugging Face:", e.message);
        }
    }
    return await callHuggingFace(prompt);
}

exports.generateDescription = async (productName, keywords) => {
    try {
        const prompt = `Rédige une description produit persuasive et SEO pour : "${productName}".
Mots-clés à inclure : ${keywords}.
Ton : Professionnel, engageant, vendeur.
Longueur : 100-150 mots.
Format : Une accroche percutante, des points clés, une conclusion avec appel à l'action.
Réponds UNIQUEMENT avec la description, sans titre ni explication.`;

        const systemInstruction = "Tu es un expert en marketing e-commerce africain. Tu rédiges des descriptions de produits percutantes en français.";
        const text = await generateText(prompt, systemInstruction);
        return text;
    } catch (error) {
        console.error('AI Service Error:', error);
        throw new Error("Impossible de générer la description (Vérifiez les clés API)");
    }
};

exports.chat = async (messages) => {
    try {
        // Essayer d'abord le mode chat multi-tour Gemini
        if (GEMINI_API_KEY) {
            try {
                return await callGeminiChat(messages);
            } catch (e) {
                console.warn("[AI Chat] Gemini chat failed, fallback to HF:", e.message);
            }
        }

        // Fallback Hugging Face avec prompt condensé
        let prompt = "Tu es l'assistant IA de la plateforme e-commerce 'Assimε'. Aide le commerçant.\n\n";
        messages.slice(-6).forEach(m => {
            prompt += `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}\n`;
        });
        prompt += "Assistant:";

        return await callHuggingFace(prompt);
    } catch (error) {
        console.error('AI Chat Error:', error);
        throw new Error("Assistant IA indisponible");
    }
};
