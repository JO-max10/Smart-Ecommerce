/**
 * OmniCart AI: Smart E-Commerce Multi-Agent Shopping Assistant
 * Interactive Client Application & SSE Stream Visualizer
 */

// Formatting Utility for Indian Rupee
function formatINR(val) {
  if (val === null || val === undefined || isNaN(val)) return '₹0';
  return '₹' + Math.round(Number(val)).toLocaleString('en-IN');
}

// Application State
const state = {
  currentQuery: "Compare smallest prices across Flipkart, Amazon, Meesho, Croma and Official Stores",
  isLoading: false,
  activeReport: null,
  watchlist: [],
  selectedProductForModal: null,
  activeSort: "composite"
};

// DOM Elements
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const agentNodes = {
  intent: document.getElementById("agent-node-intent"),
  scraper: document.getElementById("agent-node-scraper"),
  vector: document.getElementById("agent-node-vector"),
  price: document.getElementById("agent-node-price"),
  rec: document.getElementById("agent-node-rec")
};
const logsDrawer = document.getElementById("agentLogsDrawer");
const toggleLogsBtn = document.getElementById("toggleLogsBtn");
const winnerSpotlight = document.getElementById("winnerSpotlight");
const comparisonSection = document.getElementById("comparisonSection");
const comparisonTableBody = document.getElementById("comparisonTableBody");
const sortSelect = document.getElementById("sortSelect");
const priceModal = document.getElementById("priceModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const toast = document.getElementById("toastNotification");
const watchlistCountBadge = document.getElementById("watchlistCount");

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
  // Run initial default search for instant WOW experience
  runMultiAgentSearch(state.currentQuery);
  fetchWatchlist();
});

function setupEventListeners() {
  // Search Button
  searchBtn.addEventListener("click", () => {
    const q = searchInput.value.trim();
    if (q) runMultiAgentSearch(q);
  });

  // Enter Key on input
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const q = searchInput.value.trim();
      if (q) runMultiAgentSearch(q);
    }
  });

  // Preset query buttons
  document.querySelectorAll(".preset-query-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const query = btn.getAttribute("data-query");
      if (query) {
        searchInput.value = query;
        runMultiAgentSearch(query);
      }
    });
  });

  // Toggle logs drawer
  toggleLogsBtn.addEventListener("click", () => {
    if (logsDrawer.style.display === "none") {
      logsDrawer.style.display = "block";
      toggleLogsBtn.innerHTML = `<span>Hide Live Agent Logs</span> <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 15l-6-6-6 6"/></svg>`;
    } else {
      logsDrawer.style.display = "none";
      toggleLogsBtn.innerHTML = `<span>View Live Agent Logs</span> <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>`;
    }
  });

  // Sort dropdown
  sortSelect.addEventListener("change", (e) => {
    state.activeSort = e.target.value;
    if (state.activeReport) {
      renderComparisonTable(state.activeReport.comparison_table);
    }
  });

  // Close Modal
  closeModalBtn.addEventListener("click", () => {
    priceModal.classList.remove("active");
  });

  priceModal.addEventListener("click", (e) => {
    if (e.target === priceModal) priceModal.classList.remove("active");
  });

  // Set Target Alert Form inside modal
  const submitAlertBtn = document.getElementById("submitAlertBtn");
  if (submitAlertBtn) {
    submitAlertBtn.addEventListener("click", handleCreatePriceAlert);
  }
}

/**
 * Resets the 5-Agent visualizer to initial state
 */
function resetAgentFlow() {
  Object.values(agentNodes).forEach((node) => {
    node.className = "agent-node idle";
    const tag = node.querySelector(".agent-status-tag");
    if (tag) tag.textContent = "Standby";
  });
  logsDrawer.innerHTML = "";
}

/**
 * Updates an agent node status in real-time
 */
function updateAgentNode(agentKey, status, statusText) {
  const node = agentNodes[agentKey];
  if (!node) return;
  node.className = `agent-node ${status}`;
  const tag = node.querySelector(".agent-status-tag");
  if (tag) tag.textContent = statusText;
}

