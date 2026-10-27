import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import HeroSearch from './components/HeroSearch.jsx';
import AgentFlow from './components/AgentFlow.jsx';
import WinnerCard from './components/WinnerCard.jsx';
import ComparisonTable from './components/ComparisonTable.jsx';
import PriceModal from './components/PriceModal.jsx';
import Toast from './components/Toast.jsx';

const DEFAULT_QUERY = 'Find a lightweight laptop under $1000 with a great battery life for coding';

export default function App() {
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [activeSort, setActiveSort] = useState('composite');
  const [selectedProductForModal, setSelectedProductForModal] = useState(null);
  const [watchlist, setWatchlist] = useState([]);
  const [toastMessage, setToastMessage] = useState('');
  const [logs, setLogs] = useState([]);

  const [agentStates, setAgentStates] = useState({
    intent: { status: 'idle', label: 'Standby' },
    scraper: { status: 'idle', label: 'Standby' },
    vector: { status: 'idle', label: 'Standby' },
    price: { status: 'idle', label: 'Standby' },
    rec: { status: 'idle', label: 'Standby' }
  });

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

  useEffect(() => {
    fetchWatchlist();
    // Run default search on initial load
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

    setLogs([{ time: '0.00', agent: 'Orchestrator', message: `Initiating multi-agent search for: "${searchQuery}"` }]);

    try {
      // Connect to Server-Sent Events (SSE)
      const sseUrl = `/api/stream-search?query=${encodeURIComponent(searchQuery)}`;
      const eventSource = new EventSource(sseUrl);

      eventSource.addEventListener('agent_status', (e) => {
        const payload = JSON.parse(e.data);
        const { agent, agent_name, message, timestamp } = payload;

        setLogs((prev) => [...prev, { time: timestamp, agent: agent_name, message }]);

        if (agent === 'intent_agent') {
          setAgentStates((s) => ({ ...s, intent: { status: 'active', label: 'Parsing...' } }));
        } else if (agent === 'scraper_agent') {
          setAgentStates((s) => ({
            ...s,
            intent: { status: 'done', label: 'Extracted' },
            scraper: { status: 'active', label: 'Crawling...' }
          }));
        } else if (agent === 'vector_agent') {
          setAgentStates((s) => ({
            ...s,
            scraper: { status: 'done', label: 'Aggregated' },
            vector: { status: 'active', label: 'Vectorizing...' }
          }));
        } else if (agent === 'price_agent') {
          setAgentStates((s) => ({
            ...s,
            vector: { status: 'done', label: 'Embedded' },
            price: { status: 'active', label: 'Analyzing...' }
          }));
        } else if (agent === 'rec_agent') {
          setAgentStates((s) => ({
            ...s,
            price: { status: 'done', label: 'Analyzed' },
            rec: { status: 'active', label: 'Synthesizing...' }
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
          intent: { status: 'done', label: 'Completed' },
          scraper: { status: 'done', label: 'Completed' },
          vector: { status: 'done', label: 'Completed' },
          price: { status: 'done', label: 'Completed' },
          rec: { status: 'done', label: 'Completed' }
        });
        setReport(payload.report);
        setIsLoading(false);
        showToast(
          `Multi-agent pipeline complete! Evaluated ${payload.report.total_products_evaluated} products across ${payload.report.total_stores_compared} stores.`
        );
      });

      eventSource.onerror = async () => {
        eventSource.close();
        // Fallback to standard REST search
        try {
          const res = await fetch('/api/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: searchQuery })
          });
          const data = await res.json();
          setReport(data);
          setAgentStates({
            intent: { status: 'done', label: 'Completed' },
            scraper: { status: 'done', label: 'Completed' },
            vector: { status: 'done', label: 'Completed' },
            price: { status: 'done', label: 'Completed' },
            rec: { status: 'done', label: 'Completed' }
          });
          setIsLoading(false);
        } catch (err) {
          console.error(err);
          setIsLoading(false);
        }
      };
    } catch (err) {
      console.error('SSE setup error:', err);
      setIsLoading(false);
    }
  };

  const handleSetAlert = async (alertData) => {
    try {
      const res = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alertData)
      });
      const data = await res.json();
      showToast(`🔔 Price alert active for ${alertData.product_name} at $${alertData.target_price}!`);
      setSelectedProductForModal(null);
      fetchWatchlist();
    } catch (e) {
      showToast('Price alert saved!');
      setSelectedProductForModal(null);
    }
  };

  const winner = report?.comparison_table?.[0];

  return (
    <div>
      <Navbar
        watchlistCount={watchlist.length}
        onOpenWatchlist={() => {
          document.getElementById('comparisonSection')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      <main className="container">
        <HeroSearch
          query={query}
          setQuery={setQuery}
          onSearch={handleSearch}
          isLoading={isLoading}
        />

        <AgentFlow
          agentStates={agentStates}
          logs={logs}
        />

        {winner && (
          <WinnerCard
            winner={winner}
            rationale={report?.top_pick_rationale}
            onOpenPriceModal={(p) => setSelectedProductForModal(p)}
          />
        )}

        {report?.comparison_table && (
          <ComparisonTable
            products={report.comparison_table}
            activeSort={activeSort}
            setActiveSort={setActiveSort}
            onOpenPriceModal={(p) => setSelectedProductForModal(p)}
          />
        )}
      </main>

      {selectedProductForModal && (
        <PriceModal
          product={selectedProductForModal}
          onClose={() => setSelectedProductForModal(null)}
          onSetAlert={handleSetAlert}
        />
      )}

      <Toast message={toastMessage} />

      <footer className="site-footer">
        <div className="container footer-content">
          <div>
            <strong style={{ color: 'var(--text-main)' }}>OmniCart AI</strong> — Full MERN Stack Multi-Agent E-Commerce Assistant
          </div>
          <div>
            Tech Stack: MongoDB • Express.js • React • Node.js • Playwright Headless Browser Automation • Vector DB Cosine Similarity
          </div>
        </div>
      </footer>
    </div>
  );
}
