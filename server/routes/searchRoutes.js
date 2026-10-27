import express from 'express';
import { ShoppingOrchestrator } from '../agents/orchestrator.js';

const router = express.Router();
const orchestrator = new ShoppingOrchestrator();

router.post('/search', async (req, res) => {
  const { query } = req.body;
  if (!query || !query.trim()) {
    return res.status(400).json({ error: 'Search query is required' });
  }
  try {
    const report = await orchestrator.run(query);
    res.json(report);
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/stream-search', async (req, res) => {
  const query = req.query.query;
  if (!query) {
    return res.status(400).json({ error: 'Query parameter required' });
  }

  // Set SSE Headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  try {
    await orchestrator.streamPipeline(query, res);
  } catch (err) {
    console.error('Streaming pipeline error:', err);
    res.write(`event: error\ndata: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
});

export { router as searchRoutes, orchestrator };
