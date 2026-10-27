import express from 'express';
import { orchestrator } from './searchRoutes.js';

const router = express.Router();

router.get('/products', async (req, res) => {
  try {
    const catalog = await orchestrator.browserAgent.scrape('all');
    res.json(catalog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/products/:id/history', async (req, res) => {
  const { id } = req.params;
  try {
    const analysis = await orchestrator.priceAgent.analyzePrice(id, 800, 1000);
    res.json(analysis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export const productRoutes = router;
