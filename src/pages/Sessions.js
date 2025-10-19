import React, { useState, useEffect } from 'react';
import { sessionAPI } from '../api/api';
import './Sessions.css';

function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSessionName, setNewSessionName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchSessions();
    // Poll for session updates every 5 seconds
    const interval = setInterval(fetchSessions, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await sessionAPI.getAll();
      setSessions(response.data.sessions || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSession = async (e) => {
    e.preventDefault();
    if (!newSessionName.trim()) return;

    try {
      setCreating(true);
      await sessionAPI.create(newSessionName);
      setNewSessionName('');
      setShowCreateModal(false);
      fetchSessions();
    } catch (error) {
      console.error('Error creating session:', error);
      alert('Failed to create session');
    } finally {
      setCreating(false);
    }
  };

  const deleteSession = async (id) => {
    if (!window.confirm('Are you sure you want to delete this session?')) return;

    try {
      await sessionAPI.delete(id);
      fetchSessions();
    } catch (error) {
      console.error('Error deleting session:', error);
      alert('Failed to delete session');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      connected: { text: 'Connected', class: 'status-connected' },
      connecting: { text: 'Connecting', class: 'status-connecting' },
      qr: { text: 'QR Ready', class: 'status-qr' },
      disconnected: { text: 'Disconnected', class: 'status-disconnected' }
    };
    const badge = badges[status] || badges.disconnected;
    return <span className={`status-badge ${badge.class}`}>{badge.text}</span>;
  };

  if (loading) {
    return (
      <div className="sessions-page">
        <h1>WhatsApp Sessions</h1>
        <div className="loading">Loading sessions...</div>
      </div>
    );
  }

  return (
    <div className="sessions-page">
      <div className="page-header">
        <div>
          <h1>WhatsApp Sessions</h1>
          <p className="page-subtitle">Manage your WhatsApp connections</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
          + Create Session
        </button>
      </div>

      <div className="sessions-grid">
        {sessions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📱</div>
            <h3>No sessions yet</h3>
            <p>Create your first WhatsApp session to get started</p>
            <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
              Create Session
            </button>
          </div>
        ) : (
          sessions.map((session) => (
            <div key={session.id} className="session-card">
              <div className="session-header">
                <h3>{session.session_name}</h3>
                {getStatusBadge(session.status)}
              </div>

              {session.phone_number && (
                <div className="session-info">
                  <strong>Phone:</strong> {session.phone_number}
                </div>
              )}

              <div className="session-info">
                <strong>Created:</strong> {new Date(session.created_at).toLocaleString()}
              </div>

              {session.status === 'qr' && session.qr_code && (
                <div className="qr-section">
                  <p className="qr-instruction">Scan this QR code with WhatsApp:</p>
                  <img src={session.qr_code} alt="QR Code" className="qr-code" />
                </div>
              )}

              {session.status === 'connected' && (
                <div className="session-actions">
                  <span className="success-message">✓ Session is active</span>
                </div>
              )}

              <div className="session-footer">
                <button
                  className="btn-danger"
                  onClick={() => deleteSession(session.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Session</h2>
            <form onSubmit={createSession}>
              <div className="form-group">
                <label>Session Name</label>
                <input
                  type="text"
                  value={newSessionName}
                  onChange={(e) => setNewSessionName(e.target.value)}
                  placeholder="e.g., My WhatsApp"
                  required
                  autoFocus
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                  disabled={creating}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={creating}>
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sessions;

