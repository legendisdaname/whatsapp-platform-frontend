import React, { useState, useEffect } from 'react';
import { sessionAPI } from '../api/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import {
  MessageSquare,
  Plus,
  Trash2,
  RefreshCw,
  QrCode,
  Phone,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react';

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
      connected: { variant: 'success', icon: CheckCircle2, text: 'Connected' },
      connecting: { variant: 'warning', icon: Loader2, text: 'Connecting' },
      qr: { variant: 'default', icon: QrCode, text: 'QR Ready' },
      disconnected: { variant: 'destructive', icon: XCircle, text: 'Disconnected' }
    };
    const badge = badges[status] || badges.disconnected;
    const Icon = badge.icon;
    
    return (
      <Badge variant={badge.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {badge.text}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">WhatsApp Accounts</h1>
          <p className="text-muted-foreground">Loading accounts...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-32 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">WhatsApp Accounts</h1>
          <p className="text-muted-foreground">
            Manage your WhatsApp connections
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchSessions} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Account
          </Button>
        </div>
      </div>

      {/* Accounts Grid */}
      {sessions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No accounts yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first WhatsApp account to get started
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Account
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sessions.map((session) => (
            <Card key={session.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    <CardTitle className="text-xl">{session.session_name}</CardTitle>
                  </div>
                  {getStatusBadge(session.status)}
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {session.phone_number && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{session.phone_number}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{new Date(session.created_at).toLocaleDateString()}</span>
                </div>

                {session.status === 'qr' && session.qr_code && (
                  <div className="mt-4 p-3 bg-accent rounded-lg">
                    <p className="text-sm font-medium mb-2 text-center">Scan with WhatsApp:</p>
                    <img 
                      src={session.qr_code} 
                      alt="QR Code" 
                      className="w-full rounded-md border border-border"
                    />
                  </div>
                )}

                {session.status === 'connected' && (
                  <div className="mt-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm text-green-900 dark:text-green-100 font-medium">
                      Account is active
                    </span>
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteSession(session.id)}
                  className="w-full"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Create Account Modal */}
      {showCreateModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setShowCreateModal(false)}
        >
          <Card 
            className="w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader>
              <CardTitle>Create New Account</CardTitle>
              <CardDescription>
                Enter a name for your new WhatsApp account
              </CardDescription>
            </CardHeader>
            <form onSubmit={createSession}>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="account-name">Account Name</Label>
                  <Input
                    id="account-name"
                    type="text"
                    value={newSessionName}
                    onChange={(e) => setNewSessionName(e.target.value)}
                    placeholder="e.g., My WhatsApp Account"
                    required
                    autoFocus
                  />
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  disabled={creating}
                  className="w-full"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={creating} className="w-full">
                  {creating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

export default Sessions;
