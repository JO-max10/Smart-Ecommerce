import express from 'express';
import { orchestrator } from './searchRoutes.js';

const router = express.Router();

router.post('/watchlist', async (req, res) => {
  const { product_id, product_name, target_price, current_price, user_email } = req.body;
  if (!product_id || !target_price) {
    return res.status(400).json({ error: 'product_id and target_price are required' });
  }

  try {
    const alert = await orchestrator.priceAgent.createAlert({
      productId: product_id,
      productName: product_name,
      targetPrice: parseFloat(target_price),
      currentPrice: parseFloat(current_price || target_price),
      userEmail: user_email
    });
    res.json({ status: 'success', alert });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/watchlist', async (req, res) => {
  try {
    const alerts = await orchestrator.priceAgent.getAlerts();
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export const watchlistRoutes = router;
