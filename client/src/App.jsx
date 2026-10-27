import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import HeroSearch from './components/HeroSearch.jsx';
import AgentFlow from './components/AgentFlow.jsx';
import WinnerCard from './components/WinnerCard.jsx';
import ProductCardGrid from './components/ProductCardGrid.jsx';
import ComparisonTable from './components/ComparisonTable.jsx';
import CartPage from './components/CartPage.jsx';
import PriceModal from './components/PriceModal.jsx';
import WatchlistModal from './components/WatchlistModal.jsx';
import Toast from './components/Toast.jsx';
import { formatINR } from './utils/currency.js';

const DEFAULT_QUERY = 'Find smallest price deals across Flipkart, Amazon, Meesho, Croma and Official Stores';

export default function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('cartnova_theme') || 'light';
  });

  const [activeView, setActiveView] = useState('explore'); // 'explore' | 'cart'
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [allProductsCatalog, setAllProductsCatalog] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [activeSort, setActiveSort] = useState('composite');
  const [selectedStoreFilter, setSelectedStoreFilter] = useState('all');
  const [selectedProductForModal, setSelectedProductForModal] = useState(null);
  const [isWatchlistOpen, setIsWatchlistOpen] = useState(false);
  const [watchlist, setWatchlist] = useState([]);
  const [toastMessage, setToastMessage] = useState('');
  const [logs, setLogs] = useState([]);

  // Cart State (stored in localStorage)
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('cartnova_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [agentStates, setAgentStates] = useState({
    intent: { status: 'idle', label: 'Standby' },
    scraper: { status: 'idle', label: 'Standby' },
    vector: { status: 'idle', label: 'Standby' },
    price: { status: 'idle', label: 'Standby' },
    rec: { status: 'idle', label: 'Standby' }
  });

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('cartnova_theme', theme);
  }, [theme]);

  // Persist cart
  useEffect(() => {
    try {
      localStorage.setItem('cartnova_cart', JSON.stringify(cart));
    } catch (e) {
      // ignore
    }
  }, [cart]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3800);
  };

  const fetchWatchlist = async () => {
    try {
      const res = await fetch('/api/watchlist');
      const data = await res.json();
      if (Array.isArray(data)) setWatchlist(data);
    } catch (e) {
      // ignore
    }
  };

  const fetchFullCatalog = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (Array.isArray(data)) setAllProductsCatalog(data);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    fetchWatchlist();
    fetchFullCatalog();
    handleSearch(DEFAULT_QUERY);
  }, []);

  const resetAgentStates = () => {
    setAgentStates({
      intent: { status: 'idle', label: 'Standby' },
      scraper: { status: 'idle', label: 'Standby' },
      vector: { status: 'idle', label: 'Standby' },
      price: { status: 'idle', label: 'Standby' },
      rec: { status: 'idle', label: 'Standby' }
    });
    setLogs([]);
  };

  const handleSearch = async (searchQuery) => {
    if (isLoading) return;
    setIsLoading(true);
    resetAgentStates();

    setLogs([{ time: '0.00', agent: 'Orchestrator', message: `Comparing lowest prices for: "${searchQuery}"` }]);

    try {
      const sseUrl = `/api/stream-search?query=${encodeURIComponent(searchQuery)}`;
      const eventSource = new EventSource(sseUrl);

      eventSource.addEventListener('agent_status', (e) => {
        const payload = JSON.parse(e.data);
        const { agent, agent_name, message, timestamp } = payload;

        setLogs((prev) => [...prev, { time: timestamp, agent: agent_name, message }]);

        if (agent === 'intent_agent') {
          setAgentStates((s) => ({ ...s, intent: { status: 'active', label: 'Analyzing Intent...' } }));
        } else if (agent === 'scraper_agent') {
          setAgentStates((s) => ({
            ...s,
            intent: { status: 'done', label: 'Parsed' },
            scraper: { status: 'active', label: 'Checking Stores...' }
          }));
        } else if (agent === 'vector_agent') {
          setAgentStates((s) => ({
            ...s,
            scraper: { status: 'done', label: 'Stores Crawled' },
            vector: { status: 'active', label: 'Matching Specs...' }
          }));
        } else if (agent === 'price_agent') {
          setAgentStates((s) => ({
            ...s,
            vector: { status: 'done', label: 'Specs Matched' },
            price: { status: 'active', label: 'Checking Lowest Prices...' }
          }));
        } else if (agent === 'rec_agent') {
          setAgentStates((s) => ({
            ...s,
            price: { status: 'done', label: 'Prices Ranked' },
            rec: { status: 'active', label: 'Synthesizing Picks...' }
          }));
        }
      });

      eventSource.addEventListener('agent_thought', (e) => {
        const payload = JSON.parse(e.data);
        setLogs((prev) => [
          ...prev,
          { time: payload.timestamp, agent: payload.title, message: JSON.stringify(payload.data) }
        ]);
      });

      eventSource.addEventListener('pipeline_complete', (e) => {
        const payload = JSON.parse(e.data);
        eventSource.close();
        setAgentStates({
          intent: { status: 'done', label: 'Done' },
          scraper: { status: 'done', label: 'Done' },
          vector: { status: 'done', label: 'Done' },
          price: { status: 'done', label: 'Done' },
          rec: { status: 'done', label: 'Done' }
        });
        setReport(payload.report);
        setIsLoading(false);
        showToast(
          `Evaluated ${payload.report.total_products_evaluated} products across Amazon, Flipkart, Meesho & Official Stores!`
        );
      });

      eventSource.onerror = async () => {
        eventSource.close();
        try {
          const res = await fetch('/api/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: searchQuery })
          });
          const data = await res.json();
          setReport(data);
          setAgentStates({
            intent: { status: 'done', label: 'Done' },
            scraper: { status: 'done', label: 'Done' },
            vector: { status: 'done', label: 'Done' },
            price: { status: 'done', label: 'Done' },
            rec: { status: 'done', label: 'Done' }
          });
          setIsLoading(false);
        } catch (err) {
          console.error(err);
          setIsLoading(false);
        }
      };
    } catch (err) {
      console.error('SSE error:', err);
      setIsLoading(false);
    }
  };

  // Cart Management Handlers
  const handleAddToCart = (product, storeOffer) => {
    const prodId = product.product_id || product.id;
    const bestStore = storeOffer || product.stores?.[0] || {
      store: product.best_store || 'Flipkart',
      price: product.best_price || product.lowest_price
    };

    setCart((prev) => {
      const existingIdx = prev.findIndex((item) => item.product_id === prodId);
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += 1;
        return updated;
      } else {
        return [
          ...prev,
          {
            product_id: prodId,
            name: product.name,
            brand: product.brand,
            image: product.image,
            category: product.category,
            selected_store: bestStore.store,
            unit_price: Number(bestStore.price || product.best_price),
            list_price: Number(product.list_price || bestStore.price),
            lowest_price: Number(product.lowest_price || bestStore.price),
            stores: product.stores || [],
            quantity: 1,
            delivery_agent: product.delivery_agent || `${bestStore.store} Assured Express Logistics`,
            direct_url: bestStore.url || product.direct_buy_url || '#'
          }
        ];
      }
    });

    showToast(`🛒 Added "${product.name.slice(0, 30)}..." to Cart! Lowest Price: ${formatINR(bestStore.price || product.best_price)} on ${bestStore.store}`);
  };

  const handleUpdateCartQty = (productId, delta) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product_id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const handleRemoveFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.product_id !== productId));
    showToast('Item removed from cart.');
  };

  const handleUpdateCartStore = (productId, newStoreName) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.product_id === productId) {
          const storeObj = (item.stores || []).find((s) => s.store === newStoreName);
          const newPrice = storeObj ? storeObj.price : item.unit_price;
          const newUrl = storeObj ? storeObj.url : item.direct_url;
          return {
            ...item,
            selected_store: newStoreName,
            unit_price: newPrice,
            direct_url: newUrl
          };
        }
        return item;
      })
    );
    showToast(`Switched store to ${newStoreName}`);
  };

  const handleClearCart = () => {
    setCart([]);
    showToast('Cart cleared.');
  };

  const handleSelectNewLaunches = () => {
    setActiveView('explore');
    const q = 'Show latest 2026 new launch flagship phones and gadgets at lowest price';
    setQuery(q);
    handleSearch(q);
    document.getElementById('resultsSection')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSetAlert = async (alertData) => {
    try {
      const res = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alertData)
      });
      await res.json();
      showToast(`🔔 Price alert set for ${alertData.product_name} at ${formatINR(alertData.target_price)}!`);
      setSelectedProductForModal(null);
      fetchWatchlist();
    } catch (e) {
      showToast('Price alert saved!');
      setSelectedProductForModal(null);
    }
  };

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Products from search report
  let rawProducts = report?.comparison_table || [];

  // Filter by Winning Platform if selected
  if (selectedStoreFilter !== 'all') {
    rawProducts = rawProducts.filter((p) => {
      if (selectedStoreFilter === 'Official') {
        return (p.stores || []).some((s) => /official/i.test(s.store));
      }
      return (p.stores || []).some((s) =>
        s.store.toLowerCase().includes(selectedStoreFilter.toLowerCase())
      );
    });
  }

  const winner = rawProducts[0];
  const products = rawProducts;

  return (
    <div>
      <Navbar
        watchlistCount={watchlist.length}
        onOpenWatchlist={() => setIsWatchlistOpen(true)}
        cartCount={totalCartCount}
        activeView={activeView}
        setActiveView={setActiveView}
        onSelectNewLaunches={handleSelectNewLaunches}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      <main className="container">
        {activeView === 'cart' ? (
          /* Separate Dedicated Cart Page */
          <CartPage
            cart={cart}
            onUpdateQty={handleUpdateCartQty}
            onRemove={handleRemoveFromCart}
            onUpdateStore={handleUpdateCartStore}
            onClearCart={handleClearCart}
            onContinueShopping={() => setActiveView('explore')}
            allProducts={allProductsCatalog.length > 0 ? allProductsCatalog : products}
            onAddToCart={handleAddToCart}
          />
        ) : (
          /* Deals & Multi-Store Price Explorer */
          <>
            <HeroSearch
              query={query}
              setQuery={setQuery}
              onSearch={handleSearch}
              isLoading={isLoading}
              selectedStoreFilter={selectedStoreFilter}
              setSelectedStoreFilter={setSelectedStoreFilter}
            />

            <AgentFlow agentStates={agentStates} logs={logs} />

            {winner && (
              <WinnerCard
                winner={winner}
                rationale={report?.top_pick_rationale}
                onOpenPriceModal={(p) => setSelectedProductForModal(p)}
                onAddToCart={handleAddToCart}
              />
            )}

            {/* Results Header with View Mode Toggle and Sorting */}
            {products.length > 0 && (
              <div style={{ marginBottom: '16px' }} id="resultsSection">
                <div className="table-section-header">
                  <div className="section-heading">
                    <h2>
                      Smallest Price Recommendations ({products.length})
                    </h2>
                    <p>
                      Comparing live verified prices across <strong>Flipkart</strong>,{' '}
                      <strong>Amazon</strong>, <strong>Meesho</strong>, and{' '}
                      <strong>Official Brand Stores</strong>
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {/* View Mode Toggle: Grid Cards vs Table */}
                    <div className="view-mode-toggle">
                      <button
                        type="button"
                        className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
                        onClick={() => setViewMode('grid')}
                        title="Grid card view"
                      >
                        <span>⊞</span>
                        <span>Cards</span>
                      </button>
                      <button
                        type="button"
                        className={`view-mode-btn ${viewMode === 'table' ? 'active' : ''}`}
                        onClick={() => setViewMode('table')}
                        title="Comparison table view"
                      >
                        <span>☰</span>
                        <span>Table</span>
                      </button>
                    </div>

                    {/* Sort dropdown */}
                    <select
                      className="table-sort-select"
                      value={activeSort}
                      onChange={(e) => setActiveSort(e.target.value)}
                    >
                      <option value="composite">🏆 Best Match & Deal</option>
                      <option value="price-low">💰 Lowest Price (Smallest First)</option>
                      <option value="semantic">📐 Highest Spec Match</option>
                      <option value="battery">🔋 Longest Battery Life</option>
                    </select>
                  </div>
                </div>

                {/* Render selected view mode */}
                {viewMode === 'grid' ? (
                  <ProductCardGrid
                    products={products}
                    onOpenPriceModal={(p) => setSelectedProductForModal(p)}
                    onAddToCart={handleAddToCart}
                  />
                ) : (
                  <ComparisonTable
                    products={products}
                    activeSort={activeSort}
                    setActiveSort={setActiveSort}
                    onOpenPriceModal={(p) => setSelectedProductForModal(p)}
                    onAddToCart={handleAddToCart}
                  />
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Price Trend & Drop Alert Modal */}
      {selectedProductForModal && (
        <PriceModal
          product={selectedProductForModal}
          onClose={() => setSelectedProductForModal(null)}
          onSetAlert={handleSetAlert}
        />
      )}

      {/* Watchlist Modal */}
      {isWatchlistOpen && (
        <WatchlistModal
          watchlist={watchlist}
          onClose={() => setIsWatchlistOpen(false)}
        />
      )}

      <Toast message={toastMessage} />

      <footer className="site-footer">
        <div className="container footer-content">
          <div>
            <strong style={{ color: 'var(--text-main)' }}>CartNova</strong> — Multi-Platform Lowest-Price Intelligence Engine
          </div>
          <div>
            Comparing Real-Time Prices on: <strong>Flipkart</strong> • <strong>Amazon</strong> • <strong>Meesho</strong> • <strong>Official Brand Stores</strong>
          </div>
        </div>
      </footer>
    </div>
  );
}
