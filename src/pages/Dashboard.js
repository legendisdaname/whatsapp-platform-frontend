import React, { useState, useEffect } from 'react';
import { sessionAPI, botAPI, messageAPI } from '../api/api';
import './Dashboard.css';

function Dashboard() {
  const [stats, setStats] = useState({
    totalSessions: 0,
    activeSessions: 0,
    totalBots: 0,
    activeBots: 0,
    messagesSent: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Fetch sessions
      const sessionsResponse = await sessionAPI.getAll();
      const sessions = sessionsResponse.data.sessions || [];
      const activeSessions = sessions.filter(s => s.status === 'connected').length;

      // Fetch bots
      const botsResponse = await botAPI.getAll();
      const bots = botsResponse.data.bots || [];
      const activeBots = bots.filter(b => b.is_active).length;

      setStats({
        totalSessions: sessions.length,
        activeSessions: activeSessions,
        totalBots: bots.length,
        activeBots: activeBots,
        messagesSent: 0 // Would need to aggregate from all sessions
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <h1>Dashboard</h1>
        <div className="loading">Loading statistics...</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <p className="subtitle">Welcome to your WhatsApp Platform</p>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📱</div>
          <div className="stat-content">
            <h3>Total Sessions</h3>
            <p className="stat-number">{stats.totalSessions}</p>
          </div>
        </div>

        <div className="stat-card active">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Active Sessions</h3>
            <p className="stat-number">{stats.activeSessions}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🤖</div>
          <div className="stat-content">
            <h3>Total Bots</h3>
            <p className="stat-number">{stats.totalBots}</p>
          </div>
        </div>

        <div className="stat-card active">
          <div className="stat-icon">🚀</div>
          <div className="stat-content">
            <h3>Active Bots</h3>
            <p className="stat-number">{stats.activeBots}</p>
          </div>
        </div>
      </div>

      <div className="info-section">
        <h2>Quick Start Guide</h2>
        <div className="guide-steps">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Create a Session</h3>
              <p>Go to Sessions and create a new WhatsApp session</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Scan QR Code</h3>
              <p>Use WhatsApp mobile app to scan the QR code</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Send Messages</h3>
              <p>Start sending messages or create automated bots</p>
            </div>
          </div>
        </div>
      </div>

      <div className="features-section">
        <h2>Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>📨 Send Messages</h3>
            <p>Send WhatsApp messages programmatically via API</p>
          </div>
          <div className="feature-card">
            <h3>🤖 Automated Bots</h3>
            <p>Create bots with scheduled message sending</p>
          </div>
          <div className="feature-card">
            <h3>📊 Message History</h3>
            <p>Track all sent and received messages</p>
          </div>
          <div className="feature-card">
            <h3>🔄 Multi-Session</h3>
            <p>Manage multiple WhatsApp sessions</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

