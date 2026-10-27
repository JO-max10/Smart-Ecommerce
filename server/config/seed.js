import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { connectDB } from './db.js';
import { Product } from '../models/Product.js';
import { PriceHistory } from '../models/PriceHistory.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seedData() {
  console.log(' Seeding MongoDB with rich E-Commerce catalog and 90-day price history...');
  const connected = await connectDB();
  if (!connected) {
    console.error(' Cannot seed: MongoDB is not connected.');
    process.exit(1);
  }

  try {
    // 1. Seed Products
    const catalogPath = path.join(__dirname, '..', 'data', 'seedCatalog.json');
    const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));

    await Product.deleteMany({});
    console.log(' Cleared existing Product collection.');
    await Product.insertMany(catalog);
    console.log(` Successfully seeded ${catalog.length} products into MongoDB.`);

    // 2. Seed Price History
    const historyPath = path.join(__dirname, '..', 'data', 'seedPriceHistory.json');
    const historyData = JSON.parse(fs.readFileSync(historyPath, 'utf-8'));

    await PriceHistory.deleteMany({});
    console.log(' Cleared existing PriceHistory collection.');

    const historyDocs = Object.entries(historyData).map(([productId, h]) => ({
      product_id: productId,
      product_name: h.product_name,
      current_price: h.current_price,
      list_price: h.list_price,
      all_time_low: h.all_time_low,
      all_time_high: h.all_time_high,
      average_90d: h.average_90d,
      price_drop_pct: h.price_drop_pct,
      is_near_all_time_low: h.is_near_all_time_low,
      deal_rating: h.deal_rating,
      timeline: h.timeline
    }));

    await PriceHistory.insertMany(historyDocs);
    console.log(` Successfully seeded ${historyDocs.length} price history curves into MongoDB.`);

    console.log(' MongoDB Database seeding complete!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(' Seeding failed:', err);
    process.exit(1);
  }
}

seedData();