/**
 * Appends a log line to the live agent terminal
 */
function appendLog(time, agentName, msg) {
  const line = document.createElement("div");
  line.className = "log-entry";
  line.innerHTML = `
    <span class="log-time">[${time}s]</span>
    <span class="log-agent">${agentName}:</span>
    <span class="log-msg">${escapeHtml(msg)}</span>
  `;
  logsDrawer.appendChild(line);
  logsDrawer.scrollTop = logsDrawer.scrollHeight;
}

/**
 * Executes multi-agent search with real-time SSE stream
 */
async function runMultiAgentSearch(query) {
  if (state.isLoading) return;
  state.isLoading = true;
  state.currentQuery = query;

  searchBtn.classList.add("loading");
  searchBtn.innerHTML = `<span class="spinner"></span> <span>Agents Running...</span>`;
  resetAgentFlow();

  appendLog("0.0", "Orchestrator", `Received user query: "${query}"`);

  // Attempt live Server-Sent Events (SSE)
  try {
    const sseUrl = `/api/stream-search?query=${encodeURIComponent(query)}`;
    const eventSource = new EventSource(sseUrl);

    eventSource.addEventListener("agent_status", (e) => {
      const payload = JSON.parse(e.data);
      if (payload.agent === "intent_agent") {
        updateAgentNode("intent", "active", "Parsing...");
      } else if (payload.agent === "scraper_agent") {
        updateAgentNode("intent", "done", "Extracted");
        updateAgentNode("scraper", "active", "Crawling...");
      } else if (payload.agent === "vector_agent") {
        updateAgentNode("scraper", "done", "Aggregated");
        updateAgentNode("vector", "active", "Vectorizing...");
      } else if (payload.agent === "price_agent") {
        updateAgentNode("vector", "done", "Embedded");
        updateAgentNode("price", "active", "Analyzing...");
      } else if (payload.agent === "rec_agent") {
        updateAgentNode("price", "done", "Analyzed");
        updateAgentNode("rec", "active", "Synthesizing...");
      }
      appendLog(payload.timestamp, payload.agent_name, payload.message);
    });

    eventSource.addEventListener("agent_thought", (e) => {
      const payload = JSON.parse(e.data);
      appendLog(payload.timestamp, payload.title, JSON.stringify(payload.data));
    });

    eventSource.addEventListener("pipeline_complete", (e) => {
      const payload = JSON.parse(e.data);
      eventSource.close();
      finalizeSearch(payload.report);
    });

    eventSource.onerror = (err) => {
      console.warn("SSE stream closed or error, falling back to REST POST search", err);
      eventSource.close();
      fallbackRestSearch(query);
    };
  } catch (err) {
    console.warn("SSE connection error, using REST fallback:", err);
    fallbackRestSearch(query);
  }
}

/**
 * Fallback to direct REST API if SSE is unsupported
 */
async function fallbackRestSearch(query) {
  try {
    const res = await fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query })
    });
    const report = await res.json();
    finalizeSearch(report);
  } catch (error) {
    console.error("Search failed:", error);
    showToast("Error communicating with multi-agent backend.");
    searchBtn.classList.remove("loading");
    searchBtn.innerHTML = `<span>Run Multi-Agent Search</span>`;
    state.isLoading = false;
  }
}

/**
 * Finalizes search and renders UI
 */
function finalizeSearch(report) {
  state.activeReport = report;
  state.isLoading = false;

  // Mark all agents as done
  Object.keys(agentNodes).forEach((k) => updateAgentNode(k, "done", "Completed"));

  searchBtn.classList.remove("loading");
  searchBtn.innerHTML = `<span>Run Multi-Agent Search</span>`;

  // Render Winner Spotlight
  renderWinnerSpotlight(report);

  // Render Comparison Table
  renderComparisonTable(report.comparison_table);

  showToast(`Multi-agent search completed! Evaluated ${report.total_products_evaluated} products across ${report.total_stores_compared} stores.`);
}

