import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/api';
import { sessionAPI } from '../api/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import {
  User,
  Mail,
  Lock,
  Bell,
  Palette,
  Shield,
  Trash2,
  Save,
  AlertCircle,
  CheckCircle,
  Moon,
  Sun,
  Camera,
  Key,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  Loader2,
  BookOpen,
  ExternalLink,
  Code,
  Send,
  MessageSquare,
  Bot,
  Users,
  QrCode,
  CheckCircle2,
  XCircle,
  Clock,
  Plus
} from 'lucide-react';

function Settings() {
  const { user, updatePassword } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile form
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: ''
  });
  
  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Notifications
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    sessionAlerts: true,
    botAlerts: true,
    messageAlerts: false
  });
  
  // Theme
  const [theme, setTheme] = useState(
    localStorage.getItem('theme') || 'light'
  );
  
  // API Key
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [loadingApiKey, setLoadingApiKey] = useState(false);
  const [generatingApiKey, setGeneratingApiKey] = useState(false);
  
  // Sessions
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || ''
      });
      fetchApiKey();
      fetchSessions();
    }
  }, [user]);

  const fetchApiKey = async () => {
    setLoadingApiKey(true);
    try {
      const response = await api.get('/api/api-keys/current');
      if (response.data.success && response.data.data.apiKey) {
        setApiKey(response.data.data.apiKey);
      }
    } catch (error) {
      console.error('Error fetching API key:', error);
    } finally {
      setLoadingApiKey(false);
    }
  };

  const fetchSessions = async () => {
    setLoadingSessions(true);
    try {
      const response = await sessionAPI.getAll();
      setSessions(response.data.sessions || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoadingSessions(false);
    }
  };

  const copySessionId = (sessionId) => {
    navigator.clipboard.writeText(sessionId);
    showMessage('success', 'Session ID copied to clipboard!');
  };

  const generateApiKey = async () => {
    if (!window.confirm('Are you sure you want to generate a new API key? Your old key will stop working.')) {
      return;
    }

    setGeneratingApiKey(true);
    try {
      const response = await api.post('/api/api-keys/generate');
      if (response.data.success) {
        setApiKey(response.data.data.apiKey);
        setShowApiKey(true);
        showMessage('success', 'New API key generated successfully!');
      } else {
        showMessage('error', response.data.message || 'Failed to generate API key');
      }
    } catch (error) {
      console.error('Error generating API key:', error);
      console.error('Full error response:', error.response);
      
      const errorData = error.response?.data || {};
      const errorMessage = errorData.message || 
                          errorData.error || 
                          error.message || 
                          'Failed to generate API key. Please check if the api_key column exists in the users table.';
      
      // Show the error message
      showMessage('error', errorMessage);
      
      // Log full error details to console for debugging
      if (error.response?.data) {
        console.error('Backend error details:', JSON.stringify(error.response.data, null, 2));
      }
      
      // If SQL help is provided, show it in console and alert
      if (errorData.sqlHelp) {
        console.error('Database migration needed. Run this SQL in Supabase SQL Editor:');
        console.error(errorData.sqlHelp);
        
        // Show alert with SQL command
        setTimeout(() => {
          alert(`Database Migration Required\n\n${errorData.message}\n\nRun this SQL in your Supabase SQL Editor:\n\n${errorData.sqlHelp}`);
        }, 500);
      } else if (errorData.error === 'COLUMN_MISSING' || errorMessage.includes('column')) {
        const sqlHelp = 'ALTER TABLE users ADD COLUMN IF NOT EXISTS api_key TEXT UNIQUE;\nCREATE INDEX IF NOT EXISTS idx_users_api_key ON users(api_key);';
        console.error('Database column may be missing. Run this SQL in Supabase:');
        console.error(sqlHelp);
        
        setTimeout(() => {
          alert(`Database Migration Required\n\nThe api_key column is missing from the users table.\n\nRun this SQL in your Supabase SQL Editor:\n\n${sqlHelp}`);
        }, 500);
      }
      
      // Check for service role key error
      if (errorMessage.includes('SUPABASE_SERVICE_ROLE_KEY') || errorMessage.includes('Database connection error')) {
        setTimeout(() => {
          alert(`Configuration Error\n\n${errorMessage}\n\nPlease check your backend .env file and ensure SUPABASE_SERVICE_ROLE_KEY is set correctly.`);
        }, 500);
      }
    } finally {
      setGeneratingApiKey(false);
    }
  };

  const copyApiKey = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      showMessage('success', 'API key copied to clipboard!');
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // API call to update profile
      // await updateProfile(profileForm);
      showMessage('success', 'Profile updated successfully!');
    } catch (error) {
      showMessage('error', error.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showMessage('error', 'New passwords do not match');
      return;
    }
    
    if (passwordForm.newPassword.length < 8) {
      showMessage('error', 'Password must be at least 8 characters');
      return;
    }
    
    setSaving(true);
    
    try {
      await updatePassword(passwordForm.newPassword);
      showMessage('success', 'Password changed successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      showMessage('error', error.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    showMessage('success', `Theme changed to ${newTheme} mode`);
  };

  const handleNotificationUpdate = () => {
    // Save notification preferences
    showMessage('success', 'Notification preferences updated!');
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'api-keys', label: 'API Keys', icon: Key },
    { id: 'sessions', label: 'Sessions', icon: MessageSquare },
    { id: 'api-docs', label: 'API Docs', icon: BookOpen },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'danger', label: 'Danger Zone', icon: AlertCircle },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div className={`p-4 rounded-lg border animate-in slide-in-from-top-2 duration-300 ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-900 dark:bg-green-950 dark:border-green-800 dark:text-green-100' 
            : 'bg-destructive/10 border-destructive/20 text-destructive'
        }`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-3">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-3 w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information and profile picture
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleProfileUpdate}>
                <CardContent className="space-y-6">
                  {/* Avatar */}
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      {user?.avatar_url ? (
                        <img 
                          src={user.avatar_url} 
                          alt={user.name || user.email} 
                          className="h-20 w-20 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">
                          {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                      <button
                        type="button"
                        className="absolute bottom-0 right-0 p-1.5 bg-background border-2 border-background rounded-full hover:bg-accent transition-colors"
                      >
                        <Camera className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold">{user?.name || 'User'}</h3>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                      <Badge variant={user?.provider === 'google' ? 'default' : 'secondary'}>
                        {user?.provider === 'google' ? 'Google Account' : 'Email Account'}
                      </Badge>
                    </div>
                  </div>

                  {/* Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Full Name</label>
                    <Input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      placeholder="Your name"
                      icon={<User className="h-4 w-4" />}
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Email Address</label>
                    <Input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      placeholder="your@email.com"
                      icon={<Mail className="h-4 w-4" />}
                      disabled
                    />
                    <p className="text-xs text-muted-foreground">
                      Email cannot be changed for security reasons
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={saving}>
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>
                    Update your password to keep your account secure
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handlePasswordChange}>
                  <CardContent className="space-y-4">
                    {user?.provider === 'google' ? (
                      <div className="p-4 bg-accent rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          You signed in with Google. Password change is not available for Google accounts.
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold">Current Password</label>
                          <Input
                            type="password"
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                            placeholder="Enter current password"
                            icon={<Lock className="h-4 w-4" />}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-semibold">New Password</label>
                          <Input
                            type="password"
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                            placeholder="Enter new password"
                            icon={<Key className="h-4 w-4" />}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-semibold">Confirm New Password</label>
                          <Input
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                            placeholder="Confirm new password"
                            icon={<Key className="h-4 w-4" />}
                            required
                          />
                          <p className="text-xs text-muted-foreground">
                            Password must be at least 8 characters
                          </p>
                        </div>
                      </>
                    )}
                  </CardContent>
                  {user?.provider !== 'google' && (
                    <CardFooter>
                      <Button type="submit" disabled={saving}>
                        <Lock className="mr-2 h-4 w-4" />
                        {saving ? 'Updating...' : 'Update Password'}
                      </Button>
                    </CardFooter>
                  )}
                </form>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Login History</CardTitle>
                  <CardDescription>Recent login activity on your account</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
                          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Current Session</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date().toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant="success">Active</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* API Keys Tab */}
          {activeTab === 'api-keys' && (
            <Card>
              <CardHeader>
                <CardTitle>API Keys</CardTitle>
                <CardDescription>
                  Use API keys to authenticate your applications with the Streamfinitytv WhatsApp API.
                  API keys never expire and remain valid until you regenerate or revoke them.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* API Key Display */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="font-semibold">Your API Key</h3>
                      <p className="text-sm text-muted-foreground">
                        Keep this key secure. Anyone with this key can access your account through the API.
                        <span className="block mt-1 text-xs">
                          ⏰ <strong>Note:</strong> API keys never expire and remain valid until manually regenerated.
                        </span>
                      </p>
                    </div>
                    <Badge variant={apiKey ? 'success' : 'secondary'}>
                      {apiKey ? 'Active' : 'No Key'}
                    </Badge>
                  </div>

                  {loadingApiKey ? (
                    <div className="flex items-center justify-center p-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : apiKey ? (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            type={showApiKey ? 'text' : 'password'}
                            value={apiKey}
                            readOnly
                            className="font-mono text-sm pr-10"
                          />
                          <button
                            onClick={() => setShowApiKey(!showApiKey)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-accent rounded-md transition-colors"
                            type="button"
                          >
                            {showApiKey ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </button>
                        </div>
                        <Button
                          onClick={copyApiKey}
                          variant="outline"
                          size="icon"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={generateApiKey}
                          variant="outline"
                          disabled={generatingApiKey}
                        >
                          <RefreshCw className={`mr-2 h-4 w-4 ${generatingApiKey ? 'animate-spin' : ''}`} />
                          {generatingApiKey ? 'Generating...' : 'Regenerate Key'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-8 border-2 border-dashed rounded-lg">
                      <Key className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="font-semibold mb-2">No API Key Generated</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Generate an API key to start using the API
                      </p>
                      <Button
                        onClick={generateApiKey}
                        disabled={generatingApiKey}
                      >
                        <Key className="mr-2 h-4 w-4" />
                        {generatingApiKey ? 'Generating...' : 'Generate API Key'}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Usage Instructions */}
                {apiKey && (
                  <div className="space-y-3 p-4 bg-accent rounded-lg">
                    <h4 className="font-semibold text-sm">How to use your API key</h4>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>Include your API key in one of the following ways:</p>
                      <div className="space-y-2 font-mono text-xs bg-background p-3 rounded border">
                        <div>
                          <span className="text-muted-foreground">// Option 1: x-api-key header</span>
                          <div className="text-foreground">x-api-key: {showApiKey ? apiKey : 'wp_live_••••••••'}</div>
                        </div>
                        <div className="mt-2">
                          <span className="text-muted-foreground">// Option 2: Authorization header</span>
                          <div className="text-foreground">Authorization: Bearer {showApiKey ? apiKey : 'wp_live_••••••••'}</div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <p className="font-semibold text-foreground mb-1">Example with cURL:</p>
                        <code className="block bg-background p-3 rounded border text-xs overflow-x-auto">
                          curl -H "x-api-key: {showApiKey ? apiKey : 'wp_live_••••••••'}" \<br/>
                          &nbsp;&nbsp;{process.env.REACT_APP_API_URL || 'https://whatsapp-platform-backend.onrender.com'}/api/sessions
                        </code>
                      </div>
                    </div>
                  </div>
                )}

                {/* Security Warning */}
                <div className="p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="font-semibold text-sm text-yellow-900 dark:text-yellow-100">
                        Security Best Practices
                      </h4>
                      <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1 list-disc list-inside">
                        <li>Never share your API key publicly</li>
                        <li>Don't commit API keys to version control</li>
                        <li>Use environment variables to store keys</li>
                        <li>Regenerate keys if you suspect they've been compromised</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sessions Tab */}
          {activeTab === 'sessions' && (
            <Card>
              <CardHeader>
                <CardTitle>Sessions</CardTitle>
                <CardDescription>
                  View and copy your WhatsApp session IDs for easy integration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {loadingSessions ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="text-center p-8 border-2 border-dashed rounded-lg">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="font-semibold mb-2">No Sessions Found</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Create a session to get started
                    </p>
                    <Button
                      onClick={() => window.location.href = '/sessions'}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Go to Sessions
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sessions.map((session) => (
                      <div
                        key={session.id}
                        className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{session.session_name || 'Unnamed Session'}</h3>
                              <Badge
                                variant={
                                  session.status === 'connected'
                                    ? 'success'
                                    : session.status === 'connecting'
                                    ? 'default'
                                    : 'secondary'
                                }
                              >
                                {session.status === 'connected' ? (
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                ) : session.status === 'connecting' ? (
                                  <Clock className="h-3 w-3 mr-1" />
                                ) : (
                                  <XCircle className="h-3 w-3 mr-1" />
                                )}
                                {session.status || 'disconnected'}
                              </Badge>
                            </div>
                            
                            <div className="space-y-2">
                              <div>
                                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                                  Session ID
                                </label>
                                <div className="flex items-center gap-2">
                                  <code className="flex-1 bg-background border px-3 py-2 rounded text-sm font-mono break-all">
                                    {session.id}
                                  </code>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => copySessionId(session.id)}
                                    title="Copy Session ID"
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              
                              {session.created_at && (
                                <p className="text-xs text-muted-foreground">
                                  Created: {new Date(session.created_at).toLocaleString()}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex items-center gap-2 pt-3 border-t">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copySessionId(session.id)}
                          >
                            <Copy className="mr-2 h-3 w-3" />
                            Copy ID
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.location.href = '/sessions'}
                          >
                            <MessageSquare className="mr-2 h-3 w-3" />
                            Manage
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Info Card */}
                <div className="p-4 bg-accent rounded-lg">
                  <div className="flex items-start gap-3">
                    <QrCode className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1 space-y-2">
                      <h4 className="font-semibold text-sm">How to use Session IDs</h4>
                      <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                        <li>Session IDs are used to identify which WhatsApp account to use in API requests</li>
                        <li>Include the session ID in API calls to send messages, manage contacts, etc.</li>
                        <li>Copy the Session ID and use it in the <code>sessionId</code> parameter</li>
                        <li>Only connected sessions can send messages</li>
                      </ul>
                      <div className="mt-3 p-2 bg-background rounded text-xs font-mono">
                        <div className="text-muted-foreground mb-1">Example API Request:</div>
                        <div className="text-foreground">
                          POST /api/messages/send<br />
                          {`{ "sessionId": "${sessions[0]?.id || 'YOUR_SESSION_ID'}", "to": "...", "message": "..." }`}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* API Docs Tab */}
          {activeTab === 'api-docs' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>API Documentation</CardTitle>
                  <CardDescription>
                    Complete reference for the Streamfinitytv WhatsApp API
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Quick Links */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <a
                      href="/api"
                      className="p-4 border-2 rounded-lg hover:border-primary transition-all group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <BookOpen className="h-5 w-5 text-primary" />
                          <h3 className="font-semibold">Full Documentation</h3>
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        View comprehensive API reference with all endpoints, examples, and code samples
                      </p>
                    </a>

                    <a
                      href={`${process.env.REACT_APP_API_URL || 'https://whatsapp-platform-backend.onrender.com'}/api-docs`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-4 border-2 rounded-lg hover:border-primary transition-all group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Code className="h-5 w-5 text-primary" />
                          <h3 className="font-semibold">Swagger UI</h3>
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Interactive API explorer and testing interface
                      </p>
                    </a>
                  </div>

                  {/* Quick Reference */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Quick Reference</h3>
                    
                    <div className="space-y-3">
                      <div className="p-4 border rounded-lg bg-accent/50">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="h-4 w-4 text-primary" />
                          <span className="font-medium text-sm">Base URL</span>
                        </div>
                        <code className="text-xs bg-background px-2 py-1 rounded block">
                          {process.env.REACT_APP_API_URL || 'https://whatsapp-platform-backend.onrender.com'}/api
                        </code>
                      </div>

                      <div className="p-4 border rounded-lg bg-accent/50">
                        <div className="flex items-center gap-2 mb-2">
                          <Key className="h-4 w-4 text-primary" />
                          <span className="font-medium text-sm">Authentication</span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Header:</span>
                            <code className="ml-2 bg-background px-2 py-1 rounded text-xs">x-api-key: YOUR_API_KEY</code>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Or:</span>
                            <code className="ml-2 bg-background px-2 py-1 rounded text-xs">Authorization: Bearer YOUR_API_KEY</code>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Main Endpoints */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Main Endpoints</h3>
                    
                    <div className="grid gap-3">
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="h-4 w-4 text-primary" />
                          <span className="font-medium text-sm">Sessions</span>
                          <Badge variant="outline" className="ml-auto text-xs">GET, POST, DELETE</Badge>
                        </div>
                        <code className="text-xs text-muted-foreground">/api/sessions</code>
                        <p className="text-xs text-muted-foreground mt-1">
                          Manage WhatsApp Web sessions and accounts
                        </p>
                      </div>

                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Send className="h-4 w-4 text-primary" />
                          <span className="font-medium text-sm">Messages</span>
                          <Badge variant="outline" className="ml-auto text-xs">POST</Badge>
                        </div>
                        <code className="text-xs text-muted-foreground">/api/messages/send</code>
                        <p className="text-xs text-muted-foreground mt-1">
                          Send text and media messages
                        </p>
                      </div>

                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Bot className="h-4 w-4 text-primary" />
                          <span className="font-medium text-sm">Bots</span>
                          <Badge variant="outline" className="ml-auto text-xs">GET, POST, PUT, DELETE</Badge>
                        </div>
                        <code className="text-xs text-muted-foreground">/api/bots</code>
                        <p className="text-xs text-muted-foreground mt-1">
                          Create and manage automated messaging bots
                        </p>
                      </div>

                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="h-4 w-4 text-primary" />
                          <span className="font-medium text-sm">Contacts</span>
                          <Badge variant="outline" className="ml-auto text-xs">GET, POST, PUT, DELETE</Badge>
                        </div>
                        <code className="text-xs text-muted-foreground">/api/contacts</code>
                        <p className="text-xs text-muted-foreground mt-1">
                          Manage contacts and contact groups
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Example Code */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Quick Example</h3>
                    
                    <div className="p-4 bg-muted border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium">cURL Example</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const code = `curl -H "x-api-key: ${showApiKey && apiKey ? apiKey : 'YOUR_API_KEY'}" \\
  ${process.env.REACT_APP_API_URL || 'https://whatsapp-platform-backend.onrender.com'}/api/sessions`;
                            navigator.clipboard.writeText(code);
                            showMessage('success', 'Code copied to clipboard!');
                          }}
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy
                        </Button>
                      </div>
                      <pre className="text-xs overflow-x-auto">
                        <code className="text-foreground">
{`curl -H "x-api-key: ${showApiKey && apiKey ? apiKey : 'YOUR_API_KEY'}" \\
  ${process.env.REACT_APP_API_URL || 'https://whatsapp-platform-backend.onrender.com'}/api/sessions`}
                        </code>
                      </pre>
                    </div>

                    <div className="p-4 bg-muted border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium">JavaScript Example</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const code = `const axios = require('axios');

axios.get('${process.env.REACT_APP_API_URL || 'https://whatsapp-platform-backend.onrender.com'}/api/sessions', {
  headers: {
    'x-api-key': '${showApiKey && apiKey ? apiKey : 'YOUR_API_KEY'}'
  }
}).then(response => {
  console.log(response.data);
});`;
                            navigator.clipboard.writeText(code);
                            showMessage('success', 'Code copied to clipboard!');
                          }}
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy
                        </Button>
                      </div>
                      <pre className="text-xs overflow-x-auto">
                        <code className="text-foreground">
{`const axios = require('axios');

axios.get('${process.env.REACT_APP_API_URL || 'https://whatsapp-platform-backend.onrender.com'}/api/sessions', {
  headers: {
    'x-api-key': '${showApiKey && apiKey ? apiKey : 'YOUR_API_KEY'}'
  }
}).then(response => {
  console.log(response.data);
});`}
                        </code>
                      </pre>
                    </div>
                  </div>

                  {/* Call to Action */}
                  {!apiKey && (
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Key className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-1">
                            Generate your API key to start using the API
                          </p>
                          <p className="text-xs text-yellow-800 dark:text-yellow-200 mb-3">
                            Visit the API Keys tab above to generate your key
                          </p>
                          <Button
                            size="sm"
                            onClick={() => setActiveTab('api-keys')}
                          >
                            <Key className="mr-2 h-4 w-4" />
                            Go to API Keys
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose what notifications you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">
                        Receive email notifications about your account
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.emailNotifications}
                        onChange={(e) => setNotifications({ ...notifications, emailNotifications: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">Session Alerts</p>
                      <p className="text-sm text-muted-foreground">
                        Get notified when WhatsApp sessions disconnect
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.sessionAlerts}
                        onChange={(e) => setNotifications({ ...notifications, sessionAlerts: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">Bot Alerts</p>
                      <p className="text-sm text-muted-foreground">
                        Notifications when bots start or fail
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.botAlerts}
                        onChange={(e) => setNotifications({ ...notifications, botAlerts: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">Message Alerts</p>
                      <p className="text-sm text-muted-foreground">
                        Notifications for new messages received
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.messageAlerts}
                        onChange={(e) => setNotifications({ ...notifications, messageAlerts: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleNotificationUpdate}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Preferences
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                  Customize how the app looks and feels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-semibold">Theme</label>
                  <div className="grid grid-cols-3 gap-4">
                    <button
                      type="button"
                      onClick={() => handleThemeChange('light')}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        theme === 'light' 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <Sun className="h-6 w-6 mx-auto mb-2 text-primary" />
                      <p className="text-sm font-medium">Light</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleThemeChange('dark')}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        theme === 'dark' 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <Moon className="h-6 w-6 mx-auto mb-2 text-primary" />
                      <p className="text-sm font-medium">Dark</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleThemeChange('system')}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        theme === 'system' 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <Palette className="h-6 w-6 mx-auto mb-2 text-primary" />
                      <p className="text-sm font-medium">System</p>
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Danger Zone Tab */}
          {activeTab === 'danger' && (
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>
                  Irreversible actions that affect your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border-2 border-destructive/20 rounded-lg bg-destructive/5">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="font-semibold">Delete Account</p>
                      <p className="text-sm text-muted-foreground">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                    </div>
                    <Button 
                      variant="destructive"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete your account? This action cannot be undone!')) {
                          alert('Account deletion would happen here');
                        }
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default Settings;

