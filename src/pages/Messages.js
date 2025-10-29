import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sessionAPI, messageAPI } from '../api/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Textarea } from '../components/ui/Textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup, SelectLabel } from '../components/ui/Select';
import {
  Send,
  User,
  Users,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Loader2,
  AlertCircle,
  Plus,
  ArrowRight
} from 'lucide-react';

function Messages() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [messageHistory, setMessageHistory] = useState([]);
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Send message form
  const [recipientType, setRecipientType] = useState('individual');
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
      const interval = setInterval(fetchMessages, 10000);
      return () => clearInterval(interval);
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

  const fetchMessages = async () => {
    if (!selectedSession) return;
    
    try {
      setLoading(true);
      const [sentResponse, receivedResponse, groupsResponse] = await Promise.all([
        messageAPI.getHistory(selectedSession),
        messageAPI.getReceived(selectedSession),
        fetch(`${process.env.REACT_APP_API_URL || 'https://whatsapp-platform-backend.onrender.com'}/api/contacts/groups?session_id=${selectedSession}`)
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
        if (!selectedGroupId) {
          alert('Please select a group');
          return;
        }
        
        const response = await fetch(
          `${process.env.REACT_APP_API_URL || 'https://whatsapp-platform-backend.onrender.com'}/api/contacts/groups/${selectedGroupId}/phone-numbers`
        );
        const data = await response.json();
        
        if (!data.success || !data.phoneNumbers || data.phoneNumbers.length === 0) {
          alert('No phone numbers found in this group');
          return;
        }
        
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
        if (!recipientNumber || !recipientNumber.trim()) {
          alert('Please enter a phone number');
          return;
        }
        
        // Trim the recipient number before sending
        const trimmedNumber = recipientNumber.trim();
        console.log('Sending message to:', trimmedNumber);
        
        await messageAPI.send(selectedSession, trimmedNumber, messageText);
        alert('✅ Message sent successfully!');
      }
      
      setRecipientNumber('');
      setSelectedGroupId('');
      setMessageText('');
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      console.error('Error response:', error.response?.data);
      
      // Show detailed error message
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to send message';
      
      alert(`❌ Failed to send message:\n\n${errorMessage}\n\nPlease check:\n- The session is connected\n- The phone number is correct\n- The number has at least 8 digits`);
    } finally {
      setSending(false);
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
                  You need a connected WhatsApp account before you can send messages. Create and connect an account to get started.
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
          <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
          <p className="text-muted-foreground">
            Send and view WhatsApp messages
          </p>
        </div>
        <Button onClick={fetchMessages} variant="outline" size="sm" disabled={!selectedSession}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Send Message Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Send Message
            </CardTitle>
            <CardDescription>
              Send messages to individuals or groups
            </CardDescription>
          </CardHeader>
          <CardContent>
            {connectedSessions.length === 0 ? (
              <div className="p-6 text-center bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                <p className="text-yellow-900 dark:text-yellow-100">
                  ⚠️ No connected accounts. Please connect an account first.
                </p>
              </div>
            ) : (
              <form onSubmit={sendMessage} className="space-y-4">
                {/* Account Selector */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Account</label>
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

                {/* Recipient Type */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Send To</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="individual"
                        checked={recipientType === 'individual'}
                        onChange={(e) => setRecipientType(e.target.value)}
                        className="w-4 h-4"
                      />
                      <User className="h-4 w-4" />
                      <span className="text-sm">Individual</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="group"
                        checked={recipientType === 'group'}
                        onChange={(e) => setRecipientType(e.target.value)}
                        className="w-4 h-4"
                      />
                      <Users className="h-4 w-4" />
                      <span className="text-sm">Group</span>
                    </label>
                  </div>
                </div>

                {/* Recipient Input */}
                {recipientType === 'individual' ? (
                  <div className="space-y-2">
                    <Label htmlFor="phone-number">Phone Number</Label>
                    <Input
                      id="phone-number"
                      type="text"
                      value={recipientNumber}
                      onChange={(e) => setRecipientNumber(e.target.value)}
                      placeholder="e.g., +212 665-927999 or +212 0655-927999"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter phone number with country code. Supports all formats worldwide: +212 665-927999, +212 0655-927999, 212665927999, etc. Leading zeros are automatically handled. The @c.us will be added automatically.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Group</label>
                    <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                      <SelectTrigger className="w-full">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <SelectValue placeholder="Choose a group..." />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Contact Groups</SelectLabel>
                          {groups.map(group => (
                            <SelectItem key={group.id} value={group.id}>
                              {group.name} ({group.contacts?.length || 0} members)
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Message will be sent to all members
                    </p>
                  </div>
                )}

                {/* Message Text */}
                <div className="space-y-2">
                  <Label htmlFor="message-text">Message</Label>
                  <Textarea
                    id="message-text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type your message here..."
                    rows={4}
                    required
                  />
                </div>

                <Button type="submit" disabled={sending} className="w-full">
                  {sending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Message History Section */}
        <div className="space-y-4">
          {/* Sent Messages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Sent Messages ({messageHistory.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedSession ? (
                <p className="text-muted-foreground text-center py-8">
                  Select an account to view messages
                </p>
              ) : loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : messageHistory.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No sent messages yet
                </p>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {messageHistory.map((msg) => (
                    <div key={msg.id} className="p-3 border border-border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-sm font-medium">To: {msg.to}</span>
                        <Badge 
                          variant={msg.status === 'sent' ? 'success' : msg.status === 'failed' ? 'destructive' : 'default'}
                          className="text-xs"
                        >
                          {msg.status === 'sent' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {msg.status === 'failed' && <XCircle className="h-3 w-3 mr-1" />}
                          {msg.status}
                        </Badge>
                      </div>
                      <p className="text-sm mb-2">{msg.message}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(msg.created_at).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Received Messages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Received Messages ({receivedMessages.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedSession ? (
                <p className="text-muted-foreground text-center py-8">
                  Select an account to view messages
                </p>
              ) : receivedMessages.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No received messages yet
                </p>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {receivedMessages.map((msg) => (
                    <div key={msg.id} className="p-3 bg-accent rounded-lg">
                      <div className="mb-2">
                        <span className="text-sm font-medium">From: {msg.from}</span>
                      </div>
                      <p className="text-sm mb-2">{msg.message}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(msg.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Messages;
