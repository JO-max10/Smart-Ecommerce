import React from 'react';

export default function WinnerCard({ winner, rationale, onOpenPriceModal }) {
  if (!winner) return null;

  const dealRating = winner.price_analysis?.deal_rating || 'Great Value Deal';

  return (
    <section className="winner-spotlight">
      <div className="winner-image-box">
        <img src={winner.image} alt={winner.name} />
        <div className="winner-crown-badge">
          <span>👑</span>
          <span>{winner.badge || 'Top Recommended Pick'}</span>
        </div>
      </div>

      <div className="winner-info">
        <div className="winner-badges-row">
          <span className="badge-pill deal">🔥 {dealRating}</span>
          <span className="badge-pill vector">📐 {winner.semantic_match_pct}% Semantic Spec Match</span>
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

        <div className="winner-pricing-bar">
          <div className="winner-best-price">${winner.best_price?.toFixed(2)}</div>
          <div className="winner-list-price">${winner.list_price?.toFixed(2)}</div>
          <div className="winner-savings">
            Save ${winner.savings?.toFixed(2)} ({winner.discount_pct}% Off)
          </div>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)', marginLeft: 'auto' }}>
            Best store: <strong style={{ color: 'var(--text-main)' }}>{winner.best_store}</strong> ({winner.shipping_time})
          </span>
        </div>

        <div className="winner-actions">
          <a
            href={winner.direct_buy_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-buy-primary"
          >
            <span>Direct Purchase at {winner.best_store}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
          <button
            className="btn-track-alert"
            onClick={() => onOpenPriceModal(winner)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <span>Track Price Drop & History</span>
          </button>
        </div>
      </div>
    </section>
  );
}
