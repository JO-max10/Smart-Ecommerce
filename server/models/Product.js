import mongoose from 'mongoose';

const StoreOfferSchema = new mongoose.Schema({
  store: { type: String, required: true },
  price: { type: Number, required: true },
  shipping: { type: String, default: 'Standard Shipping' },
  shipping_days: { type: Number, default: 3 },
  in_stock: { type: Boolean, default: true },
  url: { type: String, default: '#' },
  badge: { type: String }
}, { _id: false });

const ProductSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  category: { type: String, required: true, index: true },
  brand: { type: String, required: true },
  image: { type: String, required: true },
  base_price: { type: Number, required: true },
  list_price: { type: Number, required: true },
  rating: { type: Number, default: 4.5 },
  review_count: { type: Number, default: 100 },
  stores: [StoreOfferSchema],
  specs: { type: mongoose.Schema.Types.Mixed, default: {} },
  pros: [{ type: String }],
  cons: [{ type: String }],
  ideal_for: { type: String },
  summary: { type: String },
  spec_vector: [{ type: Number }]
}, {
  timestamps: true
});

export const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