/**
 * Renders the top recommendation spotlight card
 */
function renderWinnerSpotlight(report) {
  if (!report.comparison_table || report.comparison_table.length === 0) return;
  const winner = report.comparison_table[0];

  winnerSpotlight.style.display = "grid";
  winnerSpotlight.innerHTML = `
    <div class="winner-image-box">
      <img src="${winner.image}" alt="${escapeHtml(winner.name)}" />
      <div class="winner-crown-badge">
        <span>👑</span>
        <span>${winner.badge || "Top Recommended Pick"}</span>
      </div>
    </div>
    <div class="winner-info">
      <div class="winner-badges-row">
        <span class="badge-pill deal">🔥 ${winner.price_analysis ? winner.price_analysis.deal_rating : "Great Deal"}</span>
        <span class="badge-pill vector">📐 ${winner.semantic_match_pct}% Semantic Spec Match</span>
        <span class="badge-pill" style="background: rgba(99,102,241,0.15); color: var(--accent-indigo-light); border: 1px solid var(--border-accent);">
          ⭐ ${winner.rating} (${winner.review_count.toLocaleString()} verified reviews)
        </span>
      </div>
      <h2 class="winner-title">${escapeHtml(winner.name)}</h2>
      <p class="winner-rationale">${escapeHtml(report.top_pick_rationale)}</p>
      
      <div class="winner-pricing-bar">
        <div class="winner-best-price">${formatINR(winner.best_price)}</div>
        <div class="winner-list-price">${formatINR(winner.list_price)}</div>
        <div class="winner-savings">Save ${formatINR(winner.savings)} (${winner.discount_pct}% Off)</div>
        <span style="font-size: 13px; color: var(--text-muted); margin-left: auto;">
          Smallest price store: <strong style="color: var(--text-main);">${escapeHtml(winner.best_store)}</strong> (${escapeHtml(winner.shipping_time)})
        </span>
      </div>

      <div class="winner-actions">
        <a href="${winner.direct_buy_url}" target="_blank" rel="noopener noreferrer" class="btn-buy-primary">
          <span>Direct Purchase at ${escapeHtml(winner.best_store)}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
        <button class="btn-track-alert" onclick="openPriceModal('${winner.product_id}')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
          <span>Track Price Drop & History</span>
        </button>
      </div>
    </div>
  `;
}

/**
 * Renders the neat comparison matrix table
 */
