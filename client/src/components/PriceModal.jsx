import React, { useState } from 'react';
import { formatINR } from '../utils/currency.js';

export default function PriceModal({ product, onClose, onSetAlert }) {
  if (!product) return null;

  const analysis = product.price_analysis || {};
  const bestPrice = product.best_price || product.lowest_price || 50000;
  const [targetPrice, setTargetPrice] = useState(
    Math.floor(bestPrice * 0.95)
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
            <stop offset="0%" stopColor="#059669" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
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
          stroke="#059669"
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
              fill="#059669"
              stroke="#ffffff"
              strokeWidth="2"
            >
              <title>{`${t.date}: ${formatINR(t.price)} (${t.store})`}</title>
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

  const handlePreset = (pct) => {
    setTargetPrice(Math.floor(bestPrice * (1 - pct / 100)));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSetAlert({
      product_id: product.product_id || product.id,
      product_name: product.name,
      current_price: bestPrice,
      target_price: Number(targetPrice),
      email
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>90-Day Price History & Drop Alert</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{product.name}</p>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-body">
          {/* Key Stats Row */}
          <div className="chart-stats-row">
            <div className="stat-box">
              <span className="stat-label">Current Lowest</span>
              <span className="stat-val text-emerald">{formatINR(bestPrice)}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">All-Time Low</span>
              <span className="stat-val">{formatINR(analysis.all_time_low || bestPrice * 0.95)}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">90-Day Average</span>
              <span className="stat-val">{formatINR(analysis.average_90d || bestPrice * 1.05)}</span>
            </div>
          </div>

          {/* SVG Price Chart */}
          <div className="chart-container">
            {chartContent || (
              <div style={{ height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                Historical price curve loading...
              </div>
            )}
          </div>

          {/* Price Drop Alert Form */}
          <form className="alert-form" onSubmit={handleSubmit}>
            <div className="alert-header">
              <h4>🔔 Set Real-Time Price Drop Alert (₹)</h4>
              <p>We monitor all major e-commerce platforms 24/7 and notify you instantly when the price drops below your target.</p>
            </div>

            <div className="preset-row">
              <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Quick Target:</span>
              <button type="button" className="preset-btn" onClick={() => handlePreset(5)}>
                -5% ({formatINR(bestPrice * 0.95)})
              </button>
              <button type="button" className="preset-btn" onClick={() => handlePreset(10)}>
                -10% ({formatINR(bestPrice * 0.90)})
              </button>
              <button type="button" className="preset-btn" onClick={() => handlePreset(15)}>
                -15% ({formatINR(bestPrice * 0.85)})
              </button>
            </div>

            <div className="alert-inputs-row">
              <div className="input-group">
                <label>Target Price (₹)</label>
                <input
                  type="number"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  min="100"
                  required
                />
              </div>
              <div className="input-group">
                <label>Notification Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn-save-alert">
                Track Drop (₹)
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
