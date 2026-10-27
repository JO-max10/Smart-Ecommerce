import React from 'react';

const CATEGORIES = [
  { id: 'all', label: 'All Products', icon: '🌟', defaultQuery: 'Compare smallest prices across Flipkart, Amazon, Meesho, Croma and Official Stores' },
  { id: 'fashion', label: 'Dresses & Fashion', icon: '👗', defaultQuery: 'Find beautiful designer dress and anarkali kurta sets at smallest price on Meesho and Flipkart' },
  { id: 'home_decor', label: 'Home Decor', icon: '🏺', defaultQuery: 'Modern ceramic vases and aesthetic home decor items with highest discounts' },
  { id: 'home_kitchen', label: 'Home & Kitchen', icon: '🍳', defaultQuery: 'Best digital air fryer and home kitchen appliances under ₹8,000' },
  { id: 'new_launches', label: '🔥 2026 New Launches', icon: '✨', defaultQuery: 'Show latest 2026 new launch flagship phones and gadgets at smallest price' },
  { id: 'smartphones', label: 'Smartphones', icon: '📱', defaultQuery: 'Compare iPhone 16 Pro and Galaxy S25 Ultra across Flipkart, Amazon and Meesho' },
  { id: 'laptops', label: 'Laptops & Coding', icon: '💻', defaultQuery: 'Find a lightweight laptop under ₹1,00,000 with a great battery life for coding' },
  { id: 'smartwatches', label: 'Smartwatches', icon: '⌚', defaultQuery: 'Compare Apple Watch Series 10 prices across Flipkart, Amazon and Croma' },
  { id: 'headphones', label: 'ANC Headphones', icon: '🎧', defaultQuery: 'Best noise cancelling wireless headphones under ₹30,000 for travel and work' },
  { id: 'monitors', label: '4K Monitors', icon: '🖥️', defaultQuery: '4K USB-C productivity monitor with portrait mode under ₹50,000' }
];

const PRESETS = [
  {
    icon: '👗',
    label: 'Libas Anarkali Dress < ₹1,500',
    query: 'Find Libas embroidered Anarkali dress under ₹1,500 on Meesho and Flipkart'
  },
  {
    icon: '🏺',
    label: 'Ceramic Vase Trio < ₹1,000',
    query: 'Nestasia minimalist ceramic donut vase set home decor deals'
  },
  {
    icon: '🍳',
    label: 'Philips Digital Air Fryer',
    query: 'Compare Philips digital air fryer smallest price across Flipkart and Amazon'
  },
  {
    icon: '✨',
    label: 'iPhone 16 Pro Lowest Price',
    query: 'Find the lowest price on Apple iPhone 16 Pro across Flipkart and Amazon'
  },
  {
    icon: '📱',
    label: 'Galaxy S25 Ultra Deal',
    query: 'Compare Samsung Galaxy S25 Ultra price on Meesho and Flipkart'
  },
  {
    icon: '💻',
    label: 'Coding Laptop < ₹1,00,000',
    query: 'Find a lightweight laptop under ₹1,00,000 with a great battery life for coding'
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
        <span>⚡ Multi-Platform Lowest Price Engine (All E-Commerce Sites)</span>
      </div>
      <h1 className="hero-title">
        Find the <span className="text-gradient">Smallest Price</span> Across All E-Commerce Sites in India
      </h1>
      <p className="hero-subtitle">
        We scan and compare real-time prices across <strong>Flipkart</strong>, <strong>Amazon India</strong>,{' '}
        <strong>Meesho</strong>, <strong>Croma</strong>, <strong>Reliance Digital</strong>, and{' '}
        <strong>Official Brand Stores</strong>. We show you the genuine smallest price with official warranty.
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
            placeholder="Search any product (e.g. iPhone 16 Pro, MacBook M3, Samsung S25, Sony XM5, smallest price in ₹)..."
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
              <span>Comparing Sites...</span>
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
        <span className="store-filter-label">Filter by Winning Store:</span>
        <div className="store-pill-group">
          {[
            { id: 'all', label: '🌐 All E-Commerce Sites' },
            { id: 'Flipkart', label: '🛍️ Flipkart Deals' },
            { id: 'Amazon', label: '📦 Amazon India Deals' },
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
