import React from 'react';

export default function CartPage({
  cart = [],
  onUpdateQty,
  onRemove,
  onUpdateStore,
  onClearCart,
  onContinueShopping,
  allProducts = [],
  onAddToCart
}) {
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Calculate platform-by-platform total cost for the entire cart
  const platforms = ['Flipkart', 'Amazon', 'Meesho', 'Official Store'];

  const platformTotals = platforms.map((platformName) => {
    let total = 0;
    let availableCount = 0;

    cart.forEach((item) => {
      let storeOffer = null;
      if (platformName === 'Official Store') {
        storeOffer = (item.stores || []).find((s) => /official/i.test(s.store));
      } else {
        storeOffer = (item.stores || []).find((s) =>
          s.store.toLowerCase().includes(platformName.toLowerCase())
        );
      }

      const price = storeOffer ? storeOffer.price : item.unit_price;
      if (storeOffer) availableCount += 1;
      total += price * item.quantity;
    });

    return {
      platform: platformName,
      total: Math.round(total * 100) / 100,
      availableCount,
      isFullyAvailable: availableCount === cart.length
    };
  });

  // Sort by smallest price
  platformTotals.sort((a, b) => a.total - b.total);
  const lowestPlatform = platformTotals[0];
  const highestPlatform = platformTotals[platformTotals.length - 1];
  const maxSavings =
    highestPlatform && lowestPlatform
      ? Math.max(0, Math.round((highestPlatform.total - lowestPlatform.total) * 100) / 100)
      : 0;

  // Selected cart total based on user's current store picks
  const selectedCartTotal = cart.reduce(
    (acc, item) => acc + item.unit_price * item.quantity,
    0
  );
  const selectedListTotal = cart.reduce(
    (acc, item) => acc + (item.list_price || item.unit_price) * item.quantity,
    0
  );
  const selectedSavings = Math.max(
    0,
    Math.round((selectedListTotal - selectedCartTotal) * 100) / 100
  );

  // Recommendations for items not yet in cart
  const cartProductIds = new Set(cart.map((c) => c.product_id));
  const suggestedItems = allProducts.filter((p) => !cartProductIds.has(p.product_id || p.id)).slice(0, 4);

  if (cart.length === 0) {
    return (
      <div className="cart-page-empty-container">
        <div className="cart-empty-card">
          <div className="cart-empty-icon">🛒</div>
          <h2>Your CartNova Deal Bag is Empty</h2>
          <p>
            You haven't added any products yet. Search across Amazon, Flipkart, Meesho, and
            Official Brand Stores to find the smallest price guaranteed!
          </p>
          <div className="cart-empty-actions">
            <button
              type="button"
              className="btn-primary-action"
              onClick={onContinueShopping}
            >
              🔍 Browse Lowest Price Deals
            </button>
          </div>
        </div>

        {/* Suggested popular deals */}
        {suggestedItems.length > 0 && (
          <div className="cart-suggestions-section">
            <div className="cart-suggestions-header">
              <h3>🔥 Trending Products at Smallest Price</h3>
              <p>Top price-dropped items across major verified platforms</p>
            </div>
            <div className="cart-suggestions-grid">
              {suggestedItems.map((prod) => {
                const bestStore = prod.stores?.[0] || {};
                const price = prod.best_price || prod.lowest_price || prod.base_price;
                return (
                  <div key={prod.product_id || prod.id} className="cart-suggest-card">
                    <img src={prod.image} alt={prod.name} />
                    <div className="cart-suggest-info">
                      <span className="cart-suggest-brand">{prod.brand}</span>
                      <h4>{prod.name}</h4>
                      <div className="cart-suggest-price-row">
                        <span className="suggest-best-price">${price.toFixed(2)}</span>
                        <span className="suggest-store-pill">
                          🏆 {bestStore.store || 'Flipkart'} Lowest
                        </span>
                      </div>
                      <button
                        type="button"
                        className="btn-quick-add"
                        onClick={() => onAddToCart(prod, bestStore)}
                      >
                        + Add at Lowest Price
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="cart-page-layout">
      {/* Top Banner: Guaranteed Lowest Price Notification */}
      <div className="cart-best-platform-banner">
        <div className="banner-badge-icon">🏆</div>
        <div className="banner-text">
          <h3>
            <strong>{lowestPlatform.platform}</strong> is giving the SMALLEST TOTAL PRICE for your cart!
          </h3>
          <p>
            Buying these items on {lowestPlatform.platform} totals{' '}
            <strong className="text-emerald">${lowestPlatform.total.toFixed(2)}</strong>. You save{' '}
            <strong>${maxSavings.toFixed(2)}</strong> compared to the highest platform!
          </p>
        </div>
        <div className="banner-action">
          <a
            href={cart[0]?.direct_url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-buy-lowest-cart"
          >
            ⚡ Buy on {lowestPlatform.platform}
          </a>
        </div>
      </div>

      <div className="cart-grid-main">
        {/* Left Column: Cart Items List */}
        <div className="cart-items-column">
          <div className="cart-header-row">
            <div>
              <h2>Your Shopping Cart ({totalItems} {totalItems === 1 ? 'item' : 'items'})</h2>
              <p>Compare which platform sells each item for the lowest price</p>
            </div>
            <button
              type="button"
              className="btn-clear-cart"
              onClick={onClearCart}
              title="Remove all items from cart"
            >
              Clear Cart
            </button>
          </div>

          <div className="cart-items-list">
            {cart.map((item) => {
              const itemTotal = item.unit_price * item.quantity;
              const originalItemTotal = (item.list_price || item.unit_price) * item.quantity;
              const itemSavings = originalItemTotal - itemTotal;

              return (
                <div key={item.product_id} className="cart-item-card">
                  <div className="cart-item-thumb">
                    <img src={item.image} alt={item.name} />
                  </div>

                  <div className="cart-item-content">
                    <div className="cart-item-top">
                      <div className="cart-item-titles">
                        <span className="cart-item-brand">{item.brand}</span>
                        <h3>{item.name}</h3>
                      </div>
                      <button
                        type="button"
                        className="btn-remove-item"
                        onClick={() => onRemove(item.product_id)}
                        title="Remove from cart"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Store Selector Pill & Direct Link */}
                    <div className="cart-platform-selector-row">
                      <div className="platform-select-box">
                        <label htmlFor={`store-select-${item.product_id}`}>Selected Platform:</label>
                        <select
                          id={`store-select-${item.product_id}`}
                          value={item.selected_store}
                          onChange={(e) => onUpdateStore(item.product_id, e.target.value)}
                          className="store-select-dropdown"
                        >
                          {(item.stores || []).map((s) => (
                            <option key={s.store} value={s.store}>
                              {s.store} — ${Number(s.price).toFixed(2)}{' '}
                              {s.price === item.lowest_price ? '🏆 (Lowest Price)' : ''}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Delivery Logistics Agent Info */}
                      <div className="cart-delivery-tag">
                        <span>🚚</span>
                        <span>
                          {item.delivery_agent || 'Express Logistics with Official Warranty'}
                        </span>
                      </div>
                    </div>

                    {/* Price and Quantity Controls */}
                    <div className="cart-item-bottom">
                      <div className="cart-pricing-block">
                        <span className="cart-unit-price">${item.unit_price.toFixed(2)}</span>
                        {item.list_price > item.unit_price && (
                          <span className="cart-list-price">${item.list_price.toFixed(2)}</span>
                        )}
                        {itemSavings > 0 && (
                          <span className="cart-item-savings">
                            Save ${itemSavings.toFixed(2)}
                          </span>
                        )}
                      </div>

                      <div className="cart-actions-right">
                        {/* Quantity Counter */}
                        <div className="qty-control">
                          <button
                            type="button"
                            onClick={() => onUpdateQty(item.product_id, -1)}
                            className="qty-btn"
                            title="Decrease quantity"
                          >
                            –
                          </button>
                          <span className="qty-val">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => onUpdateQty(item.product_id, 1)}
                            className="qty-btn"
                            title="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        {/* Direct buy single item link */}
                        <a
                          href={item.direct_url || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-buy-item-direct"
                        >
                          Buy on {item.selected_store} ⚡
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="cart-footer-nav">
            <button
              type="button"
              className="btn-continue-shopping"
              onClick={onContinueShopping}
            >
              ← Continue Shopping & Comparing
            </button>
          </div>
        </div>

        {/* Right Column: Multi-Platform Cart Total & Checkout Summary */}
        <div className="cart-summary-column">
          {/* Multi-Platform Total Cost Comparison Box */}
          <div className="multi-platform-summary-card">
            <div className="summary-title-row">
              <h3>Platform Price Comparison</h3>
              <span className="badge-live-check">● Live Comparison</span>
            </div>
            <p className="summary-subtitle">
              Total price for all {totalItems} items across competing e-commerce platforms:
            </p>

            <div className="platforms-cost-list">
              {platformTotals.map((pt) => {
                const isLowest = pt.platform === lowestPlatform.platform;
                const deltaVsLowest = pt.total - lowestPlatform.total;

                return (
                  <div
                    key={pt.platform}
                    className={`platform-cost-row ${isLowest ? 'winner-platform' : ''}`}
                  >
                    <div className="platform-name-col">
                      <div className="platform-tag">
                        <strong>{pt.platform}</strong>
                        {isLowest && (
                          <span className="platform-lowest-pill">
                            🏆 SMALLEST PRICE
                          </span>
                        )}
                      </div>
                      <span className="platform-delivery-note">
                        {pt.platform === 'Flipkart'
                          ? 'Flipkart Assured (BlueDart)'
                          : pt.platform === 'Amazon'
                          ? 'Amazon Prime Logistics'
                          : pt.platform === 'Meesho'
                          ? 'Meesho Direct Air Dispatch'
                          : 'Official Brand Direct'}
                      </span>
                    </div>

                    <div className="platform-price-col">
                      <span className="platform-total-amount">${pt.total.toFixed(2)}</span>
                      {deltaVsLowest > 0 ? (
                        <span className="platform-extra-cost">+${deltaVsLowest.toFixed(2)}</span>
                      ) : (
                        <span className="platform-best-save">Best Deal</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Price Calculations */}
            <div className="cart-totals-breakdown">
              <div className="breakdown-row">
                <span>Cart Subtotal:</span>
                <span>${selectedCartTotal.toFixed(2)}</span>
              </div>
              <div className="breakdown-row">
                <span>Estimated Shipping:</span>
                <span className="text-emerald">FREE (Verified Express)</span>
              </div>
              {selectedSavings > 0 && (
                <div className="breakdown-row highlight-save">
                  <span>Total Savings:</span>
                  <span className="text-emerald">-${selectedSavings.toFixed(2)}</span>
                </div>
              )}
              <div className="breakdown-row total-row">
                <strong>Smallest Platform Total:</strong>
                <strong className="total-highlight">
                  ${lowestPlatform.total.toFixed(2)}
                </strong>
              </div>
            </div>

            {/* Direct Official Purchase Link Button */}
            <div className="checkout-action-area">
              <a
                href={cart[0]?.direct_url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-checkout-lowest"
              >
                Proceed to Buy on {lowestPlatform.platform} ⚡
              </a>
              <p className="checkout-trust-notice">
                🛡️ <strong>Official Site / Verified Seller Guarantee</strong>: You are redirected directly
                to the official merchant checkout with authentic manufacturer warranty and standard
                return policies. CartNova does not add any markup.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
