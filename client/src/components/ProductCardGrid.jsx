import React from 'react';
import { formatINR } from '../utils/currency.js';

export default function ProductCardGrid({ products, onOpenPriceModal, onAddToCart }) {
  if (!products || products.length === 0) return null;

  return (
    <div className="product-grid">
      {products.map((p) => {
        const specs = p.key_specs || {};
        const stores = p.stores || [];
        const bestStore = stores[0] || { store: p.best_store || 'Retailer', price: p.best_price };
        const bestPrice = bestStore.price || p.best_price;
        const listPrice = p.list_price || bestPrice;
        const savings = Math.max(0, listPrice - bestPrice);

        return (
          <div key={p.product_id || p.id} className="product-card">
            {/* Image Header with Badge */}
            <div className="product-card-media">
              <img src={p.image} alt={p.name} loading="lazy" />
              <div className="product-card-top-badges">
                {p.is_new_launch && (
                  <span className="badge-new-launch">
                    ✨ 2026 NEW LAUNCH
                  </span>
                )}
                {p.badge && (
                  <div className="product-card-badge">
                    {p.badge}
                  </div>
                )}
              </div>
            </div>

            {/* Content Body */}
            <div className="product-card-body">
              <div className="product-card-brand">{p.brand}</div>
              <h3 className="product-card-title">{p.name}</h3>

              {/* Rating & Reviews */}
              <div className="product-card-rating">
                <span style={{ color: '#fbbf24' }}>★</span>
                <strong>{p.rating}</strong>
                <span className="rating-count">({p.review_count?.toLocaleString()} verified reviews)</span>
              </div>

              {/* Delivery Agent Guarantee */}
              <div className="product-card-delivery-agent">
                <span>🚚</span>
                <span>
                  {p.delivery_agent || `${bestStore.store} Assured Express Delivery`}
                </span>
              </div>

              {/* Multi-Platform Price Comparison Strip */}
              <div className="card-platform-comparison">
                <span className="platform-comp-title">Live E-Commerce Prices:</span>
                <div className="platform-chips-row">
                  {stores.map((s, idx) => {
                    const isLowest = idx === 0;
                    return (
                      <a
                        key={s.store}
                        href={s.url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`platform-chip ${isLowest ? 'lowest-chip' : ''}`}
                        title={`Buy on ${s.store} for ${formatINR(s.price)}`}
                      >
                        <span className="store-chip-name">{s.store}:</span>
                        <span className="store-chip-price">{formatINR(s.price)}</span>
                        {isLowest && <span className="lowest-dot" title="Lowest verified price">★</span>}
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* Key Specs Tags */}
              <div className="card-specs-row">
                {specs.display && <span className="spec-tag">🖥️ {specs.display.slice(0, 24)}...</span>}
                {specs.battery_hours && (
                  <span className="spec-tag">🔋 {specs.battery_hours}h Battery</span>
                )}
                {specs.weight_lbs && (
                  <span className="spec-tag">🪶 {specs.weight_lbs} lbs</span>
                )}
                {specs.ram && (
                  <span className="spec-tag">💾 {specs.ram}</span>
                )}
              </div>

              {/* Highlighted Smallest Price Section */}
              <div className="card-pricing-section">
                <div>
                  <div className="lowest-price-tag-label">
                    🏆 Smallest Price on <strong>{bestStore.store}</strong>
                  </div>
                  <div className="card-best-price">{formatINR(bestPrice)}</div>
                  {savings > 0 && (
                    <div className="card-savings">
                      Save {formatINR(savings)} vs list price ({formatINR(listPrice)})
                    </div>
                  )}
                </div>
              </div>

              {/* Primary Actions: Buy on Platform + Add to Cart */}
              <div className="card-actions">
                <a
                  href={bestStore.url || p.direct_buy_url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-card-buy"
                >
                  <span>Buy on {bestStore.store}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </a>

                {onAddToCart && (
                  <button
                    type="button"
                    className="btn-card-add-cart"
                    onClick={() => onAddToCart(p, bestStore)}
                    title="Add to CartNova cart at lowest price"
                  >
                    <span>+ Cart</span>
                  </button>
                )}

                <button
                  type="button"
                  className="btn-card-alert"
                  onClick={() => onOpenPriceModal(p)}
                  title="Track price drops & view 90-day history"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                  </svg>
                  <span>History</span>
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
