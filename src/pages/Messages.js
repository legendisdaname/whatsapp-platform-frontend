import React, { useState, useEffect } from 'react';
import { sessionAPI, messageAPI } from '../api/api';
import './Messages.css';

function Messages() {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [messageHistory, setMessageHistory] = useState([]);
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Send message form
  const [recipientType, setRecipientType] = useState('individual'); // 'individual' or 'group'
  const [recipientNumber, setRecipientNumber] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (selectedSession) {
      fetchMessages();
      // Poll for new messages every 10 seconds
      const interval = setInterval(fetchMessages, 10000);
      return () => clearInterval(interval);
    }
  }, [selectedSession]);

  const fetchSessions = async () => {
    try {
      const response = await sessionAPI.getAll();
      const allSessions = response.data.sessions || [];
      setSessions(allSessions);
      
      // Auto-select first connected session
      const connected = allSessions.find(s => s.status === 'connected');
      if (connected) {
        setSelectedSession(connected.id);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const fetchMessages = async () => {
    if (!selectedSession) return;
    
    try {
      setLoading(true);
      const [sentResponse, receivedResponse, groupsResponse] = await Promise.all([
        messageAPI.getHistory(selectedSession),
        messageAPI.getReceived(selectedSession),
        fetch(`${process.env.REACT_APP_API_URL}/api/contacts/groups?session_id=${selectedSession}`)
      ]);
      
      setMessageHistory(sentResponse.data.messages || []);
      setReceivedMessages(receivedResponse.data.messages || []);
      
      const groupsData = await groupsResponse.json();
      setGroups(groupsData.groups || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!selectedSession || !messageText) return;
    
    try {
      setSending(true);
      
      if (recipientType === 'group') {
        // Send to group - get all phone numbers first
        if (!selectedGroupId) {
          alert('Please select a group');
          return;
        }
        
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/contacts/groups/${selectedGroupId}/phone-numbers`
        );
        const data = await response.json();
        
        if (!data.success || !data.phoneNumbers || data.phoneNumbers.length === 0) {
          alert('No phone numbers found in this group');
          return;
        }
        
        // Send to each phone number in the group
        let successCount = 0;
        let failCount = 0;
        
        for (const phoneNumber of data.phoneNumbers) {
          try {
            await messageAPI.send(selectedSession, phoneNumber, messageText);
            successCount++;
          } catch (error) {
            console.error(`Failed to send to ${phoneNumber}:`, error);
            failCount++;
          }
        }
        
        alert(`✅ Messages sent!\n\nSuccess: ${successCount}\nFailed: ${failCount}\nTotal: ${data.phoneNumbers.length}`);
      } else {
        // Send to individual number
        if (!recipientNumber) {
          alert('Please enter a phone number');
          return;
        }
        
        await messageAPI.send(selectedSession, recipientNumber, messageText);
        alert('✅ Message sent successfully!');
      }
      
      setRecipientNumber('');
      setSelectedGroupId('');
      setMessageText('');
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('❌ Failed to send message: ' + error.message);
    } finally {
      setSending(false);
    }
  };

  const connectedSessions = sessions.filter(s => s.status === 'connected');

  return (
    <div className="messages-page">
      <h1>Messages</h1>
      <p className="page-subtitle">Send and view WhatsApp messages</p>

      <div className="messages-container">
        {/* Send Message Section */}
        <div className="send-section">
          <h2>Send Message</h2>
          
          {connectedSessions.length === 0 ? (
            <div className="alert alert-warning">
              ⚠️ No connected sessions. Please connect a session first.
            </div>
          ) : (
            <form onSubmit={sendMessage}>
              <div className="form-group">
                <label>Select Session</label>
                <select
                  value={selectedSession}
                  onChange={(e) => setSelectedSession(e.target.value)}
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
                <label>Send To</label>
                <div className="recipient-type-selector">
                  <label className="radio-label">
                    <input
                      type="radio"
                      value="individual"
                      checked={recipientType === 'individual'}
                      onChange={(e) => setRecipientType(e.target.value)}
                    />
                    <span>📱 Individual Number</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      value="group"
                      checked={recipientType === 'group'}
                      onChange={(e) => setRecipientType(e.target.value)}
                    />
                    <span>👥 Contact Group</span>
                  </label>
                </div>
              </div>

              {recipientType === 'individual' ? (
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    value={recipientNumber}
                    onChange={(e) => setRecipientNumber(e.target.value)}
                    placeholder="e.g., 1234567890"
                    required
                  />
                  <small>Enter phone number with country code (without +)</small>
                </div>
              ) : (
                <div className="form-group">
                  <label>Select Group</label>
                  <select
                    value={selectedGroupId}
                    onChange={(e) => setSelectedGroupId(e.target.value)}
                    required
                  >
                    <option value="">Choose a group...</option>
                    {groups.map(group => (
                      <option key={group.id} value={group.id}>
                        {group.name} ({group.contacts?.length || 0} members)
                      </option>
                    ))}
                  </select>
                  <small>Message will be sent to all members in the group</small>
                </div>
              )}

              <div className="form-group">
                <label>Message</label>
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type your message here..."
                  rows="4"
                  required
                />
              </div>

              <button type="submit" className="btn-primary" disabled={sending}>
                {sending ? 'Sending...' : '📤 Send Message'}
              </button>
            </form>
          )}
        </div>

        {/* Message History Section */}
        <div className="history-section">
          <h2>Message History</h2>
          
          {!selectedSession ? (
            <div className="alert alert-info">
              Select a session to view message history
            </div>
          ) : loading ? (
            <div className="loading">Loading messages...</div>
          ) : (
            <div className="history-tabs">
              <div className="tab-content">
                <h3>Sent Messages ({messageHistory.length})</h3>
                <div className="message-list">
                  {messageHistory.length === 0 ? (
                    <p className="empty-message">No sent messages yet</p>
                  ) : (
                    messageHistory.map((msg) => (
                      <div key={msg.id} className="message-item sent">
                        <div className="message-header">
                          <span className="message-recipient">To: {msg.to}</span>
                          <span className={`message-status status-${msg.status}`}>
                            {msg.status}
                          </span>
                        </div>
                        <div className="message-body">{msg.message}</div>
                        <div className="message-time">
                          {new Date(msg.created_at).toLocaleString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <h3 style={{marginTop: '2rem'}}>Received Messages ({receivedMessages.length})</h3>
                <div className="message-list">
                  {receivedMessages.length === 0 ? (
                    <p className="empty-message">No received messages yet</p>
                  ) : (
                    receivedMessages.map((msg) => (
                      <div key={msg.id} className="message-item received">
                        <div className="message-header">
                          <span className="message-recipient">From: {msg.from}</span>
                        </div>
                        <div className="message-body">{msg.message}</div>
                        <div className="message-time">
                          {new Date(msg.timestamp).toLocaleString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Messages;

