import React from 'react';

const PRESETS = [
  {
    icon: '💻',
    label: 'Lightweight Coding Laptop < $1000 (Prompt)',
    query: 'Find a lightweight laptop under $1000 with a great battery life for coding'
  },
  {
    icon: '🎧',
    label: 'ANC Headphones < $300 for Flights',
    query: 'Best noise cancelling wireless headphones under $300 for frequent flying'
  },
  {
    icon: '🖥️',
    label: '4K USB-C Coding Monitor < $500',
    query: '4K USB-C productivity monitor with portrait mode under $500'
  },
  {
    icon: '⚡',
    label: 'Budget Ultrabook 16GB < $700',
    query: 'Budget student ultrabook under $700 with 16GB RAM'
  }
];

export default function HeroSearch({ query, setQuery, onSearch, isLoading }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim());
    }
  };

  return (
    <section className="hero-section">
      <div className="hero-tag">
        <span>🤖 Multi-Agent E-Commerce Shopping Assistant (MERN)</span>
      </div>
      <h1 className="hero-title">
        Find the Best Deals & Specs with <span className="text-gradient">Autonomous AI Agents</span>
      </h1>
      <p className="hero-subtitle">
        Understands nuanced criteria, crawls top retailers with Playwright headless browsers, 
        performs semantic vector matching on hardware specs, and tracks 90-day price drops.
      </p>

      {/* Natural Language Search Bar */}
      <form className="search-container" onSubmit={handleSubmit}>
        <div className="search-glass-card">
          <div className="search-icon-prefix">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </div>
          <input
            type="text"
            className="search-input"
            placeholder="e.g. Find a lightweight laptop under $1000 with a great battery life for coding..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className={`search-btn ${isLoading ? 'loading' : ''}`} disabled={isLoading}>
            {isLoading ? (
              <span>Agents Running...</span>
            ) : (
              <>
                <span>Run Multi-Agent Search</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Quick Preset Prompt Pills */}
      <div className="preset-queries">
        {PRESETS.map((p, idx) => (
          <button
            key={idx}
            type="button"
            className="preset-query-btn"
            onClick={() => {
              setQuery(p.query);
              onSearch(p.query);
            }}
          >
            <span>{p.icon}</span>
            <span>{p.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
