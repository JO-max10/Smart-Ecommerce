/**
 * Agent 4: Price Drop & Deal Tracking Agent (Node.js)
 * Analyzes historical pricing curves, flags All-Time Lows, calculates deal quality,
 * and manages user price drop alert triggers.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PriceHistory } from '../models/PriceHistory.js';
import { Watchlist } from '../models/Watchlist.js';
import { getDBStatus } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class PriceDropAgent {
  constructor() {
    this.name = 'Price Drop & History Tracker Agent';
    this.role = '90-Day Price Trend Analysis & Deal Quality Scoring';
    this.historyData = this._loadSeedPriceHistory();
    this.inMemoryAlerts = [];
  }

  _loadSeedPriceHistory() {
    try {
      const p = path.join(__dirname, '..', 'data', 'seedPriceHistory.json');
      const data = fs.readFileSync(p, 'utf-8');
      return JSON.parse(data);
    } catch (e) {
      console.error('Error loading seed price history:', e);
      return {};
    }
  }

  async analyzePrice(productId, currentLowestPrice, listPrice) {
    let historyRecord = null;

    if (getDBStatus()) {
      try {
        historyRecord = await PriceHistory.findOne({ product_id: productId }).lean();
      } catch (err) {
        console.warn('MongoDB PriceHistory fallback:', err.message);
      }
    }

    if (!historyRecord) {
      historyRecord = this.historyData[productId] || {};
    }

    let atl = Number(historyRecord.all_time_low || currentLowestPrice * 0.95);
    const ath = Number(historyRecord.all_time_high || listPrice);
    const avg90d = Number(historyRecord.average_90d || (currentLowestPrice + listPrice) / 2);

    if (currentLowestPrice < atl) atl = currentLowestPrice;

    const savingsVsList = Math.round((listPrice - currentLowestPrice) * 100) / 100;
    const savingsVsAvg = Math.round((avg90d - currentLowestPrice) * 100) / 100;
    const discountPct = listPrice > 0 ? Math.round(((listPrice - currentLowestPrice) / listPrice) * 1000) / 10 : 0.0;

    const isAtl = currentLowestPrice <= (atl + 1.0);
    const isNearAtl = currentLowestPrice <= (atl * 1.05);

    let dealRating = 'Standard Market Price';
    let dealScore = 65;
    let recommendation = 'Fair price; price tracking active for upcoming drops.';

    if (isAtl && discountPct >= 20.0) {
      dealRating = '🔥 Historic All-Time Low';
      dealScore = 98;
      recommendation = 'Immediate Buy: Lowest price recorded in the past 90 days.';
    } else if (isAtl) {
      dealRating = '⚡ All-Time Low';
      dealScore = 93;
      recommendation = 'Great time to buy: Matches recorded historical low.';
    } else if (savingsVsAvg > 50.0) {
      dealRating = '🏷️ Deep Discount vs Average';
      dealScore = 88;
      recommendation = `Save $${savingsVsAvg.toFixed(0)} below the 90-day average price.`;
    } else if (discountPct >= 10.0) {
      dealRating = '👍 Solid Deal';
      dealScore = 80;
      recommendation = 'Good discount from MSRP with recent downward price trajectory.';
    }

    const timeline = (historyRecord.timeline || []).map(p => ({
      date: p.date,
      price: Number(p.price),
      store: p.store || 'Retailer'
    }));

    return {
      product_id: productId,
      current_price: currentLowestPrice,
      list_price: listPrice,
      all_time_low: atl,
      all_time_high: ath,
      average_90d: avg90d,
      savings_vs_list: savingsVsList,
      savings_vs_avg: savingsVsAvg,
      price_drop_pct: discountPct,
      is_all_time_low: isAtl,
      is_near_all_time_low: isNearAtl,
      deal_rating: dealRating,
      deal_score: dealScore,
      recommendation,
      history: timeline
    };
  }

  async createAlert({ productId, productName, targetPrice, currentPrice, userEmail = 'user@example.com' }) {
    const isTriggered = currentPrice <= targetPrice;
    const diff = targetPrice - currentPrice;
    const statusMsg = isTriggered
      ? `Target met! Current price $${currentPrice.toFixed(2)} is already at or below your $${targetPrice.toFixed(2)} target.`
      : `Alert active! We will notify you when price drops by $${(-diff).toFixed(2)} to hit $${targetPrice.toFixed(2)}.`;

    const alertItem = {
      alert_id: `alt_${Math.random().toString(36).substring(2, 10)}`,
      product_id: productId,
      product_name: productName,
      target_price: targetPrice,
      current_price: currentPrice,
      user_email: userEmail,
      is_triggered: isTriggered,
      status_message: statusMsg,
      createdAt: new Date()
    };

    if (getDBStatus()) {
      try {
        await Watchlist.create(alertItem);
      } catch (err) {
        console.warn('Failed to save alert in MongoDB:', err.message);
      }
    }

    this.inMemoryAlerts.unshift(alertItem);
    return alertItem;
  }

  async getAlerts() {
    if (getDBStatus()) {
      try {
        const docs = await Watchlist.find().sort({ createdAt: -1 }).lean();
        if (docs && docs.length > 0) return docs;
      } catch (err) {
        console.warn('MongoDB Watchlist get fallback:', err.message);
      }
    }
    return this.inMemoryAlerts;
  }
}
