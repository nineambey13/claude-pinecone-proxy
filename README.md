# Claude and Pinecone API Proxy Server

A simple proxy server for Claude and Pinecone APIs to avoid exposing API keys in client-side code.

## Features

- Proxies requests to Claude API
- Proxies requests to Pinecone API
- Handles CORS
- Provides health check endpoint

## Environment Variables

- `CLAUDE_API_KEY`: Your Claude API key
- `PINECONE_API_KEY`: Your Pinecone API key
- `PORT`: (Optional) Port to run the server on (defaults to 3001)

## API Endpoints

- `GET /`: Root endpoint
- `GET /health`: Health check endpoint
- `POST /api/claude`: Claude API proxy
- `POST /api/pinecone/query`: Pinecone query API proxy

## Running Locally

```bash
npm install
npm start
```
