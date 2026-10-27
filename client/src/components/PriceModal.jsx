import React, { useState } from 'react';

export default function PriceModal({ product, onClose, onSetAlert }) {
  if (!product) return null;

  const analysis = product.price_analysis || {};
  const [targetPrice, setTargetPrice] = useState(
    Math.floor((product.best_price || 900) * 0.95)
  );
  const [email, setEmail] = useState('user@example.com');

  const timeline = analysis.history || [];

  // SVG Chart Calculation
  const width = 580;
  const height = 180;
  const padding = 35;

  let chartContent = null;
  if (timeline.length > 0) {
    const prices = timeline.map(t => t.price);
    const minPrice = Math.min(...prices) * 0.96;
    const maxPrice = Math.max(...prices) * 1.04;

    const getX = (idx) => padding + (idx / (timeline.length - 1)) * (width - padding * 2);
    const getY = (val) => height - padding - ((val - minPrice) / (maxPrice - minPrice)) * (height - padding * 2);

    const points = timeline.map((t, idx) => `${getX(idx)},${getY(t.price)}`).join(' ');

    chartContent = (
      <svg className="chart-svg" viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Gradient Area Fill */}
        <polygon
          points={`${padding},${height - padding} ${points} ${getX(timeline.length - 1)},${height - padding}`}
          fill="url(#chartGradient)"
        />

        {/* Line Stroke */}
        <polyline
          points={points}
          fill="none"
          stroke="#06b6d4"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Points & Labels */}
        {timeline.map((t, idx) => (
          <g key={idx}>
            <circle
              cx={getX(idx)}
              cy={getY(t.price)}
              r="4.5"
              fill="#06b6d4"
              stroke="#040711"
              strokeWidth="2"
            >
              <title>{`${t.date}: $${t.price} (${t.store})`}</title>
            </circle>
            <text
              x={getX(idx)}
              y={height - 10}
              fill="#64748b"
              fontSize="9"
              textAnchor="middle"
            >
              {t.date.slice(5)}
            </text>
          </g>
        ))}
      </svg>
    );
  }

  const handleAlertSubmit = (e) => {
    e.preventDefault();
    if (!targetPrice || targetPrice <= 0) return;
    onSetAlert({
      product_id: product.product_id,
      product_name: product.name,
      target_price: parseFloat(targetPrice),
      current_price: product.best_price,
      user_email: email
    });
  };

  return (
    <div className="modal-overlay active" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>{product.name}</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
              90-Day Cross-Retailer Price History & Alert Engine
            </span>
          </div>
          <button className="btn-close-modal" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-body">
          <div className="chart-stats-row">
            <div className="stat-box">
              <div className="stat-label">Current Lowest</div>
              <div className="stat-val">${product.best_price?.toFixed(2)}</div>
            </div>
            <div className="stat-box highlight">
              <div className="stat-label">All-Time Low (90d)</div>
              <div className="stat-val">${analysis.all_time_low?.toFixed(2)}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">90-Day Average</div>
              <div className="stat-val">${analysis.average_90d?.toFixed(2)}</div>
            </div>
          </div>

          {/* Chart Container */}
          <div className="chart-container">
            {chartContent || (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>
                No historical points available.
              </div>
            )}
          </div>

          {/* Alert Form */}
          <form className="alert-form-box" onSubmit={handleAlertSubmit}>
            <h4>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              <span>Set Price Drop Notification</span>
            </h4>
            <div className="alert-inputs">
              <input
                type="number"
                className="alert-input"
                placeholder="Target Price ($)"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                required
              />
              <input
                type="email"
                className="alert-input"
                placeholder="Notify Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" className="btn-submit-alert">
                Track Price Drop
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
