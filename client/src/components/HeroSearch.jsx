import React from 'react';

const CATEGORIES = [
  { id: 'all', label: 'All Products', icon: '🌟', defaultQuery: 'Show all top tech deals across Amazon, Flipkart, Meesho, and Official Stores' },
  { id: 'new_launches', label: '🔥 2026 New Launches', icon: '✨', defaultQuery: 'Show latest 2026 new launch flagship phones and gadgets at lowest price' },
  { id: 'smartphones', label: 'Smartphones', icon: '📱', defaultQuery: 'Find best price on iPhone 16 Pro and Galaxy S25 Ultra across Flipkart and Meesho' },
  { id: 'laptops', label: 'Laptops & Coding', icon: '💻', defaultQuery: 'Find a lightweight laptop under $1000 with a great battery life for coding' },
  { id: 'smartwatches', label: 'Smartwatches', icon: '⌚', defaultQuery: 'Compare Apple Watch Series 10 prices across Flipkart, Amazon, and Apple Store' },
  { id: 'headphones', label: 'ANC Headphones', icon: '🎧', defaultQuery: 'Best noise cancelling wireless headphones under $350 for travel and work' },
  { id: 'monitors', label: '4K Monitors', icon: '🖥️', defaultQuery: '4K USB-C productivity monitor with portrait mode under $500' }
];

const PRESETS = [
  {
    icon: '✨',
    label: 'iPhone 16 Pro Lowest Price',
    query: 'Find the lowest price on Apple iPhone 16 Pro across Flipkart and Amazon'
  },
  {
    icon: '📱',
    label: 'Samsung S25 Ultra Deal',
    query: 'Compare Samsung Galaxy S25 Ultra price on Meesho and Flipkart'
  },
  {
    icon: '💻',
    label: 'Coding Laptop < $1000',
    query: 'Find a lightweight laptop under $1000 with a great battery life for coding'
  },
  {
    icon: '⌚',
    label: 'Apple Watch Series 10',
    query: 'Apple Watch Series 10 lowest verified price deal'
  },
  {
    icon: '🎧',
    label: 'Sony XM5 ANC Headphones',
    query: 'Sony WH-1000XM5 wireless noise cancelling headphones lowest price'
  }
];

export default function HeroSearch({
  query,
  setQuery,
  onSearch,
  isLoading,
  selectedStoreFilter = 'all',
  setSelectedStoreFilter
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim());
    }
  };

  const handleClear = () => {
    setQuery('');
  };

  return (
    <section className="hero-section">
      <div className="hero-tag">
        <span>⚡ Multi-Platform Lowest Price Engine</span>
      </div>
      <h1 className="hero-title">
        Find the <span className="text-gradient">Smallest Price</span> Across Amazon, Flipkart & Meesho
      </h1>
      <p className="hero-subtitle">
        We track prices across Amazon, Flipkart, Meesho, and Official Brand Stores in real time.
        We direct you straight to the verified seller giving the absolute lowest price with full official warranty.
      </p>

      {/* Category Quick Selectors */}
      <div className="category-tabs">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className="category-tab-btn"
            onClick={() => {
              if (cat.defaultQuery) {
                setQuery(cat.defaultQuery);
                onSearch(cat.defaultQuery);
              }
            }}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Natural Language Search Bar */}
      <form className="search-container" onSubmit={handleSubmit}>
        <div className="search-glass-card">
          <div className="search-icon-prefix">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </div>
          <input
            type="text"
            className="search-input"
            placeholder="Search any product or brand (e.g. iPhone 16 Pro, MacBook M3, Samsung S25, Sony XM5, low price on Flipkart)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          {/* Quick Clear Button */}
          {query && (
            <button
              type="button"
              className="btn-clear-query"
              onClick={handleClear}
              title="Clear search"
            >
              &times;
            </button>
          )}

          <button type="submit" className={`search-btn ${isLoading ? 'loading' : ''}`} disabled={isLoading}>
            {isLoading ? (
              <span>Searching...</span>
            ) : (
              <>
                <span>Compare Lowest Prices</span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Platform Filter Buttons */}
      <div className="store-filters-strip">
        <span className="store-filter-label">Filter by Winning Platform:</span>
        <div className="store-pill-group">
          {[
            { id: 'all', label: '🌐 All Stores' },
            { id: 'Flipkart', label: '🛍️ Flipkart Deals' },
            { id: 'Amazon', label: '📦 Amazon Deals' },
            { id: 'Meesho', label: '🏷️ Meesho Deals' },
            { id: 'Official', label: '🏢 Official Brand Stores' }
          ].map((st) => (
            <button
              key={st.id}
              type="button"
              className={`store-filter-pill ${selectedStoreFilter === st.id ? 'active' : ''}`}
              onClick={() => setSelectedStoreFilter(st.id)}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Suggested Search Chips */}
      <div className="preset-queries">
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginRight: '4px' }}>Try:</span>
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
