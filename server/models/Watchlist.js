import mongoose from 'mongoose';

const WatchlistSchema = new mongoose.Schema({
  alert_id: { type: String, required: true, unique: true },
  product_id: { type: String, required: true, index: true },
  product_name: { type: String, required: true },
  target_price: { type: Number, required: true },
  current_price: { type: Number, required: true },
  user_email: { type: String, default: 'user@example.com' },
  is_triggered: { type: Boolean, default: false },
  status_message: { type: String }
}, {
  timestamps: true
});

export const Watchlist = mongoose.models.Watchlist || mongoose.model('Watchlist', WatchlistSchema);
