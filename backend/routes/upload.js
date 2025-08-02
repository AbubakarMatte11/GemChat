const express = require('express');
const multer = require('multer');
const path = require('path');
const { admin } = require('../config/firebase');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const { chatId, senderId } = req.body;
    const file = req.file;
    
    // Generate unique filename
    const fileName = `${Date.now()}_${file.originalname}`;
    const filePath = `chat-media/${chatId}/${fileName}`;
    
    // Upload to Firebase Storage
    const bucket = admin.storage().bucket();
    const fileUpload = bucket.file(filePath);
    
    const stream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });
    
    stream.on('error', (error) => {
      console.error('Upload error:', error);
      res.status(500).json({ success: false, error: 'Upload failed' });
    });
    
    stream.on('finish', async () => {
      // Make file publicly accessible
      await fileUpload.makePublic();
      
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
      
      res.json({ success: true, url: publicUrl });
    });
    
    stream.end(file.buffer);
    
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;