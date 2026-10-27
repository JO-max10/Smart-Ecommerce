import React, { useState } from 'react';

export default function AgentFlow({ agentStates, logs }) {
  const [showLogs, setShowLogs] = useState(false);

  const AGENTS = [
    {
      key: 'intent',
      icon: '🧠',
      title: 'Intent Understanding',
      role: 'Semantic constraint & nuance parser'
    },
    {
      key: 'scraper',
      icon: '🌐',
      title: 'Browser Automation',
      role: 'Playwright multi-store crawler'
    },
    {
      key: 'vector',
      icon: '📐',
      title: 'Vector Spec Engine',
      role: 'High-dimensional cosine similarity'
    },
    {
      key: 'price',
      icon: '📉',
      title: 'Price Drop Tracker',
      role: '90-day history & ATL detector'
    },
    {
      key: 'rec',
      icon: '✨',
      title: 'Review Synthesizer',
      role: 'Pros/cons & direct purchase advice'
    }
  ];

  return (
    <section className="agent-flow-container">
      <div className="flow-header">
        <div className="flow-title">
          <h3>Real-Time Multi-Agent Pipeline</h3>
          <span className="agent-badge">Live Coordination</span>
        </div>
        <button
          className="toggle-logs-btn"
          onClick={() => setShowLogs(!showLogs)}
        >
          <span>{showLogs ? 'Hide Live Agent Logs' : 'View Live Agent Logs'}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d={showLogs ? 'M18 15l-6-6-6 6' : 'M6 9l6 6 6-6'} />
          </svg>
        </button>
      </div>

      {/* 5 Autonomous Agent Nodes */}
      <div className="agents-grid">
        {AGENTS.map((agent) => {
          const current = agentStates[agent.key] || { status: 'idle', label: 'Standby' };
          return (
            <div key={agent.key} className={`agent-node ${current.status}`}>
              <div className="agent-icon-wrapper">{agent.icon}</div>
              <div className="agent-node-title">{agent.title}</div>
              <div className="agent-node-role">{agent.role}</div>
              <span className="agent-status-tag">{current.label}</span>
            </div>
          );
        })}
      </div>

      {/* Live Terminal Console Log Drawer */}
      {showLogs && (
        <div className="agent-logs-drawer" style={{ display: 'block' }}>
          {logs.length === 0 ? (
            <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '10px 0' }}>
              No agent events recorded yet. Run a search to see live steps.
            </div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="log-entry">
                <span className="log-time">[{log.time}s]</span>
                <span className="log-agent">{log.agent}:</span>
                <span className="log-msg">{log.message}</span>
              </div>
            ))
          )}
        </div>
      )}
    </section>
  );
}
