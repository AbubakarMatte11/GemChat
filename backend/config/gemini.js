// backend/config/gemini.js
const { GoogleGenerativeAI } = require('@google/generative-ai');

// The Gemini API key is loaded from the .env file
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

module.exports = { model };