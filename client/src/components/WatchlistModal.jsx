import React from 'react';

export default function WatchlistModal({ watchlist, onClose, onRemoveAlert }) {
  return (
    <div className="modal-overlay active" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
        <div className="modal-header">
          <div>
            <h3>Price Drop Watchlist</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Active price alerts ({watchlist.length})
            </span>
          </div>
          <button className="btn-close-modal" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-body">
          {watchlist.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 12px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '36px', marginBottom: '10px' }}>🔔</div>
              <p style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                No active price alerts yet
              </p>
              <p style={{ fontSize: '13px' }}>
                Click "Track Price Drop" on any product to get notified when the price hits your target.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {watchlist.map((item, idx) => (
                <div
                  key={item.alert_id || idx}
                  style={{
                    background: 'var(--bg-page)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '3px' }}>
                      {item.product_name}
                    </h4>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      Target: <strong style={{ color: '#38bdf8' }}>${item.target_price?.toFixed(2)}</strong> (Current: ${item.current_price?.toFixed(2)})
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Notification to: {item.user_email || 'user@example.com'}
                    </div>
                  </div>

                  <span
                    style={{
                      background: item.is_triggered ? 'var(--accent-emerald-soft)' : 'rgba(59, 130, 246, 0.12)',
                      color: item.is_triggered ? '#34d399' : '#60a5fa',
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {item.is_triggered ? '🎉 Target Met!' : 'Active'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
