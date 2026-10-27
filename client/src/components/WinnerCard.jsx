import React from 'react';
import { formatINR } from '../utils/currency.js';

export default function WinnerCard({ winner, rationale, onOpenPriceModal, onAddToCart }) {
  if (!winner) return null;

  const dealRating = winner.price_analysis?.deal_rating || 'Lowest Price Guaranteed';
  const stores = winner.stores || [];
  const bestStore = stores[0] || { store: winner.best_store || 'Retailer', price: winner.best_price };

  return (
    <section className="winner-spotlight">
      <div className="winner-image-box">
        <img src={winner.image} alt={winner.name} />
        <div className="winner-crown-badge">
          <span>👑</span>
          <span>{winner.badge || 'Top Recommended Pick'}</span>
        </div>
        {winner.is_new_launch && (
          <span className="winner-new-badge">
            ✨ 2026 NEW LAUNCH
          </span>
        )}
      </div>

      <div className="winner-info">
        <div className="winner-badges-row">
          <span className="badge-pill deal">🔥 {dealRating}</span>
          <span className="badge-pill vector">📐 {winner.semantic_match_pct}% Semantic Match</span>
          <span
            className="badge-pill"
            style={{
              background: 'rgba(99,102,241,0.15)',
              color: 'var(--accent-indigo-light)',
              border: '1px solid var(--border-accent)'
            }}
          >
            ⭐ {winner.rating} ({winner.review_count?.toLocaleString()} verified reviews)
          </span>
        </div>

        <h2 className="winner-title">{winner.name}</h2>
        <p className="winner-rationale">{rationale}</p>

        {/* Live Multi-Store Price Comparison Strip */}
        <div className="winner-stores-strip">
          <span className="winner-stores-label">Compare All E-Commerce Prices:</span>
          <div className="winner-stores-chips">
            {stores.map((s, idx) => {
              const isLowest = idx === 0;
              return (
                <a
                  key={s.store}
                  href={s.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`winner-store-chip ${isLowest ? 'lowest-store' : ''}`}
                >
                  <span className="winner-chip-name">{s.store}:</span>
                  <span className="winner-chip-price">{formatINR(s.price)}</span>
                  {isLowest && <span className="winner-lowest-pill">Lowest</span>}
                </a>
              );
            })}
          </div>
        </div>

        {/* Delivery Logistics Agent Info */}
        <div className="winner-delivery-bar">
          <span>🚚</span>
          <span>
            {winner.delivery_agent || `${bestStore.store} Assured Express Delivery with Official Warranty`}
          </span>
        </div>

        <div className="winner-pricing-bar">
          <div className="winner-best-price">{formatINR(winner.best_price)}</div>
          <div className="winner-list-price">{formatINR(winner.list_price)}</div>
          {winner.savings > 0 && (
            <div className="winner-savings">
              Save {formatINR(winner.savings)} ({winner.discount_pct}% Off)
            </div>
          )}
          <span style={{ fontSize: '13px', color: 'var(--text-muted)', marginLeft: 'auto' }}>
            Lowest platform: <strong style={{ color: 'var(--accent-emerald)' }}>{bestStore.store}</strong>
          </span>
        </div>

        <div className="winner-actions">
          <a
            href={winner.direct_buy_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-buy-primary"
          >
            <span>Buy on {bestStore.store} ({formatINR(winner.best_price)})</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>

          {onAddToCart && (
            <button
              type="button"
              className="btn-add-cart-winner"
              onClick={() => onAddToCart(winner, bestStore)}
            >
              <span>🛒 Add to Cart</span>
            </button>
          )}

          <button
            type="button"
            className="btn-track-alert"
            onClick={() => onOpenPriceModal(winner)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <span>90-Day History & Alert</span>
          </button>
        </div>
      </div>
    </section>
  );
}
