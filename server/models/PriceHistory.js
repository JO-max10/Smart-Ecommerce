import mongoose from 'mongoose';

const TimelinePointSchema = new mongoose.Schema({
  date: { type: String, required: true },
  price: { type: Number, required: true },
  store: { type: String, default: 'Retailer' }
}, { _id: false });

const PriceHistorySchema = new mongoose.Schema({
  product_id: { type: String, required: true, unique: true, index: true },
  product_name: { type: String, required: true },
  current_price: { type: Number, required: true },
  list_price: { type: Number, required: true },
  all_time_low: { type: Number, required: true },
  all_time_high: { type: Number, required: true },
  average_90d: { type: Number, required: true },
  price_drop_pct: { type: Number, default: 0.0 },
  is_near_all_time_low: { type: Boolean, default: false },
  deal_rating: { type: String, default: 'Standard Price' },
  timeline: [TimelinePointSchema]
}, {
  timestamps: true
});

export const PriceHistory = mongoose.models.PriceHistory || mongoose.model('PriceHistory', PriceHistorySchema);
