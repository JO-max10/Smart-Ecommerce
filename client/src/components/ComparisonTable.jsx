import React from 'react';
import { formatINR } from '../utils/currency.js';

export default function ComparisonTable({
  products,
  activeSort,
  setActiveSort,
  onOpenPriceModal,
  onAddToCart
}) {
  if (!products || products.length === 0) return null;

  // Sort products
  const sorted = [...products].sort((a, b) => {
    if (activeSort === 'price-low') return a.best_price - b.best_price;
    if (activeSort === 'semantic') return b.semantic_match_pct - a.semantic_match_pct;
    if (activeSort === 'battery') {
      const batA = a.key_specs?.battery_hours || 0;
      const batB = b.key_specs?.battery_hours || 0;
      return batB - batA;
    }
    return b.composite_score - a.composite_score;
  });

  return (
    <section className="comparison-section" id="comparisonSection">
      <div className="table-section-header">
        <div className="section-heading">
          <h2>All E-Commerce Specification & Price Comparison</h2>
          <p>Real-time cross-store pricing across Flipkart, Amazon, Meesho, Croma & Official Stores in Indian Rupees (₹)</p>
        </div>
        <div className="table-controls">
          <label style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Sort By:</label>
          <select
            className="table-sort-select"
            value={activeSort}
            onChange={(e) => setActiveSort(e.target.value)}
          >
            <option value="composite">🏆 Highest Recommendation Score</option>
            <option value="price-low">💰 Lowest Price First (₹)</option>
            <option value="semantic">📐 Vector Spec Match %</option>
            <option value="battery">🔋 Longest Battery Life</option>
          </select>
        </div>
      </div>

      <div className="comparison-card">
        <div className="table-responsive">
          <table className="spec-matrix-table">
            <thead>
              <tr>
                <th>Product & Brand</th>
                <th>Prices Across Competing E-Commerce Sites</th>
                <th>Vector DB Match</th>
                <th>Key Specifications</th>
                <th>Synthesized Pros & Cons</th>
                <th>Direct Purchase & Cart</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((p, idx) => {
                const isWinner = idx === 0 && activeSort === 'composite';
                const specs = p.key_specs || {};
                const stores = p.stores || [];
                const bestStore = stores[0] || { store: p.best_store || 'Retailer', price: p.best_price };

                return (
                  <tr key={p.product_id || p.id} className={isWinner ? 'row-winner' : ''}>
                    {/* Product & Brand */}
                    <td>
                      <div className="product-cell">
                        <div className="product-thumb">
                          <img src={p.image} alt={p.name} />
                        </div>
                        <div className="product-meta">
                          <span className="product-brand">{p.brand}</span>
                          <span className="product-title">{p.name}</span>
                          <div className="product-rank-badge">
                            {p.is_new_launch && (
                              <span className="badge-pill-new">✨ 2026 NEW</span>
                            )}
                            <span>{p.badge ? p.badge : `#${p.rank} Rank`}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Multi-Store Real-Time Prices */}
                    <td>
                      <div className="store-offers-box">
                        {stores.map((s, sIdx) => {
                          const isLowest = sIdx === 0;
                          return (
                            <a
                              key={sIdx}
                              href={s.url || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`store-offer-chip ${isLowest ? 'best-offer' : ''}`}
                              title={`Buy on ${s.store} for ${formatINR(s.price)}`}
                            >
                              <span className="store-name">{s.store}:</span>
                              <span className={`store-price ${isLowest ? 'highlight' : ''}`}>
                                {formatINR(s.price)}
                              </span>
                              {isLowest && <span className="lowest-tag">Lowest</span>}
                            </a>
                          );
                        })}
                        <div className="table-delivery-agent">
                          🚚 {p.delivery_agent || `${bestStore.store} Express Logistics`}
                        </div>
                      </div>
                    </td>

                    {/* Vector DB Semantic Match */}
                    <td>
                      <div className="vector-match-cell">
                        <div className="vector-percent">
                          <span>{p.semantic_match_pct}%</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'normal' }}>
                            match
                          </span>
                        </div>
                        <div className="vector-bar-track">
                          <div
                            className="vector-bar-fill"
                            style={{ width: `${p.semantic_match_pct}%` }}
                          ></div>
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '4px' }}>
                          Score: {p.composite_score}/100
                        </div>
                      </div>
                    </td>

                    {/* Key Technical Specs */}
                    <td>
                      <div className="specs-list">
                        {specs.processor && (
                          <div className="spec-item">
                            <span className="spec-icon">⚡</span> {specs.processor.split('(')[0]}
                          </div>
                        )}
                        {specs.display && (
                          <div className="spec-item">
                            <span className="spec-icon">🖥️</span> {specs.display.split('(')[0]}
                          </div>
                        )}
                        {specs.battery_hours && (
                          <div className="spec-item">
                            <span className="spec-icon">🔋</span>
                            <strong>{specs.battery_hours}h</strong> Battery Life
                          </div>
                        )}
                        {specs.weight_lbs && (
                          <div className="spec-item">
                            <span className="spec-icon">🪶</span>
                            <strong>{specs.weight_lbs} lbs</strong>
                          </div>
                        )}
                        {specs.ram && (
                          <div className="spec-item">
                            <span className="spec-icon">💾</span> {specs.ram}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Pros & Cons */}
                    <td>
                      <div className="pros-cons-cell">
                        {(p.pros || []).map((pro, pIdx) => (
                          <div key={pIdx} className="pro-chip">
                            <span style={{ color: '#10b981' }}>✔</span>
                            <span>{pro}</span>
                          </div>
                        ))}
                        {(p.cons || []).map((con, cIdx) => (
                          <div key={cIdx} className="con-chip">
                            <span style={{ color: '#f43f5e' }}>✖</span>
                            <span>{con}</span>
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="action-cell">
                      <div className="table-action-stack">
                        <a
                          href={bestStore.url || p.direct_buy_url || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-table-buy"
                        >
                          <span>Buy on {bestStore.store} ({formatINR(bestStore.price || p.best_price)})</span>
                        </a>

                        {onAddToCart && (
                          <button
                            type="button"
                            className="btn-table-add-cart"
                            onClick={() => onAddToCart(p, bestStore)}
                          >
                            <span>🛒 Add to Cart</span>
                          </button>
                        )}

                        <button
                          type="button"
                          className="btn-table-history"
                          onClick={() => onOpenPriceModal(p)}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 3v18h18" />
                            <path d="m19 9-5 5-4-4-3 3" />
                          </svg>
                          <span>Price Trend</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
