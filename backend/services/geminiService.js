// backend/services/geminiService.js
const { model } = require('../config/gemini');

/**
 * Generates a response from the Gemini AI model.
 * @param {string} prompt - The user's message/prompt for the AI.
 * @returns {Promise<string>} The text response from the AI.
 */
async function getGeminiResponse(prompt) {
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error fetching Gemini response:", error);
        return "I'm having trouble connecting to my brain right now. Please try again later.";
    }
}

module.exports = { getGeminiResponse };