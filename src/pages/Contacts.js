import React, { useState, useEffect } from 'react';
import { sessionAPI } from '../api/api';
import './Contacts.css';

function Contacts() {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [contacts, setContacts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Modals
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showGroupDetailsModal, setShowGroupDetailsModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  
  // Import
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState(null);
  
  // Forms
  const [contactForm, setContactForm] = useState({
    phone_number: '',
    name: '',
    email: '',
    notes: ''
  });
  
  const [groupForm, setGroupForm] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (selectedSession) {
      fetchData();
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

  const fetchData = async () => {
    if (!selectedSession) return;
    
    try {
      setLoading(true);
      
      // Fetch contacts and groups for selected session
      const [contactsRes, groupsRes] = await Promise.all([
        fetch(`${process.env.REACT_APP_API_URL}/api/contacts?session_id=${selectedSession}`),
        fetch(`${process.env.REACT_APP_API_URL}/api/contacts/groups?session_id=${selectedSession}`)
      ]);
      
      const contactsData = await contactsRes.json();
      const groupsData = await groupsRes.json();
      
      setContacts(contactsData.contacts || []);
      setGroups(groupsData.groups || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createContact = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: selectedSession,
          ...contactForm
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setContactForm({ phone_number: '', name: '', email: '', notes: '' });
        setShowAddContactModal(false);
        fetchData();
        alert('✅ Contact added successfully!');
      } else {
        alert('❌ Failed to add contact: ' + data.message);
      }
    } catch (error) {
      console.error('Error creating contact:', error);
      alert('❌ Failed to add contact');
    }
  };

  const deleteContact = async (id) => {
    if (!window.confirm('Delete this contact?')) return;
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/contacts/${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        fetchData();
        alert('✅ Contact deleted');
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
      alert('❌ Failed to delete contact');
    }
  };

  const createGroup = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/contacts/groups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: selectedSession,
          ...groupForm
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setGroupForm({ name: '', description: '' });
        setShowCreateGroupModal(false);
        fetchData();
        alert('✅ Group created successfully!');
      } else {
        alert('❌ Failed to create group: ' + data.message);
      }
    } catch (error) {
      console.error('Error creating group:', error);
      alert('❌ Failed to create group');
    }
  };

  const deleteGroup = async (id) => {
    if (!window.confirm('Delete this group? (Contacts will remain)')) return;
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/contacts/groups/${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        fetchData();
        alert('✅ Group deleted');
      }
    } catch (error) {
      console.error('Error deleting group:', error);
      alert('❌ Failed to delete group');
    }
  };

  const viewGroupDetails = async (group) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/contacts/groups/${group.id}`
      );
      const data = await response.json();
      
      if (data.success) {
        setSelectedGroup(data.group);
        setShowGroupDetailsModal(true);
      }
    } catch (error) {
      console.error('Error fetching group details:', error);
      alert('❌ Failed to load group details');
    }
  };

  const addContactToGroup = async (contactId, groupId) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/contacts/groups/${groupId}/members`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contact_id: contactId })
        }
      );
      
      const data = await response.json();
      
      if (data.success) {
        alert('✅ Contact added to group!');
        if (selectedGroup && selectedGroup.id === groupId) {
          viewGroupDetails({ id: groupId });
        }
      }
    } catch (error) {
      console.error('Error adding contact to group:', error);
      alert('❌ Failed to add contact to group');
    }
  };

  const removeContactFromGroup = async (contactId, groupId) => {
    if (!window.confirm('Remove this contact from the group?')) return;
    
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/contacts/groups/${groupId}/members/${contactId}`,
        { method: 'DELETE' }
      );
      
      const data = await response.json();
      
      if (data.success) {
        alert('✅ Contact removed from group');
        viewGroupDetails({ id: groupId });
      }
    } catch (error) {
      console.error('Error removing contact:', error);
      alert('❌ Failed to remove contact');
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['.csv', '.xlsx', '.xls'];
      const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      
      if (validTypes.includes(fileExt)) {
        setImportFile(file);
        setImportResults(null);
      } else {
        alert('❌ Please select a CSV or Excel file');
        e.target.value = '';
      }
    }
  };

  const importContacts = async (e) => {
    e.preventDefault();
    
    if (!importFile) {
      alert('Please select a file');
      return;
    }
    
    try {
      setImporting(true);
      
      const formData = new FormData();
      formData.append('file', importFile);
      formData.append('session_id', selectedSession);
      
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/import/contacts`,
        {
          method: 'POST',
          body: formData
        }
      );
      
      const data = await response.json();
      
      if (data.success) {
        setImportResults(data);
        setImportFile(null);
        fetchData();
      } else {
        alert('❌ Import failed: ' + data.message);
      }
    } catch (error) {
      console.error('Error importing contacts:', error);
      alert('❌ Failed to import contacts');
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = (format) => {
    window.open(
      `${process.env.REACT_APP_API_URL}/api/import/template/download?format=${format}`,
      '_blank'
    );
  };

  const connectedSessions = sessions.filter(s => s.status === 'connected');

  return (
    <div className="contacts-page">
      <div className="page-header">
        <div>
          <h1>Contacts & Groups</h1>
          <p className="page-subtitle">Manage your contacts and organize them into groups</p>
        </div>
      </div>

      {/* Session Selector */}
      <div className="session-selector">
        <label>Select Session:</label>
        <select
          value={selectedSession}
          onChange={(e) => setSelectedSession(e.target.value)}
        >
          <option value="">Choose a session</option>
          {connectedSessions.map((session) => (
            <option key={session.id} value={session.id}>
              {session.session_name} ({session.phone_number})
            </option>
          ))}
        </select>
      </div>

      {!selectedSession ? (
        <div className="alert alert-info">
          👆 Please select a connected session to manage contacts
        </div>
      ) : loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="contacts-container">
          {/* Contacts Section */}
          <div className="section contacts-section">
            <div className="section-header">
              <div>
                <h2>📱 Contacts ({contacts.length})</h2>
              </div>
              <div className="header-actions">
                <button className="btn-secondary" onClick={() => setShowImportModal(true)}>
                  📥 Import
                </button>
                <button className="btn-primary" onClick={() => setShowAddContactModal(true)}>
                  + Add Contact
                </button>
              </div>
            </div>

            {contacts.length === 0 ? (
              <div className="empty-state-small">
                <p>No contacts yet</p>
                <button className="btn-primary" onClick={() => setShowAddContactModal(true)}>
                  Add Your First Contact
                </button>
              </div>
            ) : (
              <div className="contacts-list">
                {contacts.map((contact) => (
                  <div key={contact.id} className="contact-card">
                    <div className="contact-info">
                      <h3>{contact.name || 'Unnamed'}</h3>
                      <p className="contact-phone">📱 {contact.phone_number}</p>
                      {contact.email && (
                        <p className="contact-email">📧 {contact.email}</p>
                      )}
                      {contact.notes && (
                        <p className="contact-notes">📝 {contact.notes}</p>
                      )}
                    </div>
                    <div className="contact-actions">
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            addContactToGroup(contact.id, e.target.value);
                            e.target.value = '';
                          }
                        }}
                        className="group-select"
                      >
                        <option value="">Add to group...</option>
                        {groups.map(g => (
                          <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                      </select>
                      <button
                        className="btn-icon danger"
                        onClick={() => deleteContact(contact.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Groups Section */}
          <div className="section groups-section">
            <div className="section-header">
              <h2>👥 Groups ({groups.length})</h2>
              <button className="btn-primary" onClick={() => setShowCreateGroupModal(true)}>
                + Create Group
              </button>
            </div>

            {groups.length === 0 ? (
              <div className="empty-state-small">
                <p>No groups yet</p>
                <button className="btn-primary" onClick={() => setShowCreateGroupModal(true)}>
                  Create Your First Group
                </button>
              </div>
            ) : (
              <div className="groups-list">
                {groups.map((group) => (
                  <div key={group.id} className="group-card">
                    <h3>{group.name}</h3>
                    {group.description && (
                      <p className="group-description">{group.description}</p>
                    )}
                    <div className="group-stats">
                      <span className="stat">
                        👥 {group.contacts?.length || 0} members
                      </span>
                    </div>
                    <div className="group-actions">
                      <button
                        className="btn-secondary"
                        onClick={() => viewGroupDetails(group)}
                      >
                        View Members
                      </button>
                      <button
                        className="btn-icon danger"
                        onClick={() => deleteGroup(group.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Contact Modal */}
      {showAddContactModal && (
        <div className="modal-overlay" onClick={() => setShowAddContactModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>📱 Add New Contact</h2>
            <form onSubmit={createContact}>
              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  value={contactForm.phone_number}
                  onChange={(e) => setContactForm({...contactForm, phone_number: e.target.value})}
                  placeholder="1234567890 (with country code, no +)"
                  required
                />
                <small>Format: Country code + number (e.g., 1234567890 for US)</small>
              </div>

              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                  placeholder="John Doe"
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                  placeholder="john@example.com"
                />
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={contactForm.notes}
                  onChange={(e) => setContactForm({...contactForm, notes: e.target.value})}
                  placeholder="Add any notes about this contact..."
                  rows="3"
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setShowAddContactModal(false);
                    setContactForm({ phone_number: '', name: '', email: '', notes: '' });
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateGroupModal && (
        <div className="modal-overlay" onClick={() => setShowCreateGroupModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>👥 Create Contact Group</h2>
            <form onSubmit={createGroup}>
              <div className="form-group">
                <label>Group Name *</label>
                <input
                  type="text"
                  value={groupForm.name}
                  onChange={(e) => setGroupForm({...groupForm, name: e.target.value})}
                  placeholder="e.g., VIP Customers"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={groupForm.description}
                  onChange={(e) => setGroupForm({...groupForm, description: e.target.value})}
                  placeholder="What is this group for?"
                  rows="3"
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setShowCreateGroupModal(false);
                    setGroupForm({ name: '', description: '' });
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Contacts Modal */}
      {showImportModal && (
        <div className="modal-overlay" onClick={() => setShowImportModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>📥 Import Contacts</h2>
            
            <div className="import-info">
              <p>Import contacts from CSV or Excel files</p>
              <div className="template-downloads">
                <strong>Download Template:</strong>
                <button 
                  className="btn-link" 
                  onClick={() => downloadTemplate('csv')}
                >
                  📄 CSV Template
                </button>
                <button 
                  className="btn-link" 
                  onClick={() => downloadTemplate('xlsx')}
                >
                  📊 Excel Template
                </button>
              </div>
            </div>

            <form onSubmit={importContacts}>
              <div className="form-group">
                <label>Select File (CSV or Excel)</label>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileSelect}
                  required
                />
                {importFile && (
                  <div className="file-selected">
                    ✅ Selected: {importFile.name}
                  </div>
                )}
              </div>

              <div className="file-format-info">
                <strong>File Format:</strong>
                <pre>
phone_number,name,email,notes
1234567890,John Doe,john@email.com,VIP
9876543210,Jane Smith,jane@email.com,Regular
                </pre>
                <small>
                  • <strong>phone_number</strong> is required (with country code, no +)<br/>
                  • Other fields are optional
                </small>
              </div>

              {importResults && (
                <div className="import-results">
                  <h3>Import Results:</h3>
                  <div className="results-summary">
                    <span className="result-item success">
                      ✅ Success: {importResults.imported}
                    </span>
                    <span className="result-item failed">
                      ❌ Failed: {importResults.failed}
                    </span>
                    <span className="result-item total">
                      📊 Total: {importResults.total}
                    </span>
                  </div>
                  {importResults.errors && importResults.errors.length > 0 && (
                    <div className="import-errors">
                      <strong>Errors:</strong>
                      <ul>
                        {importResults.errors.slice(0, 5).map((err, idx) => (
                          <li key={idx}>
                            {err.contact.phone_number}: {err.error}
                          </li>
                        ))}
                        {importResults.errors.length > 5 && (
                          <li>... and {importResults.errors.length - 5} more</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setShowImportModal(false);
                    setImportFile(null);
                    setImportResults(null);
                  }}
                  disabled={importing}
                >
                  {importResults ? 'Close' : 'Cancel'}
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={importing || !importFile}
                >
                  {importing ? 'Importing...' : '📥 Import Contacts'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Group Details Modal */}
      {showGroupDetailsModal && selectedGroup && (
        <div className="modal-overlay" onClick={() => setShowGroupDetailsModal(false)}>
          <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
            <h2>👥 {selectedGroup.name}</h2>
            {selectedGroup.description && (
              <p className="group-description">{selectedGroup.description}</p>
            )}

            <h3>Members ({selectedGroup.members?.length || 0})</h3>
            
            {selectedGroup.members && selectedGroup.members.length > 0 ? (
              <div className="group-members-list">
                {selectedGroup.members.map((member) => (
                  <div key={member.id} className="member-item">
                    <div className="member-info">
                      <strong>{member.name || 'Unnamed'}</strong>
                      <span className="member-phone">📱 {member.phone_number}</span>
                    </div>
                    <button
                      className="btn-icon danger"
                      onClick={() => removeContactFromGroup(member.id, selectedGroup.id)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-message">No members in this group yet</p>
            )}

            <h3 style={{marginTop: '2rem'}}>Add Members</h3>
            <div className="add-members-section">
              {contacts.filter(c => 
                !selectedGroup.members?.find(m => m.id === c.id)
              ).length === 0 ? (
                <p className="empty-message">All contacts are already in this group</p>
              ) : (
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      addContactToGroup(e.target.value, selectedGroup.id);
                      e.target.value = '';
                    }
                  }}
                  className="add-member-select"
                >
                  <option value="">Select contact to add...</option>
                  {contacts.filter(c => 
                    !selectedGroup.members?.find(m => m.id === c.id)
                  ).map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone_number})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => {
                  setShowGroupDetailsModal(false);
                  setSelectedGroup(null);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Contacts;

