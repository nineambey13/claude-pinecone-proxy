// Simple Express server for API proxying (optimized for Render.com)
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON request bodies
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'API proxy server is running',
    endpoints: ['/api/pinecone/query', '/api/claude', '/health']
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    pineconeApiConfigured: !!process.env.PINECONE_API_KEY,
    claudeApiConfigured: !!process.env.CLAUDE_API_KEY
  });
});

// Claude API Proxy
app.post('/api/claude', async (req, res) => {
  try {
    if (!process.env.CLAUDE_API_KEY) {
      return res.status(500).json({ error: 'Claude API key not configured on the server' });
    }
    
    console.log('Proxying request to Claude API');
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(req.body)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Claude API error (${response.status}): ${errorText}`);
      return res.status(response.status).json({
        error: `Claude API error: ${response.statusText}`,
        details: errorText
      });
    }
    
    const data = await response.json();
    console.log('Claude API response received successfully');
    res.json(data);
  } catch (error) {
    console.error('Error proxying to Claude API:', error);
    res.status(500).json({ error: error.message });
  }
});

// Pinecone API Proxy
app.post('/api/pinecone/query', async (req, res) => {
  try {
    if (!process.env.PINECONE_API_KEY) {
      return res.status(500).json({ error: 'Pinecone API key not configured on the server' });
    }

    console.log('Proxying request to Pinecone API');
    
    const { vector, topK = 10, includeMetadata = true, includeValues = true } = req.body;

    // The correct URL for the clarity-opensource index
    const pineconeUrl = 'https://clarity-opensource-pdxguy4.svc.aped-4627-b74a.pinecone.io/query';

    const response = await fetch(pineconeUrl, {
      method: 'POST',
      headers: {
        'Api-Key': process.env.PINECONE_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        vector,
        topK,
        includeMetadata,
        includeValues
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Pinecone API error (${response.status}): ${errorText}`);
      return res.status(response.status).json({
        error: `Pinecone API error: ${response.statusText}`,
        details: errorText
      });
    }

    const data = await response.json();
    console.log('Pinecone API response received successfully');
    res.json(data);
  } catch (error) {
    console.error('Error proxying to Pinecone API:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
