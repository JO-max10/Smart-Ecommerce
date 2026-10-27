import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import { searchRoutes } from './routes/searchRoutes.js';
import { productRoutes } from './routes/productRoutes.js';
import { watchlistRoutes } from './routes/watchlistRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4001;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Smart E-Commerce Multi-Agent Assistant (MERN Backend)',
    stack: 'MongoDB, Express.js, React, Node.js',
    agents: [
      'Preference & Intent Understanding Agent',
      'Playwright Browser Scraper Agent',
      'Vector Database Spec Engine (TF-IDF & Embeddings)',
      'Price Drop & Deal Tracker Agent',
      'Review Synthesis & Recommendation Agent'
    ],
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api', searchRoutes);
app.use('/api', productRoutes);
app.use('/api', watchlistRoutes);

// Serve client static images if needed
const publicImages = path.join(__dirname, '..', 'client', 'public', 'images');
app.use('/images', express.static(publicImages));

// Start listening with resilient port fallback
function startServer(port, maxAttempts = 10) {
  const server = app.listen(port, '127.0.0.1', () => {
    console.log('=================================================================');
    console.log(` Smart E-Commerce Multi-Agent MERN Server running on http://127.0.0.1:${port}`);
    console.log(` Health Check: http://127.0.0.1:${port}/api/health`);
    console.log('=================================================================');
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && maxAttempts > 0) {
      console.log(` Port ${port} is in use, attempting port ${port + 1}...`);
      startServer(port + 1, maxAttempts - 1);
    } else {
      console.error(' Server fatal error:', err);
    }
  });
}

startServer(PORT);