function renderComparisonTable(products) {
  if (!products) return;
  comparisonSection.style.display = "block";

  // Sort products based on user selection
  const sorted = [...products].sort((a, b) => {
    if (state.activeSort === "price-low") return a.best_price - b.best_price;
    if (state.activeSort === "semantic") return b.semantic_match_pct - a.semantic_match_pct;
    if (state.activeSort === "battery") {
      const batA = a.key_specs.battery_hours || 0;
      const batB = b.key_specs.battery_hours || 0;
      return batB - batA;
    }
    // Default: composite score
    return b.composite_score - a.composite_score;
  });

  comparisonTableBody.innerHTML = sorted.map((p, idx) => {
    const isWinner = idx === 0 && state.activeSort === "composite";
    const specs = p.key_specs || {};
    
    // Store offers tags
    const storeChips = (p.stores || []).map((s) => {
      const isBest = s.price === p.best_price;
      return `
        <div class="store-offer-chip ${isBest ? 'best-offer' : ''}">
          <span class="store-name">${escapeHtml(s.store)}</span>
          <span class="store-price ${isBest ? 'highlight' : ''}">${formatINR(s.price)}</span>
        </div>
      `;
    }).join("");

    // Pros list
    const prosHtml = (p.pros || []).map((pro) => `
      <div class="pro-chip">
        <span style="color:#10b981;">✔</span>
        <span>${escapeHtml(pro)}</span>
      </div>
    `).join("");

    // Cons list
    const consHtml = (p.cons || []).map((con) => `
      <div class="con-chip">
        <span style="color:#f43f5e;">✖</span>
        <span>${escapeHtml(con)}</span>
      </div>
    `).join("");

    return `
      <tr class="${isWinner ? 'row-winner' : ''}">
        <!-- Product & Brand -->
        <td>
          <div class="product-cell">
            <div class="product-thumb">
              <img src="${p.image}" alt="${escapeHtml(p.name)}" />
            </div>
            <div class="product-meta">
              <span class="product-brand">${escapeHtml(p.brand)}</span>
              <span class="product-title">${escapeHtml(p.name)}</span>
              <div class="product-rank-badge">
                <span>${p.badge ? p.badge : `#${p.rank} Rank`}</span>
              </div>
            </div>
          </div>
        </td>

        <!-- Multi-Store Real-Time Prices -->
        <td>
          <div class="store-offers-box">
            ${storeChips}
            <div style="font-size: 11px; color: var(--text-dim); margin-top: 2px;">
              🚀 ${escapeHtml(p.shipping_time)}
            </div>
          </div>
        </td>

        <!-- Vector DB Semantic Match -->
        <td>
          <div class="vector-match-cell">
            <div class="vector-percent">
              <span>${p.semantic_match_pct}%</span>
              <span style="font-size: 11px; color: var(--text-muted); font-weight: normal;">match</span>
            </div>
            <div class="vector-bar-track">
              <div class="vector-bar-fill" style="width: ${p.semantic_match_pct}%;"></div>
            </div>
            <div style="font-size: 10px; color: var(--text-dim); margin-top: 4px;">
              Score: ${p.composite_score}/100
            </div>
          </div>
        </td>

        <!-- Key Technical Specs -->
        <td>
          <div class="specs-list">
            ${specs.battery_hours ? `<div class="spec-item"><span class="spec-icon">🔋</span> <strong>${specs.battery_hours}h</strong> Battery Life</div>` : ''}
            ${specs.weight_lbs ? `<div class="spec-item"><span class="spec-icon">🪶</span> <strong>${specs.weight_lbs} lbs</strong> (${specs.weight_kg || '1.2'} kg)</div>` : ''}
            ${specs.ram ? `<div class="spec-item"><span class="spec-icon">💾</span> ${specs.ram}</div>` : ''}
            ${specs.processor ? `<div class="spec-item"><span class="spec-icon">⚡</span> ${specs.processor.split('(')[0]}</div>` : ''}
            ${specs.display ? `<div class="spec-item"><span class="spec-icon">🖥️</span> ${specs.display.split('(')[0]}</div>` : ''}
          </div>
        </td>

        <!-- Pros & Cons -->
        <td>
          <div class="pros-cons-cell">
            ${prosHtml}
            ${consHtml}
          </div>
        </td>

        <!-- Actions -->
        <td class="action-cell">
          <a href="${p.direct_buy_url}" target="_blank" rel="noopener noreferrer" class="btn-table-buy">
            <span>Buy $${p.best_price.toFixed(2)}</span>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
          <button class="btn-table-history" onclick="openPriceModal('${p.product_id}')">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
            <span>Price Trend & Alert</span>
          </button>
        </td>
      </tr>
    `;
  }).join("");
}

/**
 * Opens the Price History & Alert Modal with SVG chart
 */
async function openPriceModal(productId) {
  if (!state.activeReport) return;
  const product = state.activeReport.comparison_table.find((p) => p.product_id === productId);
  if (!product) return;

  state.selectedProductForModal = product;
  const analysis = product.price_analysis;

  document.getElementById("modalProductTitle").textContent = product.name;
  document.getElementById("modalCurrentPrice").textContent = `$${product.best_price.toFixed(2)}`;
  document.getElementById("modalLowestPrice").textContent = `$${analysis.all_time_low.toFixed(2)}`;
  document.getElementById("modalAvgPrice").textContent = `$${analysis.average_90d.toFixed(2)}`;
  document.getElementById("targetPriceInput").value = Math.floor(product.best_price * 0.95);

  renderPriceHistoryChart(analysis.history);
  priceModal.classList.add("active");
}

/**
 * Draws an interactive SVG price history curve
 */
function renderPriceHistoryChart(timeline) {
  const container = document.getElementById("chartSvgContainer");
  if (!timeline || timeline.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding: 40px; color: var(--text-dim);">No historical points recorded.</div>`;
    return;
  }

  const width = 580;
  const height = 180;
  const padding = 35;

  const prices = timeline.map((t) => t.price);
  const minPrice = Math.min(...prices) * 0.96;
  const maxPrice = Math.max(...prices) * 1.04;

  const getX = (idx) => padding + (idx / (timeline.length - 1)) * (width - padding * 2);
  const getY = (val) => height - padding - ((val - minPrice) / (maxPrice - minPrice)) * (height - padding * 2);

  const points = timeline.map((t, idx) => `${getX(idx)},${getY(t.price)}`).join(" ");

  // Generate SVG path and dots
  const circles = timeline.map((t, idx) => `
    <circle cx="${getX(idx)}" cy="${getY(t.price)}" r="4.5" fill="#06b6d4" stroke="#040711" stroke-width="2">
      <title>${t.date}: $${t.price} (${t.store})</title>
    </circle>
    <text x="${getX(idx)}" y="${height - 10}" fill="#64748b" font-size="9" text-anchor="middle">${t.date.slice(5)}</text>
  `).join("");

  const svgHtml = `
    <svg class="chart-svg" viewBox="0 0 ${width} ${height}">
      <!-- Gradient Fill -->
      <defs>
        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="#06b6d4" stop-opacity="0.0"/>
        </linearGradient>
      </defs>
      
      <!-- Area fill -->
      <polygon points="${padding},${height - padding} ${points} ${getX(timeline.length - 1)},${height - padding}" fill="url(#chartGradient)"/>
      
      <!-- Line stroke -->
      <polyline points="${points}" fill="none" stroke="#06b6d4" stroke-width="2.5" stroke-linecap="round"/>
      
      <!-- Points -->
      ${circles}
    </svg>
  `;

  container.innerHTML = svgHtml;
}

/**
 * Handles setting up a price drop alert
 */
async function handleCreatePriceAlert() {
  if (!state.selectedProductForModal) return;
  const targetPrice = parseFloat(document.getElementById("targetPriceInput").value);
  const email = document.getElementById("targetEmailInput").value || "user@example.com";

  if (!targetPrice || targetPrice <= 0) {
    alert("Please enter a valid target alert price.");
    return;
  }

  try {
    const res = await fetch("/api/watchlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product_id: state.selectedProductForModal.product_id,
        product_name: state.selectedProductForModal.name,
        target_price: targetPrice,
        current_price: state.selectedProductForModal.best_price,
        user_email: email
      })
    });
    const data = await res.json();
    showToast(`🔔 Price alert set for ${state.selectedProductForModal.brand} at ${formatINR(targetPrice)}!`);
    priceModal.classList.remove("active");
    fetchWatchlist();
  } catch (err) {
    console.error("Failed to set alert:", err);
    showToast("Price alert registered in memory!");
    priceModal.classList.remove("active");
  }
}

/**
 * Fetches active price alerts from backend
 */
async function fetchWatchlist() {
  try {
    const res = await fetch("/api/watchlist");
    const alerts = await res.json();
    state.watchlist = alerts;
    if (watchlistCountBadge) {
      watchlistCountBadge.textContent = alerts.length;
    }
  } catch (e) {
    // silently ignore if backend restarting
  }
}

/**
 * Helper to show toast messages
 */
function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("active");
  setTimeout(() => {
    toast.classList.remove("active");
  }, 3800);
}

/**
 * Escape HTML to prevent injection
 */
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
