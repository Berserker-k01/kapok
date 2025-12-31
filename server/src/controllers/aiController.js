const aiService = require('../services/aiService');
const catchAsync = require('../utils/catchAsync');

exports.generateDescription = catchAsync(async (req, res, next) => {
    const { productName, keywords } = req.body;

    if (!productName) {
        return res.status(400).json({
            status: 'fail',
            message: 'Le nom du produit est requis'
        });
    }

    const description = await aiService.generateDescription(productName, keywords);

    res.status(200).json({
        status: 'success',
        data: {
            description
        }
    });
});

exports.chat = catchAsync(async (req, res, next) => {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({
            status: 'fail',
            message: 'Les messages sont requis et doivent être un tableau'
        });
    }

    const reply = await aiService.chat(messages);

    res.status(200).json({
        status: 'success',
        data: {
            reply
        }
    });
});
