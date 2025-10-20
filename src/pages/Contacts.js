import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sessionAPI } from '../api/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Textarea } from '../components/ui/Textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup, SelectLabel } from '../components/ui/Select';
import {
  Users,
  Plus,
  Trash2,
  RefreshCw,
  Phone,
  Mail,
  FileText,
  Upload,
  UserPlus,
  FolderPlus,
  Loader2,
  MessageSquare,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

function Contacts() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [contacts, setContacts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  
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

  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);

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
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/contacts/${id}`, { method: 'DELETE' });
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
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/contacts/groups/${id}`, { method: 'DELETE' });
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

  const importContacts = async (e) => {
    e.preventDefault();
    if (!importFile) return;
    
    try {
      setImporting(true);
      const formData = new FormData();
      formData.append('file', importFile);
      formData.append('session_id', selectedSession);
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/import/contacts`, {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      if (data.success) {
        alert(`✅ Imported ${data.imported} contacts successfully!`);
        setImportFile(null);
        setShowImportModal(false);
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

  const connectedSessions = sessions.filter(s => s.status === 'connected');

  return (
    <div className="space-y-6">
      {/* No Accounts Alert */}
      {connectedSessions.length === 0 && (
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900">
                <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                  No Connected Accounts
                </h3>
                <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
                  You need a connected WhatsApp account to manage contacts. Create and connect an account to start organizing your contacts.
                </p>
                <Button
                  onClick={() => navigate('/sessions')}
                  variant="default"
                  size="sm"
                  className="bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-600 dark:hover:bg-yellow-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contacts & Groups</h1>
          <p className="text-muted-foreground">Manage your contacts and organize them into groups</p>
        </div>
        <Button onClick={fetchData} variant="outline" size="sm" disabled={!selectedSession}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Account Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium min-w-[100px]">Select Account:</label>
            <div className="flex-1">
              <Select value={selectedSession} onValueChange={setSelectedSession}>
                <SelectTrigger className="w-full">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Choose an account" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Connected Accounts</SelectLabel>
                    {connectedSessions.map((session) => (
                      <SelectItem key={session.id} value={session.id}>
                        {session.session_name} ({session.phone_number})
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {!selectedSession ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">👆 Please select a connected account to manage contacts</p>
          </CardContent>
        </Card>
      ) : loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Contacts Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Contacts ({contacts.length})
                  </CardTitle>
                  <CardDescription>Your contact list</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => setShowImportModal(true)} variant="outline" size="sm">
                    <Upload className="h-4 w-4" />
                  </Button>
                  <Button onClick={() => setShowAddContactModal(true)} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {contacts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No contacts yet</p>
                  <Button onClick={() => setShowAddContactModal(true)} size="sm">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Your First Contact
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {contacts.map((contact) => (
                    <div key={contact.id} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{contact.name || 'Unnamed'}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <span>{contact.phone_number}</span>
                        </div>
                        {contact.email && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            <span className="truncate">{contact.email}</span>
                          </div>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => deleteContact(contact.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Groups Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FolderPlus className="h-5 w-5" />
                    Groups ({groups.length})
                  </CardTitle>
                  <CardDescription>Organize contacts into groups</CardDescription>
                </div>
                <Button onClick={() => setShowCreateGroupModal(true)} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {groups.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No groups yet</p>
                  <Button onClick={() => setShowCreateGroupModal(true)} size="sm">
                    <FolderPlus className="mr-2 h-4 w-4" />
                    Create Your First Group
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {groups.map((group) => (
                    <div key={group.id} className="p-4 border border-border rounded-lg hover:bg-accent transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium">{group.name}</h4>
                          {group.description && (
                            <p className="text-sm text-muted-foreground mt-1">{group.description}</p>
                          )}
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => deleteGroup(group.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      <Badge variant="secondary">
                        <Users className="h-3 w-3 mr-1" />
                        {group.contacts?.length || 0} members
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Contact Modal */}
      {showAddContactModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setShowAddContactModal(false)}>
          <Card className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle>Add New Contact</CardTitle>
              <CardDescription>Enter contact details</CardDescription>
            </CardHeader>
            <form onSubmit={createContact}>
              <CardContent className="space-y-4">
                <div className="grid w-full items-center gap-3">
                  <Label htmlFor="contact-phone">Phone Number *</Label>
                  <Input 
                    id="contact-phone"
                    type="tel" 
                    value={contactForm.phone_number} 
                    onChange={(e) => setContactForm({...contactForm, phone_number: e.target.value})} 
                    placeholder="1234567890 (with country code)" 
                    required 
                    icon={<Phone className="h-4 w-4" />}
                  />
                </div>
                <div className="grid w-full items-center gap-3">
                  <Label htmlFor="contact-name">Name</Label>
                  <Input 
                    id="contact-name"
                    type="text" 
                    value={contactForm.name} 
                    onChange={(e) => setContactForm({...contactForm, name: e.target.value})} 
                    placeholder="John Doe" 
                  />
                </div>
                <div className="grid w-full items-center gap-3">
                  <Label htmlFor="contact-email">Email</Label>
                  <Input 
                    id="contact-email"
                    type="email" 
                    value={contactForm.email} 
                    onChange={(e) => setContactForm({...contactForm, email: e.target.value})} 
                    placeholder="john@example.com"
                    icon={<Mail className="h-4 w-4" />}
                  />
                </div>
                <div className="grid w-full items-center gap-3">
                  <Label htmlFor="contact-notes">Notes</Label>
                  <Textarea 
                    id="contact-notes"
                    value={contactForm.notes} 
                    onChange={(e) => setContactForm({...contactForm, notes: e.target.value})} 
                    placeholder="Add any notes..." 
                    rows={3}
                  />
                </div>
              </CardContent>
              <div className="flex gap-2 p-6 pt-0">
                <Button type="button" variant="outline" onClick={() => { setShowAddContactModal(false); setContactForm({ phone_number: '', name: '', email: '', notes: '' }); }} className="w-full">Cancel</Button>
                <Button type="submit" className="w-full">Add Contact</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateGroupModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setShowCreateGroupModal(false)}>
          <Card className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle>Create Contact Group</CardTitle>
              <CardDescription>Organize your contacts</CardDescription>
            </CardHeader>
            <form onSubmit={createGroup}>
              <CardContent className="space-y-4">
                <div className="grid w-full items-center gap-3">
                  <Label htmlFor="group-name">Group Name *</Label>
                  <Input 
                    id="group-name"
                    type="text" 
                    value={groupForm.name} 
                    onChange={(e) => setGroupForm({...groupForm, name: e.target.value})} 
                    placeholder="e.g., VIP Customers" 
                    required 
                    icon={<Users className="h-4 w-4" />}
                  />
                </div>
                <div className="grid w-full items-center gap-3">
                  <Label htmlFor="group-description">Description</Label>
                  <Textarea 
                    id="group-description"
                    value={groupForm.description} 
                    onChange={(e) => setGroupForm({...groupForm, description: e.target.value})} 
                    placeholder="What is this group for?" 
                    rows={3}
                  />
                </div>
              </CardContent>
              <div className="flex gap-2 p-6 pt-0">
                <Button type="button" variant="outline" onClick={() => { setShowCreateGroupModal(false); setGroupForm({ name: '', description: '' }); }} className="w-full">Cancel</Button>
                <Button type="submit" className="w-full">Create Group</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Import Contacts Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setShowImportModal(false)}>
          <Card className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle>Import Contacts</CardTitle>
              <CardDescription>Upload CSV or Excel file</CardDescription>
            </CardHeader>
            <form onSubmit={importContacts}>
              <CardContent className="space-y-4">
                <div className="grid w-full items-center gap-3">
                  <Label htmlFor="import-file">Select File</Label>
                  <Input 
                    id="import-file"
                    type="file" 
                    accept=".csv,.xlsx,.xls" 
                    onChange={(e) => setImportFile(e.target.files[0])} 
                    required 
                  />
                  {importFile && (
                    <p className="text-xs text-muted-foreground flex items-center gap-2">
                      <FileText className="h-3 w-3" />
                      Selected: {importFile.name}
                    </p>
                  )}
                </div>
                <div className="p-3 bg-accent rounded-lg text-sm">
                  <p className="font-medium mb-1">File Format:</p>
                  <code className="text-xs">phone_number,name,email,notes</code>
                </div>
              </CardContent>
              <div className="flex gap-2 p-6 pt-0">
                <Button type="button" variant="outline" onClick={() => { setShowImportModal(false); setImportFile(null); }} disabled={importing} className="w-full">Cancel</Button>
                <Button type="submit" disabled={importing || !importFile} className="w-full">
                  {importing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Importing...</> : <><Upload className="mr-2 h-4 w-4" />Import</>}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

export default Contacts;
