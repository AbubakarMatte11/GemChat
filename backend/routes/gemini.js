const express = require('express');
const { model } = require('../config/gemini');
const router = express.Router();

// Get AI response
router.post('/chat', async (req, res) => {
  try {
    const { message, context } = req.body;
    
    let prompt = message;
    if (context) {
      prompt = `Context: ${context}\n\nUser: ${message}\n\nPlease respond helpfully:`;
    }
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    res.json({ success: true, response: text });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get message suggestions
router.post('/suggestions', async (req, res) => {
  try {
    const { lastMessages } = req.body;
    
    const prompt = `Based on this conversation context: ${lastMessages.join('\n')}\n\nSuggest 3 short, appropriate reply options:`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse suggestions (you might want to improve this parsing)
    const suggestions = text.split('\n').filter(s => s.trim()).slice(0, 3);
    
    res.json({ success: true, suggestions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;