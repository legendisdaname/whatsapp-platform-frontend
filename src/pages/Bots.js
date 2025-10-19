import React, { useState, useEffect } from 'react';
import { sessionAPI, botAPI } from '../api/api';
import './Bots.css';

function Bots() {
  const [sessions, setSessions] = useState([]);
  const [bots, setBots] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showGroupSelectorModal, setShowGroupSelectorModal] = useState(false);
  const [editingBot, setEditingBot] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    session_id: '',
    name: '',
    message_template: '',
    target_numbers: '',
    schedule_pattern: '',
    is_active: false
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sessionsResponse, botsResponse] = await Promise.all([
        sessionAPI.getAll(),
        botAPI.getAll()
      ]);
      
      setSessions(sessionsResponse.data.sessions || []);
      setBots(botsResponse.data.bots || []);
      
      // Fetch groups for all sessions
      const allSessions = sessionsResponse.data.sessions || [];
      if (allSessions.length > 0) {
        const groupsResponse = await fetch(
          `${process.env.REACT_APP_API_URL}/api/contacts/groups`
        );
        const groupsData = await groupsResponse.json();
        setGroups(groupsData.groups || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      session_id: '',
      name: '',
      message_template: '',
      target_numbers: '',
      schedule_pattern: '',
      is_active: false
    });
  };

  const createBot = async (e) => {
    e.preventDefault();
    
    try {
      const numbersArray = formData.target_numbers
        .split(',')
        .map(n => n.trim())
        .filter(n => n);

      if (numbersArray.length === 0) {
        alert('Please enter at least one target number');
        return;
      }

      await botAPI.create({
        session_id: formData.session_id,
        name: formData.name,
        message_template: formData.message_template,
        target_numbers: numbersArray,
        schedule_pattern: formData.schedule_pattern || null,
        is_active: formData.is_active
      });

      resetForm();
      setShowCreateModal(false);
      fetchData();
      alert('Bot created successfully!');
    } catch (error) {
      console.error('Error creating bot:', error);
      alert('Failed to create bot: ' + error.message);
    }
  };

  const updateBot = async (e) => {
    e.preventDefault();
    if (!editingBot) return;

    try {
      const updates = { ...formData };
      
      if (typeof formData.target_numbers === 'string') {
        updates.target_numbers = formData.target_numbers
          .split(',')
          .map(n => n.trim())
          .filter(n => n);
      }

      await botAPI.update(editingBot.id, updates);
      
      resetForm();
      setEditingBot(null);
      setShowEditModal(false);
      fetchData();
      alert('Bot updated successfully!');
    } catch (error) {
      console.error('Error updating bot:', error);
      alert('Failed to update bot: ' + error.message);
    }
  };

  const deleteBot = async (id) => {
    if (!window.confirm('Are you sure you want to delete this bot?')) return;

    try {
      await botAPI.delete(id);
      fetchData();
      alert('Bot deleted successfully!');
    } catch (error) {
      console.error('Error deleting bot:', error);
      alert('Failed to delete bot');
    }
  };

  const toggleBot = async (bot) => {
    try {
      await botAPI.update(bot.id, { is_active: !bot.is_active });
      fetchData();
    } catch (error) {
      console.error('Error toggling bot:', error);
      alert('Failed to toggle bot');
    }
  };

  const triggerBot = async (id) => {
    if (!window.confirm('Send messages now?')) return;

    try {
      await botAPI.trigger(id);
      alert('Bot triggered! Messages are being sent.');
    } catch (error) {
      console.error('Error triggering bot:', error);
      alert('Failed to trigger bot: ' + error.message);
    }
  };

  const openEditModal = (bot) => {
    setEditingBot(bot);
    setFormData({
      session_id: bot.session_id,
      name: bot.name,
      message_template: bot.message_template,
      target_numbers: Array.isArray(bot.target_numbers) 
        ? bot.target_numbers.join(', ') 
        : bot.target_numbers,
      schedule_pattern: bot.schedule_pattern || '',
      is_active: bot.is_active
    });
    setShowEditModal(true);
  };

  const connectedSessions = sessions.filter(s => s.status === 'connected');

  if (loading) {
    return (
      <div className="bots-page">
        <h1>Bots</h1>
        <div className="loading">Loading bots...</div>
      </div>
    );
  }

  return (
    <div className="bots-page">
      <div className="page-header">
        <div>
          <h1>Automated Bots</h1>
          <p className="page-subtitle">Create and manage message automation</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
          + Create Bot
        </button>
      </div>

      <div className="bots-grid">
        {bots.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🤖</div>
            <h3>No bots yet</h3>
            <p>Create your first bot to automate message sending</p>
            <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
              Create Bot
            </button>
          </div>
        ) : (
          bots.map((bot) => {
            const session = sessions.find(s => s.id === bot.session_id);
            return (
              <div key={bot.id} className={`bot-card ${bot.is_active ? 'active' : ''}`}>
                <div className="bot-header">
                  <h3>{bot.name}</h3>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={bot.is_active}
                      onChange={() => toggleBot(bot)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="bot-info">
                  <div className="info-item">
                    <strong>Session:</strong> {session?.session_name || 'Unknown'}
                  </div>
                  <div className="info-item">
                    <strong>Schedule:</strong> {bot.schedule_pattern || 'Manual only'}
                  </div>
                  <div className="info-item">
                    <strong>Targets:</strong> {bot.target_numbers?.length || 0} numbers
                  </div>
                </div>

                <div className="bot-message">
                  <strong>Message Template:</strong>
                  <p>{bot.message_template}</p>
                </div>

                <div className="bot-actions">
                  <button
                    className="btn-icon"
                    onClick={() => triggerBot(bot.id)}
                    title="Send now"
                  >
                    ▶️
                  </button>
                  <button
                    className="btn-icon"
                    onClick={() => openEditModal(bot)}
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    className="btn-icon danger"
                    onClick={() => deleteBot(bot.id)}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Bot Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal bot-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Bot</h2>
            
            {connectedSessions.length === 0 ? (
              <div className="alert alert-warning">
                ⚠️ No connected sessions. Please connect a session first.
              </div>
            ) : (
              <form onSubmit={createBot}>
                <div className="form-group">
                  <label>Bot Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., Daily Reminder Bot"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Select Session *</label>
                  <select
                    value={formData.session_id}
                    onChange={(e) => setFormData({...formData, session_id: e.target.value})}
                    required
                  >
                    <option value="">Choose a session</option>
                    {connectedSessions.map((session) => (
                      <option key={session.id} value={session.id}>
                        {session.session_name} ({session.phone_number})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Message Template *</label>
                  <textarea
                    value={formData.message_template}
                    onChange={(e) => setFormData({...formData, message_template: e.target.value})}
                    placeholder="Hello! This is an automated message. Today is {day}."
                    rows="4"
                    required
                  />
                  <small>
                    Available variables: {'{date}'}, {'{time}'}, {'{datetime}'}, {'{day}'}
                  </small>
                </div>

                <div className="form-group">
                  <label>Target Numbers *</label>
                  <input
                    type="text"
                    value={formData.target_numbers}
                    onChange={(e) => setFormData({...formData, target_numbers: e.target.value})}
                    placeholder="1234567890, 0987654321, group:GROUP_ID"
                    required
                  />
                  <small>
                    • Enter phone numbers: 1234567890, 9876543210<br/>
                    • Or use groups: group:GROUP_ID<br/>
                    • Mix both: group:GROUP_ID, 1234567890
                  </small>
                  {groups.length > 0 && (
                    <div className="group-selector-helper">
                      <strong>Quick Select Groups:</strong>
                      <div className="group-buttons">
                        {groups.map(group => (
                          <button
                            key={group.id}
                            type="button"
                            className="btn-group-select"
                            onClick={() => {
                              const current = formData.target_numbers;
                              const groupRef = `group:${group.id}`;
                              const newValue = current ? `${current}, ${groupRef}` : groupRef;
                              setFormData({...formData, target_numbers: newValue});
                            }}
                          >
                            + {group.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Schedule Pattern (Cron)</label>
                  <input
                    type="text"
                    value={formData.schedule_pattern}
                    onChange={(e) => setFormData({...formData, schedule_pattern: e.target.value})}
                    placeholder="0 9 * * * (daily at 9 AM)"
                  />
                  <small>
                    Cron pattern (e.g., "0 9 * * *" = daily at 9 AM). Leave empty for manual only.
                  </small>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    />
                    Activate bot immediately
                  </label>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Create Bot
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Edit Bot Modal */}
      {showEditModal && editingBot && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal bot-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Bot</h2>
            <form onSubmit={updateBot}>
              <div className="form-group">
                <label>Bot Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Message Template *</label>
                <textarea
                  value={formData.message_template}
                  onChange={(e) => setFormData({...formData, message_template: e.target.value})}
                  rows="4"
                  required
                />
              </div>

              <div className="form-group">
                <label>Target Numbers * (comma-separated)</label>
                <input
                  type="text"
                  value={formData.target_numbers}
                  onChange={(e) => setFormData({...formData, target_numbers: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Schedule Pattern (Cron)</label>
                <input
                  type="text"
                  value={formData.schedule_pattern}
                  onChange={(e) => setFormData({...formData, schedule_pattern: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  />
                  Bot is active
                </label>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingBot(null);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Update Bot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Bots;

