import React from 'react';

export default function Navbar({ watchlistCount, onOpenWatchlist }) {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <div className="brand-wrapper" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="brand-icon-box">⚡</div>
          <div className="brand-text">
            <h1>OmniCart AI</h1>
            <p>MERN Stack Multi-Agent Assistant</p>
          </div>
        </div>

        {/* Real-Time Agent Heartbeat Status */}
        <div className="header-status-pills">
          <div className="status-pill">
            <span className="status-dot"></span>
            <span>5 Autonomous Agents Online</span>
          </div>
          <div className="status-pill">
            <span>🍃 MongoDB Active</span>
          </div>
          <div className="status-pill">
            <span>🌐 Playwright Ready</span>
          </div>
          <div className="status-pill">
            <span>📐 Vector Spec DB Active</span>
          </div>
        </div>

        {/* Header Actions */}
        <div className="header-actions">
          <button className="btn-header" onClick={onOpenWatchlist}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <span>Price Watchlist</span>
            <span className="badge-counter">{watchlistCount}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
