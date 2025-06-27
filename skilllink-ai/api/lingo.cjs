// Simple Express backend proxy for LingoDotDev API
const express = require('express');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
const router = express.Router();

const LINGO_API_KEY = process.env.VITE_LINGO_DOT_DEV_API_KEY || process.env.LINGO_DOT_DEV_API_KEY;
const LINGO_BASE = 'https://engine.lingo.dev';

// Proxy for language detection
router.post('/recognizeLocale', async (req, res) => {
  try {
    const { text } = req.body;
    const response = await fetch(`${LINGO_BASE}/recognize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': LINGO_API_KEY,
      },
      body: JSON.stringify({ text }),
    });
    const data = await response.json();
    res.json({ locale: data.locale || 'en' });
  } catch (err) {
    res.status(500).json({ error: 'LingoDotDev recognizeLocale failed', details: err.message });
  }
});

// Proxy for translation
router.post('/localizeText', async (req, res) => {
  try {
    const { text, sourceLocale, targetLocale } = req.body;
    const response = await fetch(`${LINGO_BASE}/localize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': LINGO_API_KEY,
      },
      body: JSON.stringify({ text, sourceLocale, targetLocale }),
    });
    const data = await response.json();
    res.json({ localizedText: data.localizedText || text });
  } catch (err) {
    res.status(500).json({ error: 'LingoDotDev localizeText failed', details: err.message });
  }
});

// If run directly, start an Express server
if (require.main === module) {
  const app = express();
  app.use(bodyParser.json());
  app.use('/api/lingo', router);
  const port = process.env.PORT || 3001;
  app.listen(port, () => {
    console.log(`LingoDotDev proxy listening on port ${port}`);
  });
} else {
  // If imported, export the router for use in a larger app
  module.exports = router;
}

// Usage:
// 1. To run standalone: node api/lingo.js
// 2. Or import and use in your main Express app:
//    const lingoRouter = require('./api/lingo');
//    app.use('/api/lingo', lingoRouter);
